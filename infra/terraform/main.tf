terraform {
  required_version = ">= 1.6.0"
  required_providers { aws = { source = "hashicorp/aws", version = "~> 5.0" } }
}

provider "aws" { region = var.aws_region }

# This foundation intentionally accepts existing network identifiers. Networking,
# DNS, and secrets remain environment-owned rather than hard-coded in source.
resource "aws_ecr_repository" "api" { name = "${var.project_name}-api" image_scanning_configuration { scan_on_push = true } }
resource "aws_sqs_queue" "worker_dlq" { name = "${var.project_name}-worker-dlq" }
resource "aws_sqs_queue" "worker" { name = "${var.project_name}-worker" redrive_policy = jsonencode({ deadLetterTargetArn = aws_sqs_queue.worker_dlq.arn, maxReceiveCount = 5 }) }
resource "aws_cloudwatch_log_group" "api" { name = "/ecs/${var.project_name}-api" retention_in_days = 30 }

output "api_repository_url" { value = aws_ecr_repository.api.repository_url }
output "worker_queue_url" { value = aws_sqs_queue.worker.url }
