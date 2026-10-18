# ==============================================================================
# Multi-Architecture Production Frontend Image for IBM LinuxONE (s390x) & x86_64
# Serves pre-built static React production assets via lightweight Nginx
# Avoids node/esbuild native binary architecture incompatibilities on s390x
# ==============================================================================

FROM nginx:bookworm-slim

# Remove default nginx static html
RUN rm -rf /usr/share/nginx/html/*

# Copy pre-compiled production bundle into webroot
COPY dist /usr/share/nginx/html

# Copy custom Nginx configuration supporting SPA routing and backend API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
