# DynamoDB Table
resource "aws_dynamodb_table" "visitor_table" {
  name         = "${local.stack_name}-${var.environment}-visitor"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "IpAddress"
  range_key    = "Timestamp"

  attribute {
    name = "IpAddress"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "N"
  }

  tags = local.common_tags
}

# Lambda Role
resource "aws_iam_role" "lambda_role" {
  name = "${local.stack_name}-${var.environment}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
  tags = local.common_tags
}

# Lambda policy: CloudWatch Logs, SES, DynamoDB
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${local.stack_name}-${var.environment}-lambda-policy"
  role = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.visitor_table.arn,
          "${aws_dynamodb_table.visitor_table.arn}/index/*"
        ]
      }
    ]
  })
}

# Lambda Functions
data "archive_file" "send_message_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/send_message.js"
  output_path = "${path.module}/lambda/send_message.zip"
}

resource "aws_lambda_function" "send_message_lambda" {
  function_name = "${local.stack_name}-${var.environment}-lambda-send-message"
  runtime       = "nodejs22.x"
  handler       = "send_message.handler"
  filename      = data.archive_file.send_message_lambda_zip.output_path
  source_code_hash = data.archive_file.send_message_lambda_zip.output_base64sha256
  role          = aws_iam_role.lambda_role.arn
  tags          = local.common_tags
}

data "archive_file" "add_visitor_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/add_visitor.js"
  output_path = "${path.module}/lambda/add_visitor.zip"
}

resource "aws_lambda_function" "add_visitor_lambda" {
  function_name = "${local.stack_name}-${var.environment}-lambda-add-visitor"
  runtime       = "nodejs22.x"
  handler       = "add_visitor.handler"
  filename      = data.archive_file.add_visitor_lambda_zip.output_path
  source_code_hash = data.archive_file.add_visitor_lambda_zip.output_base64sha256
  role          = aws_iam_role.lambda_role.arn
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_table.name
    }
  }
  tags = local.common_tags
}

data "archive_file" "get_visitor_count_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/get_visitor_count.js"
  output_path = "${path.module}/lambda/get_visitor_count.zip"
}

resource "aws_lambda_function" "get_visitor_count_lambda" {
  function_name = "${local.stack_name}-${var.environment}-lambda-get-visitor-count"
  runtime       = "nodejs22.x"
  handler       = "get_visitor_count.handler"
  filename      = data.archive_file.get_visitor_count_lambda_zip.output_path
  source_code_hash = data.archive_file.get_visitor_count_lambda_zip.output_base64sha256
  role          = aws_iam_role.lambda_role.arn
  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_table.name
    }
  }
  tags = local.common_tags
}

# API Gateway
resource "aws_api_gateway_rest_api" "api" {
  name        = "${local.stack_name}-${var.environment}-api-gateway"
  description = "AWS Resume API Gateway"
  tags        = local.common_tags
}

resource "aws_api_gateway_resource" "send_message" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "send-message"
}

resource "aws_api_gateway_resource" "add_visitor" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "add-visitor"
}

resource "aws_api_gateway_resource" "get_visitor_count" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "get-visitor-count"
}

# Send-message: POST
resource "aws_api_gateway_method" "send_message_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.send_message.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "send_message_post" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.send_message.id
  http_method = aws_api_gateway_method.send_message_post.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.send_message_lambda.invoke_arn
}

# Add-visitor: POST
resource "aws_api_gateway_method" "add_visitor_post" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.add_visitor.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "add_visitor_post" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.add_visitor.id
  http_method = aws_api_gateway_method.add_visitor_post.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.add_visitor_lambda.invoke_arn
}

# Get-visitor-count: GET
resource "aws_api_gateway_method" "get_visitor_count_get" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.get_visitor_count.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_visitor_count_get" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.get_visitor_count.id
  http_method = aws_api_gateway_method.get_visitor_count_get.http_method
  type        = "AWS_PROXY"
  integration_http_method = "POST"
  uri         = aws_lambda_function.get_visitor_count_lambda.invoke_arn
}

# CORS preflight (OPTIONS) for each resource - matches CDK defaultCorsPreflightOptions
locals {
  cors_headers = {
    "Access-Control-Allow-Origin"  = "'*'"
    "Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "Access-Control-Allow-Methods" = "'GET,POST,OPTIONS,PUT,DELETE'"
    "Access-Control-Allow-Credentials" = "'true'"
  }
}

# OPTIONS send-message
resource "aws_api_gateway_method" "send_message_options" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.send_message.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "send_message_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.send_message.id
  http_method = aws_api_gateway_method.send_message_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "send_message_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.send_message.id
  http_method = aws_api_gateway_method.send_message_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"      = true
    "method.response.header.Access-Control-Allow-Headers"     = true
    "method.response.header.Access-Control-Allow-Methods"     = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "send_message_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.send_message.id
  http_method = aws_api_gateway_method.send_message_options.http_method
  status_code = aws_api_gateway_method_response.send_message_options.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"      = "'*'"
    "method.response.header.Access-Control-Allow-Headers"    = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods"     = "'GET,POST,OPTIONS,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Credentials" = "'true'"
  }
}

# OPTIONS add-visitor
resource "aws_api_gateway_method" "add_visitor_options" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.add_visitor.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "add_visitor_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.add_visitor.id
  http_method = aws_api_gateway_method.add_visitor_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "add_visitor_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.add_visitor.id
  http_method = aws_api_gateway_method.add_visitor_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"      = true
    "method.response.header.Access-Control-Allow-Headers"     = true
    "method.response.header.Access-Control-Allow-Methods"     = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "add_visitor_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.add_visitor.id
  http_method = aws_api_gateway_method.add_visitor_options.http_method
  status_code = aws_api_gateway_method_response.add_visitor_options.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"      = "'*'"
    "method.response.header.Access-Control-Allow-Headers"     = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods"      = "'GET,POST,OPTIONS,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Credentials"  = "'true'"
  }
}

# OPTIONS get-visitor-count
resource "aws_api_gateway_method" "get_visitor_count_options" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.get_visitor_count.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_visitor_count_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.get_visitor_count.id
  http_method = aws_api_gateway_method.get_visitor_count_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "get_visitor_count_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.get_visitor_count.id
  http_method = aws_api_gateway_method.get_visitor_count_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"      = true
    "method.response.header.Access-Control-Allow-Headers"     = true
    "method.response.header.Access-Control-Allow-Methods"     = true
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration_response" "get_visitor_count_options" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.get_visitor_count.id
  http_method = aws_api_gateway_method.get_visitor_count_options.http_method
  status_code = aws_api_gateway_method_response.get_visitor_count_options.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"      = "'*'"
    "method.response.header.Access-Control-Allow-Headers"     = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods"      = "'GET,POST,OPTIONS,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Credentials"  = "'true'"
  }
}

# Lambda permissions for API Gateway (allow any stage/method from this API)
resource "aws_lambda_permission" "send_message" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.send_message_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "add_visitor" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_visitor_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_visitor_count" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_visitor_count_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

# API Gateway Deployment (depends on all methods including OPTIONS)
resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  depends_on = [
    aws_api_gateway_integration.send_message_post,
    aws_api_gateway_integration.add_visitor_post,
    aws_api_gateway_integration.get_visitor_count_get,
    aws_api_gateway_integration_response.send_message_options,
    aws_api_gateway_integration_response.add_visitor_options,
    aws_api_gateway_integration_response.get_visitor_count_options
  ]
  lifecycle {
    create_before_destroy = true
  }
  triggers = {
    redeployment = md5(jsonencode([
      aws_api_gateway_integration.send_message_post.uri,
      aws_api_gateway_integration.add_visitor_post.uri,
      aws_api_gateway_integration.get_visitor_count_get.uri
    ]))
  }
}

resource "aws_api_gateway_stage" "api" {
  deployment_id = aws_api_gateway_deployment.api.id
  rest_api_id   = aws_api_gateway_rest_api.api.id
  stage_name    = var.environment
  tags          = local.common_tags
}

# Gateway responses for CORS (4xx and 5xx)
resource "aws_api_gateway_gateway_response" "default_4xx" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  response_type = "DEFAULT_4XX"
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
  }
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
}

resource "aws_api_gateway_gateway_response" "default_5xx" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  response_type = "DEFAULT_5XX"
  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
  }
  response_templates = {
    "application/json" = "{\"message\":$context.error.messageString}"
  }
}
