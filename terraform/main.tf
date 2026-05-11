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

# ACM certificates for CloudFront must live in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  stack_name = "aws-resume-${var.environment}"
  common_tags = {
    Environment = var.environment
    Project     = "AWS-Resume"
    ManagedBy   = "Terraform"
  }

  # Normalize public URLs to bare hostnames.
  _f_in         = trimspace(var.frontend_public_url)
  _a_in         = trimspace(var.api_public_url)
  frontend_host = lower(trimsuffix(replace(replace(local._f_in, "https://", ""), "http://", ""), "/"))
  api_host      = lower(trimsuffix(replace(replace(local._a_in, "https://", ""), "http://", ""), "/"))
}
