import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, accessToken, login, logout } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (response) => {
      console.log('Login response:', response)
      const userData = response.data?.data?.user || response.data?.user
      const token = response.data?.data?.accessToken || response.data?.accessToken
      const redirectTo = response.data?.data?.redirectTo || response.data?.redirectTo
      
      if (!userData || !token) {
        toast.error('Invalid response from server')
        console.error('Missing user or token in response:', response.data)
        return
      }

      login(userData, token)
      toast.success(`Welcome back, ${userData.fullName?.split(' ')[0] || 'User'}!`)
      // Use redirectTo from response if available, otherwise default based on role
      const destination = redirectTo || (userData.role === 'student' ? '/student/portal' : '/dashboard')
      navigate(destination)
    },
    onError: (err) => {
      console.error('Login error:', err)
      const message = err.response?.data?.message || err.message || 'Login failed'
      toast.error(message)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast.success('Logged out')
      navigate('/login')
    },
    onError: (err) => {
      console.error('Logout error:', err)
      logout()
      queryClient.clear()
      navigate('/login')
    },
  })

  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isAdmin: user?.role === 'admin',
    isCounsellor: user?.role === 'counsellor',
    hasRole: (roles) => roles.includes(user?.role),
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
