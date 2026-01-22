import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { Kafka, Partitioners } from 'kafkajs';

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cors());

// --- CONFIGURACIÓN DE KAFKA (PRODUCTOR) ---
const kafka = new Kafka({
  clientId: 'inventory-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer({ 
  createPartitioner: Partitioners.LegacyPartitioner 
});

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

// --- ENDPOINTS (Ajustados para el Gateway) ---

/**
 * GET / : Obtener todos los activos
 * El Gateway redirige /api/inventory (GET) aquí.
 */
app.get('/', async (req: any, res: any) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM assets ORDER BY id DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('❌ Error al obtener activos:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST / : Crear un nuevo activo
 * El Gateway redirige /api/inventory (POST) aquí.
 */
app.post('/', async (req: any, res: any) => {
  const { name, category, value } = req.body;
  
  try {
    // 1. Persistencia en MySQL (AWS RDS)
    // Agregamos 'Activo' por defecto para que el Dashboard lo muestre verde
    const [result]: any = await pool.execute(
      'INSERT INTO assets (name, category, value, status) VALUES (?, ?, ?, ?)',
      [name, category || 'Hardware', value || 0, 'Activo']
    );

    // 2. Notificación vía Kafka (Para que Audit Service lo guarde en MongoDB)
    const eventPayload = {
      event: 'ASSET_CREATED',
      assetId: result.insertId,
      name,
      category,
      value,
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
    console.error('❌ Error al crear activo:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint adicional por si se consulta /assets directamente
 */
app.get('/assets', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM assets');
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`📦 Inventory Service corriendo en puerto ${PORT}`);
});

// Cierre limpio de conexiones
process.on('SIGINT', async () => {
  await producer.disconnect();
  await pool.end();
  process.exit(0);
});