import { useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { tutorService } from './services/tutorService'

interface Message {
  role: 'student' | 'assistant'
  content: string
}

interface SelectedFile {
  file: File
  previewUrl?: string
}

interface ChatHistoryItem {
  session_id: string
  title: string
  topic: string
  difficulty: string
  updated_at: number
}

const topics = [
  'Arrays',
  'Strings',
  'Hashing',
  'Two Pointers',
  'Sliding Window',
  'Linked List',
  'Stack',
  'Queue',
  'Binary Search',
  'Sorting',
  'Recursion',
  'Backtracking',
  'Trees',
  'BST',
  'Heap / Priority Queue',
  'Graphs',
  'Greedy',
  'Dynamic Programming',
  'Bit Manipulation',
]

const difficulties = [
  'Beginner',
  'Easy',
  'Medium',
  'Hard',
]


/* =========================================================
   LOGIN
========================================================= */

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-abyss text-quartz">

      <div className="aurora-purple pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="plasma-pink pointer-events-none absolute inset-x-0 bottom-0 h-[300px]" />

      <div className="relative flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-[480px]">

          <div className="mb-8 flex items-center justify-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-quartz text-xl font-bold text-void">
              ◈
            </div>

            <div>
              <h1 className="font-figtree text-xl font-semibold">
                DSA Mentor AI
              </h1>

              <p className="text-sm text-ash">
                Your personal DSA coding mentor
              </p>
            </div>

          </div>


          <div className="surface rounded-md p-8 shadow-xl-2">

            <div className="mb-8">

              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ash">
                AI-powered learning
              </p>

              <h2 className="font-figtree text-4xl font-semibold leading-tight">
                Master DSA

                <span className="block text-ash">
                  one step at a time.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-ash">
                Learn algorithms through guided conversations,
                hints and interactive problem solving.
              </p>

            </div>


            <button
              onClick={() => navigate('/dashboard')}
              className="w-full rounded-full bg-quartz px-5 py-3 text-sm font-semibold text-void shadow-inner-glow transition hover:opacity-90"
            >
              Start Learning →
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   DASHBOARD
========================================================= */

function DashboardPage() {

  /* -------------------------------------------------------
     CHAT
  ------------------------------------------------------- */

  const [messages, setMessages] =
    useState<Message[]>([])

  const [input, setInput] =
    useState('')

  const [sessionId, setSessionId] =
    useState<string | undefined>()

  const [loading, setLoading] =
    useState(false)


  /* -------------------------------------------------------
     DSA SETTINGS
  ------------------------------------------------------- */

  const [difficulty, setDifficulty] =
    useState('Beginner')

  const [topic, setTopic] =
    useState('Arrays')


  /* -------------------------------------------------------
     HISTORY
  ------------------------------------------------------- */

  const [chatHistory, setChatHistory] =
    useState<ChatHistoryItem[]>([])

  const [historyLoading, setHistoryLoading] =
    useState(true)

  const [historyError, setHistoryError] =
    useState(false)


  /* -------------------------------------------------------
     FILE
  ------------------------------------------------------- */

  const [selectedFile, setSelectedFile] =
    useState<SelectedFile | null>(null)

  const fileInputRef =
    useRef<HTMLInputElement>(null)


  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  const loadHistory = async () => {

    try {

      setHistoryLoading(true)
      setHistoryError(false)

      const history =
        await tutorService.getHistory()

      setChatHistory(history)

    } catch (error) {

      console.error(
        'History error:',
        error
      )

      setHistoryError(true)

    } finally {

      setHistoryLoading(false)

    }

  }


  /* =======================================================
     LOAD HISTORY ON PAGE OPEN
  ======================================================= */

  useEffect(() => {

    loadHistory()

  }, [])


  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = async () => {

    const message = input.trim()

    if (!message || loading) {
      return
    }


    setMessages((prev) => [
      ...prev,
      {
        role: 'student',
        content: message,
      },
    ])


    setInput('')
    setLoading(true)


    try {

      const response =
        await tutorService.chat({
          message,
          difficulty,
          topic,
          request_type: 'chat',
          hint_level: 1,
          session_id: sessionId,
        })


      setSessionId(
        response.session_id
      )


      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
        },
      ])


      /* Refresh sidebar */
      await loadHistory()

    } catch (error) {

      console.error(
        'Chat error:',
        error
      )


      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry, something went wrong. Please check whether the backend server is running.',
        },
      ])

    } finally {

      setLoading(false)

    }

  }


  /* =======================================================
     LOAD A CONVERSATION
  ======================================================= */

  const loadConversation = async (
    item: ChatHistoryItem
  ) => {

    if (loading) {
      return
    }

    try {

      setLoading(true)

      const conversation =
        await tutorService.getConversation(
          item.session_id
        )


      setMessages(
        conversation.messages
      )

      setSessionId(
        conversation.session_id
      )

      setTopic(
        item.topic
      )

      setDifficulty(
        item.difficulty
      )

      setInput('')

    } catch (error) {

      console.error(
        'Conversation load error:',
        error
      )

    } finally {

      setLoading(false)

    }

  }


  /* =======================================================
     NEW CHAT
  ======================================================= */

  const resetConversation = () => {

    setMessages([])

    setSessionId(undefined)

    setInput('')

    setTopic('Arrays')

    setDifficulty('Beginner')

    removeFile()

  }


  /* =======================================================
     DELETE CHAT
  ======================================================= */

  const deleteConversation = async (
    event: React.MouseEvent,
    id: string
  ) => {

    event.stopPropagation()

    try {

      await tutorService.deleteConversation(
        id
      )


      if (sessionId === id) {

        resetConversation()

      }


      await loadHistory()

    } catch (error) {

      console.error(
        'Delete conversation error:',
        error
      )

    }

  }


  /* =======================================================
     ENTER
  ======================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault()

      sendMessage()

    }

  }


  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }


    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
    ]


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      alert(
        'Only PDF, PNG, JPG and WEBP files are allowed.'
      )

      event.target.value = ''

      return

    }


    let previewUrl:
      | string
      | undefined


    if (
      file.type.startsWith(
        'image/'
      )
    ) {

      previewUrl =
        URL.createObjectURL(file)

    }


    setSelectedFile({
      file,
      previewUrl,
    })

  }


  /* =======================================================
     REMOVE FILE
  ======================================================= */

  const removeFile = () => {

    if (
      selectedFile?.previewUrl
    ) {

      URL.revokeObjectURL(
        selectedFile.previewUrl
      )

    }


    setSelectedFile(null)


    if (fileInputRef.current) {

      fileInputRef.current.value =
        ''

    }

  }


  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatChatDate = (
    timestamp: number
  ) => {

    const date =
      new Date(
        timestamp * 1000
      )

    const now =
      new Date()

    const isToday =
      date.toDateString() ===
      now.toDateString()


    if (isToday) {

      return date.toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )

    }


    return date.toLocaleDateString(
      [],
      {
        day: '2-digit',
        month: 'short',
      }
    )

  }


  /* =======================================================
     UI
  ======================================================= */

  return (

    <div className="min-h-screen bg-abyss text-quartz">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-30 border-b border-inkline bg-abyss/95 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-5 lg:px-8">


          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-quartz text-sm font-bold text-void">
              ◈
            </div>

            <div>

              <h1 className="font-figtree text-sm font-semibold">
                DSA Mentor AI
              </h1>

              <p className="text-[11px] text-ash">
                Learn · Practice · Master
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <div className="hidden items-center gap-2 rounded-full border border-inkline bg-deep-sea px-3 py-1.5 md:flex">

              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <span className="text-xs text-ash">
                AI Online
              </span>

            </div>


            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value
                )
              }
              className="rounded-full border border-inkline bg-deep-sea px-3 py-1.5 text-xs text-mist outline-none"
            >

              {difficulties.map(
                (level) => (

                  <option
                    key={level}
                    value={level}
                  >
                    {level}
                  </option>

                )
              )}

            </select>

          </div>

        </div>

      </header>


      {/* ===================================================
          LAYOUT
      =================================================== */}

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1440px]">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="hidden w-[280px] shrink-0 border-r border-inkline lg:flex lg:flex-col">


          {/* -----------------------------------------------
              NEW CHAT
          ----------------------------------------------- */}

          <div className="border-b border-inkline p-4">

            <button
              onClick={
                resetConversation
              }
              className="flex w-full items-center justify-center gap-2 rounded-md bg-quartz px-4 py-2.5 text-sm font-semibold text-void transition hover:opacity-90"
            >

              <span className="text-base">
                ＋
              </span>

              New Chat

            </button>

          </div>


          {/* -----------------------------------------------
              SCROLLABLE SIDEBAR
          ----------------------------------------------- */}

          <div className="flex-1 overflow-y-auto p-4">


            {/* =============================================
                RECENT CHATS
            ============================================= */}

            <div className="mb-7">

              <div className="mb-3 flex items-center justify-between px-2">

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ash">
                  Recent Chats
                </p>

                {chatHistory.length > 0 && (

                  <span className="text-[10px] text-ash/50">
                    {chatHistory.length}
                  </span>

                )}

              </div>


              {/* History list */}

              {historyLoading ? (

                <div className="rounded-md border border-dashed border-inkline px-3 py-5 text-center">

                  <div className="mx-auto mb-2 h-4 w-4 animate-spin rounded-full border-2 border-ash/20 border-t-ash" />

                  <p className="text-[10px] text-ash">
                    Loading history...
                  </p>

                </div>

              ) : historyError ? (

                <div className="rounded-md border border-dashed border-red-500/20 px-3 py-5 text-center">

                  <p className="text-xs text-red-400">
                    Unable to load history
                  </p>

                  <button
                    onClick={
                      loadHistory
                    }
                    className="mt-2 text-[10px] text-ash underline hover:text-quartz"
                  >
                    Try again
                  </button>

                </div>

              ) : chatHistory.length === 0 ? (

                <div className="rounded-md border border-dashed border-inkline px-3 py-5 text-center">

                  <div className="mb-2 text-lg text-ash/60">
                    ◌
                  </div>

                  <p className="text-xs text-ash">
                    No conversations yet
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-ash/50">
                    Your recent chats will appear here.
                  </p>

                </div>

              ) : (

                <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">

                  {chatHistory.map(
                    (item) => (

                      <div
                        key={
                          item.session_id
                        }
                        onClick={() =>
                          loadConversation(
                            item
                          )
                        }
                        className={`group cursor-pointer rounded-md px-3 py-2.5 transition ${
                          sessionId ===
                          item.session_id
                            ? 'bg-cobalt-panel'
                            : 'hover:bg-deep-sea'
                        }`}
                      >

                        <div className="flex items-start gap-2">

                          <span
                            className={`mt-1 text-[8px] ${
                              sessionId ===
                              item.session_id
                                ? 'text-frosted-lilac'
                                : 'text-ash/50'
                            }`}
                          >
                            ●
                          </span>


                          <div className="min-w-0 flex-1">

                            <p
                              className={`truncate text-xs ${
                                sessionId ===
                                item.session_id
                                  ? 'text-quartz'
                                  : 'text-mist'
                              }`}
                            >
                              {item.title}
                            </p>


                            <div className="mt-1 flex items-center gap-2">

                              <span className="truncate text-[9px] text-ash/60">
                                {item.topic}
                              </span>

                              <span className="text-[9px] text-ash/40">
                                ·
                              </span>

                              <span className="shrink-0 text-[9px] text-ash/60">
                                {formatChatDate(
                                  item.updated_at
                                )}
                              </span>

                            </div>

                          </div>


                          {/* Delete */}

                          <button
                            onClick={(
                              event
                            ) =>
                              deleteConversation(
                                event,
                                item.session_id
                              )
                            }
                            className="hidden shrink-0 text-xs text-ash/40 hover:text-red-400 group-hover:block"
                            title="Delete conversation"
                          >
                            ×
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>


            {/* =============================================
                DSA TOPICS
            ============================================= */}

            <div>

              <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ash">
                DSA Topics
              </p>


              <div className="space-y-1">

                {topics.map(
                  (item) => (

                    <button
                      key={item}
                      onClick={() =>
                        setTopic(item)
                      }
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                        topic === item
                          ? 'bg-cobalt-panel text-frosted-lilac'
                          : 'text-ash hover:bg-deep-sea hover:text-quartz'
                      }`}
                    >

                      <span className="mr-3 text-[9px]">

                        {topic === item
                          ? '●'
                          : '○'}

                      </span>

                      {item}

                    </button>

                  )
                )}

              </div>

            </div>

          </div>


          {/* -----------------------------------------------
              PROGRESS
          ----------------------------------------------- */}

          <div className="border-t border-inkline p-4">

            <div className="mb-2 flex items-center justify-between">

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ash">
                Progress
              </p>

              <span className="text-xs text-ash">
                35%
              </span>

            </div>


            <div className="h-1.5 overflow-hidden rounded-full bg-inkline">

              <div className="h-full w-[35%] rounded-full bg-signal-blue" />

            </div>

          </div>

        </aside>


        {/* =================================================
            MAIN
        ================================================= */}

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">


          {/* Aurora */}

          <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] opacity-50">

            <div className="aurora-purple h-full w-full" />

          </div>


          {/* =================================================
              PROBLEM HEADER
          ================================================= */}

          <div className="relative border-b border-inkline px-5 py-5 lg:px-8">

            <div className="mx-auto flex max-w-5xl items-center justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="font-figtree text-xl font-semibold">
                    {topic}
                  </h2>

                  <span className="rounded-full border border-sapphire-hairline bg-cobalt-panel px-2.5 py-1 text-[10px] uppercase tracking-wide text-frosted-lilac">
                    {difficulty}
                  </span>

                </div>

                <p className="mt-1 text-xs text-ash">
                  Interactive DSA learning session
                </p>

              </div>


              <div className="hidden items-center gap-1 sm:flex">

                <span className="h-1 w-8 rounded-full bg-signal-blue" />

                <span className="h-1 w-8 rounded-full bg-inkline" />

                <span className="h-1 w-8 rounded-full bg-inkline" />

                <span className="h-1 w-8 rounded-full bg-inkline" />

              </div>

            </div>

          </div>


          {/* =================================================
              CHAT
          ================================================= */}

          <div className="relative flex-1 overflow-y-auto">

            <div className="mx-auto max-w-5xl px-5 py-8 lg:px-10">


              {messages.length === 0 ? (

                <div className="flex min-h-[500px] items-center justify-center">

                  <div className="max-w-xl text-center">

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md border border-inkline bg-deep-sea text-xl">
                      ◈
                    </div>

                    <p className="mb-3 text-xs uppercase tracking-[0.18em] text-ash">
                      Your AI coding mentor
                    </p>

                    <h2 className="font-figtree text-3xl font-semibold">
                      Ready to solve DSA?
                    </h2>

                    <p className="mt-4 text-sm leading-6 text-ash">
                      Ask a question or upload a problem.
                      I'll guide you through the reasoning
                      instead of immediately giving away the solution.
                    </p>


                    <div className="mt-6 flex flex-wrap justify-center gap-2">

                      {[
                        'How do I solve Two Sum?',
                        'Explain Binary Search',
                        'What is a Hash Map?',
                      ].map(
                        (suggestion) => (

                          <button
                            key={suggestion}
                            onClick={() =>
                              setInput(
                                suggestion
                              )
                            }
                            className="rounded-full border border-inkline bg-deep-sea px-4 py-2 text-xs text-ash transition hover:border-sapphire-hairline hover:text-quartz"
                          >
                            {suggestion}
                          </button>

                        )
                      )}

                    </div>

                  </div>

                </div>

              ) : (

                <div className="space-y-7">

                  {messages.map(
                    (
                      message,
                      index
                    ) => (

                      <div
                        key={index}
                        className={`chat-message flex gap-3 ${
                          message.role ===
                          'student'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >

                        {message.role ===
                          'assistant' && (

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-sapphire-hairline bg-cobalt-panel text-sm text-frosted-lilac">
                            ◈
                          </div>

                        )}


                        <div
                          className={`max-w-[78%] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-6 ${
                            message.role ===
                            'student'
                              ? 'bg-signal-blue text-white'
                              : 'border border-inkline bg-deep-sea text-mist'
                          }`}
                        >
                          {message.content}
                        </div>


                        {message.role ===
                          'student' && (

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-inkline bg-deep-sea text-[10px] text-ash">
                            You
                          </div>

                        )}

                      </div>

                    )
                  )}


                  {loading && (

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-sapphire-hairline bg-cobalt-panel text-sm text-frosted-lilac">
                        ◈
                      </div>

                      <div className="flex items-center gap-1.5 rounded-md border border-inkline bg-deep-sea px-5 py-4">

                        <span className="loading-dot" />

                        <span className="loading-dot" />

                        <span className="loading-dot" />

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <div className="relative border-t border-inkline bg-abyss/95 px-5 py-5 backdrop-blur-xl lg:px-8">

            <div className="mx-auto max-w-5xl">


              {selectedFile && (

                <div className="mb-3 flex">

                  <div className="flex items-center gap-3 rounded-sm border border-inkline bg-deep-sea px-3 py-2">

                    {selectedFile.previewUrl ? (

                      <img
                        src={
                          selectedFile.previewUrl
                        }
                        alt="Selected"
                        className="h-10 w-10 rounded-sm object-cover"
                      />

                    ) : (

                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-500/10 text-[10px] text-red-400">
                        PDF
                      </div>

                    )}


                    <div className="max-w-[220px]">

                      <p className="truncate text-xs text-mist">
                        {
                          selectedFile.file.name
                        }
                      </p>

                      <p className="mt-0.5 text-[10px] text-ash">
                        {(
                          selectedFile.file.size /
                          1024
                        ).toFixed(0)} KB
                      </p>

                    </div>


                    <button
                      onClick={
                        removeFile
                      }
                      className="ml-2 text-ash hover:text-quartz"
                    >
                      ×
                    </button>

                  </div>

                </div>

              )}


              <div className="rounded-md border border-inkline bg-deep-sea shadow-md">

                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  disabled={loading}
                  rows={2}
                  placeholder="Ask your DSA question..."
                  className="w-full resize-none bg-transparent px-4 pt-4 text-sm text-mist outline-none"
                />


                <div className="flex items-center justify-between px-3 pb-3">


                  <div className="flex items-center gap-1">

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      hidden
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={
                        handleFileSelect
                      }
                    />


                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      title="Upload PDF or Image"
                      className="flex h-9 w-9 items-center justify-center rounded-sm text-ash transition hover:bg-cobalt-panel hover:text-quartz"
                    >
                      📎
                    </button>


                    <button
                      type="button"
                      className="rounded-full px-3 py-2 text-xs text-ash transition hover:bg-cobalt-panel hover:text-quartz"
                    >
                      💡 Hint
                    </button>

                  </div>


                  <button
                    onClick={
                      sendMessage
                    }
                    disabled={
                      loading ||
                      !input.trim()
                    }
                    className="rounded-full bg-quartz px-5 py-2 text-sm font-semibold text-void shadow-inner-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate disabled:text-ash"
                  >

                    {loading
                      ? 'Thinking...'
                      : 'Send →'}

                  </button>

                </div>

              </div>


              <div className="mt-2 flex justify-between px-1">

                <p className="text-[10px] text-ash">
                  Enter to send · Shift + Enter for new line
                </p>


                {sessionId && (

                  <p className="text-[10px] text-green-400/70">
                    ● Session active
                  </p>

                )}

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/dashboard"
          element={
            <DashboardPage />
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  )
}

export default App