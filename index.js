import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import resource from "./routes/resource.route.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use(resource)

mongoose
    .connect(process.env.MONGO)
    .then(() => console.log("Успешно соединились с сервером MongDB!"))
    .catch(() => console.log("Ошибка при соединении с сервером MongoDB"));

app.listen(process.env.PORT, () => {
    console.log("Сервер успешно запущен");
});
