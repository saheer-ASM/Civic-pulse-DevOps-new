# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# 1. Copy everything first
COPY . .

# 2. DEBUG: See exactly what Docker sees in the build context
RUN echo "Checking directory structure:" && ls -R /app

# 3. SMART FIX: Handle any nested 'client' folder or casing issues
RUN if [ -d "client/public" ]; then mv client/* . && mv client/.* . 2>/dev/null || true; fi

# 4. Install dependencies
RUN npm install --legacy-peer-deps

# 5. Build the application
# We use the full path to ensure it finds the file
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache curl
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:80/ || exit 1
CMD ["nginx", "-g", "daemon off;"]