import "reflect-metadata";
import { DataSource } from "typeorm";
import { Asset } from "./domain/asset";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "rootpassword",
    database: "inventory_db",
    synchronize: true, // Esto crea la tabla automáticamente al iniciar
    logging: false,
    entities: [Asset],
});