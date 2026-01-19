import "reflect-metadata";
import { DataSource } from "typeorm";
import { Asset } from "./domain/asset";

export const AppDataSource = new DataSource({
    type: "mysql",
    // Pega aquí el endpoint que nos dio Terraform
    host: "terraform-20260118181254720500000001.clcvjbxlkkn2.us-east-1.rds.amazonaws.com",
    port: 3306,
    username: "admin",              // Usuario definido en main.tf
    password: "AssetGuard2026!",    // Password definida en main.tf
    database: "assetguard_inventory", // Nombre de la DB que creamos
    synchronize: true,              // Esto creará la tabla 'Asset' en AWS automáticamente
    logging: true,                  
    entities: [Asset],
});