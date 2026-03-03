# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
