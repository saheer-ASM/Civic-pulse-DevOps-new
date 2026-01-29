# Local Testing Guide - Civic Pulse DevOps

## Step 1: Build Docker Images Locally

```bash
# Go to project root
cd ~/Civic-pulse-DevOps-new

# Build server image
docker build -t saheer/civic-pulse-server:latest ./server

# Build client image
docker build -t saheer/civic-pulse-client:latest ./client

# Verify images were created
docker images | grep civic-pulse
```

Expected output:
```
saheer/civic-pulse-server   latest    abc123def456   2 minutes ago   ...
saheer/civic-pulse-client   latest    def456ghi789   1 minute ago    ...
```

---

## Step 2: Start Services with Docker Compose

```bash
# Start all services (MongoDB, Server, Client)
docker-compose up -d

# Check status
docker-compose ps

# Watch logs
docker-compose logs -f
```

Expected output:
```
CONTAINER ID   IMAGE                              STATUS              PORTS
abc123...      civic-pulse-mongodb:latest         Up 30s (healthy)    27017/tcp
def456...      saheer/civic-pulse-server:latest   Up 20s (healthy)    0.0.0.0:5000->5000/tcp
ghi789...      saheer/civic-pulse-client:latest   Up 10s (healthy)    0.0.0.0:3000->80/tcp
```

---

## Step 3: Test the Application

### Test Frontend (Client)
```bash
# Open browser: http://localhost:3000
# You should see the Civic Pulse interface

# Or test with curl
curl -s http://localhost:3000 | head -20
```

### Test Backend API (Server)
```bash
# Check health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-28T..."}
```

### Test MongoDB Connection
```bash
# Connect to MongoDB container
docker-compose exec mongodb mongosh -u admin -p changeme

# In the MongoDB shell, run:
use admin
db.adminCommand('ping')

# Exit with: exit
```

---

## Step 4: Test API Endpoints

### Create a User (Register)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Expected: User created successfully
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Expected: JWT token in response
# Save the token for next requests
```

### Submit a Complaint (Replace TOKEN with actual JWT)
```bash
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "There is a large pothole that needs repair",
    "category": "Infrastructure",
    "location": "123 Main Street",
    "priority": "high"
  }'

# Expected: Complaint created successfully
```

### Get All Complaints
```bash
curl http://localhost:5000/api/complaints \
  -H "Authorization: Bearer $TOKEN"

# Expected: List of complaints in JSON
```

---

## Step 5: Check Logs

```bash
# Server logs
docker-compose logs server

# Client logs
docker-compose logs client

# MongoDB logs
docker-compose logs mongodb

# All logs with timestamps
docker-compose logs --timestamps
```

---

## Step 6: Stop and Clean Up

```bash
# Stop containers (but keep data)
docker-compose stop

# Remove containers (data persists in volumes)
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Clean up old images
docker image prune -a
```

---

## Troubleshooting

### Issue: "Connection refused" when accessing localhost:3000
**Solution:**
```bash
# Check if containers are running
docker-compose ps

# Restart containers
docker-compose restart

# Check logs
docker-compose logs client
```

### Issue: MongoDB connection error
**Solution:**
```bash
# Verify MongoDB is healthy
docker-compose exec mongodb mongosh -u admin -p changeme

# Check MongoDB logs
docker-compose logs mongodb
```

### Issue: Server can't connect to MongoDB
**Solution:**
```bash
# The server uses the hostname "mongodb" (not localhost)
# This is configured in docker-compose.yml
# Do NOT change DB_HOST to "localhost"

# Verify network connectivity
docker-compose exec server ping mongodb
```

### Issue: Port already in use (3000, 5000, 27017)
**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
# Then restart
docker-compose down
docker-compose up -d
```

---

## Performance Optimization

The new Dockerfiles use multi-stage builds to minimize image size:

**Server Image Size:** ~300MB (down from ~500MB)
**Client Image Size:** ~50MB (down from ~200MB)

Benefits:
- Faster builds
- Faster container startup
- Reduced storage requirements
- Better for CI/CD pipelines

---

## Next Steps (After Local Testing)

Once everything works locally:

1. **Push to Docker Hub:**
```bash
docker login
docker push saheer/civic-pulse-server:latest
docker push saheer/civic-pulse-client:latest
```

2. **Deploy to AWS EKS:**
```bash
cd infrastructure
terraform init
terraform plan -out=tfplan
terraform apply tfplan  # WARNING: Costs money!
```

3. **Configure kubectl:**
```bash
aws eks update-kubeconfig --name civic-pulse-eks --region us-east-1
```

4. **Deploy with Helm:**
```bash
helm upgrade --install civic-pulse ./charts/civic-pulse
```

---

## Success Checklist

- [ ] Docker images build successfully
- [ ] Docker Compose starts all services
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:5000
- [ ] MongoDB is running and healthy
- [ ] Can register a user
- [ ] Can log in and get JWT token
- [ ] Can submit and retrieve complaints
- [ ] No errors in container logs

Once all checks pass, you're ready for AWS deployment! 🚀
