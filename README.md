# AssetGuard UCE  (75% Progress)

This repository contains Phase 2 of the AssetGuard project, a comprehensive asset management system built with a focus on Hexagonal Architecture, Security (JWT), and CI/CD Pipelines.

## Architecture & Technologies
- **Backend:** Node.js with TypeScript.
- **Architecture:** Hexagonal & Layered Architecture (Domain, Application, Infrastructure).
- **Persistence:** Polyglot persistence strategy using MySQL (deployed via AWS RDS and local Docker).
- **Security:** JWT-based authentication with Bcrypt password hashing and custom middleware protection.
- **Infrastructure:** Infrastructure as Code (IaC) using Terraform for AWS (VPC, RDS).
- **DevOps:** GitHub Actions for Automated CI, Docker Compose for localized container orchestration.
- **Event-Driven Messaging:** Apache Kafka for asynchronous service communication and decoupling.
- **Polyglot Persistence:** Combined use of AWS RDS (MySQL) for transactional data and MongoDB Atlas for event-driven audit logs.
- **API Gateway:** Centralized entry point using http-proxy-middleware for secure service routing and JWT validation.

## Services Delivered
-Security Service (Port 3002): Handles user lifecycle management (registration, login) and secure JWT generation.

-Inventory Service (Port 3002): Produces ASSET_CREATED events to Kafka.

-Audit Service (Port 3003): Consumes Kafka events and persists them in MongoDB Atlas.

-Notification Service (Port 3008): Real-time alerts consumer.

-Reporting Service (Port 3009): Data aggregator (joins SQL and NoSQL data).

-API Gateway (Port 3000): The main orchestrator and security guard.

## 🛠 Local Setup & Execution
### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Postman (for API testing)

### Installation
Local Execution (Monorepo)
The project is managed as a Node.js Workspace for easier orchestration.

Prerequisites
Docker Desktop (with Kafka & Zookeeper containers running)

Node.js (v18+)

Steps
Install all dependencies:

# Install all dependencies for the entire project
npm install

# Start all microservices, Gateway, and Kafka listeners at once
npm run dev

This command uses concurrently to launch the Gateway and all 10 microservices.

**Key Technical Workflows**
1. Event-Driven Flow (The Kafka Chain)
When an Asset is created in Inventory:

Inventory Service saves to AWS RDS.

A message is published to the asset-events topic in Kafka.

Audit Service consumes the message and stores it in MongoDB Atlas.

Notification Service consumes the message and triggers a real-time alert.

2. Aggregator Pattern (Reporting)
The Reporting Service performs internal API calls (propagating the JWT token) to fetch data from both the MySQL and MongoDB ecosystems, delivering a unified JSON report to the client.

🔐 Security Flow
Login: POST /api/auth/login → Receive JWT.

Authorized Access: All requests to /api/* (except auth) must include the Authorization: Bearer <token> header. The API Gateway validates the token before proxying the request to the target microservice.

**CI/CD Status**
The project includes a GitHub Actions pipeline (.github/workflows/main.yml) that automatically triggers on every Push or Pull Request to main and develop branches, ensuring code quality and infrastructure validation.