import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'UCE_SECRET_2026';

app.use(cors());
// IMPORTANTE: No usar express.json() aquí para no romper los proxies de peticiones POST

const services = {
  security: 'http://localhost:3001',
  inventory: 'http://localhost:3002',
  audit: 'http://localhost:3003',
  depreciation: 'http://localhost:3004',
  tracking: 'http://localhost:3005',
  purchasing: 'http://localhost:3006',
  fixed_assets: 'http://localhost:3007',
  notification: 'http://localhost:3008',
  reporting: 'http://localhost:3009',
  user: 'http://localhost:3010',
};

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado: Token faltante' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

// --- CONFIGURACIÓN DE PROXIES ---

// 1. Security (Público)
app.use('/api/auth', createProxyMiddleware({ 
  target: services.security, 
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
  onProxyReq: (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => {
    console.log(`[GATEWAY] -> Security: ${req.url}`);
  }
} as Options));

// 2. Inventory (Protegido)
app.use('/api/inventory', authenticateToken, createProxyMiddleware({ 
  target: services.inventory, 
  changeOrigin: true,
  pathRewrite: { '^/api/inventory': '' } 
} as Options));

// 3. Audit (Protegido)
app.use('/api/audit', authenticateToken, createProxyMiddleware({ 
  target: services.audit, 
  changeOrigin: true,
  pathRewrite: { '^/api/audit': '' } 
} as Options));

// 4. Reporting (Protegido)
app.use('/api/reporting', authenticateToken, createProxyMiddleware({ 
  target: services.reporting, 
  changeOrigin: true,
  pathRewrite: { '^/api/reporting': '' } 
} as Options));

// 5. Otros Servicios (Protegidos)
app.use('/api/fixed-assets', authenticateToken, createProxyMiddleware({ target: services.fixed_assets, changeOrigin: true, pathRewrite: { '^/api/fixed-assets': '' } } as Options));
app.use('/api/tracking', authenticateToken, createProxyMiddleware({ target: services.tracking, changeOrigin: true, pathRewrite: { '^/api/tracking': '' } } as Options));
app.use('/api/users', authenticateToken, createProxyMiddleware({ target: services.user, changeOrigin: true, pathRewrite: { '^/api/users': '' } } as Options));
app.use('/api/notifications', authenticateToken, createProxyMiddleware({ target: services.notification, changeOrigin: true, pathRewrite: { '^/api/notifications': '' } } as Options));
app.use('/api/depreciation', authenticateToken, createProxyMiddleware({ target: services.depreciation, changeOrigin: true, pathRewrite: { '^/api/depreciation': '' } } as Options));
app.use('/api/purchasing', authenticateToken, createProxyMiddleware({ target: services.purchasing, changeOrigin: true, pathRewrite: { '^/api/purchasing': '' } } as Options));

// --- HEALTH CHECK ---
app.get('/health', (req, res) => res.json({ 
  status: 'Gateway AssetGuard Online', 
  timestamp: new Date() 
}));

app.listen(PORT, () => console.log(`🚀 Gateway AssetGuard en http://localhost:${PORT}`));