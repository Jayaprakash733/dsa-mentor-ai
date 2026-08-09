import { useEffect, useState } from 'react'
import { authService } from '../services/authService'

interface User {
  id: string
  email: string
  username: string
  full_name?: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const profile = await authService.getProfile()
        setUser(profile)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await authService.login({
      email,
      password,
    })

    localStorage.setItem(
      'access_token',
      response.access_token
    )

    localStorage.setItem(
      'refresh_token',
      response.refresh_token
    )

    const profile = await authService.getProfile()
    setUser(profile)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  }
}