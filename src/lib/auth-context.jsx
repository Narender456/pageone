// lib/auth-context.js

import { createContext, useContext, useEffect, useState } from "react"
import { apiClient, tokenManager } from "./api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const res = await apiClient.post("/auth/login", { email, password })
      if (res.success) {
        tokenManager.setTokens(res.token, res.refreshToken)
        setUser(res.user)
        return true
      } else {
        return false
      }
    } catch (err) {
      console.error("Login error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    tokenManager.clearTokens()
    setUser(null)
  }

  const fetchUser = async () => {
    try {
      const res = await apiClient.get("/auth/me")
      if (res.success) {
        setUser(res.data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
