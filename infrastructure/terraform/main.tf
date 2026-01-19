# 1. Configuración de Providers y Versiones
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 2. Credenciales Directas (Asegúrate de pegar las de tu sesión actual)
provider "aws" {
  region     = "us-east-1"
  access_key = "TU_ACCESS_KEY_AQUI"
  secret_key = "TU_ACCESS_KEY_AQUI"
  token      = "TU_ACCESS_KEY_AQUI"
}

# 3. Redes: VPC
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "VPC-AssetGuard-UCE" }
}

# 4. Internet Gateway (Crucial para acceso externo)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
  tags   = { Name = "IGW-AssetGuard" }
}

# 5. Tabla de Rutas Pública
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "Public-RT-AssetGuard" }
}

# 6. Subredes Públicas (Usamos rangos 100 y 200 para evitar cualquier conflicto previo)
resource "aws_subnet" "subnet_a" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.100.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags                    = { Name = "Subnet-A-AssetGuard" }
}

resource "aws_subnet" "subnet_b" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.200.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
  tags                    = { Name = "Subnet-B-AssetGuard" }
}

# Asociaciones de Rutas
resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.subnet_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.subnet_b.id
  route_table_id = aws_route_table.public_rt.id
}

# 7. Grupo de Seguridad (Puerto 3306 ABIERTO para tu PC)
resource "aws_security_group" "db_sg" {
  name   = "db-security-group-v2"
  vpc_id = aws_vpc.main_vpc.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 8. RDS Subnet Group (Nombre nuevo para evitar error de VPC antigua)
resource "aws_db_subnet_group" "main_db_subnet" {
  name       = "assetguard-db-subnet-group-v2"
  subnet_ids = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
  tags       = { Name = "DB-Subnet-Group-AssetGuard" }
}

# 9. Instancia de Base de Datos RDS MySQL
resource "aws_db_instance" "inventory_db" {
  allocated_storage      = 20
  db_name                = "assetguard_inventory"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  username               = "admin"
  password               = "AssetGuard2026!"
  db_subnet_group_name   = aws_db_subnet_group.main_db_subnet.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = true # PERMITIR ACCESO DESDE INTERNET
}
# 11. AWS DocumentDB (MongoDB compatible)
resource "aws_docdb_cluster" "docdb" {
  cluster_identifier      = "assetguard-docdb"
  engine                  = "docdb"
  master_username         = "dbadmin"        # CAMBIADO: 'admin' estaba reservado
  master_password         = "AssetGuard2026!"
  skip_final_snapshot     = true
  db_subnet_group_name    = aws_db_subnet_group.main_db_subnet.name
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
}



# 12. Redis (ElastiCache)
# Primero creamos el grupo de subredes específico para Redis
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "assetguard-redis-subnet-group"
  subnet_ids = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "assetguard-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name # USANDO EL NUEVO GRUPO
  security_group_ids   = [aws_security_group.db_sg.id]
}