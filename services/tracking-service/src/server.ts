import express from 'express';
import { sendAuditLog } from './kafka';
const app = express();
const PORT = 3005; 

app.use(express.json());

app.get('/health', (req, res) => {
    // CORRECCIÓN: Nombre del servicio
    res.json({ status: 'Tracking Service is running' });
});

app.get('/test-audit', async (req, res) => {
    try {
        // CORRECCIÓN: Log de consola
        console.log('Solicitud de prueba recibida en Tracking...');
        
        // Enviamos el evento a Kafka (Cambiamos el nombre del evento)
        await sendAuditLog('TRACKING_EVENT', { 
            assetId: '12345', 
            location: 'Warehouse Central',
            status: 'Moving' 
        });

        res.json({ 
            success: true, 
            message: '🚀 Evento de TRACKING enviado a Kafka. Revisa Audit Service!' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error al hablar con Kafka desde Tracking' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Tracking service running on port ${PORT}`);
});