import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'tracking-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

export const sendAuditLog = async (action: string, details: any) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'audit-topic',
      messages: [{ 
        value: JSON.stringify({ service: 'tracking', action, details, timestamp: new Date() }) 
      }],
    });
    console.log(`📡 [Tracking] Evento enviado: ${action}`);
  } catch (error) {
    console.error('❌ Error Kafka:', error);
  } finally {
    await producer.disconnect();
  }
};