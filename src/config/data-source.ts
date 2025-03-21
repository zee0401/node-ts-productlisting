import { DataSource } from "typeorm";
import { Product } from "../entity/Product";
import { ProductImage } from "../entity/Product-Image";

export const AppDataSource = new DataSource({
    type: "postgres",
    // url: process.env.DATABASE_URL,
    database: "product",
    username: "postgres",
    password: "",
    host: "localhost",
    port: 5432,
    synchronize: true,
    // logging: true,
    entities: [Product, ProductImage],
    subscribers: [],
    migrations: [],
});
