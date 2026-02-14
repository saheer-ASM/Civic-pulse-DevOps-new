#!/bin/bash

set -e

PROJECT_DIR="/home/saheer/Civic-pulse-DevOps-new"
AWS_REGION="us-east-1"
DOCKER_REGISTRY="moshaheer"
VERSION="${1:-latest}"

step() {
    echo ""
    echo "▶ $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Civic-Pulse Deploy Script                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

step "Verifying Tools"
docker --version > /dev/null 2>&1 || { echo "✗ Docker not found"; exit 1; }
aws --version > /dev/null 2>&1 || { echo "✗ AWS CLI not found"; exit 1; }
terraform version > /dev/null 2>&1 || { echo "✗ Terraform not found"; exit 1; }
echo "✓ All tools available"

cd "$PROJECT_DIR"

step "Building Docker Images"
docker build -t $DOCKER_REGISTRY/civic-pulse-server:${VERSION} -t $DOCKER_REGISTRY/civic-pulse-server:latest -f server/Dockerfile server/
docker build -t $DOCKER_REGISTRY/civic-pulse-client:${VERSION} -t $DOCKER_REGISTRY/civic-pulse-client:latest -f client/Dockerfile client/
echo "✓ Images built"

step "Pushing Images to Docker Hub"
docker push $DOCKER_REGISTRY/civic-pulse-server:${VERSION}
docker push $DOCKER_REGISTRY/civic-pulse-server:latest
docker push $DOCKER_REGISTRY/civic-pulse-client:${VERSION}
docker push $DOCKER_REGISTRY/civic-pulse-client:latest
echo "✓ Images pushed"

step "Provisioning Infrastructure (Terraform)"
cd infrastructure
terraform init
terraform plan -out=tfplan
terraform apply -auto-approve tfplan
EC2_HOST=$(terraform output -raw ec2_public_ip 2>/dev/null || echo "")
cd ..
echo "✓ Infrastructure ready"

step "Deploying to EC2"
if [ -z "$EC2_HOST" ]; then
    echo "⚠ Could not get EC2 IP from Terraform output."
    echo "  Export EC2_HOST and re-run, or deploy manually."
    exit 1
fi

echo "Target: ${EC2_HOST}"
scp -o StrictHostKeyChecking=no docker-compose.yml ubuntu@${EC2_HOST}:/home/ubuntu/civic-pulse/

ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} << 'EOF'
cd /home/ubuntu/civic-pulse
docker pull moshaheer/civic-pulse-server:latest
docker pull moshaheer/civic-pulse-client:latest
docker compose down || true
docker compose up -d
sleep 15
docker compose ps
curl -sf http://localhost:5000/health && echo "Server: OK" || echo "Server: FAILED"
curl -sf http://localhost:3000/ > /dev/null 2>&1 && echo "Client: OK" || echo "Client: FAILED"
docker image prune -f > /dev/null 2>&1
EOF
echo "✓ Application deployed"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Deployment Complete!                          ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  App: http://${EC2_HOST}:3000                              ║"
echo "║  API: http://${EC2_HOST}:5000                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
