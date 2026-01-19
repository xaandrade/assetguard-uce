import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3000;

// Redirecciones
app.use('/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/inventory', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/audit', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`Expansion Gateway running on http://localhost:${PORT}`);
});