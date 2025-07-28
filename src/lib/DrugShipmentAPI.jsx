import { apiClient } from "./api"

export const shipmentsAPI = {
  getAll: (params) => apiClient.get("/shipments", { params }),
  getById: (id) => apiClient.get(`/shipments/${id}`),
  create: (data) => apiClient.post("/shipments", data),
  update: (id, data) => apiClient.put(`/shipments/${id}`, data),
  delete: (id) => apiClient.delete(`/shipments/${id}`),
  acknowledge: (id, data) => apiClient.post(`/shipments/${id}/acknowledge`, data),
  getRelatedFields: (studyId) => {
    console.log("Calling API with studyId:", studyId)
    return apiClient.get(`/shipments/related-fields/${studyId}`)
  },
}
