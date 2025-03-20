import express from "express";
import cors from "cors";
import path from "path";
import { AppDataSource } from "./config/data-source";
import productRouter from "./routes/product-router";
import imageRouter from "./routes/productImage-router";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

console.log(path.join(__dirname, "./uploads"));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

AppDataSource.initialize()
    .then(async () => {
        console.log("Data source is connected");
    })
    .catch((error) => console.log("datasource error", error));

app.use("/products", productRouter);
app.use("/products", imageRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
