import express from "express";
import inventoryRoutes from "./routes";

const app = express();

app.use(express.json());
app.use("/api/inventory", inventoryRoutes);

export default app;
