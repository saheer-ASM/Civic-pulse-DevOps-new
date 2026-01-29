# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# 1. Copy everything first so we can detect the structure
COPY . .

# 2. SMART FIX: Check if files are nested in a 'client' subfolder and move them up
# This solves the "public/index.html not found" error automatically.
RUN if [ -d "client/public" ]; then \
        echo "Nested structure detected. Moving files..."; \
        mv client/* . && mv client/.* . 2>/dev/null || true; \
    fi

# 3. Clean and install dependencies in the correct root
RUN rm -rf node_modules && npm install --legacy-peer-deps

# 4. Final verification of paths before building
RUN ls -la public/index.html && ls -la src/index.js

# 5. Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for EKS health checks
RUN apk add --no-cache curl

# Copy the build output from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy your nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]