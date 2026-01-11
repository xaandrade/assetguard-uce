# AssetGuard UCE - Proyecto de Microservicios (75% Avance)

Este repositorio contiene la Fase 2 del proyecto AssetGuard, enfocado en Arquitectura Hexagonal, Seguridad y CI/CD.

## Componentes Entregados:
- **Security Service (Port 3002):** Manejo de autenticación, registro de usuarios y generación de JWT.
- **Inventory Service (Port 3001):** CRUD de activos protegido por Middleware de seguridad.
- **Infrastructure:** Scripts de Terraform para despliegue de VPC y RDS en AWS.
- **DevOps:** Pipeline de GitHub Actions (CI) configurado para validación de código.

## Cómo probar el sistema:
1. Iniciar DB: `docker-compose up -d`
2. Iniciar Seguridad: `cd services/security-service && npm run dev`
3. Iniciar Inventario: `cd services/inventory-service && npm run dev`