import { apiClient } from '../../../utils/apiClient';

const BASE_PATH = '/salepro';

// Build query string, bỏ qua giá trị null/undefined/'' (giữ 0)
const qs = (params = {}) => {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export const saleProApi = {
  getAllProjects: () => apiClient.get(`${BASE_PATH}/projects`),

  getProjectById: (id) => apiClient.get(`${BASE_PATH}/projects/${id}`),

  getBuildingsByProjectId: (projectId) => apiClient.get(`${BASE_PATH}/projects/${projectId}/buildings`),

  getBuildingById: (buildingId) => apiClient.get(`${BASE_PATH}/buildings/${buildingId}`),

  getFloorPlansByBuildingId: (buildingId) => apiClient.get(`${BASE_PATH}/buildings/${buildingId}/floor-plans`),

  getApartmentsByBuildingId: (buildingId) => apiClient.get(`${BASE_PATH}/buildings/${buildingId}/apartments`),

  getApartmentsByProjectId: (projectId) => apiClient.get(`${BASE_PATH}/projects/${projectId}/apartments`),

  // Quỹ căn: tìm kiếm + lọc + phân trang (server-side)
  searchApartments: (projectId, params = {}) =>
    apiClient.get(`${BASE_PATH}/projects/${projectId}/apartments/search${qs(params)}`),

  updateApartmentStatus: (apartmentId, status) =>
    apiClient.put(`${BASE_PATH}/apartments/${apartmentId}/status?status=${status}`),

  // Hỏi đáp
  getApartmentQuestions: (apartmentId) => apiClient.get(`${BASE_PATH}/apartments/${apartmentId}/questions`),
  createApartmentQuestion: (apartmentId, body) =>
    apiClient.post(`${BASE_PATH}/apartments/${apartmentId}/questions`, body),

  // Tiến độ & Tài liệu
  getProjectProgress: (projectId) => apiClient.get(`${BASE_PATH}/projects/${projectId}/progress`),
  getProjectDocuments: (projectId) => apiClient.get(`${BASE_PATH}/projects/${projectId}/documents`),
};
