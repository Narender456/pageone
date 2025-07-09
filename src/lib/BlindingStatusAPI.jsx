import { apiClient } from "./api"

class BlindingStatusAPI {
  async getBlindingStatuses(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/blinding-status?${queryString}` : "/blinding-status"

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

  async getBlindingStatusById(id) {
    try {
      const response = await apiClient.get(`/blinding-status/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async createBlindingStatus(data) {
    try {
      // Clean and prepare the data for backend
        const payload = {
          blinding_status: data.blinding_status,
          isActive: data.isActive,
          studies: data.selectedStudies || data.studies || [],
        }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Creating blinding status with payload:', payload)
      const response = await apiClient.post("/blinding-status", payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async updateBlindingStatus(id, data) {
    try {
      // Clean and prepare the data for backend
      const payload = {
        blinding_status: data.blinding_status,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
      }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating blinding status with payload:', payload)
      const response = await apiClient.put(`/blinding-status/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteBlindingStatus(id) {
    try {
      const response = await apiClient.delete(`/blinding-status/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async toggleBlindingStatusStatus(id) {
    try {
      const response = await apiClient.patch(`/blinding-status/${id}/toggle-status`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getBlindingStatusStats() {
    try {
      const response = await apiClient.get("/blinding-status/stats")
      console.log('Stats Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addStudyToBlindingStatus(blindingStatusId, studyId) {
    try {
      const response = await apiClient.post(`/blinding-status/${blindingStatusId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromBlindingStatus(blindingStatusId, studyId) {
    try {
      const response = await apiClient.delete(`/blinding-status/${blindingStatusId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const blindingStatusAPI = new BlindingStatusAPI()