import { apiClient } from "./api"

export const studiesApi = {
  // Get all studies with filters
getStudies: async (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, value.toString())
    }
  })

  const response = await apiClient.get(`/studies?${params.toString()}`)
  console.log("📡 GET /studies response", response.data)
  return response.data // Not .data.data unless you unwrap it
},
  // Get single study
  getStudy: async (id) => {
    const response = await apiClient.get(`/studies/${id}`)
    return response.data
  },

  // Create study
  createStudy: async (data) => {
    const response = await apiClient.post("/studies", data)
    return response.data
  },

  // Update study
  updateStudy: async (id, data) => {
    const response = await apiClient.put(`/studies/${id}`, data)
    return response.data
  },

  // Delete study
  deleteStudy: async (id) => {
    const response = await apiClient.delete(`/studies/${id}`)
    return response.data
  },

  // Get study statistics
  getStudyStats: async () => {
    const response = await apiClient.get("/studies/stats")
    return response.data
  },

  // Get blinding statuses
  getBlindingStatuses: async () => {
    const response = await apiClient.get("/studies/blinding-statuses")
    return response.data
  },
}
