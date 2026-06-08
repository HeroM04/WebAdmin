import { apiClient } from '../../../utils/apiClient';

const BASE_PATH = '/salepro';

export const saleProApi = {
  getAllProjects: () => apiClient.get(`${BASE_PATH}/projects`),
  
  getProjectById: (id) => apiClient.get(`${BASE_PATH}/projects/${id}`),
  
  getBuildingsByProjectId: (projectId) => apiClient.get(`${BASE_PATH}/projects/${projectId}/buildings`),
  
  getApartmentsByBuildingId: (buildingId) => apiClient.get(`${BASE_PATH}/buildings/${buildingId}/apartments`),
  
  updateApartmentStatus: (apartmentId, status) => apiClient.put(`${BASE_PATH}/apartments/${apartmentId}/status?status=${status}`),
};
