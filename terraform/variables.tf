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

variable "frontend_public_url" {
  description = "Frontend public URL (e.g. https://resume.example.com). Hostname becomes the CloudFront alternate domain and the S3 bucket name."
  type        = string
  validation {
    condition     = trimspace(var.frontend_public_url) != ""
    error_message = "frontend_public_url must be non-empty."
  }
}

variable "api_public_url" {
  description = "API public URL (e.g. https://api.resume.example.com). Hostname becomes the CloudFront alternate domain in front of API Gateway."
  type        = string
  validation {
    condition     = trimspace(var.api_public_url) != ""
    error_message = "api_public_url must be non-empty."
  }
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for ACM DNS validation and A/AAAA aliases (e.g. Z0123456789)."
  type        = string
  validation {
    condition     = trimspace(var.route53_zone_id) != ""
    error_message = "route53_zone_id must be non-empty."
  }
}
