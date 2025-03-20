import { DataSource } from "typeorm";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: "postgres",
    password: "",
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: true,
    entities: [Product, ProductImage],
    subscribers: [],
    migrations: [],
});
