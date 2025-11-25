# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install build tools for native npm modules
RUN apk add --no-cache python3 make g++

# Copy dependency manifests
COPY package*.json ./

# Install deps
RUN npm install

# Copy the rest of the source
COPY . .

# Build Vite app
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy built assets from previous stage
COPY --from=build /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
