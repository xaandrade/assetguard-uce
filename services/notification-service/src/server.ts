import express from 'express';
import cors from 'cors';
import { Kafka } from 'kafkajs';

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURACIÓN KAFKA ---
const kafka = new Kafka({ 
  clientId: 'notification-service', 
  brokers: ['localhost:9092'] 
});
const consumer = kafka.consumer({ groupId: 'notification-group' });

async function startListener() {
  try {
    await consumer.connect();
    // Escuchamos el mismo tópico que Auditoría
    await consumer.subscribe({ topic: 'asset-events', fromBeginning: false });

    console.log('🔔 Notification Service: Escuchando eventos de Kafka...');

    await consumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(message.value?.toString() || '{}');
        
        // Simulación de notificación (puedes imaginar que envía un correo)
        console.log('\n==========================================');
        console.log('📢 ALERTA DE SISTEMA: NUEVO ACTIVO');
        console.log(`Nombre: ${payload.name}`);
        console.log(`Categoría: ${payload.category || 'N/A'}`);
        console.log(`Fecha: ${new Date().toLocaleString()}`);
        console.log('✅ Notificación enviada a los administradores.');
        console.log('==========================================\n');
      },
    });
  } catch (err) {
    console.error('❌ Error en Notification Kafka:', err);
  }
}

startListener();

app.get('/health', (req, res) => res.json({ status: 'Notification Service Online' }));

app.listen(3008, () => console.log('🚀 Notification Service corriendo en puerto 3008'));