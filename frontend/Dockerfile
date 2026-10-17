# Multi-Stage Dockerfile for ClaimGuard AI Frontend
# Architecture Target: IBM LinuxONE (s390x) & x86_64
# Compatible with multi-arch docker buildx

# Stage 1: Build static assets with Node.js (Debian slim has full s390x/IBM Z support)
FROM node:20-slim AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies (frozen lockfile or clean install)
RUN npm ci || npm install

# Copy source code and build config
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# Stage 2: Serve static production assets via lightweight Nginx (multi-arch s390x compatible)
FROM nginx:bookworm-slim

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration supporting SPA client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
