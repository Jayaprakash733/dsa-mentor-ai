import apiClient from './api'

export const analyticsService = {
  getOverview: async () => {
    const response = await apiClient.get('/analytics/overview')

    return response.data
  },

  getProgress: async () => {
    const response = await apiClient.get('/analytics/progress')

    return response.data
  },

  getActivity: async () => {
    const response = await apiClient.get('/analytics/activity')

    return response.data
  },
}