import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Redirect to /login if not authenticated
export const ProtectedRoute = () => {
  const { user, accessToken } = useAuthStore()
  console.log('ProtectedRoute check:', { user, accessToken, isAuthenticated: !!accessToken && !!user })
  
  if (!accessToken || !user) {
    console.warn('Not authenticated, redirecting to /login')
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}

// Redirect to /dashboard if user doesn't have required role
export const RoleRoute = ({ roles = [] }) => {
  const { user } = useAuthStore()
  if (!roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
