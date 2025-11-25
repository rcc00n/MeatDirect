# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache python3 make g++

# monorepo: context is repo root, so copy from frontend/
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
