import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./domain/user";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "rootpassword", // Asegúrate de que sea la misma de tu Docker
    database: "inventory_db",
    synchronize: true, // Esto crea la tabla si no existe
    logging: false,
    entities: [User],
});