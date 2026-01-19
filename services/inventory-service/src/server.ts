import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { Kafka, Partitioners } from 'kafkajs';

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURACIÓN DE KAFKA (PRODUCTOR) ---
const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: ['localhost:9092']
});
const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

async function connectKafka() {
  try {
    await producer.connect();
    console.log('📡 Inventory: Productor conectado a Kafka');
  } catch (err) {
    console.error('❌ Error Kafka Producer:', err);
  }
}
connectKafka();

// --- CONFIGURACIÓN AWS RDS ---
const pool = mysql.createPool({
  host: 'terraform-20260118181254720500000001.clcvjbxlkkn2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'AssetGuard2026!', 
  database: 'assetguard_inventory', 
  port: 3306
});

// --- ENDPOINT PRINCIPAL ---
app.post('/assets', async (req: any, res: any) => {
  const { name, category, value } = req.body;
  
  try {
    // 1. Persistencia en MySQL
    const [result]: any = await pool.execute(
      'INSERT INTO assets (name, category, value) VALUES (?, ?, ?)',
      [name, category || 'Sin Categoría', value || 0]
    );

    // 2. Notificación vía Kafka
    const eventPayload = {
      event: 'ASSET_CREATED',
      assetId: result.insertId,
      name,
      category,
      timestamp: new Date()
    };

    await producer.send({
      topic: 'asset-events',
      messages: [{ value: JSON.stringify(eventPayload) }],
    });

    console.log(`✉️ Evento Kafka enviado: ${name}`);

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Activo guardado en RDS y evento enviado a Kafka',
      data: req.body 
    });
  } catch (error: any) {
    console.error('❌ Error en Inventory:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/assets', async (req: any, res: any) => {
  const [rows] = await pool.execute('SELECT * FROM assets');
  res.json(rows);
});

app.listen(3002, () => console.log('📦 Inventory Service en puerto 3002'));