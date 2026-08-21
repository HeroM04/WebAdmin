// Luôn dùng biến môi trường từ Vite (.env.production / .env.development)
// Khi build production: VITE_API_BASE_URL sẽ là URL của Render
// Khi chạy dev local: VITE_API_BASE_URL sẽ là localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kpi-backend-4xex.onrender.com/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('kpi_access_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Unauthorized - token expired or invalid
    localStorage.removeItem('kpi_is_auth');
    localStorage.removeItem('kpi_access_token');
    localStorage.removeItem('kpi_current_user');
    window.location.href = '/';
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

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
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
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (response.status === 401) return handleResponse(response); // để chung một chỗ xử lý hết hạn
    const data = await response.json().catch(() => null);
    if (!response.ok) return Promise.reject(data || response.statusText);
    return data;
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  upload: async (endpoint, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = getAuthHeaders();
    delete headers['Content-Type']; // Let browser set Content-Type with boundary

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });
    return handleResponse(response);
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};
