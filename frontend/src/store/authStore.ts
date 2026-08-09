import { create } from 'zustand'

interface User {
  id: string
  email: string
  username: string
  full_name?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  setAuth: (
    user: User,
    accessToken: string
  ) => void

  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, accessToken) => {
    localStorage.setItem(
      'access_token',
      accessToken
    )

    set({
      user,
      accessToken,
      isAuthenticated: true,
    })
  },

  clearAuth: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    })
  },
}))