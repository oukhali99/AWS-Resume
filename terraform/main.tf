# Specify the AWS provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.18.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  stack_name = "aws-resume-${var.environment}"
  common_tags = {
    Environment = var.environment
    Project     = "AWS-Resume"
    ManagedBy   = "Terraform"
  }
}
