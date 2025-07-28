import { apiClient } from "./api"


export const stagesAPI = {
  getAll: (params) => apiClient.get("/stages", { params }),
  getById: (id) => apiClient.get(`/stages/details/${id}`),
  getBySlug: (slug) => apiClient.get(`/stages/${slug}`),
  create: (data) => apiClient.post("/stages", data),
  update: (slug, data) => apiClient.put(`/stages/${slug}`, data),
  delete: (slug) => apiClient.delete(`/stages/${slug}`),
}