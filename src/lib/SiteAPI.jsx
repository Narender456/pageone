import { apiClient } from "./api"

class SiteAPI {
  async getSites(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/sites?${queryString}` : "/sites"

    try {
      const response = await apiClient.get(endpoint)
      console.log('Raw API Response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', response ? Object.keys(response) : 'No response')
      
      // Handle different possible response structures
      let processedResponse = null
      
      // Case 1: Response has nested data property with expected structure
      if (response && typeof response === 'object' && response.data && Array.isArray(response.data)) {
        console.log('Case 1: Found response.data array')
        processedResponse = {
          data: response.data,
          total: response.total || response.count || response.data.length,
          count: response.count || response.data.length,
          pagination: response.pagination || null,
          success: response.success || true
        }
      }
      // Case 2: Response is directly an array (unwrapped by apiClient)
      else if (Array.isArray(response)) {
        console.log('Case 2: Response is direct array')
        processedResponse = {
          data: response,
          total: response.length,
          count: response.length,
          pagination: null,
          success: true
        }
      }
      // Case 3: Response has sites property
      else if (response && response.sites && Array.isArray(response.sites)) {
        console.log('Case 3: Found response.sites array')
        processedResponse = {
          data: response.sites,
          total: response.total || response.sites.length,
          count: response.count || response.sites.length,
          pagination: response.pagination || null,
          success: response.success || true
        }
      }
      // Case 4: Response has results property
      else if (response && response.results && Array.isArray(response.results)) {
        console.log('Case 4: Found response.results array')
        processedResponse = {
          data: response.results,
          total: response.total || response.results.length,
          count: response.count || response.results.length,
          pagination: response.pagination || null,
          success: response.success || true
        }
      }
      // Case 5: Response is an object but not expected structure - check if it's a single item
      else if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Check if it has properties that suggest it's a single site object
        if (response._id || response.id || response.siteName) {
          console.log('Case 5: Single site object, wrapping in array')
          processedResponse = {
            data: [response],
            total: 1,
            count: 1,
            pagination: null,
            success: true
          }
        } else {
          console.log('Case 5b: Unknown object structure, treating as empty')
          processedResponse = {
            data: [],
            total: 0,
            count: 0,
            pagination: null,
            success: true
          }
        }
      }
      // Case 6: Empty or null response
      else if (!response || response === null || response === undefined) {
        console.log('Case 6: Empty/null response')
        processedResponse = {
          data: [],
          total: 0,
          count: 0,
          pagination: null,
          success: true
        }
      }
      // Case 7: Unexpected response type
      else {
        console.log('Case 7: Unexpected response type:', typeof response, response)
        // Don't throw error, return empty structure instead
        processedResponse = {
          data: [],
          total: 0,
          count: 0,
          pagination: null,
          success: false,
          error: 'Unexpected response structure'
        }
      }
      
      console.log('Processed response:', processedResponse)
      return processedResponse
      
    } catch (error) {
      console.error('API Error in getSites:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response
      })
      
      // Return a consistent error structure instead of throwing
      return {
        data: [],
        total: 0,
        count: 0,
        pagination: null,
        success: false,
        error: error.message || 'Unknown error occurred'
      }
    }
  }

  async getSiteById(id) {
    try {
      const response = await apiClient.get(`/sites/${id}`)
      console.log('getSiteById response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getSiteBySlug(slug) {
    try {
      const response = await apiClient.get(`/sites/slug/${slug}`)
      console.log('getSiteBySlug response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async searchSites(query) {
    try {
      const response = await apiClient.get(`/sites/search?q=${encodeURIComponent(query)}`)
      console.log('searchSites response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async checkSiteExists(siteId, siteName, protocolNumber) {
    try {
      const params = new URLSearchParams()
      if (siteId) params.append('siteId', siteId)
      if (siteName) params.append('siteName', siteName)
      if (protocolNumber) params.append('protocolNumber', protocolNumber)
      
      const response = await apiClient.get(`/sites/check-exists?${params.toString()}`)
      console.log('checkSiteExists response:', response)
      return response
    } catch (error) {
      console.error('API Error in checkSiteExists:', error)
      // If endpoint doesn't exist, return false (assume site doesn't exist)
      if (error.status === 404) {
        return { exists: false }
      }
      throw error
    }
  }

  async createSite(data) {
    try {
      // Validate required fields
      if (!data.siteName || !data.siteId) {
        throw new Error('Site name and Site ID are required')
      }

      // Clean and prepare the data for backend
      const payload = {
        siteName: data.siteName.trim(),
        siteId: data.siteId.trim(),
        protocolNumber: data.protocolNumber?.trim() || '',
        piName: data.piName?.trim() || '',
        studies: data.selectedStudies || data.studies || [],
        userAssignments: data.selectedUsers || data.userAssignments || [],
      }

      // Remove any undefined/null values but keep empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Creating site with payload:', payload)
      const response = await apiClient.post("/sites", payload)
      console.log('createSite response:', response)
      return response
    } catch (error) {
      console.error('API Error in createSite:', error)
      
      // Handle specific error cases
      if (error.status === 409 || error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || error.message
        
        if (errorMessage?.toLowerCase().includes('siteid') || errorMessage?.toLowerCase().includes('site id')) {
          throw new Error('A site with this Site ID already exists. Please use a different Site ID.')
        } else if (errorMessage?.toLowerCase().includes('sitename') || errorMessage?.toLowerCase().includes('site name')) {
          throw new Error('A site with this name already exists. Please use a different site name.')
        } else if (errorMessage?.toLowerCase().includes('protocol')) {
          throw new Error('A site with this protocol number already exists. Please use a different protocol number.')
        } else {
          throw new Error('This site conflicts with an existing site. Please check your Site ID, Site Name, and Protocol Number.')
        }
      }
      
      // Handle other error statuses
      if (error.status === 400 || error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid data provided'
        throw new Error(errorMessage)
      }
      
      if (error.status === 500 || error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again later.')
      }
      
      // Default error handling
      throw new Error(error.response?.data?.message || error.message || 'Failed to create site')
    }
  }

  async updateSite(id, data) {
    try {
      // Validate required fields
      if (!data.siteName || !data.siteId) {
        throw new Error('Site name and Site ID are required')
      }

      // Clean and prepare the data for backend
      const payload = {
        siteName: data.siteName.trim(),
        siteId: data.siteId.trim(),
        protocolNumber: data.protocolNumber?.trim() || '',
        piName: data.piName?.trim() || '',
        studies: data.selectedStudies || data.studies || [],
        userAssignments: data.selectedUsers || data.userAssignments || [],
      }

      // Remove any undefined/null values but keep empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating site with payload:', payload)
      const response = await apiClient.put(`/sites/${id}`, payload)
      console.log('updateSite response:', response)
      return response
    } catch (error) {
      console.error('API Error in updateSite:', error)
      
      // Handle specific error cases
      if (error.status === 409 || error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || error.message
        
        if (errorMessage?.toLowerCase().includes('siteid') || errorMessage?.toLowerCase().includes('site id')) {
          throw new Error('A site with this Site ID already exists. Please use a different Site ID.')
        } else if (errorMessage?.toLowerCase().includes('sitename') || errorMessage?.toLowerCase().includes('site name')) {
          throw new Error('A site with this name already exists. Please use a different site name.')
        } else if (errorMessage?.toLowerCase().includes('protocol')) {
          throw new Error('A site with this protocol number already exists. Please use a different protocol number.')
        } else {
          throw new Error('This site conflicts with an existing site. Please check your Site ID, Site Name, and Protocol Number.')
        }
      }
      
      // Handle other error statuses
      if (error.status === 400 || error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Invalid data provided'
        throw new Error(errorMessage)
      }
      
      if (error.status === 404 || error.response?.status === 404) {
        throw new Error('Site not found. It may have been deleted.')
      }
      
      if (error.status === 500 || error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again later.')
      }
      
      // Default error handling
      throw new Error(error.response?.data?.message || error.message || 'Failed to update site')
    }
  }

  async deleteSite(id) {
    try {
      const response = await apiClient.delete(`/sites/${id}`)
      console.log('deleteSite response:', response)
      return response
    } catch (error) {
      console.error('API Error in deleteSite:', error)
      throw error
    }
  }

  async toggleSiteStatus(id) {
    try {
      const response = await apiClient.patch(`/sites/${id}/toggle-status`)
      console.log('toggleSiteStatus response:', response)
      return response
    } catch (error) {
      console.error('API Error in toggleSiteStatus:', error)
      throw error
    }
  }

  async getSiteStats() {
    try {
      const response = await apiClient.get('/sites/stats')
      console.log('getSiteStats response:', response)
      return response
    } catch (error) {
      console.error('API Error in getSiteStats:', error)
      // Return default stats if API fails
      return {
        data: {
          totalSites: 0,
          activeSites: 0,
          totalStudies: 0,
          recentSites: 0,
        }
      }
    }
  }

  async addStudyToSite(siteId, studyId) {
    try {
      const response = await apiClient.post(`/sites/${siteId}/studies/${studyId}`)
      console.log('addStudyToSite response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addStudiesToSite(siteId, studyIds) {
    try {
      const response = await apiClient.post(`/sites/${siteId}/studies`, { studyIds })
      console.log('addStudiesToSite response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromSite(siteId, studyId) {
    try {
      const response = await apiClient.delete(`/sites/${siteId}/studies/${studyId}`)
      console.log('removeStudyFromSite response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addUserToSite(siteId, userId) {
    try {
      const response = await apiClient.post(`/sites/${siteId}/users/${userId}`)
      console.log('addUserToSite response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addUsersToSite(siteId, userIds) {
    try {
      const response = await apiClient.post(`/sites/${siteId}/users`, { userIds })
      console.log('addUsersToSite response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeUserFromSite(siteId, userId) {
    try {
      const response = await apiClient.delete(`/sites/${siteId}/users/${userId}`)
      console.log('removeUserFromSite response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const siteAPI = new SiteAPI()