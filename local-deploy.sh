#!/bin/bash
# Local Testing Script for Civic Pulse DevOps
# Run this in WSL: bash local-deploy.sh

set -e

echo "=================================="
echo "Civic Pulse Local Testing Script"
echo "=================================="

# Step 1: Build Docker Images
echo ""
echo "Step 1: Building Docker Images..."
echo "=================================="

echo "Building server image..."
docker build -t saheer/civic-pulse-server:latest ./server

echo "Building client image..."
docker build --no-cache -t saheer/civic-pulse-client:latest ./client

echo ""
echo "Verifying images..."
docker images | grep saheer/civic-pulse

# Step 2: Stop any existing containers
echo ""
echo "Step 2: Cleaning up old containers..."
echo "=================================="
docker-compose down -v 2>/dev/null || true

# Step 3: Start services
echo ""
echo "Step 3: Starting services with Docker Compose..."
echo "=================================="
docker-compose up -d

echo ""
echo "Waiting for services to start..."
sleep 10

# Step 4: Check service status
echo ""
echo "Step 4: Checking service status..."
echo "=================================="
docker-compose ps

# Step 5: Test connectivity
echo ""
echo "Step 5: Testing connectivity..."
echo "=================================="

echo "Testing MongoDB..."
docker-compose exec -T mongodb mongosh -u admin -p changeme admin --eval "db.adminCommand('ping')" 2>/dev/null && echo "✓ MongoDB is healthy" || echo "✗ MongoDB failed"

echo ""
echo "Testing Server..."
curl -s http://localhost:5000/health || echo "Server not ready yet, retrying..."
sleep 5
curl -s http://localhost:5000/health | head -20 && echo "✓ Server is running" || echo "✗ Server failed"

echo ""
echo "Testing Client..."
curl -s http://localhost:3000 | head -5 && echo "✓ Client is running" || echo "✗ Client failed"

# Step 6: Display logs
echo ""
echo "Step 6: Recent logs..."
echo "=================================="
echo "Server logs (last 10 lines):"
docker-compose logs server | tail -10
echo ""
echo "Client logs (last 10 lines):"
docker-compose logs client | tail -10

# Step 7: Success message
echo ""
echo "=================================="
echo "LOCAL TESTING COMPLETED!"
echo "=================================="
echo ""
echo "Access your application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  MongoDB:  localhost:27017"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs:     docker-compose logs -f"
echo "To access MongoDB:"
echo "  docker-compose exec mongodb mongosh -u admin -p changeme"
