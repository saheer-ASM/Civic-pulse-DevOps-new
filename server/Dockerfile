FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl (needed for healthcheck) and bash if you want shell access
RUN apk add --no-cache curl bash

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Healthcheck to monitor if app is running
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]

