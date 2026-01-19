
import { Kafka, logLevel } from 'kafkajs'; // Añadimos logLevel aquí
import { AuditLog } from './domain/AuditLog.js'; // Verifica que la ruta y el .js sean correctos

const kafka = new Kafka({
  clientId: 'audit-service',
  brokers: ['localhost:9092'],
  logLevel: logLevel.ERROR, // <-- Esto hará que solo salgan errores críticos, no los avisos rojos de "reintento"
});

const consumer = kafka.consumer({ groupId: 'audit-group' });

export const startAuditConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'audit-topic', fromBeginning: true });

    console.log('📡 Audit Service: Escuchando eventos de Kafka...');

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (message.value) {
          const data = JSON.parse(message.value.toString());
          
          // Guardamos en MongoDB lo que llegue de Kafka
          await AuditLog.create({
            service: data.service,
            action: data.action,
            details: data.details,
            timestamp: new Date()
          });

          console.log(`✅ Evento de [${data.service}] procesado y guardado en Mongo`);
        }
      },
    });
  } catch (error) {
    console.error('❌ Error en Kafka Consumer:', error);
  }
};