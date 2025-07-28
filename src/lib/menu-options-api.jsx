import { apiClient } from "./api"

export const menuOptionsApi = {
  // Get all menu options
  getMenuOptions: async (params) => {
    const response = await apiClient.get("/menu-options", { params })
    return response.data
  },

  // Get menu hierarchy
  getMenuHierarchy: async () => {
    const response = await apiClient.get("/menu-options/hierarchy")
    return response.data
  },

  // Get parent menu options
  getParentMenuOptions: async () => {
    const response = await apiClient.get("/menu-options/parents")
    return response.data
  },

  // Get menu option by ID
  getMenuOptionById: async (id) => {
    const response = await apiClient.get(`/menu-options/${id}`)
    return response.data
  },

  // Create menu option
  createMenuOption: async (data) => {
    const response = await apiClient.post("/menu-options", data)
    return response.data
  },

  // Update menu option
  updateMenuOption: async (id, data) => {
    const response = await apiClient.put(`/menu-options/${id}`, data)
    return response.data
  },

  // Delete menu option
  deleteMenuOption: async (id) => {
    const response = await apiClient.delete(`/menu-options/${id}`)
    return response.data
  },
}