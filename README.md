# AssetGuard UCE  (75% Progress)

This repository contains Phase 2 of the AssetGuard project, a comprehensive asset management system built with a focus on Hexagonal Architecture, Security (JWT), and CI/CD Pipelines.

## Architecture & Technologies
- **Backend:** Node.js with TypeScript.
- **Architecture:** Hexagonal & Layered Architecture (Domain, Application, Infrastructure).
- **Persistence:** Polyglot persistence strategy using MySQL (deployed via AWS RDS and local Docker).
- **Security:** JWT-based authentication with Bcrypt password hashing and custom middleware protection.
- **Infrastructure:** Infrastructure as Code (IaC) using Terraform for AWS (VPC, RDS).
- **DevOps:** GitHub Actions for Automated CI, Docker Compose for localized container orchestration.

## Services Delivered
- **Security Service (Port 3002):** Handles user lifecycle management (registration, login) and secure JWT generation.
- **Inventory Service (Port 3001):** Core Assets CRUD functionality, fully protected by an Authentication Middleware that validates tokens against the Security Service logic.

## 🛠 Local Setup & Execution
### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Postman (for API testing)

### Installation
1. **Start the Database:**
   bash
   docker-compose up -d

2. **Setup Security Service:**
Bash
cd services/security-service
npm install
npm run dev

3. **Setup Inventory Service:**
Bash
cd services/inventory-service
npm install
npm run dev

**API Security Flow**
Register User: POST /api/auth/register - Create new credentials.
Login: POST /api/auth/login - Obtain a Bearer Token.
Authorized Request: Include the token in the Authorization header (Bearer <token>) to access protected routes in the Inventory Service.

**CI/CD Status**
The project includes a GitHub Actions pipeline (.github/workflows/main.yml) that automatically triggers on every Push or Pull Request to main and develop branches, ensuring code quality and infrastructure validation.