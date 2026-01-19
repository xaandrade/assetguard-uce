import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

export const sendAuditLog = async (action: string, details: any) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'audit-topic',
      messages: [{ 
        value: JSON.stringify({ service: 'notification', action, details, timestamp: new Date() }) 
      }],
    });
    console.log(`📡 [Notification] Evento enviado: ${action}`);
  } catch (error) {
    console.error('❌ Error Kafka:', error);
  } finally {
    await producer.disconnect();
  }
};