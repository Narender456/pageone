import { apiClient } from "./api"

class StudyDesignsAPI {
  async getStudyDesigns(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/study-designs?${queryString}` : "/study-designs"

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

  async getStudyDesignById(id) {
    try {
      const response = await apiClient.get(`/study-designs/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async createStudyDesign(data) {
    try {
      // Clean and prepare the data for backend
        const payload = {
          study_design: data.study_design,
          isActive: data.isActive,
          studies: data.selectedStudies || data.studies || [],
        }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Creating study design with payload:', payload)
      const response = await apiClient.post("/study-designs", payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async updateStudyDesign(id, data) {
    try {
      // Clean and prepare the data for backend
      const payload = {
        study_design: data.study_design,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
      }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating study design with payload:', payload)
      const response = await apiClient.put(`/study-designs/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteStudyDesign(id) {
    try {
      const response = await apiClient.delete(`/study-designs/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async toggleStudyDesignStatus(id) {
    try {
      const response = await apiClient.patch(`/study-designs/${id}/toggle-status`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getStudyDesignStats() {
    try {
      const response = await apiClient.get("/study-designs/stats")
      console.log('Stats Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addStudyToDesign(designId, studyId) {
    try {
      const response = await apiClient.post(`/study-designs/${designId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromDesign(designId, studyId) {
    try {
      const response = await apiClient.delete(`/study-designs/${designId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const studyDesignsAPI = new StudyDesignsAPI()