import { Resources } from "../models/resource.model.js";

const resourcesController = {
  addResource: async (req, res) => {
    const { name } = req.body;

    try {
      let resource = await Resources.findOne({ name });

      if (!resource) {
        // Если ресурс с стаким именем не существует, создаем новый
        resource = await Resources.create({
          name,
          count: 0,
        });
      }

      // Увеличиваем количество ресурса на 1
      resource.count += 1;
      await resource.save();

      return res.json(resource);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getResources: async (req, res) => {
    try {
      const resources = await Resources.find();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeResource: async (req, res) => {
    const { name } = req.params;

    try {
      // Находим ресурс по имени
      const resource = await Resources.findOne({ name });

      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      // Уменьшаем количество ресурса на 1
      resource.count -= 1;

      // Проверяем, чтобы количество не было отрицательным
      if (resource.count < 0) {
        resource.count = 0;
      }

      await resource.save();

      return res.json(resource);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

export default resourcesController;

