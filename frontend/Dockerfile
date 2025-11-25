# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Tools for native npm modules (safe to keep)
RUN apk add --no-cache python3 make g++

# Copy dependency manifests from monorepo root
COPY frontend/package*.json ./

RUN npm install

# Copy the rest of the frontend source
COPY frontend/ .

RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Built assets
COPY --from=build /app/dist ./

# 🔹 Use our SPA nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
