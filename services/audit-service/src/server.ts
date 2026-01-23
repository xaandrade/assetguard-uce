import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Kafka } from 'kafkajs';

const app = express();
const PORT = 3003;

app.use(express.json());
app.use(cors());

// --- MONGODB ATLAS ---
const MONGO_URI = 'mongodb+srv://xavictorxd_db_user:fRtGjFciNWhixNb1@cluster0.kdepoke.mongodb.net/assetguard_audit?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Audit: Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Esquema de Auditoría
const AuditLogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  userId: { type: String, default: 'SYSTEM_KAFKA' },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// --- CONFIGURACIÓN KAFKA (CONSUMIDOR) ---
const kafka = new Kafka({
  clientId: 'audit-service',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'audit-group' });

async function runConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'asset-events', fromBeginning: true });

    console.log('🛡️ Audit: Consumidor esperando mensajes de Kafka...');

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        
        try {
          const payload = JSON.parse(message.value.toString());
          console.log('📩 Mensaje recibido de Kafka:', payload.event);

          const log = new AuditLog({
            event: payload.event,
            userId: payload.userId || 'SYSTEM_KAFKA',
            details: payload
          });
          
          await log.save();
          console.log('✅ Log guardado en MongoDB Atlas automáticamente');
        } catch (parseErr) {
          console.error('❌ Error procesando mensaje de Kafka:', parseErr);
        }
      },
    });
  } catch (err) {
    console.error('❌ Error en conexión Kafka:', err);
  }
}

runConsumer().catch(console.error);

// --- ENDPOINTS ---

/**
 * IMPORTANTE: app.get('/') es la que usará el API Gateway 
 * cuando hagas api.get('/audit') desde el Frontend.
 */
app.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener logs de auditoría' });
  }
});

app.get('/logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener logs' });
  }
});

// Graceful Shutdown (Para que no queden conexiones colgadas)
process.on('SIGTERM', async () => {
  await consumer.disconnect();
  await mongoose.connection.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🛡️ Audit Service corriendo en puerto ${PORT}`);
});