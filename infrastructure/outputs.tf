output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.civic_pulse_cluster.name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.civic_pulse_cluster.endpoint
}

output "eks_cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = aws_security_group.eks_control_plane_sg.id
}

output "eks_cluster_iam_role_arn" {
  description = "EKS cluster IAM role ARN"
  value       = aws_iam_role.eks_cluster_role.arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.civic_pulse_vpc.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
}

output "eks_node_group_id" {
  description = "EKS node group ID"
  value       = aws_eks_node_group.civic_pulse_nodes.id
}

output "configure_kubectl_command" {
  description = "Command to configure kubectl"
  value       = "aws eks update-kubeconfig --name ${aws_eks_cluster.civic_pulse_cluster.name} --region ${var.aws_region}"
}
