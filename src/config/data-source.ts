import { DataSource } from "typeorm";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: true,
    entities: [Product, ProductImage],
    subscribers: [],
    migrations: [],
});
