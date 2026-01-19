import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database';
import { User } from '../domain/user';

const router = Router();
const SECRET_KEY = "assetguard_secret_key_2026"; 

// REGISTRO DE USUARIO
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = userRepository.create({ username, password: hashedPassword });
        
        await userRepository.save(user);
        res.status(201).json({ message: "Usuario creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// LOGIN (Genera el Token)
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        
        const user = await userRepository.findOneBy({ username });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Clave incorrecta" });

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error en el login" });
    }
});

export default router;