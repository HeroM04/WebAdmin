# Stage 1: Build the Vite React application
FROM node:18-alpine AS builder

WORKDIR /app

# Khai báo các biến môi trường cần thiết lúc build (Vite cần biến môi trường để nướng vào file tĩnh)
ARG VITE_API_BASE_URL
ARG VITE_WS_URL

# Gán giá trị biến môi trường cho quá trình build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn và build
COPY . .
RUN npm run build

# Stage 2: Phục vụ ứng dụng tĩnh với Nginx
FROM nginx:alpine

# Copy cấu hình Nginx tùy chỉnh (hỗ trợ React Router fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy thư mục build từ stage 1 sang thư mục phục vụ mặc định của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
