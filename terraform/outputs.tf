output "api_endpoint" {
  description = "API Gateway invoke URL (raw; clients should use api_public_url)"
  value       = aws_api_gateway_stage.api.invoke_url
}

output "api_public_url" {
  description = "Custom-domain API URL fronted by CloudFront"
  value       = "https://${local.api_host}"
}

output "frontend_public_url" {
  description = "Custom-domain frontend URL fronted by CloudFront"
  value       = "https://${local.frontend_host}"
}

output "frontend_bucket" {
  description = "S3 bucket hosting the SPA"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_cloudfront_distribution_id" {
  description = "CloudFront distribution ID for the SPA"
  value       = aws_cloudfront_distribution.frontend.id
}

output "api_cloudfront_distribution_id" {
  description = "CloudFront distribution ID for the API"
  value       = aws_cloudfront_distribution.api.id
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN (us-east-1) used by both CloudFront distributions"
  value       = aws_acm_certificate.cloudfront.arn
}

output "dynamodb_table_name" {
  description = "DynamoDB visitor table name"
  value       = aws_dynamodb_table.visitor_table.name
}

output "pipeline_artifacts_bucket" {
  description = "S3 bucket for pipeline artifacts"
  value       = aws_s3_bucket.pipeline_artifacts.bucket
}

output "codepipeline_name" {
  description = "CodePipeline name"
  value       = aws_codepipeline.main.name
}
