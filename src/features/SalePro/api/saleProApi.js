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

  getReferrer: (userId) => apiClient.get(`${BASE_PATH}/referrer/${userId}`),

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

  // Admin CRUD
  createProject: (body) => apiClient.post(`${BASE_PATH}/admin/projects`, body),
  updateProject: (id, body) => apiClient.put(`${BASE_PATH}/admin/projects/${id}`, body),
  deleteProject: (id) => apiClient.delete(`${BASE_PATH}/admin/projects/${id}`),

  createBuilding: (body) => apiClient.post(`${BASE_PATH}/admin/buildings`, body),
  updateBuilding: (id, body) => apiClient.put(`${BASE_PATH}/admin/buildings/${id}`, body),
  deleteBuilding: (id) => apiClient.delete(`${BASE_PATH}/admin/buildings/${id}`),

  createApartment: (body) => apiClient.post(`${BASE_PATH}/admin/apartments`, body),
  updateApartment: (id, body) => apiClient.put(`${BASE_PATH}/admin/apartments/${id}`, body),
  deleteApartment: (id) => apiClient.delete(`${BASE_PATH}/admin/apartments/${id}`),

  // Admin - Chuyên viên
  listAgents: () => apiClient.get(`${BASE_PATH}/admin/agents`),
  createAgent: (body) => apiClient.post(`${BASE_PATH}/admin/agents`, body),
  updateAgent: (id, body) => apiClient.put(`${BASE_PATH}/admin/agents/${id}`, body),
  deleteAgent: (id) => apiClient.delete(`${BASE_PATH}/admin/agents/${id}`),

  // Admin - Mặt bằng tầng
  createFloorPlan: (body) => apiClient.post(`${BASE_PATH}/admin/floor-plans`, body),
  updateFloorPlan: (id, body) => apiClient.put(`${BASE_PATH}/admin/floor-plans/${id}`, body),
  deleteFloorPlan: (id) => apiClient.delete(`${BASE_PATH}/admin/floor-plans/${id}`),

  // Admin - Tiến độ
  createProgress: (body) => apiClient.post(`${BASE_PATH}/admin/progress`, body),
  updateProgress: (id, body) => apiClient.put(`${BASE_PATH}/admin/progress/${id}`, body),
  deleteProgress: (id) => apiClient.delete(`${BASE_PATH}/admin/progress/${id}`),

  // Admin - Tài liệu
  createDocument: (body) => apiClient.post(`${BASE_PATH}/admin/documents`, body),
  updateDocument: (id, body) => apiClient.put(`${BASE_PATH}/admin/documents/${id}`, body),
  deleteDocument: (id) => apiClient.delete(`${BASE_PATH}/admin/documents/${id}`),
};
