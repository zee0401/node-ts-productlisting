import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/data-source";
import productRouter from "./router/product-router";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());

AppDataSource.initialize()
    .then(async () => {
        console.log("Data source is connected");
    })
    .catch((error) => console.log("datasource error", error));

app.use("/product", productRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
