import express from 'express';
import cors from 'cors';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

const app = express();
const PORT = 3000;

// --- DEBE SER IGUAL AL SECURITY SERVICE ---
const SECRET_KEY = 'uce_secret_key'; 

app.use(cors());

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

// Middleware de Autenticación
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`[GATEWAY] ⚠️ Token faltante en: ${req.url}`);
    return res.status(401).json({ message: 'Acceso denegado: Token faltante' });
  }

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) {
      console.log(`[GATEWAY] ❌ Token inválido en: ${req.url}`);
      return res.status(403).json({ message: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

const logProxyReq = (proxyReq: ClientRequest, req: IncomingMessage, res: ServerResponse) => {
  console.log(`[GATEWAY] -> Redirigiendo ${req.method} ${req.url}`);
};

// 1. Auth (Público)
app.use('/api/auth', createProxyMiddleware({ 
  target: services.security, 
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
  onProxyReq: logProxyReq
} as Options));

// 2. Inventario (Protegido)
app.use('/api/inventory', authenticateToken, createProxyMiddleware({ 
  target: services.inventory, 
  changeOrigin: true,
  pathRewrite: { '^/api/inventory': '' },
  onProxyReq: logProxyReq
} as Options));

// 3. Auditoría (Protegido) - AJUSTADO PARA /logs
app.use('/api/audit', authenticateToken, createProxyMiddleware({ 
  target: services.audit, 
  changeOrigin: true,
  pathRewrite: { '^/api/audit': '/logs' }, // <--- ESTO ES LO IMPORTANTE
  onProxyReq: logProxyReq
} as Options));

// 4. Otros Servicios
const genericServices = [
  { path: '/api/fixed-assets', target: services.fixed_assets },
  { path: '/api/tracking', target: services.tracking },
  { path: '/api/users', target: services.user },
  { path: '/api/notifications', target: services.notification },
  { path: '/api/depreciation', target: services.depreciation },
  { path: '/api/purchasing', target: services.purchasing },
  { path: '/api/reporting', target: services.reporting },
];

genericServices.forEach(service => {
  app.use(service.path, authenticateToken, createProxyMiddleware({
    target: service.target,
    changeOrigin: true,
    pathRewrite: { [`^${service.path}`]: '' },
    onProxyReq: logProxyReq
  } as Options));
});

app.listen(PORT, () => {
  console.log(`🚀 Gateway AssetGuard en http://localhost:${PORT}`);
  console.log(`🔑 Seguridad: Clave sincronizada -> ${SECRET_KEY}`);
});