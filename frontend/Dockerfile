FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Install ONLY dependencies first to leverage caching
COPY package*.json ./
RUN npm ci

# Copy source after deps are cached
COPY . .
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM node:18-alpine

WORKDIR /app

# Serve build files using a lightweight static server
RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
