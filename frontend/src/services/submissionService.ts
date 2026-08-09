import apiClient from './api'

export interface SubmissionRequest {
  problem_id: string
  code: string
  language: string
}

export const submissionService = {
  submit: async (data: SubmissionRequest) => {
    const response = await apiClient.post(
      '/submissions',
      data
    )

    return response.data
  },

  getSubmission: async (submissionId: string) => {
    const response = await apiClient.get(
      `/submissions/${submissionId}`
    )

    return response.data
  },

  getMySubmissions: async (
    problemId?: string
  ) => {
    const response = await apiClient.get(
      '/submissions',
      {
        params: {
          problem_id: problemId,
        },
      }
    )

    return response.data
  },
}