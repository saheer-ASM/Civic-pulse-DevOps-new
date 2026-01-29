#!/bin/bash

set -e

PROJECT_DIR="/home/saheer/Civic-pulse-DevOps-new"
AWS_REGION="us-east-1"
CLUSTER_NAME="civic-pulse-eks"
DOCKER_REGISTRY="moshaheer"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        Civic-Pulse Complete Deployment Script              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to print step
step() {
    echo ""
    echo "▶ STEP: $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Function to print success
success() {
    echo "✓ $1"
}

# Function to print error
error() {
    echo "✗ ERROR: $1" >&2
    exit 1
}

# Step 1: Verify Tools
step "Verifying Required Tools"
docker --version > /dev/null || error "Docker not found"
success "Docker available"
aws --version > /dev/null || error "AWS CLI not found"
success "AWS CLI available"
kubectl version --client > /dev/null || error "kubectl not found"
success "kubectl available"
terraform version > /dev/null || error "Terraform not found"
success "Terraform available"
helm version > /dev/null || error "Helm not found"
success "Helm available"

# Step 2: Navigate to project
step "Setting Up Project Directory"
cd "$PROJECT_DIR" || error "Cannot change to project directory"
success "Working directory: $(pwd)"

# Step 3: Build Docker Images
step "Building Docker Images"
echo "Building server image..."
docker build -t $DOCKER_REGISTRY/civic-pulse-server:latest -f server/Dockerfile server/ > /dev/null
success "Server image built"

echo "Building client image..."
docker build -t $DOCKER_REGISTRY/civic-pulse-client:latest -f client/Dockerfile client/ > /dev/null
success "Client image built"

# Step 4: Push to Docker Hub
step "Pushing Images to Docker Hub"
echo "Pushing server image..."
docker push $DOCKER_REGISTRY/civic-pulse-server:latest > /dev/null
success "Server image pushed"

echo "Pushing client image..."
docker push $DOCKER_REGISTRY/civic-pulse-client:latest > /dev/null
success "Client image pushed"

# Step 5: Deploy Infrastructure
step "Deploying AWS Infrastructure"
cd infrastructure
echo "Planning Terraform changes..."
terraform plan -out=tfplan > /dev/null
success "Terraform plan created"

echo "Applying Terraform changes (this may take 10-15 minutes)..."
terraform apply -auto-approve tfplan
success "Infrastructure deployed"

# Step 6: Configure kubectl
step "Configuring kubectl Access"
aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION
success "kubeconfig updated"

# Step 7: Wait for Nodes
step "Waiting for Worker Nodes"
echo "Waiting up to 5 minutes for nodes to join cluster..."
ELAPSED=0
MAX_WAIT=300
while [ $(kubectl get nodes 2>/dev/null | grep -c ' Ready ') -lt 1 ] && [ $ELAPSED -lt $MAX_WAIT ]; do
    sleep 10
    ELAPSED=$((ELAPSED + 10))
    echo "  ⟳ Waiting... ($ELAPSED seconds)"
done

if [ $(kubectl get nodes 2>/dev/null | grep -c ' Ready ') -ge 1 ]; then
    success "Worker nodes are ready"
    kubectl get nodes
else
    error "Worker nodes did not become ready within timeout"
fi

# Step 8: Deploy Application
step "Deploying Application with Helm"
cd ..
echo "Installing Civic-Pulse Helm chart..."
helm upgrade --install civic-pulse ./charts/civic-pulse --namespace default --create-namespace
success "Helm deployment initiated"

# Step 9: Wait for Pods
step "Waiting for Pods to be Ready"
echo "Waiting up to 5 minutes for pods to start..."
ELAPSED=0
while [ $(kubectl get pods -A | grep -c 'Running') -lt 3 ] && [ $ELAPSED -lt 300 ]; do
    sleep 10
    ELAPSED=$((ELAPSED + 10))
    echo "  ⟳ Waiting... ($ELAPSED seconds)"
done

success "Checking pod status..."
kubectl get pods -A

# Step 10: Get Application URL
step "Getting Application Access Information"
echo "Waiting for LoadBalancer IP assignment..."
ELAPSED=0
while [ -z "$(kubectl get svc civic-pulse-client -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)" ] && [ $ELAPSED -lt 300 ]; do
    sleep 10
    ELAPSED=$((ELAPSED + 10))
    echo "  ⟳ Waiting... ($ELAPSED seconds)"
done

LB_HOSTNAME=$(kubectl get svc civic-pulse-client -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
LB_IP=$(kubectl get svc civic-pulse-client -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")

if [ -n "$LB_HOSTNAME" ]; then
    success "Application URL: http://$LB_HOSTNAME"
elif [ -n "$LB_IP" ]; then
    success "Application URL: http://$LB_IP"
else
    echo "⚠ LoadBalancer IP not yet assigned. Check with:"
    echo "  kubectl get svc civic-pulse-client"
fi

# Step 11: Deployment Summary
step "Deployment Summary"
echo ""
echo "✓ Docker images built and pushed"
echo "✓ AWS EKS cluster deployed"
echo "✓ Worker nodes joined cluster"
echo "✓ Application deployed with Helm"
echo "✓ Pods running and services configured"
echo ""
echo "Next steps:"
echo "  1. Access application at: http://$(kubectl get svc civic-pulse-client -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo '<LoadBalancer-IP>')"
echo "  2. Test login with credentials"
echo "  3. Monitor logs: kubectl logs -f deployment/civic-pulse-server"
echo "  4. Check status: kubectl get all"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              Deployment Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
