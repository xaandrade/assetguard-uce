import mongoose from 'mongoose';

// Usamos el host de Docker local
const MONGO_URI = "mongodb://localhost:27017/assetguard_audit";

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Audit Service conectado a MongoDB (Local Docker)");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        // No cerramos el proceso para que ts-node-dev no se buclee si Mongo tarda en subir
    }
};