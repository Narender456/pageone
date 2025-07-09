import { apiClient } from "./api"

class StudyTypeAPI {
  async getStudytype(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/study-types?${queryString}` : "/study-types"

    try {
      const response = await apiClient.get(endpoint)
      console.log('API Response:', response)

      if (response && response.data && Array.isArray(response.data)) {
        return response
      }

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

  async getStudyTypeById(id) {
    try {
      const response = await apiClient.get(`/study-types/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async createStudyType(data) {
    try {
      const payload = {
        study_type: data.study_type,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
      }

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })

      console.log('Creating study Type with payload:', payload)
      const response = await apiClient.post("/study-types", payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async updateStudyType(id, data) {
    try {
      const payload = {
        study_Type: data.study_Type,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
      }

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })

      console.log('Updating study Type with payload:', payload)
      const response = await apiClient.put(`/study-types/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteStudyType(id) {
    try {
      const response = await apiClient.delete(`/study-types/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async toggleStudytypetatus(id) {
    try {
      const response = await apiClient.patch(`/study-types/${id}/toggle-status`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getStudytypetats() {
    try {
      const response = await apiClient.get("/study-types/stats")
      console.log('Stats Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addStudyToType(TypeId, studyId) {
    try {
      const response = await apiClient.post(`/study-types/${TypeId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromType(TypeId, studyId) {
    try {
      const response = await apiClient.delete(`/study-types/${TypeId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const studyTypeAPI = new StudyTypeAPI()
