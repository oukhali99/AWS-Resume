# S3 Bucket for Pipeline Artifacts
resource "aws_s3_bucket" "pipeline_artifacts" {
  bucket        = "${local.stack_name}-pipeline-artifacts"
  force_destroy = true
  tags          = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "pipeline_artifacts" {
  bucket                  = aws_s3_bucket.pipeline_artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM Role for CodeBuild (build + invalidate)
resource "aws_iam_role" "codebuild" {
  name = "${local.stack_name}-${var.environment}-codebuild-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
    }]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy" "codebuild" {
  name = "${local.stack_name}-${var.environment}-codebuild-policy"
  role = aws_iam_role.codebuild.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:GetObjectVersion"]
        Resource = "${aws_s3_bucket.pipeline_artifacts.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.pipeline_artifacts.arn
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:GetObjectVersion", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.frontend.arn
      },
      {
        Effect   = "Allow"
        Action   = ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation", "cloudfront:ListInvalidations"]
        Resource = aws_cloudfront_distribution.frontend.arn
      }
    ]
  })
}

# CodeBuild Project — build frontend
resource "aws_codebuild_project" "main" {
  name          = "${local.stack_name}-${var.environment}-codebuild-project"
  description   = "Build AWS Resume frontend"
  build_timeout = 60
  service_role  = aws_iam_role.codebuild.arn
  artifacts {
    type = "CODEPIPELINE"
  }
  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    environment_variable {
      name  = "VITE_API_URL"
      value = trimsuffix(trimspace(var.api_public_url), "/")
    }
  }
  source {
    type      = "CODEPIPELINE"
    buildspec = <<-BUILDSPEC
      version: 0.2
      phases:
        install:
          runtime-versions:
            nodejs: 22
          commands:
            - npm install -g yarn
            - yarn install
        build:
          commands:
            - yarn build
      artifacts:
        base-directory: dist
        files:
          - '**/*'
    BUILDSPEC
  }
  tags = local.common_tags
}

# CodeBuild Project — CloudFront invalidation after S3 deploy
resource "aws_codebuild_project" "invalidate" {
  name          = "${local.stack_name}-${var.environment}-invalidate"
  description   = "Invalidate CloudFront cache after deploy"
  build_timeout = 10
  service_role  = aws_iam_role.codebuild.arn
  artifacts {
    type = "CODEPIPELINE"
  }
  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    environment_variable {
      name  = "CF_DISTRIBUTION_ID"
      value = aws_cloudfront_distribution.frontend.id
    }
  }
  source {
    type      = "CODEPIPELINE"
    buildspec = <<-BUILDSPEC
      version: 0.2
      phases:
        build:
          commands:
            - aws cloudfront create-invalidation --distribution-id "$CF_DISTRIBUTION_ID" --paths '/*'
    BUILDSPEC
  }
  tags = local.common_tags
}

# IAM Role for CodePipeline
resource "aws_iam_role" "codepipeline" {
  name = "${local.stack_name}-${var.environment}-codepipeline-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codepipeline.amazonaws.com" }
    }]
  })
  tags = local.common_tags
}

resource "aws_iam_role_policy" "codepipeline" {
  name = "${local.stack_name}-${var.environment}-codepipeline-policy"
  role = aws_iam_role.codepipeline.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:GetObjectVersion", "s3:PutObject"]
        Resource = ["${aws_s3_bucket.pipeline_artifacts.arn}/*", "${aws_s3_bucket.frontend.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [aws_s3_bucket.pipeline_artifacts.arn, aws_s3_bucket.frontend.arn]
      },
      {
        Effect = "Allow"
        Action = ["codebuild:BatchGetBuilds", "codebuild:StartBuild", "codestar-connections:UseConnection"]
        Resource = [
          aws_codebuild_project.main.arn,
          aws_codebuild_project.invalidate.arn,
          var.github_connection_arn,
        ]
      }
    ]
  })
}

# CodePipeline
resource "aws_codepipeline" "main" {
  name     = "${local.stack_name}-${var.environment}-pipeline"
  role_arn = aws_iam_role.codepipeline.arn
  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }
  stage {
    name = "Source"
    action {
      name             = "GitHubSource"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["SourceOutput"]
      configuration = {
        ConnectionArn    = var.github_connection_arn
        FullRepositoryId = "oukhali99/AWS-Resume"
        BranchName       = "main"
      }
    }
  }
  stage {
    name = "Build"
    action {
      name             = "BuildWithYarn"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["SourceOutput"]
      output_artifacts = ["BuildOutput"]
      configuration = {
        ProjectName = aws_codebuild_project.main.name
      }
    }
  }
  stage {
    name = "Deploy"
    action {
      name            = "DeployToS3"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "S3"
      version         = "1"
      input_artifacts = ["BuildOutput"]
      configuration = {
        BucketName = aws_s3_bucket.frontend.bucket
        Extract    = "true"
      }
    }
  }
  stage {
    name = "Invalidate"
    action {
      name            = "InvalidateCloudFront"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["BuildOutput"]
      configuration = {
        ProjectName = aws_codebuild_project.invalidate.name
      }
    }
  }
  tags = local.common_tags
}
