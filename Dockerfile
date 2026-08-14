# syntax=docker/dockerfile:1

# ============================================================
# KPI Frontend — React 19 + Vite → build static, serve bằng nginx
# nginx đồng thời proxy /api, /ws sang backend (không cần CORS)
# ============================================================

# ---- Stage 1: Build ----
# Vite 8 yêu cầu Node >= 20.19 → dùng Node 22
FROM node:22-alpine AS builder
WORKDIR /app

# Cài dependencies theo lockfile (ổn định, có cache layer)
COPY package*.json ./
RUN npm ci

# Copy mã nguồn
COPY . .

# API/WS trỏ tương đối để nginx proxy sang backend trong mạng Docker.
# Ghi đè .env.production để build ra đúng cấu hình container (xác định,
# không phụ thuộc thứ tự ưu tiên biến môi trường của Vite).
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_WS_URL=/ws
RUN printf "VITE_API_BASE_URL=%s\nVITE_WS_URL=%s\n" "$VITE_API_BASE_URL" "$VITE_WS_URL" > .env.production

RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:alpine

# Cấu hình Nginx tùy chỉnh: SPA fallback + proxy API/WS
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bản build tĩnh
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
