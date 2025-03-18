import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "product",
    synchronize: true,
    logging: true,
    // entities: [Products],
    subscribers: [],
    migrations: [],
});
