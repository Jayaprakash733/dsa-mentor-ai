import apiClient from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export const authService = {
  register: async (
    data: RegisterRequest
  ): Promise<AuthResponse> => {
    const response = await apiClient.post(
      '/auth/register',
      data
    )

    return response.data
  },

  login: async (
    data: LoginRequest
  ): Promise<AuthResponse> => {
    const response = await apiClient.post(
      '/auth/login',
      data
    )

    return response.data
  },

  refresh: async (): Promise<AuthResponse> => {
    const refreshToken =
      localStorage.getItem('refresh_token')

    const response = await apiClient.post(
      '/auth/refresh',
      {
        refresh_token: refreshToken,
      }
    )

    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', {})
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/me')

    return response.data
  },

  updateProfile: async (data: unknown) => {
    const response = await apiClient.put(
      '/users/me',
      data
    )

    return response.data
  },
}