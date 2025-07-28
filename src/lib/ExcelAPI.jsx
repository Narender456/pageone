import { apiClient } from "./api"

class ExcelAPI {
  // Excel Management Methods (New - these were missing)
    async getExcels(filters = {}) {
      try {
        const params = new URLSearchParams()
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })
        
        const url = `/excel/files?${params.toString()}`
        console.log('Fetching excels from:', url)
        const response = await apiClient.get(url)
        console.log('Excels response:', response)
        
        // Normalize the response
        return this.normalizeExcelsResponse(response)
      } catch (error) {
        console.error('API Error:', error)
        // Return empty data structure to prevent UI errors
        return { data: [] }
      }
    }

    // Helper to normalize different response structures
    normalizeExcelsResponse(response) {
      if (!response) return { data: [] }
      
      if (Array.isArray(response)) {
        return { data: response }
      }
      
      if (response.data && Array.isArray(response.data)) {
        return response
      }
      
      if (response.excels && Array.isArray(response.excels)) {
        return { data: response.excels, ...response }
      }
      
      if (response.files && Array.isArray(response.files)) {
        return { data: response.files, ...response }
      }
      
      if (response.results && Array.isArray(response.results)) {
        return { data: response.results, ...response }
      }
      
      // If there's a single Excel object in the response
      if (response.excel) {
        return { data: [response.excel] }
      }
      
      // Default empty array
      return { data: [] }
    }


    async createExcel(data) {
      try {
          const payload = {
            excel_name: data.excel_name || data.file?.name || data.name || "Unnamed Excel",
            fileId: data.fileId, // ✅ make sure this is passed
            selectedStudies: data.selectedStudies || [],
            Studies: data.selectedStudies || [],
            isActive: data.isActive !== undefined ? data.isActive : true,
          }

        
        console.log('Creating Excel with payload:', payload)
        const response = await apiClient.post("/excel", payload)
        return response
      } catch (error) {
        console.error('Create Excel Error:', error)
        throw error
      }
    }

    async updateExcel(id, data) {
      try {
        const payload = {
          excel_name: data.excel_name || data.name,
          selectedStudies: data.selectedStudies || [],
          Studies: data.selectedStudies || [], // Send both for compatibility
          isActive: data.isActive,
        }

        // Remove any undefined/null values
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined || payload[key] === null) {
            delete payload[key]
          }
        })
        
        console.log('Updating Excel with payload:', payload)
        const response = await apiClient.put(`/excel/files/${id}`, payload)
        return response
      } catch (error) {
        console.error('API Error:', error)
        throw error
      }
    }

    async deleteExcel(id) {
      try {
        const response = await apiClient.delete(`/excel/files/${id}`)
        return response
      } catch (error) {
        console.error('API Error:', error)
        throw error
      }
    }

    async toggleExcelStatus(id) {
      try {
        const response = await apiClient.patch(`/excel/${id}/toggle-status`)
        return response
      } catch (error) {
        console.error('API Error:', error)
        throw error
      }
    }

  async getExcelStats() {
    try {
      const response = await apiClient.get("/excel/stats")
      console.log('Excel Stats Response:', response)
      return response
    } catch (error) {
      console.error('Stats Error:', error)
      console.log('Attempting to calculate stats from getExcels...')
      
      // Fallback: calculate stats from getExcels if stats endpoint doesn't exist
      try {
        const excelsResponse = await this.getExcels()
        console.log('Fallback excelsResponse:', excelsResponse)
        
        const excels = excelsResponse.data || excelsResponse.excels || excelsResponse || []
        console.log('Extracted excels for stats:', excels)
        
        const stats = {
          totalExcels: excels.length,
          activeExcels: excels.filter(excel => excel.isActive).length,
          totalStudies: excels.reduce((acc, excel) => acc + (excel.selectedStudies?.length || 0), 0),
          recentExcels: excels.filter(excel => {
            if (!excel.date_created && !excel.createdAt) return false
            const created = new Date(excel.date_created || excel.createdAt)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return created > weekAgo
          }).length
        }
        
        console.log('Calculated fallback stats:', stats)
        return { data: stats }
      } catch (fallbackError) {
        console.error('Fallback stats error:', fallbackError)
        // Return default stats if everything fails
        return {
          data: {
            totalExcels: 0,
            activeExcels: 0,
            totalStudies: 0,
            recentExcels: 0
          }
        }
      }
    }
  }

  // Excel File Management Methods
  async uploadExcelFile(file, temporary = true) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('temporary', temporary.toString())

      const response = await apiClient.post("/excel/files/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      console.error('Upload Error:', error)
      throw error
    }
  }

  async getExcelFiles(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/excel/files?${queryString}` : "/excel/files"

    try {
      const response = await apiClient.get(endpoint)
      console.log('Excel Files Response:', response)
      
      // Handle the response structure that matches your backend
      if (response && response.files && Array.isArray(response.files)) {
        return response
      }
      
      // If the response is directly an array
      if (Array.isArray(response)) {
        return {
          files: response,
          pagination: {
            total: response.length,
            current: 1,
            pages: 1
          }
        }
      }
      
      throw new Error('Unexpected response structure')
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getExcelFileById(id) {
    try {
      const response = await apiClient.get(`/excel/files/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async updateExcelFile(id, data) {
    try {
      const payload = {
        selectedColumns: data.selectedColumns,
        temporary: data.temporary,
      }

      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating Excel file with payload:', payload)
      const response = await apiClient.put(`/excel/files/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteExcelFile(id) {
    try {
      const response = await apiClient.delete(`/excel/files/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async parseExcelFile(id) {
    try {
      const response = await apiClient.get(`/excel/files/${id}/parse`)
      console.log('Parse Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Excel Data Row Management Methods
async createRowsFromFile({ fileId, studyIds }) {
  try {
    const payload = { fileId, studyIds }
    const response = await apiClient.post("/excel/rows/create-from-file", payload)
    return response
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}
  async getExcelDataRows(filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/excel/rows?${queryString}` : "/excel/rows"

    try {
      const response = await apiClient.get(endpoint)
      console.log('Excel Rows Response:', response)
      
      // Handle the response structure that matches your backend
      if (response && response.rows && Array.isArray(response.rows)) {
        return response
      }
      
      // If the response is directly an array
      if (Array.isArray(response)) {
        return {
          rows: response,
          pagination: {
            total: response.length,
            current: 1,
            pages: 1
          }
        }
      }
      
      throw new Error('Unexpected response structure')
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getExcelDataRowById(id) {
    try {
      const response = await apiClient.get(`/excel/rows/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async updateExcelDataRow(id, data) {
    try {
      const payload = {
        rowData: data.rowData,
        studyIds: data.selectedStudies || data.studyIds || data.studies || [],
        clinicalDataId: data.clinicalDataId,
      }

      // Remove any undefined/null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key]
        }
      })
      
      console.log('Updating Excel data row with payload:', payload)
      const response = await apiClient.put(`/excel/rows/${id}`, payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async deleteExcelDataRow(id) {
    try {
      const response = await apiClient.delete(`/excel/rows/${id}`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async markRowAsSent(id) {
    try {
      const response = await apiClient.patch(`/excel/rows/${id}/mark-sent`)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async markMultipleRowsAsSent(rowIds) {
    try {
      const payload = { rowIds }
      
      console.log('Marking multiple rows as sent:', payload)
      const response = await apiClient.patch("/excel/rows/mark-multiple-sent", payload)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async getRowsByStudy(studyId, filters = {}) {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const endpoint = queryString ? `/excel/studies/${studyId}/rows?${queryString}` : `/excel/studies/${studyId}/rows`

    try {
      const response = await apiClient.get(endpoint)
      console.log('Study Rows Response:', response)
      return response
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Bulk Operations
  async bulkDeleteFiles(fileIds) {
    try {
      const deletePromises = fileIds.map(id => this.deleteExcelFile(id))
      const results = await Promise.allSettled(deletePromises)
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      return {
        successful,
        failed,
        total: fileIds.length,
        results
      }
    } catch (error) {
      console.error('Bulk Delete Error:', error)
      throw error
    }
  }

  async bulkDeleteRows(rowIds) {
    try {
      const deletePromises = rowIds.map(id => this.deleteExcelDataRow(id))
      const results = await Promise.allSettled(deletePromises)
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      return {
        successful,
        failed,
        total: rowIds.length,
        results
      }
    } catch (error) {
      console.error('Bulk Delete Error:', error)
      throw error
    }
  }
}

export const excelAPI = new ExcelAPI()