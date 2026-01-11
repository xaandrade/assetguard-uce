import "reflect-metadata";
import express from 'express';
import { AppDataSource } from './database';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = 3002;

AppDataSource.initialize()
    .then(() => {
        console.log("✅ Security DB Connected");
        app.listen(PORT, () => {
            console.log(`🔐 Security Service running on port ${PORT}`);
        });
    })
    .catch((error) => console.log("❌ DB Connection Error:", error));