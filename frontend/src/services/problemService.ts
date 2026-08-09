import apiClient from './api'

export interface ProblemFilters {
  difficulty?: string
  topic?: string
  search?: string
  page?: number
  limit?: number
}

export const problemService = {
  getProblems: async (filters?: ProblemFilters) => {
    const response = await apiClient.get('/problems', {
      params: filters,
    })

    return response.data
  },

  getProblem: async (problemId: string) => {
    const response = await apiClient.get(
      `/problems/${problemId}`
    )

    return response.data
  },

  createProblem: async (data: unknown) => {
    const response = await apiClient.post(
      '/problems',
      data
    )

    return response.data
  },

  updateProblem: async (
    problemId: string,
    data: unknown
  ) => {
    const response = await apiClient.put(
      `/problems/${problemId}`,
      data
    )

    return response.data
  },

  deleteProblem: async (problemId: string) => {
    const response = await apiClient.delete(
      `/problems/${problemId}`
    )

    return response.data
  },
}