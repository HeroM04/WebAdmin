let BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  BASE_URL = 'https://kpi-backend-4xex.onrender.com/api/v1';
} else if (!BASE_URL) {
  console.warn("Chưa cấu hình VITE_API_BASE_URL trong file .env!");
  BASE_URL = 'http://localhost:8088/api/v1'; // Fallback
}

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
