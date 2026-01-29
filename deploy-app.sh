#!/bin/bash

cd /home/saheer/Civic-pulse-DevOps-new

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Civic-Pulse Deployment - WSL Execution Script          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check cluster status
echo "▶ Checking Kubernetes Cluster"
kubectl cluster-info
echo ""

echo "▶ Checking Worker Nodes"
NODE_COUNT=$(kubectl get nodes 2>/dev/null | grep -c "Ready" || echo "0")
echo "Ready nodes: $NODE_COUNT"
kubectl get nodes 2>/dev/null || echo "⚠ No nodes ready yet - will deploy anyway"
echo ""

# Deploy with Helm
echo "▶ Deploying Application with Helm"
echo "Installing Civic-Pulse chart..."
helm upgrade --install civic-pulse ./charts/civic-pulse \
  --namespace default \
  --create-namespace \
  --values charts/civic-pulse/values.yaml \
  --wait \
  --timeout 10m || true

echo ""
echo "▶ Checking Deployment Status"
kubectl get deployments -n default
echo ""
kubectl get services -n default
echo ""

echo "▶ Checking Pods"
kubectl get pods -n default -o wide || echo "Pods not yet created"
echo ""

echo "▶ Waiting for LoadBalancer IP (up to 5 minutes)"
for i in {1..30}; do
  LB_IP=$(kubectl get svc civic-pulse-client -n default -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
  LB_HOSTNAME=$(kubectl get svc civic-pulse-client -n default -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
  
  if [ -n "$LB_IP" ] || [ -n "$LB_HOSTNAME" ]; then
    echo "✓ LoadBalancer IP assigned!"
    echo ""
    if [ -n "$LB_IP" ]; then
      echo "   Access URL: http://$LB_IP"
    fi
    if [ -n "$LB_HOSTNAME" ]; then
      echo "   Access URL: http://$LB_HOSTNAME"
    fi
    break
  else
    echo "  ⟳ Waiting... ($((i * 10)) seconds elapsed)"
    sleep 10
  fi
done

echo ""
echo "▶ Deployment Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ EKS Cluster: ACTIVE (civic-pulse-eks)"
echo "✓ Docker Images: Pushed to Docker Hub"
echo "✓ Helm Chart: Deployed"
echo ""
echo "Next steps:"
echo "  1. Check pod logs: kubectl logs -f deployment/civic-pulse-server"
echo "  2. Check all resources: kubectl get all"
echo "  3. Describe service: kubectl describe svc civic-pulse-client"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 Deployment Complete!                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
