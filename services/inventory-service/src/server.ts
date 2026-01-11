import "reflect-metadata";
import { AppDataSource } from "./database";
import app from './app';

const PORT = 3001;

AppDataSource.initialize()
    .then(() => {
        console.log("✅ Database connected successfully (MySQL in Docker)");
        app.listen(PORT, () => {
            console.log(`🚀 Inventory service running on port ${PORT}`);
        });
    })
    .catch((error) => console.log("❌ Error during Database connection:", error));