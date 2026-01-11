# 1. Configuración de Providers y Versiones
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 2. Definición de Variables para AWS Academy (Evita el error 403)
variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_session_token" {}

provider "aws" {
  region = "us-east-1"
}

# 3. Redes: VPC (Requerimiento Obligatorio)
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "VPC-AssetGuard-UCE"
  }
}

# 4. Subred Pública (Para el Bastion Host y el Gateway)
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
  tags = {
    Name = "Public-Subnet-AssetGuard"
  }
}

# 5. Internet Gateway (Para que la VPC tenga salida a internet)
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
  tags = {
    Name = "IGW-AssetGuard"
  }
}

# 6. Bastion Host / Jump Box (Requerimiento de Seguridad)
resource "aws_instance" "bastion" {
  ami           = "ami-0c7217cdde317cfec" # Amazon Linux 2 AMI (Free Tier)
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public_subnet.id
  
  tags = {
    Name = "Bastion-Host-AssetGuard"
    Environment = "QA"
  }
}
# 7. Grupo de Seguridad para la Base de Datos
resource "aws_security_group" "db_sg" {
  name        = "db-security-group"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Solo permite tráfico dentro de la VPC por seguridad
  }
}

# 8. Subredes para RDS (AWS requiere al menos 2 en diferentes zonas)
resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"
}

resource "aws_db_subnet_group" "main_db_subnet" {
  name       = "main-db-subnet-group"
  subnet_ids = [aws_subnet.public_subnet.id, aws_subnet.private_subnet_b.id]
}

# 9. Instancia de Base de Datos RDS MySQL
resource "aws_db_instance" "inventory_db" {
  allocated_storage      = 20
  db_name                = "assetguard_inventory"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  username               = "admin"
  password               = "AssetGuard2026!" # Usa esta clave para tu demo
  db_subnet_group_name   = aws_db_subnet_group.main_db_subnet.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = true # Activado para que el profesor vea que puedes conectar
}