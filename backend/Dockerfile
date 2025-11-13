# ---------- Stage 1: Install Dependencies ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ---------- Stage 2: Final Lightweight Runtime ----------
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 5000

CMD ["node", "server.js"]
