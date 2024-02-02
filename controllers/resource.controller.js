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

  updateResourcePrice: async (req, res) => {
    try {
      const { resourceName, newPrice, newLevel } = req.body;
      const userId = req.user.id;
  
      console.log('Имя ресурса:', resourceName);
      console.log('Новая цена:', newPrice);
      console.log('Новый уровень:', newLevel);
      
  
      // Пытаемся найти ресурс для конкретного пользователя
      let resource = await Resources.findOne({ name: resourceName, user: userId });
  
      // Если ресурс не существует, создаем новый для текущего пользователя
      if (!resource) {
        resource = new Resources({ name: resourceName, user: userId });
      }
  
      // Устанавливаем новую цену и уровень
      resource.price = newPrice;
      resource.level = newLevel || 0; // Если newLevel не передан, устанавливаем уровень по умолчанию
      await resource.save();
  
      res.status(200).json({ success: true, updatedResource: resource });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Ошибка при обновлении цены ресурса' });
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

      resource.count -= 1;
      user.wallet += resource.price;

      // Сохраняем изменения в ресурсе и пользователе
      await Promise.all([resource.save(), user.save()]);

      // Теперь обновим инвентарь пользователя
      const updatedInventory = { ...user.inventory, [resourceName]: resource.count };
      user.inventory = updatedInventory;
      await user.save();

      res.status(200).json({ message: `Вы продали ${resourceName} и получили ${resource.price} в кошелек` });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  }
};

export default resourcesController;