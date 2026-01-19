import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// URLs directas (usamos los puertos internos para saltarnos el Gateway y ser más rápidos)
const INVENTORY_SERVICE_URL = 'http://localhost:3002';
const AUDIT_SERVICE_URL = 'http://localhost:3003';

app.get('/report/assets-summary', async (req, res) => {
  // Extraemos el token que viene de Postman
  const authHeader = req.headers['authorization'];

  try {
    // 1. Pedir los activos enviando el mismo Token
    const inventoryRes = await axios.get(`${INVENTORY_SERVICE_URL}/assets`, {
      headers: { Authorization: authHeader }
    });
    const assets = inventoryRes.data;

    // 2. Pedir los logs enviando el mismo Token
    const auditRes = await axios.get(`${AUDIT_SERVICE_URL}/logs`, {
      headers: { Authorization: authHeader }
    });
    const logs = auditRes.data;

    // 3. Unificar la información (Lógica de agregación)
    const summary = assets.map((asset: any) => ({
      assetName: asset.name,
      currentStatus: asset.status,
      value: asset.value,
      history: logs.filter((log: any) => log.details && log.details.assetId === asset.id)
    }));

    res.json({
      generatedAt: new Date(),
      totalAssets: assets.length,
      reportData: summary
    });

  } catch (error: any) {
    console.error('❌ Error en el Agregador:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'No se pudo consolidar el reporte',
      details: error.response?.data || error.message 
    });
  }
});

app.listen(3009, () => console.log('📊 Reporting Service en puerto 3009'));