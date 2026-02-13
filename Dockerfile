# -----------------------------
# Stage 1: Build frontend
# -----------------------------
FROM node:20-slim AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build


# -----------------------------
# Stage 2: Backend runtime
# -----------------------------
FROM node:20-slim

ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm install --omit=dev --prefix ./backend

COPY backend ./backend

RUN mkdir -p ./backend/public
COPY --from=builder /app/frontend/dist ./backend/public

EXPOSE 5000

RUN chown -R node:node /app
USER node

CMD ["node", "backend/server.js"]
