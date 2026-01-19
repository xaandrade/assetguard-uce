import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Kafka } from 'kafkajs';

const app = express();
app.use(express.json());
app.use(cors());

// --- MONGODB ATLAS ---
const MONGO_URI = 'mongodb+srv://xavictorxd_db_user:fRtGjFciNWhixNb1@cluster0.kdepoke.mongodb.net/assetguard_audit?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI).then(() => console.log('🍃 Audit: Conectado a MongoDB Atlas'));

const AuditLog = mongoose.model('AuditLog', new mongoose.Schema({
  event: String,
  userId: String,
  details: Object,
  timestamp: { type: Date, default: Date.now }
}));

// --- CONFIGURACIÓN KAFKA (CONSUMIDOR) ---
const kafka = new Kafka({
  clientId: 'audit-service',
  brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'audit-group' });

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'asset-events', fromBeginning: true });

  console.log('🛡️ Audit: Consumidor esperando mensajes de Kafka...');

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      
      const payload = JSON.parse(message.value.toString());
      console.log('📩 Mensaje recibido de Kafka:', payload.event);

      // Guardar automáticamente en MongoDB
      const log = new AuditLog({
        event: payload.event,
        userId: 'SYSTEM_KAFKA', // Identificamos que vino por Kafka
        details: payload
      });
      
      await log.save();
      console.log('✅ Log guardado en MongoDB Atlas automáticamente');
    },
  });
}

runConsumer().catch(e => console.error('❌ Error en Consumidor Kafka:', e));

// Endpoint para consulta manual
app.get('/logs', async (req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

app.listen(3003, () => console.log('🛡️ Audit Service en puerto 3003'));