import { apiClient } from "./api"

class SponsorsAPI {
  async getSponsors(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/sponsors?${queryString}` : "/sponsors"

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

  async getSponsorById(id) {
    try {
      const response = await apiClient.get(`/sponsors/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async createSponsor(data) {
    try {
      // ENHANCED DEBUG LOGGING
      console.log('=== CREATE SPONSOR DEBUG START ===')
      console.log('1. Raw input data:', JSON.stringify(data, null, 2))
      console.log('2. Data properties:')
      console.log('   - sponsor_name:', data.sponsor_name, '(type:', typeof data.sponsor_name, ')')
      console.log('   - isActive:', data.isActive, '(type:', typeof data.isActive, ')')
      console.log('   - selectedStudies:', data.selectedStudies, '(type:', typeof data.selectedStudies, ', isArray:', Array.isArray(data.selectedStudies), ')')
      console.log('   - studies:', data.studies, '(type:', typeof data.studies, ', isArray:', Array.isArray(data.studies), ')')

      // Validate sponsor_name first
      if (!data.sponsor_name || typeof data.sponsor_name !== 'string' || data.sponsor_name.trim().length === 0) {
        console.error('❌ sponsor_name validation failed:', data.sponsor_name)
        throw new Error('Sponsor name is required and must be a non-empty string')
      }

      // Handle studies array more carefully
      let studiesArray = []
      if (data.selectedStudies) {
        if (Array.isArray(data.selectedStudies)) {
          studiesArray = data.selectedStudies
        } else {
          console.warn('selectedStudies is not an array:', data.selectedStudies)
        }
      } else if (data.studies) {
        if (Array.isArray(data.studies)) {
          studiesArray = data.studies
        } else {
          console.warn('studies is not an array:', data.studies)
        }
      }

      console.log('3. Processed studies array:', studiesArray)

      // Create clean payload
      const payload = {
        sponsor_name: data.sponsor_name.trim(),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        studies: studiesArray
      }

      // Add description if it exists
      if (data.description && typeof data.description === 'string') {
        payload.description = data.description.trim()
      }

      console.log('4. Final payload:', JSON.stringify(payload, null, 2))
      console.log('5. Payload validation:')
      console.log('   - sponsor_name: valid string?', typeof payload.sponsor_name === 'string' && payload.sponsor_name.length > 0)
      console.log('   - isActive: valid boolean?', typeof payload.isActive === 'boolean')
      console.log('   - studies: valid array?', Array.isArray(payload.studies))
      console.log('   - studies length:', payload.studies.length)

      console.log('6. Making API call to POST /sponsors...')
      
      const response = await apiClient.post("/sponsors", payload)
      
      console.log('7. ✅ API call successful!')
      console.log('=== CREATE SPONSOR DEBUG END ===')
      
      return response
    } catch (error) {
      console.log('=== CREATE SPONSOR ERROR DEBUG ===')
      console.error('❌ API Error:', error)
      
      if (error.response) {
        console.error('Error status:', error.response.status)
        console.error('Error data:', error.response.data)
        console.error('Error headers:', error.response.headers)
      } else if (error.request) {
        console.error('Request was made but no response:', error.request)
      } else {
        console.error('Error setting up request:', error.message)
      }
      
      console.log('=== ERROR DEBUG END ===')
      throw error
    }
  }

  

  async updateSponsor(id, data) {
    try {
      // Similar debug logging for update
      console.log('=== UPDATE SPONSOR DEBUG START ===')
      console.log('Sponsor ID:', id)
      console.log('Update data:', JSON.stringify(data, null, 2))

      if (!data.sponsor_name || typeof data.sponsor_name !== 'string' || data.sponsor_name.trim().length === 0) {
        throw new Error('Sponsor name is required and must be a non-empty string')
      }

      let studiesArray = []
      if (data.selectedStudies && Array.isArray(data.selectedStudies)) {
        studiesArray = data.selectedStudies
      } else if (data.studies && Array.isArray(data.studies)) {
        studiesArray = data.studies
      }

      const payload = {
        sponsor_name: data.sponsor_name.trim(),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        studies: studiesArray
      }

      if (data.description && typeof data.description === 'string') {
        payload.description = data.description.trim()
      }

      console.log('Update payload:', JSON.stringify(payload, null, 2))
      
      const response = await apiClient.put(`/sponsors/${id}`, payload)
      console.log('=== UPDATE SPONSOR DEBUG END ===')
      return response
    } catch (error) {
      console.error('Update API Error:', error)
      if (error.response) {
        console.error('Update Error data:', error.response.data)
      }
      throw error
    }
  }

  async deleteSponsor(id) {
    try {
      const response = await apiClient.delete(`/sponsors/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async toggleSponsorStatus(id) {
    try {
      const response = await apiClient.patch(`/sponsors/${id}/toggle-status`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getSponsorStats() {
    try {
      const response = await apiClient.get("/sponsors/stats")
      console.log('Stats Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addStudyToSponsor(sponsorId, studyId) {
    try {
      const response = await apiClient.post(`/sponsors/${sponsorId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromSponsor(sponsorId, studyId) {
    try {
      const response = await apiClient.delete(`/sponsors/${sponsorId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const sponsorsAPI = new SponsorsAPI()