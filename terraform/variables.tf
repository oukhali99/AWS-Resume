variable "aws_region" {
  description = "The AWS region to deploy the infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "github_connection_arn" {
  description = "ARN of the GitHub connection for CodePipeline"
  type        = string
}

variable "s3_bucket_website" {
  description = "S3 bucket name for website deployment"
  type        = string
}

variable "backend_url" {
  description = "Backend API URL (for VITE_API_URL in build)"
  type        = string
}
