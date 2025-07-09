const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Auth token management
class TokenManager {
  static instance = null
  token = null
  refreshToken = null

  static getInstance() {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken
    this.refreshToken = refreshToken
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
    }
  }

  getAccessToken() {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken")
    }
    return this.token
  }

  getRefreshToken() {
    if (!this.refreshToken && typeof window !== "undefined") {
      this.refreshToken = localStorage.getItem("refreshToken")
    }
    return this.refreshToken
  }

  clearTokens() {
    this.token = null
    this.refreshToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    }
  }
}

const tokenManager = TokenManager.getInstance()

// HTTP client with automatic token refresh
class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const token = tokenManager.getAccessToken()

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      // Handle token expiration
      if (response.status === 401 && data.message === "Token expired") {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry the original request with new token
          const newToken = tokenManager.getAccessToken()
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          }
          const retryResponse = await fetch(url, retryConfig)
          return await retryResponse.json()
        } else {
          // Refresh failed, redirect to login
          tokenManager.clearTokens()
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
        }
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw new Error("Network error occurred")
    }
  }

  async refreshAccessToken() {
    try {
      const refreshToken = tokenManager.getRefreshToken()
      if (!refreshToken) return false

      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        tokenManager.setTokens(data.token, data.refreshToken)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: "GET" })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
export { tokenManager }