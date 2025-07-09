import { Navigate } from "react-router-dom"
import { useAuth } from "../../lib/auth-context"

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
