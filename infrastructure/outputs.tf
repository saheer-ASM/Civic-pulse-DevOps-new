output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.civic_pulse_ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.civic_pulse_ec2.public_dns
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.civic_pulse_vpc.id
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.civic_pulse_ec2.public_ip}:3000"
}

output "api_url" {
  description = "API URL"
  value       = "http://${aws_instance.civic_pulse_ec2.public_ip}:5000"
}

output "ssh_command" {
  description = "SSH command to connect"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.civic_pulse_ec2.public_ip}"
}
