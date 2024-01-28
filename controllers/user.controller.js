import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const usersController = {
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
            expiresIn: "24h",
        });
        res.json(token);
    },

    getUser: async (req, res) => {
        try {
            const user = await User.find();
            res.json(user);
        } catch (error) {
            res.status(401).json({ error: "Ошибка при показе пользователей" });
        }
    },

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
};

export default usersController;
