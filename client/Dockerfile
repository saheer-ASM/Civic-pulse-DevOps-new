# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# 1. Copy package files first to leverage Docker cache
COPY package*.json ./

# 2. Install dependencies (including legacy support for your MERN project)
RUN npm ci --legacy-peer-deps

# 3. Copy EVERYTHING from the client directory
# This avoids "folder not found" errors by grabbing the whole structure at once
COPY . .

# 4. Verify the folder structure in the Jenkins log (Useful for debugging)
RUN ls -la /app/public && ls -la /app/src

# 5. Make node_modules executables accessible
RUN chmod -R +x node_modules/.bin

# 6. Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for cluster-side health checks in EKS
RUN apk add --no-cache curl

# Copy built files from the build stage to the Nginx root
COPY --from=build /app/build /usr/share/nginx/html

# Copy your specific nginx configuration for React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions for the Nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

# Health check to ensure the container is serving traffic
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]