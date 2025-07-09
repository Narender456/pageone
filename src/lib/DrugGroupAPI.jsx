import { apiClient } from "./api"

class DrugGroupAPI {
  async getDrugGroups(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/drug-groups?${queryString}` : "/drug-groups"

    try {
      const response = await apiClient.get(endpoint)
      console.log('API Response:', response)
      
      // Handle the response structure that matches your backend
      // Your backend returns: { success: true, count: X, total: X, pagination: {...}, data: [...] }
      if (response && response.data && Array.isArray(response.data)) {
        return response
      }
      
      // If the response is directly an array (some API clients might unwrap it)
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          count: response.length
        }
      }
      
      throw new Error('Unexpected response structure')
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getDrugGroupById(id) {
    try {
      const response = await apiClient.get(`/drug-groups/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async createDrugGroup(data) {
    try {
      // Clean and prepare the data for backend
      const payload = {
        group_name: data.group_name,
        description: data.description,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
        drugs: data.selectedDrugs || data.drugs || [],
      }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Creating drug group with payload:', payload)
      const response = await apiClient.post("/drug-groups", payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async updateDrugGroup(id, data) {
    try {
      // Clean and prepare the data for backend
      const payload = {
        group_name: data.group_name,
        description: data.description,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
        drugs: data.selectedDrugs || data.drugs || [],
      }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating drug group with payload:', payload)
      const response = await apiClient.put(`/drug-groups/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteDrugGroup(id) {
    try {
      const response = await apiClient.delete(`/drug-groups/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async toggleDrugGroupStatus(id) {
    try {
      const response = await apiClient.patch(`/drug-groups/${id}/toggle-status`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getDrugGroupStats() {
    try {
      const response = await apiClient.get("/drug-groups/stats")
      console.log('Stats Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Study management methods
  async addStudyToDrugGroup(drugGroupId, studyId) {
    try {
      const response = await apiClient.post(`/drug-groups/${drugGroupId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromDrugGroup(drugGroupId, studyId) {
    try {
      const response = await apiClient.delete(`/drug-groups/${drugGroupId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async bulkAddStudiesToDrugGroup(drugGroupId, studyIds) {
    try {
      const payload = { studyIds }
      const response = await apiClient.post(`/drug-groups/${drugGroupId}/studies/bulk`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getStudiesInGroup(drugGroupId) {
    try {
      const response = await apiClient.get(`/drug-groups/${drugGroupId}/studies`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getAvailableStudies() {
    try {
      const response = await apiClient.get("/drug-groups/available-studies")
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Drug management methods
  async addDrugToDrugGroup(drugGroupId, drugId) {
    try {
      const response = await apiClient.post(`/drug-groups/${drugGroupId}/drugs/${drugId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeDrugFromDrugGroup(drugGroupId, drugId) {
    try {
      const response = await apiClient.delete(`/drug-groups/${drugGroupId}/drugs/${drugId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async bulkAddDrugsToDrugGroup(drugGroupId, drugIds) {
    try {
      const payload = { drugIds }
      const response = await apiClient.post(`/drug-groups/${drugGroupId}/drugs/bulk`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getDrugsInGroup(drugGroupId) {
    try {
      const response = await apiClient.get(`/drug-groups/${drugGroupId}/drugs`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getAvailableDrugs() {
    try {
      const response = await apiClient.get("/drug-groups/available-drugs")
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Utility methods
  async syncDrugGroupRelationships() {
    try {
      const response = await apiClient.post("/drug-groups/sync-relationships")
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const drugGroupAPI = new DrugGroupAPI()