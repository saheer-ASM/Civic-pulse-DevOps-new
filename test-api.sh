#!/bin/bash
# API Testing Script for Civic Pulse

API_URL="http://localhost:5000"
TOKEN=""

echo "========================================="
echo "Civic Pulse API Testing"
echo "========================================="

# Test 1: Health Check
echo ""
echo "1. Testing Health Endpoint..."
echo "   GET $API_URL/health"
HEALTH=$(curl -s "$API_URL/health")
echo "   Response: $HEALTH"

if [[ $HEALTH == *"connected"* ]]; then
  echo "   ✓ Backend is healthy and database is connected"
else
  echo "   ✗ Backend health check failed"
  exit 1
fi

# Test 2: Register a User
echo ""
echo "2. Registering a Test User..."
echo "   POST $API_URL/api/auth/register"
REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }')
echo "   Response: $REGISTER"

if [[ $REGISTER == *"success"* ]] || [[ $REGISTER == *"user"* ]]; then
  echo "   ✓ User registration successful"
else
  echo "   Note: User might already exist (that's OK)"
fi

# Test 3: Login
echo ""
echo "3. Testing User Login..."
echo "   POST $API_URL/api/auth/login"
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')
echo "   Response: $LOGIN"

# Extract token from response (adjust based on your actual response format)
TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  # Try alternative format
  TOKEN=$(echo $LOGIN | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -n "$TOKEN" ]; then
  echo "   ✓ Login successful, token obtained: ${TOKEN:0:20}..."
else
  echo "   ✗ Login failed or no token in response"
fi

# Test 4: Submit a Complaint (if token obtained)
if [ -n "$TOKEN" ]; then
  echo ""
  echo "4. Submitting a Test Complaint..."
  echo "   POST $API_URL/api/complaints"
  COMPLAINT=$(curl -s -X POST "$API_URL/api/complaints" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "title": "Test Pothole",
      "description": "Large pothole on Main Street",
      "category": "Infrastructure",
      "location": "123 Main Street",
      "priority": "high"
    }')
  echo "   Response: $COMPLAINT"
  
  if [[ $COMPLAINT == *"success"* ]] || [[ $COMPLAINT == *"_id"* ]]; then
    echo "   ✓ Complaint submitted successfully"
  else
    echo "   Note: Check if complaints endpoint exists"
  fi
fi

# Test 5: Get All Complaints
if [ -n "$TOKEN" ]; then
  echo ""
  echo "5. Retrieving Complaints..."
  echo "   GET $API_URL/api/complaints"
  COMPLAINTS=$(curl -s "$API_URL/api/complaints" \
    -H "Authorization: Bearer $TOKEN")
  echo "   Response: $COMPLAINTS"
  
  if [[ $COMPLAINTS == *"["* ]] || [[ $COMPLAINTS == *"{"* ]]; then
    echo "   ✓ Successfully retrieved complaints"
  fi
fi

# Summary
echo ""
echo "========================================="
echo "Testing Complete!"
echo "========================================="
echo ""
echo "If all tests passed:"
echo "  1. Your application is working locally ✓"
echo "  2. Next: Push images to Docker Hub"
echo "  3. Then: Deploy to AWS EKS"
echo ""
echo "Commands:"
echo "  docker-compose logs -f        (view real-time logs)"
echo "  docker-compose stop           (stop services)"
echo "  docker-compose down -v        (remove all)"
