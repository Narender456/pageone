import { apiClient } from "./api"

export const permissionsApi = {
  // Get permissions for a role
  getRolePermissions: async (roleId) => {
    const response = await apiClient.get(`/permissions/roles/${roleId}`)
    return response.data
  },

  // Update role permissions
  updateRolePermissions: async (roleId, permissions) => {
    const response = await apiClient.put(`/permissions/roles/${roleId}`, { permissions })
    return response.data
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    const response = await apiClient.get(`/permissions/users/${userId}`)
    return response.data
  },

  // Check user permission for specific menu
  checkUserPermission: async (userId, menuOptionId, action) => {
    const response = await apiClient.get(`/permissions/users/${userId}/check/${menuOptionId}`, {
      params: { action },
    })
    return response.data
  },
}