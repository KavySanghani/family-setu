variable "aws_region" { type = string }
variable "project_name" { type = string default = "familysetu" }
# ECS/ALB/CloudFront resources are deliberately parameterized for the target
# account/network and should be provisioned only after environment review.
