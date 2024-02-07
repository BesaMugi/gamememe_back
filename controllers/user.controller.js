import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Resources } from "../models/resource.model.js";

const usersController = {
  //регистрация аккаунта
  registUser: async (req, res) => {
    const { login, password } = req.body;
    const hash = await bcrypt.hash(password, +process.env.BCRYPT_ROUNDS);
    try {
      const user = await User.create({
        login,
        password: hash,
      });
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: "Ошибка при регистрации" + error.message });
    }
  },

  //вход в аккаунт
  login: async (req, res) => {
    const { password, login } = req.body;

    const candidate = await User.findOne({ login });
    if (!candidate) {
      return res.status(401).json("Неверный логин");
    }
    const valid = await bcrypt.compare(password, candidate.password);
    if (!valid) {
      return res.status(401).json("Неверный пароль");
    }

    const payload = {
      id: candidate._id,
      login: candidate.login,
    };

    const token = await jwt.sign(payload, process.env.SECRET_JWT_KEY, {
      expiresIn: "48h",
    });
    res.json(token);
  },

  //показ профиля игрока
  getUserProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },

  //изменение энергии игрока
  updateUserEnergy: async (req, res) => {
    try {
      const userId = req.params.id;
      const { energyChange } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      user.energy += energyChange;
      await user.save();

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },

  //изменение инвентаря игрока
  updateInventory: async (req, res) => {
    try {
      const userId = req.params.id;
      const { inventory } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      user.inventory = inventory;
      await user.save();

      // Обновляем ресурсы в папке resources
      for (const resourceName in inventory) {
        const resourceCount = inventory[resourceName];

        const resource = await Resources.findOne({ name: resourceName, user: userId });

        if (resource) {
          resource.count = resourceCount;
          await resource.save();
        } else {
          // Если ресурса не существует, создаем новый с count из инвентаря и ценой 0
          await Resources.create({ name: resourceName, count: resourceCount, price: 0, user: userId });
        }
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },

  //изменения в кошельке игрока
  updateWallet: async (req, res) => {
    try {
      const userId = req.params.id;
      const { newWalletValue } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      user.wallet = newWalletValue;
      await user.save();

      res.status(200).json({ message: "Кошелек пользователя успешно обновлен" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },

  //удаление игрока
  deleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      await User.findByIdAndDelete(userId);

      return res.json({ message: "Пользователь успешно удален" });
    } catch (error) {
      res.status(401).json({ error: "Ошибка при удалении пользователей" });
    }
  },

  //поедание еды (минус еда - плюс энергия)
  eatItem: async (req, res) => {
    try {
      const userId = req.params.id;
      const { itemName, energyToAdd } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const inventory = user.inventory;

      if (!inventory || !inventory[itemName] || inventory[itemName] <= 0) {
        return res.status(400).json({ error: "У вас нет этого предмета в инвентаре или его количество равно нулю" });
      }
      const updatedInventory = { ...inventory };
      updatedInventory[itemName] -= 1;

      user.inventory = updatedInventory;

      user.energy += energyToAdd;

      await user.save();

      //дополнительно удаляем ресурс из базы данных в отдельной папке
      const resource = await Resources.findOne({ name: itemName, user: userId });

      if (resource) {
        // Если ресурс существует, уменьшать его количество в базе данных
        resource.count -= 1;
        await resource.save();
      }

      res.status(200).json({ message: `Вы съели ${itemName} и восполнили энергию` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  },
};

export default usersController;
