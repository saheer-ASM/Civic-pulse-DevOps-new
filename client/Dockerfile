# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# 1. Copy dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 2. Copy EVERYTHING (Ensure public/ and src/ are here)
COPY . .

# 3. VERIFICATION: This MUST show 'public' and 'src' in the Jenkins log
RUN ls -la /app

# 4. Build
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]