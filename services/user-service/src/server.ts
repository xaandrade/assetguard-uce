import express from 'express';
import { sendAuditLog } from './kafka';
const app = express();
const PORT = 3010;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'User Management Service Online' });
});

app.post('/create', async (req, res) => {
    const { username, role } = req.body;
    await sendAuditLog('USER_ACCOUNT_CREATED', { username, role });
    res.json({ message: 'Usuario creado en el sistema' });
});

app.listen(PORT, () => console.log(`🚀 User Service en puerto ${PORT}`));