import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

export const sendAuditLog = async (action: string, details: any) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'audit-topic',
      messages: [
        { 
          value: JSON.stringify({ 
            service: 'inventory', 
            action, 
            details,
            timestamp: new Date() 
          }) 
        },
      ],
    });
    console.log(`📡 Evento enviado a Kafka: ${action}`);
  } catch (error) {
    console.error('❌ Error enviando a Kafka:', error);
  } finally {
    await producer.disconnect();
  }
};