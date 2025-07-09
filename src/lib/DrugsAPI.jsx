import { apiClient } from "./api"

class DrugsAPI {
  async getDrugs(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/drugs?${queryString}` : "/drugs"

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

  
  async getDrugById(id) {
    try {
      const response = await apiClient.get(`/drugs/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

async createDrug(data) {
  try {
    // Clean and prepare the data for backend
    const payload = {
      drug_name: data.drug_name,
      description: data.description,
      quantity: data.quantity || 0,
      // Auto-set remaining_quantity to quantity if not explicitly provided
      remaining_quantity: data.remaining_quantity !== undefined 
        ? data.remaining_quantity 
        : (data.quantity || 0),
      expiry_date: data.expiry_date,
      isActive: data.isActive !== undefined ? data.isActive : true,
      studies: data.selectedStudies || data.studies || [],
    }

    // Remove any undefined/null values (except remaining_quantity which we want to keep)
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null) {
        // Don't delete remaining_quantity even if it's 0
        if (key !== 'remaining_quantity') {
          delete payload[key]
        }
      }
    })
    
    console.log('Creating drug with payload:', payload)
    const response = await apiClient.post("/drugs", payload)
    return response
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

  async updateDrug(id, data) {
    try {
      // Clean and prepare the data for backend
      const payload = {
        drug_name: data.drug_name,
        description: data.description,
        quantity: data.quantity,
        remaining_quantity: data.remaining_quantity,
        expiry_date: data.expiry_date,
        isActive: data.isActive,
        studies: data.selectedStudies || data.studies || [],
      }

      
      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating drug with payload:', payload)
      const response = await apiClient.put(`/drugs/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteDrug(id) {
    try {
      const response = await apiClient.delete(`/drugs/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async toggleDrugStatus(id) {
    try {
      const response = await apiClient.patch(`/drugs/${id}/toggle-status`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getDrugStats() {
    try {
      const response = await apiClient.get("/drugs/stats")
      console.log('Stats Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async addStudyToDrug(drugId, studyId) {
    try {
      const response = await apiClient.post(`/drugs/${drugId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async removeStudyFromDrug(drugId, studyId) {
    try {
      const response = await apiClient.delete(`/drugs/${drugId}/studies/${studyId}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async bulkAddStudiesToDrug(drugId, studyIds) {
    try {
      const response = await apiClient.post(`/drugs/${drugId}/studies/bulk`, { studyIds })
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getAvailableStudies() {
    try {
      const response = await apiClient.get("/drugs/available-studies")
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getStudiesInDrug(drugId) {
    try {
      const response = await apiClient.get(`/drugs/${drugId}/studies`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async syncDrugRelationships() {
    try {
      const response = await apiClient.post("/drugs/sync-relationships")
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }
}

export const drugsAPI = new DrugsAPI()