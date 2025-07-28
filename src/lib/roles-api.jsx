import { apiClient } from "./api"

export const rolesApi = {
  // Get all roles
  getRoles: async (params) => {
    const response = await apiClient.get("/roles", { params })
    return response.data
  },

  // Get role by ID
  getRole: async (id) => {
    const response = await apiClient.get(`/roles/${id}`)
    return response.data
  },

  // Create role
  createRole: async (data) => {
    const response = await apiClient.post("/roles", data)
    return response.data
  },

  // Update role - with debugging
  updateRole: async (id, data) => {
    try {
      console.log("Making PUT request to:", `/roles/${id}`)
      console.log("Request data:", data)
      
      const response = await apiClient.put(`/roles/${id}`, data)
      
      console.log("Response status:", response.status)
      console.log("Response data:", response.data)
      
      return response.data
    } catch (error) {
      console.error("API Error in updateRole:")
      console.error("Status:", error.response?.status)
      console.error("Status Text:", error.response?.statusText)
      console.error("Response Data:", error.response?.data)
      console.error("Request Config:", error.config)
      
      // Re-throw the error so it can be handled by the calling component
      throw error
    }
  },

  // Delete role
  deleteRole: async (id) => {
    const response = await apiClient.delete(`/roles/${id}`)
    return response.data
  },

  // Get role statistics
  getRoleStats: async () => {
    const response = await apiClient.get("/roles/statistics")
    return response.data
  },
}