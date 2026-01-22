import express from 'express';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { sendAuditLog } from './kafka';

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURACIÓN RDS ---
const dbConfig = {
  host: 'terraform-20260118181254720500000001.clcvjbxlkkn2.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'AssetGuard2026!',
  database: 'assetguard_inventory',
  port: 3306,
  connectTimeout: 10000
};

// --- SINCRONIZADA CON EL GATEWAY ---
const SECRET_KEY = 'uce_secret_key'; 
const pool = mysql.createPool(dbConfig);

// ENDPOINT DE LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[SECURITY] Intento de login: ${email}`);

  try {
    const [rows]: any = await pool.execute(
      'SELECT id, email, role FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      // Firmamos el token con la clave compartida
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        SECRET_KEY,
        { expiresIn: '2h' }
      );

      // Auditamos a Kafka (MongoDB Atlas lo recibirá)
      sendAuditLog('USER_LOGIN_SUCCESS', { userId: user.id, email: user.email, action: 'Login exitoso' })
        .catch(e => console.error("Error Kafka Audit:", e.message));

      return res.json({ token, role: user.role });
    } else {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error: any) {
    console.error('❌ Error RDS:', error.message);
    return res.status(500).json({ message: 'Error de base de datos' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'Security Service Online' }));

app.listen(3001, () => console.log('🛡️ Security Service operativo en puerto 3001'));