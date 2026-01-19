import express from 'express';
import { sendAuditLog } from './kafka';
const app = express();
const PORT = 3006;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Purchasing Service Online' });
});

app.post('/order', async (req, res) => {
    const { itemId, quantity } = req.body;
    await sendAuditLog('PURCHASE_ORDER_CREATED', { itemId, quantity, status: 'PENDING' });
    res.json({ message: 'Orden de compra generada' });
});

app.listen(PORT, () => console.log(`🚀 Purchasing Service en puerto ${PORT}`));