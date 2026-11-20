import { layToken, lamMoiToken, xoaPhien } from './phienDangNhap';

// Luôn dùng biến môi trường từ Vite (.env.production / .env.development)
// Khi build production: VITE_API_BASE_URL sẽ là URL của Render
// Khi chạy dev local: VITE_API_BASE_URL sẽ là localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.trilongland.vn/api/v1';

const veTrangDangNhap = () => {
  xoaPhien();
  window.location.href = '/';
};

/**
 * Gọi máy chủ kèm token; token hết hạn (401) thì tự xin token mới rồi gọi lại
 * đúng một lần — người đang dùng web không bị đá ra mỗi giờ nữa (xem phienDangNhap.js).
 * Xin token mới bị từ chối (bị đăng xuất từ xa, bỏ web quá lâu) thì trả nguyên
 * 401 để chỗ gọi đưa về trang đăng nhập. Mất mạng lúc xin token thì báo lỗi,
 * KHÔNG đăng xuất.
 *
 * Dùng được cho cả địa chỉ ngoài BASE_URL (tải file Excel ở /api/reports).
 *
 * @param {string} url    địa chỉ đầy đủ
 * @param {RequestInit} init  không cần tự thêm Authorization
 * @returns {Promise<Response>}
 */
export async function fetchCoToken(url, init = {}) {
  const goi = (token) => {
    const headers = new Headers(init.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };

  const token = layToken();
  const res = await goi(token);
  if (res.status !== 401 || !token) return res;

  const kq = await lamMoiToken(BASE_URL, token);
  if (kq.token) return goi(kq.token);
  if (kq.loiTam) throw new Error('Mất kết nối tới máy chủ, thử lại sau ít phút.');
  return res; // hết phiên thật
}

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Đã thử gia hạn mà vẫn 401: phiên kết thúc thật
    veTrangDangNhap();
    return Promise.reject('Unauthorized');
  }

  // Xử lý status 204 No Content
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return Promise.reject(data || response.statusText);
  }

  // Unwrap { status: 'SUCCESS', data: ... }
  if (data && data.status === 'SUCCESS' && data.data !== undefined) {
    return data.data;
  }

  return data;
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetchCoToken(`${BASE_URL}${endpoint}`, { method: 'GET', headers: JSON_HEADERS });
    return handleResponse(response);
  },

  /**
   * Như get() nhưng KHÔNG bóc lớp bọc { status, data }.
   *
   * Cần cho các endpoint trả kèm thông tin ngoài `data` — ví dụ chấm công gửi
   * thêm `page` (phân trang) và `stats` (thống kê). Dùng get() ở đó sẽ chỉ nhận
   * được mảng bản ghi và mất sạch phần còn lại.
   */
  getRaw: async (endpoint) => {
    const response = await fetchCoToken(`${BASE_URL}${endpoint}`, { method: 'GET', headers: JSON_HEADERS });
    if (response.status === 401) return handleResponse(response); // để chung một chỗ xử lý hết hạn
    const data = await response.json().catch(() => null);
    if (!response.ok) return Promise.reject(data || response.statusText);
    return data;
  },

  post: async (endpoint, body) => {
    const response = await fetchCoToken(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  upload: async (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Không đặt Content-Type: trình duyệt tự ghi kèm boundary.
    // FormData của trình duyệt gửi lại được, nên gọi lại sau khi gia hạn token vẫn đủ ảnh.
    const response = await fetchCoToken(`${BASE_URL}${endpoint}`, { method: 'POST', body: formData });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetchCoToken(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetchCoToken(`${BASE_URL}${endpoint}`, { method: 'DELETE', headers: JSON_HEADERS });
    return handleResponse(response);
  }
};
