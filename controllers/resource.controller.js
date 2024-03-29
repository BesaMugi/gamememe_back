import { Resources } from "../models/resource.model.js";
import { User } from "../models/user.model.js";


const resourcesController = {
  getResources: async (req, res) => {
    try {
      const resources = await Resources.find();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateResourcePriceAndLevel: async (req, res) => {
    try {
        const { resourceName, newPrice, newLevel, newPriceUpgrade } = req.body;
        const userId = req.user.id;

        // Пытаемся найти ресурс для конкретного пользователя
        let resource = await Resources.findOne({ name: resourceName, user: userId });

        // Если ресурс не существует, создаем новый для текущего пользователя
        if (!resource) {
            resource = new Resources({ name: resourceName, user: userId });
        }

        // Проверим, достаточно ли у пользователя средств для улучшения
        const user = await User.findById(userId);
        if (newLevel > 0 && newPriceUpgrade > user.wallet) {
            // Проверяем, что уровень больше 0 и недостаточно средств для улучшения
            return res.status(400).json({ success: false, error: "Недостаточно средств для улучшения ресурса" });
        }

        // Если уровень больше 0, вычитаем цену улучшения из кошелька пользователя
        if (newLevel > 0) {
            user.wallet -= newPriceUpgrade;
        }

        // Устанавливаем новую цену, уровень и цену улучшения
        resource.price += newPrice;

        // Проверим, если newLevel - это число, иначе установим priceUpgrade в 0
        if (!isNaN(newLevel)) {
            resource.level += newLevel;
            // Рассчитываем новую цену улучшения в зависимости от уровня
            resource.priceUpgrade = newLevel > 0 ? newPriceUpgrade : 0;
        } else {
            resource.priceUpgrade = 0;
        }

        await Promise.all([resource.save(), user.save()]);

        res.status(200).json({ success: true, updatedResource: resource });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Ошибка при обновлении цены ресурса' });
    }
},

  getUserResources: async (req, res) => {
    try {
      const userId = req.user.id;
      const userResources = await Resources.find({ user: userId });

      res.status(200).json(userResources);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Ошибка при получении ресурсов пользователя' });
    }
  },


  sellResource: async (req, res) => {
    try {
      const userId = req.params.id;
      const { resourceName } = req.body;

      const user = await User.findById(userId);
      const resource = await Resources.findOne({ name: resourceName, user: userId });

      if (resource.count <= 0) {
        return res.status(400).json({ error: "У вас нет этого ресурса в инвентаре или его количество равно нулю" });
      }

      if (resource.price === 0) {
        return res.status(400).json({ error: "Улучшите ресурс чтобы его продавать" })
      }
      resource.count -= 1;
      user.wallet += resource.price;

      // Сохраняем изменения в ресурсе и пользователе
      await Promise.all([resource.save(), user.save()]);

      // Теперь обновим инвентарь пользователя
      const updatedInventory = { ...user.inventory, [resourceName]: resource.count };
      user.inventory = updatedInventory;
      await user.save();

      res.status(200).json({ message: `Вы продали ${resourceName} и получили ${resource.price} в кошелек` });
      console.log("Request Body:", req.body);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
};


export default resourcesController;