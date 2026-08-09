import apiClient from './api'


// =====================================================
// CHAT
// =====================================================

export interface ChatRequest {
  message: string
  difficulty?: string
  topic?: string
  request_type?: string
  hint_level?: number
  session_id?: string
}


export interface ChatResponse {
  response: string
  session_id: string
}


// =====================================================
// HINT
// =====================================================

export interface HintRequest {
  message: string
  topic?: string
  hint_level?: number
  session_id?: string
  difficulty?: string
}


// =====================================================
// CHAT HISTORY
// =====================================================

export interface ConversationSummary {
  session_id: string
  title: string
  topic: string
  difficulty: string
  updated_at: number
}


export interface ConversationMessage {
  role: 'student' | 'assistant'
  content: string
}


export interface ConversationHistory {
  session_id: string
  messages: ConversationMessage[]
}


// =====================================================
// TUTOR SERVICE
// =====================================================

export const tutorService = {

  // ---------------------------------------------------
  // Normal Chat
  // ---------------------------------------------------

  chat: async (
    data: ChatRequest
  ): Promise<ChatResponse> => {

    const response =
      await apiClient.post(
        '/chat',
        {
          message: data.message,

          difficulty:
            data.difficulty ??
            'Beginner',

          topic:
            data.topic ??
            'Arrays',

          request_type:
            data.request_type ??
            'chat',

          hint_level:
            data.hint_level ??
            1,

          session_id:
            data.session_id,
        }
      )

    return response.data
  },


  // ---------------------------------------------------
  // Hint
  // ---------------------------------------------------

  getHint: async (
    data: HintRequest
  ): Promise<ChatResponse> => {

    const response =
      await apiClient.post(
        '/chat',
        {
          message: data.message,

          difficulty:
            data.difficulty ??
            'Beginner',

          topic:
            data.topic ??
            'Arrays',

          request_type:
            'hint',

          hint_level:
            data.hint_level ??
            1,

          session_id:
            data.session_id,
        }
      )

    return response.data
  },


  // ---------------------------------------------------
  // Get Recent Chat History
  // ---------------------------------------------------

  getHistory: async (): Promise<
    ConversationSummary[]
  > => {

    const response =
      await apiClient.get(
        '/chat/history'
      )

    return response.data
  },


  // ---------------------------------------------------
  // Get One Conversation
  // ---------------------------------------------------

  getConversation: async (
    sessionId: string
  ): Promise<ConversationHistory> => {

    const response =
      await apiClient.get(
        `/chat/history/${sessionId}`
      )

    return response.data
  },


  // ---------------------------------------------------
  // Delete Conversation
  // ---------------------------------------------------

  deleteConversation: async (
    sessionId: string
  ): Promise<{
    success: boolean
    session_id: string
  }> => {

    const response =
      await apiClient.delete(
        `/chat/history/${sessionId}`
      )

    return response.data
  },

}