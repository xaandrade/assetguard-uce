import express from 'express';
import { sendAuditLog } from './kafka';
const app = express();
const PORT = 3007;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Fixed Assets Service Online' });
});

app.post('/revaluate', async (req, res) => {
    const { assetId, newValue } = req.body;
    await sendAuditLog('ASSET_REVALUATION', { assetId, newValue });
    res.json({ message: 'Revalorización de activo fijo registrada' });
});

app.listen(PORT, () => console.log(`🚀 Fixed Assets Service en puerto ${PORT}`));