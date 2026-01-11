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
  region     = "us-east-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
  token      = var.aws_session_token
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