import { apiClient } from '../../utils/apiClient';

// Build query string, bỏ qua null/undefined/'' (giữ 0)
const qs = (params = {}) => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

// ===== Sự kiện =====
export const eventApi = {
  list: (params = {}) => apiClient.get(`/events${qs(params)}`),
  getById: (id) => apiClient.get(`/events/${id}`),
  // Admin
  create: (body) => apiClient.post(`/events`, body),
  update: (id, body) => apiClient.put(`/events/${id}`, body),
  remove: (id) => apiClient.delete(`/events/${id}`),
};

// ===== Tin tức =====
export const newsApi = {
  list: (params = {}) => apiClient.get(`/news${qs(params)}`),
  getById: (id) => apiClient.get(`/news/${id}`),
  categories: () => apiClient.get(`/news/categories`),
  tags: () => apiClient.get(`/news/tags`),
  // Admin - bài viết
  create: (body) => apiClient.post(`/news`, body),
  update: (id, body) => apiClient.put(`/news/${id}`, body),
  remove: (id) => apiClient.delete(`/news/${id}`),
  // Admin - chuyên mục
  createCategory: (body) => apiClient.post(`/news/categories`, body),
  updateCategory: (id, body) => apiClient.put(`/news/categories/${id}`, body),
  deleteCategory: (id) => apiClient.delete(`/news/categories/${id}`),
};
