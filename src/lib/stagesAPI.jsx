import { apiClient } from "./api"

export const stagesAPI = {
  getAll: async (params) => {
    try {
      console.log('=== STAGES API CALL ===');
      console.log('Calling /stages endpoint with params:', params);
      console.log('API client available:', !!apiClient);
      
      const response = await apiClient.get("/stages", { params });
      
      console.log('Raw stages API response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      
      if (response?.data) {
        console.log('Response data keys:', Object.keys(response.data));
        console.log('Is response.data an array?', Array.isArray(response.data));
      }
      
      console.log('=== END STAGES API CALL ===');
      
      return response;
    } catch (error) {
      console.error('=== STAGES API ERROR ===');
      console.error('Error calling stages API:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('=== END STAGES API ERROR ===');
      throw error;
    }
  },
  getById: (id) => apiClient.get(`/stages/details/${id}`),
  getBySlug: (slug) => apiClient.get(`/stages/${slug}`),
  create: (data) => apiClient.post("/stages", data),
  update: (slug, data) => apiClient.put(`/stages/${slug}`, data),
  delete: (slug) => apiClient.delete(`/stages/${slug}`),
}