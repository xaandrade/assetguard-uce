import express from 'express';
import { sendAuditLog } from './kafka';
const app = express();
const PORT = 3004;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Depreciation Service Online' });
});

app.post('/calculate', async (req, res) => {
    const { assetId, method } = req.body;
    await sendAuditLog('DEPRECIATION_CALCULATED', { assetId, method, value: 150.25 });
    res.json({ message: 'Depreciación calculada con éxito' });
});

app.listen(PORT, () => console.log(`🚀 Depreciation Service en puerto ${PORT}`));