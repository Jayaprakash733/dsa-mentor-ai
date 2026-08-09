import apiClient from './api'

export const progressService = {
  getProgress: async () => {
    const response = await apiClient.get('/progress')

    return response.data
  },

  getProblemProgress: async (problemId: string) => {
    const response = await apiClient.get(
      `/progress/problems/${problemId}`
    )

    return response.data
  },

  updateProgress: async (
    problemId: string,
    data: unknown
  ) => {
    const response = await apiClient.put(
      `/progress/problems/${problemId}`,
      data
    )

    return response.data
  },
}