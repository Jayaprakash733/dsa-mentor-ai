import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import { tutorService } from './services/tutorService'

const DSA_MENTOR_LOGO = '/dsa-mentor-ai-logo.png'

interface Message {
  role: 'student' | 'assistant'
  content: string
}

interface ChatHistoryItem {
  session_id: string
  title: string
  topic: string
  difficulty: string
  updated_at: number
}

interface ExecutionResult {
  success: boolean
  stdout: string
  stderr: string
  exit_code: number | null
  timed_out: boolean
}

interface TestCaseResult {
  passed: boolean
  input: string
  expected_output: string
  actual_output: string
  error: string
  timed_out: boolean
}

interface TestSuiteResult {
  passed: number
  total: number
  test_cases: TestCaseResult[]
}

interface Problem {
  id: string
  problem_id: string
  frontend_id: string
  title: string
  difficulty: string
  topics: string[]
  description: string
  constraints: string
  follow_ups: string[]
  hints: string[]
  examples: {
    example_num: number
    text: string
  }[]
  test_cases?: {
    input: string
    expected_output: string
  }[]
  starter_code: string
  solution: string
}

interface ProblemsResponse {
  total: number
  problems: Problem[]
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

const difficulties = ['Easy', 'Medium', 'Hard']

const topicApiMap: Record<string, string> = {
  Arrays: 'Array',
  Strings: 'String',
  Hashing: 'Hash Table',
  'Two Pointers': 'Two Pointers',
  'Sliding Window': 'Sliding Window',
  'Linked List': 'Linked List',
  Stack: 'Stack',
  Queue: 'Queue',
  'Binary Search': 'Binary Search',
  Sorting: 'Sorting',
  Recursion: 'Recursion',
  Backtracking: 'Backtracking',
  Trees: 'Tree',
  BST: 'Binary Search Tree',
  'Heap / Priority Queue': 'Heap',
  Graphs: 'Graph',
  Greedy: 'Greedy',
  'Dynamic Programming': 'Dynamic Programming',
  'Bit Manipulation': 'Bit Manipulation',
}

const codeTemplates: Record<string, string> = {
  python: `nums = [2, 7, 11, 15]
target = 9

# Write your solution here
`,
  c: `#include <stdio.h>

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;

    // Write your solution here

    return 0;
}
`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;

    // Write your solution here

    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;

        // Write your solution here
    }
}
`,
}

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
            <img
              src={DSA_MENTOR_LOGO}
              alt="DSA Mentor AI"
              className="h-11 w-11 rounded-full object-contain"
            />

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
                Practice real DSA problems with an AI mentor that gives
                hints, explains mistakes and helps you reason before revealing
                the solution.
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
   QUICK ACTION BUTTONS
========================================================= */

function QuickActionButton({
  emoji,
  label,
  onClick,
  disabled,
}: {
  emoji: string
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left text-[11px] text-ash transition hover:border-[#5269aa]/30 hover:bg-[#5269aa]/10 hover:text-[#b9c9ff] disabled:opacity-50"
    >
      <span className="text-sm">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const [code, setCode] = useState(codeTemplates.python)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)
  const [executing, setExecuting] = useState(false)
  const [language, setLanguage] = useState('python')

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage)
    setExecutionResult(null)
    setTestSuiteResult(null)

    // Do NOT replace the selected problem with the hardcoded
    // Two Sum template when the language changes.
    //
    // The imported dataset currently exposes starter_code as the
    // Python starter. Keep the selected problem's code for Python.
    // For other languages, use an empty editor rather than showing
    // unrelated code from another problem.
    if (nextLanguage === 'python' && currentProblem?.starter_code?.trim()) {
      setCode(currentProblem.starter_code)
    } else if (nextLanguage !== 'python') {
      setCode('')
    } else {
      setCode('')
    }
  }

  const [difficulty, setDifficulty] = useState('Easy')
  const [topic, setTopic] = useState('Arrays')
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState(false)

  const [problems, setProblems] = useState<Problem[]>([])
  const [allProblems, setAllProblems] = useState<Problem[]>([])
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [problemsLoading, setProblemsLoading] = useState(false)
  const [problemsError, setProblemsError] = useState(false)
  const [testSuiteResult, setTestSuiteResult] = useState<TestSuiteResult | null>(null)

  const [solvedProblems, setSolvedProblems] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const problemTitle = currentProblem?.title || 'Select a problem'
  const problemDescription =
    currentProblem?.description ||
    'Choose a problem from the sidebar to start practicing.'

  const examples = currentProblem?.examples || []
  const constraints = currentProblem?.constraints || ''

  const problemTopics = currentProblem?.topics || []

  const totalProblemCount = allProblems.length

  const solvedCount = solvedProblems.length

  // Keep small but real progress visible.
  // Example: 1 / 2913 = 0.03%, not 0%.
  const progressPercent =
    totalProblemCount > 0
      ? Number(
          Math.min(
            100,
            (solvedCount / totalProblemCount) * 100
          ).toFixed(2)
        )
      : 0

  const progressBarPercent =
    solvedCount > 0 && progressPercent > 0
      ? Math.max(progressPercent, 1)
      : 0

  const getTopicProgress = (topicName: string) => {
    const topicProblems = allProblems.filter((problem) =>
      (problem.topics || []).some(
        (problemTopic) =>
          problemTopic.trim().toLowerCase() ===
          topicName.trim().toLowerCase()
      )
    )

    const solved = topicProblems.filter((problem) =>
      solvedProblems.includes(problem.id)
    ).length

    return {
      solved,
      total: topicProblems.length,
    }
  }

  const arraysProgress = getTopicProgress('Array')
  const stringsProgress = getTopicProgress('String')
  const hashingProgress = getTopicProgress('Hash Table')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        'dsa_solved_problems'
      )

      if (!saved) {
        return
      }

      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        setSolvedProblems(
          parsed.filter(
            (value): value is string =>
              typeof value === 'string'
          )
        )
      }
    } catch (error) {
      console.error(
        'Solved problems load error:',
        error
      )
    }
  }, [])

  const buildMentorContext = () => {
    const exampleText = examples.length
      ? examples.map((example) => example.text).join('\n')
      : 'No examples available.'

    return `
You are the AI mentor for the EXACT DSA problem currently selected by the student.

Problem title:
${problemTitle}

Topic:
${problemTopics.length ? problemTopics.join(', ') : topic}

Difficulty:
${currentProblem?.difficulty || difficulty}

Problem statement:
${problemDescription}

Constraints:
${constraints || 'No constraints available.'}

Examples:
${exampleText}

Current student code:
${code.trim() || 'No code written yet.'}

Latest execution result:
${
  executionResult
    ? `
Success: ${executionResult.success}
Output: ${executionResult.stdout || 'No output'}
Error: ${executionResult.stderr || 'None'}
Timed out: ${executionResult.timed_out}
`
    : 'The code has not been executed yet.'
}

${buildExecutionContext()}

Important:
- The student is already working on the problem above.
- Do NOT ask which problem the student means.
- Do NOT ask the student to provide the problem statement.
- Use the supplied problem context directly.
`
  }


  /* =======================================================
     EXECUTION-AWARE MENTOR CONTEXT
  ======================================================= */

  const buildExecutionContext = () => {
    if (!testSuiteResult) {
      return `
Latest test-suite result:
No test-suite execution has been performed yet.
`
    }

    const failedCases = testSuiteResult.test_cases
      .map((testCase, index) => {
        if (testCase.passed) return null

        return `
Case ${index + 1}:
Input: ${testCase.input}
Expected: ${testCase.expected_output}
Actual: ${testCase.actual_output || 'No output'}
Error: ${testCase.error || 'None'}
Timed out: ${testCase.timed_out ? 'Yes' : 'No'}
`
      })
      .filter(Boolean)
      .join('\n')

    return `
Latest test-suite result:
Passed: ${testSuiteResult.passed}/${testSuiteResult.total}

${
  failedCases
    ? `Failed test cases:
${failedCases}`
    : 'All available test cases passed.'
}
`
  }

  /* =======================================================
     LOAD PROBLEMS
  ======================================================= */

  const loadProblems = async () => {
    try {
      setProblemsLoading(true)
      setProblemsError(false)

      // Fetch the complete dataset once for reliable frontend filtering.
      // The backend already contains all 2913 imported problems.
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/problems?limit=2913'
      )

      if (!response.ok) {
        throw new Error(`Failed to load problems: ${response.status}`)
      }

      const data = (await response.json()) as ProblemsResponse

      setAllProblems(data.problems || [])

      const apiTopic = topicApiMap[topic]

      const normalizedTopic = (apiTopic || topic).trim().toLowerCase()
      const normalizedDifficulty = difficulty.trim().toLowerCase()

      const filteredProblems = (data.problems || []).filter((problem) => {
        const topicMatch = (problem.topics || []).some(
          (problemTopic) =>
            problemTopic.trim().toLowerCase() === normalizedTopic
        )

        const difficultyMatch =
          problem.difficulty.trim().toLowerCase() === normalizedDifficulty

        return topicMatch && difficultyMatch
      })

      // Stable ordering: numeric LeetCode/frontend id first.
      filteredProblems.sort((a, b) => {
        const aId = Number(a.frontend_id || a.problem_id || 0)
        const bId = Number(b.frontend_id || b.problem_id || 0)

        if (!Number.isNaN(aId) && !Number.isNaN(bId)) {
          return aId - bId
        }

        return a.title.localeCompare(b.title)
      })

      setProblems(filteredProblems)

      if (filteredProblems.length === 0) {
        setCurrentProblem(null)
        return
      }

      const existing = currentProblem
        ? filteredProblems.find(
            (problem) => problem.id === currentProblem.id
          )
        : null

      setCurrentProblem(existing || filteredProblems[0])
    } catch (error) {
      console.error('Problem loading error:', error)
      setProblems([])
      setCurrentProblem(null)
      setProblemsError(true)
    } finally {
      setProblemsLoading(false)
    }
  }

  const handleProblemSelect = async (problem: Problem) => {
    try {
      setExecutionResult(null)
      setTestSuiteResult(null)

      // Set the selected list item immediately.
      // The synchronization effect below will clear/replace the editor.
      setCurrentProblem(problem)

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/problems/${problem.id}`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load problem: ${response.status}`
        )
      }

      const fullProblem =
        (await response.json()) as Problem

      setCurrentProblem(fullProblem)
    } catch (error) {
      console.error(
        'Problem selection error:',
        error
      )

      // The list item already contains enough information
      // to keep the selected problem usable.
      setCurrentProblem(problem)
    }
  }

  // Keep the editor synchronized with the selected problem.
  // This is the source of truth: when the selected question changes,
  // the old question's code can never remain in the editor.
  useEffect(() => {
    if (!currentProblem) {
      setCode('')
      return
    }

    setExecutionResult(null)
    setTestSuiteResult(null)

    if (language === 'python') {
      setCode(currentProblem.starter_code?.trim() || '')
    } else {
      // The current imported schema exposes Python starter_code.
      // Never show a hardcoded starter from another problem.
      setCode('')
    }
  }, [currentProblem?.id, language])

  useEffect(() => {
    loadProblems()
    // Topic/difficulty are the filters that control the problem list.
  }, [topic, difficulty])

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  /* =======================================================
     LOAD HISTORY
  ======================================================= */

  const loadHistory = async () => {
    try {
      setHistoryLoading(true)
      setHistoryError(false)
      const history = await tutorService.getHistory()
      setChatHistory(history)
    } catch (error) {
      console.error('History error:', error)
      setHistoryError(true)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = async (customMessage?: string) => {
    const message = (customMessage || input).trim()

    if (!message || loading) return

    setMessages((prev) => [
      ...prev,
      {
        role: 'student',
        content: message,
      },
    ])

    if (!customMessage) {
      setInput('')
    }

    setLoading(true)

    try {
      const response = await tutorService.chat({
        message: `${buildMentorContext()}

Student request:
${message}

Mentor instructions:
- Answer specifically for the selected problem.
- Use the student's current code when relevant.
- If test cases failed, focus on the failed cases and explain the mismatch.
- Give reasoning and guidance before code.
- Do not reveal a complete solution unless the student explicitly asks for it.
- Do not ask which problem the student is solving.`,
        difficulty,
        topic: problemTopics[0] || topic,
        request_type: 'chat',
        hint_level: 1,
        session_id: sessionId,

        problem_title: problemTitle,
        problem_description: currentProblem?.description || '',
        problem_constraints: currentProblem?.constraints || '',
        problem_examples: examples.map((example) => example.text),
        student_code: code,
        execution_feedback: testSuiteResult
          ? {
              passed: testSuiteResult.passed,
              total: testSuiteResult.total,
              test_cases: testSuiteResult.test_cases,
            }
          : undefined,
      })

      setSessionId(response.session_id)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
        },
      ])

      await loadHistory()
    } catch (error) {
      console.error('Chat error:', error)
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
     GET HINT
  ======================================================= */

  const handleHint = async () => {
    if (loading) return

    const hintMessage = `
${buildMentorContext()}

Task:
Give ONE progressive hint for the selected problem.

Hint rules:
1. Do not give the complete solution.
2. Do not provide complete code.
3. Do not ask which problem the student is solving.
4. Do not ask for the problem statement.
5. Focus on the student's current code when code is present.
6. Give a concrete thinking direction appropriate for the difficulty.
7. Prefer an observation, data structure, invariant, or next step.
8. Keep the hint concise and beginner-friendly.
`

    setLoading(true)

    try {
      const response = await tutorService.getHint({
        message: hintMessage,
        difficulty,
        topic: problemTopics[0] || topic,
        hint_level: 1,
        session_id: sessionId,

        problem_title: problemTitle,
        problem_description: currentProblem?.description || '',
        problem_constraints: currentProblem?.constraints || '',
        problem_examples: examples.map((example) => example.text),
        student_code: code,
        execution_feedback: testSuiteResult
          ? {
              passed: testSuiteResult.passed,
              total: testSuiteResult.total,
              test_cases: testSuiteResult.test_cases,
            }
          : undefined,
      })

      if (response.session_id) {
        setSessionId(response.session_id)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
        },
      ])

      await loadHistory()
    } catch (error) {
      console.error('Hint error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not generate a hint. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }


  /* =======================================================
     RUN CODE + TEST SUITE
  ======================================================= */

  const buildTestCases = () => {
    if (currentProblem?.test_cases?.length) {
      return currentProblem.test_cases
    }

    return examples
      .map((example) => {
        const text = example.text || ''
        const inputIndex = text.indexOf('Input:')
        const outputIndex = text.indexOf('Output:')

        if (inputIndex < 0 || outputIndex <= inputIndex) {
          return null
        }

        const input = text
          .slice(inputIndex + 'Input:'.length, outputIndex)
          .trim()

        const outputText = text
          .slice(outputIndex + 'Output:'.length)
          .trim()

        const explanationIndex = outputText.indexOf('Explanation:')

        const expectedOutput =
          explanationIndex >= 0
            ? outputText.slice(0, explanationIndex).trim()
            : outputText.split('\n')[0].trim()

        if (!input || !expectedOutput) {
          return null
        }

        return {
          input,
          expected_output: expectedOutput,
        }
      })
      .filter(
        (
          item
        ): item is {
          input: string
          expected_output: string
        } => item !== null
      )
  }

  const getFunctionName = () => {
    if (language.toLowerCase() !== 'python') {
      return null
    }

    if (!/class\s+Solution\s*[:(]/.test(code)) {
      return null
    }

    const match = code.match(
      /(?:^|\n)\s*def\s+([A-Za-z_]\w*)\s*\(/
    )

    return match?.[1] || null
  }

  const runCode = async () => {
    if (!code.trim() || executing) {
      return
    }

    setExecuting(true)
    setExecutionResult(null)
    setTestSuiteResult(null)

    try {
      const testCases = buildTestCases()

      // ==================================================
      // PROBLEM WITH STRUCTURED TEST CASES
      // Run directly through /execute/tests so stdin is
      // actually supplied to the program.
      // ==================================================

      if (testCases.length > 0) {
        const testResponse = await fetch(
          'http://127.0.0.1:8000/api/v1/execute/tests',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              language,
              function_name: getFunctionName(),
              test_cases: testCases,
            }),
          }
        )

        if (!testResponse.ok) {
          throw new Error(
            `Test execution failed: ${testResponse.status}`
          )
        }

        const testResult =
          (await testResponse.json()) as TestSuiteResult

        setTestSuiteResult(testResult)

        // Mark the problem solved only when every available
        // test case passes. Failed/partial runs never count.
        if (
          currentProblem &&
          testResult.total > 0 &&
          testResult.passed === testResult.total
        ) {
          setSolvedProblems((previous) => {
            if (previous.includes(currentProblem.id)) {
              return previous
            }

            const updated = [
              ...previous,
              currentProblem.id,
            ]

            try {
              localStorage.setItem(
                'dsa_solved_problems',
                JSON.stringify(updated)
              )
            } catch (error) {
              console.error(
                'Solved problems save error:',
                error
              )
            }

            return updated
          })
        }

        // Use the first test case to populate the main
        // execution result panel.
        const firstCase = testResult.test_cases[0]

        if (firstCase) {
          setExecutionResult({
            success:
              firstCase.passed &&
              !firstCase.timed_out,
            stdout:
              firstCase.actual_output || '',
            stderr:
              firstCase.error || '',
            exit_code:
              firstCase.passed ? 0 : 1,
            timed_out:
              firstCase.timed_out,
          })
        }

        return
      }

      // ==================================================
      // FALLBACK: SIMPLE EXECUTION
      // Used for problems without structured test cases.
      // ==================================================

      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/execute',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Execution failed: ${response.status}`
        )
      }

      const result =
        (await response.json()) as ExecutionResult

      setExecutionResult(result)
    } catch (error) {
      console.error(
        'Code execution error:',
        error
      )

      setExecutionResult({
        success: false,
        stdout: '',
        stderr:
          'Unable to connect to the code execution service.',
        exit_code: null,
        timed_out: false,
      })

      setTestSuiteResult(null)
    } finally {
      setExecuting(false)
    }
  }

  /* =======================================================
     ASK MENTOR ABOUT CODE
  ======================================================= */

  const askMentorAboutCode = async () => {
    if (!code.trim() || !executionResult || executing || loading) return

    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/execute/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problem: `${problemTitle}: ${problemDescription}`,
          topic: problemTopics[0] || topic,
          difficulty: currentProblem?.difficulty || difficulty,
          success: executionResult.success,
          stdout: executionResult.stdout,
          stderr: executionResult.stderr,
          timed_out: executionResult.timed_out,
        }),
      })

      if (!response.ok) {
        throw new Error(`Mentor feedback failed: ${response.status}`)
      }

      const result = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.feedback || 'No mentor feedback was returned.',
        },
      ])
    } catch (error) {
      console.error('Mentor feedback error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not analyze the execution right now. Please make sure the backend is running.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     RESET CONVERSATION
  ======================================================= */

  const resetConversation = () => {
    setMessages([])
    setSessionId(undefined)
    setInput('')
    setLanguage('python')
    setCurrentProblem(null)
    setCode('')
    setExecutionResult(null)
    setTestSuiteResult(null)
  }

  /* =======================================================
     LOAD CONVERSATION
  ======================================================= */

  const loadConversation = async (item: ChatHistoryItem) => {
    if (loading) return

    try {
      setLoading(true)
      const conversation = await tutorService.getConversation(item.session_id)
      setMessages(conversation.messages)
      setSessionId(conversation.session_id)
      setTopic(item.topic)
      setDifficulty(item.difficulty)
      setInput('')
    } catch (error) {
      console.error('Conversation load error:', error)
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     DELETE CONVERSATION
  ======================================================= */

  const deleteConversation = async (event: MouseEvent, id: string) => {
    event.stopPropagation()

    try {
      await tutorService.deleteConversation(id)
      if (sessionId === id) {
        resetConversation()
      }
      await loadHistory()
    } catch (error) {
      console.error('Delete conversation error:', error)
    }
  }

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatChatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return date.toLocaleDateString([], {
      day: '2-digit',
      month: 'short',
    })
  }

  /* =======================================================
     HANDLE KEYBOARD
  ======================================================= */

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  /* =======================================================
     UI RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#080b13] text-quartz">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080b13]/95 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <img
              src={DSA_MENTOR_LOGO}
              alt="DSA Mentor AI"
              className="h-8 w-8 rounded-full object-contain"
            />
            <div>
              <p className="text-sm font-semibold">DSA Mentor AI</p>
              <p className="hidden text-[10px] text-ash sm:block">Practice · Understand · Master</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-[11px] text-ash">AI Online</span>
            </div>

            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-mist outline-none"
            >
              {difficulties.map((level) => (
                <option key={level} value={level} className="bg-[#0b1020]">
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex min-h-[calc(100vh-56px)]">
        {/* LEFT SIDEBAR */}
        <aside className="hidden w-[240px] shrink-0 border-r border-white/[0.06] bg-[#090d16] xl:flex xl:flex-col">
          <div className="border-b border-white/[0.06] p-3">
            <button
              onClick={resetConversation}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#080b13] transition hover:bg-white/90"
            >
              <span>＋</span>
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* RECENT */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ash">Recent</p>
                {chatHistory.length > 0 && (
                  <span className="text-[9px] text-ash/50">{chatHistory.length}</span>
                )}
              </div>

              {historyLoading ? (
                <div className="px-2 py-4 text-[10px] text-ash">Loading...</div>
              ) : historyError || chatHistory.length === 0 ? (
                <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                  <p className="text-[10px] text-ash">
                    {historyError ? 'Recent chats are unavailable right now.' : 'No recent chats yet.'}
                  </p>
                  {historyError && (
                    <button
                      onClick={loadHistory}
                      className="mt-2 text-[10px] text-[#9fb2ff] underline underline-offset-2"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {chatHistory.slice(0, 8).map((item) => (
                    <div
                      key={item.session_id}
                      onClick={() => loadConversation(item)}
                      className={`group cursor-pointer rounded-md px-2.5 py-2 transition ${
                        sessionId === item.session_id
                          ? 'bg-[#182b60]'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-1 text-[7px] text-ash/60">●</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] text-mist">{item.title}</p>
                          <p className="mt-0.5 truncate text-[9px] text-ash/50">
                            {item.topic} · {formatChatDate(item.updated_at)}
                          </p>
                        </div>
                        <button
                          onClick={(event) => deleteConversation(event, item.session_id)}
                          className="hidden text-xs text-ash/30 hover:text-red-400 group-hover:block"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOPICS */}
            <div>
              <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-ash">
                Topics
              </p>
              <div className="space-y-0.5">
                {topics.map((item) => (
                  <button
                    key={item}
                    onClick={() => setTopic(item)}
                    className={`w-full rounded-md px-2.5 py-1.5 text-left text-[11px] transition ${
                      topic === item
                        ? 'bg-[#182b60] text-[#b9c9ff]'
                        : 'text-ash hover:bg-white/[0.04] hover:text-quartz'
                    }`}
                  >
                    <span className="mr-2 text-[7px]">{topic === item ? '●' : '○'}</span>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="border-t border-white/[0.06] px-3 py-4">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ash">
                Questions
              </p>
              <span className="text-[9px] text-ash/50">
                {problems.length}
              </span>
            </div>

            {problemsLoading ? (
              <div className="px-2 py-4 text-[10px] text-ash">
                Loading questions...
              </div>
            ) : problemsError ? (
              <div className="rounded-md border border-red-400/10 bg-red-400/[0.03] px-3 py-3">
                <p className="text-[10px] text-red-300">
                  Unable to load questions.
                </p>
                <button
                  type="button"
                  onClick={loadProblems}
                  className="mt-2 text-[10px] text-[#9fb2ff] underline"
                >
                  Retry
                </button>
              </div>
            ) : problems.length === 0 ? (
              <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                <p className="text-[10px] text-ash">
                  No questions found for this topic and difficulty.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => handleProblemSelect(problem)}
                    className={`w-full rounded-md px-2.5 py-2 text-left transition ${
                      currentProblem?.id === problem.id
                        ? 'bg-[#182b60] text-[#b9c9ff]'
                        : 'text-ash hover:bg-white/[0.04] hover:text-quartz'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[7px]">
                        {currentProblem?.id === problem.id ? '●' : '○'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10px]">
                          {problem.frontend_id}. {problem.title}
                        </p>
                        <p className="mt-0.5 text-[8px] text-ash/50">
                          {problem.difficulty}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PROGRESS */}
          <div className="border-t border-white/[0.06] p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.16em] text-ash">
                Your Progress
              </p>

              <span className="text-[10px] font-semibold text-[#9fb2ff]">
                {progressPercent}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-[#5277ff] transition-all duration-300"
                style={{
                  width: `${progressBarPercent}%`,
                }}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              <div className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
                <p className="text-[9px] text-ash">Arrays</p>
                <p className="mt-0.5 text-[10px] text-mist">
                  {arraysProgress.solved} / {arraysProgress.total}
                </p>
              </div>

              <div className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
                <p className="text-[9px] text-ash">Strings</p>
                <p className="mt-0.5 text-[10px] text-mist">
                  {stringsProgress.solved} / {stringsProgress.total}
                </p>
              </div>

              <div className="rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5">
                <p className="text-[9px] text-ash">Hashing</p>
                <p className="mt-0.5 text-[10px] text-mist">
                  {hashingProgress.solved} / {hashingProgress.total}
                </p>
              </div>
            </div>

            <p className="mt-2 text-[8px] text-ash/50">
              {solvedCount} of {totalProblemCount} problems solved
            </p>
          </div>
        </aside>

        {/* CENTER + RIGHT LAYOUT */}
        <main className="min-w-0 flex-1">
          <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* CENTER: PROBLEM + CODE EDITOR */}
            <section className="min-w-0 overflow-y-auto border-r border-white/[0.06] bg-[#080c14]">
              <div className="mx-auto max-w-[1000px] px-4 py-6 lg:px-8">
                {/* MOBILE CONTROLS */}
                <div className="mb-4 flex items-center justify-between xl:hidden">
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-ash"
                  >
                    + New Chat
                  </button>
                  <span className="text-[9px] text-ash/60">
                    {topic} · {difficulty}
                  </span>
                </div>

                {/* PROBLEM TOOLBAR */}
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-ash/60">
                      Practice workspace
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/20" />
                    <span className="text-[9px] text-ash/50">
                      Guided by AI Mentor
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={loading}
                    className="rounded-md border border-[#5269aa]/25 bg-[#5269aa]/10 px-3 py-1.5 text-[10px] font-semibold text-[#b9c9ff] transition hover:bg-[#5269aa]/20 disabled:opacity-50"
                  >
                    💡 Hint
                  </button>
                </div>

                {/* PROBLEM HEADER */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-green-400/10 px-2 py-0.5 text-[9px] font-medium text-green-400">
                      {currentProblem?.difficulty || difficulty}
                    </span>
                    {problemTopics.slice(0, 2).map((problemTopic) => (
                      <span
                        key={problemTopic}
                        className="rounded-full bg-blue-400/10 px-2 py-0.5 text-[9px] font-medium text-blue-400"
                      >
                        {problemTopic}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h1 className="text-[30px] font-semibold tracking-[-0.02em]">{problemTitle}</h1>
                      <p className="mt-1 text-[11px] text-ash">
                        {problemTopics.length > 0
                          ? problemTopics.join(' · ')
                          : 'Choose a problem'} · {currentProblem?.difficulty || difficulty}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[9px] text-ash/60">
                      <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1">
                        Beginner friendly
                      </span>
                      <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1">
                        Guided practice
                      </span>
                    </div>
                  </div>
                </div>

                {/* PROBLEM CARD */}
                <div className="mb-6 rounded-lg border border-white/[0.07] bg-[#0c1220]">
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ash">
                      Problem Statement
                    </p>
                  </div>

                  <div className="space-y-4 px-4 py-4">
                    {!currentProblem && (
                      <div className="rounded-md border border-[#5269aa]/20 bg-[#5269aa]/[0.05] px-3 py-3 text-[10px] text-[#b9c9ff]">
                        Select a question from the left sidebar to begin.
                      </div>
                    )}
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ash/70">
                        Understand
                      </p>
                      <p className="text-sm leading-6 text-mist">{problemDescription}</p>
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-semibold text-ash">Examples</p>
                      <div className="space-y-2">
                        {examples.length > 0 ? (
                          examples.map((example) => (
                            <div
                              key={example.example_num}
                              className="rounded-md bg-[#080c14] px-3 py-2 font-mono text-[10px] leading-5"
                            >
                              <p className="mb-1 text-[9px] text-ash/60">
                                Example {example.example_num}
                              </p>
                              <pre className="whitespace-pre-wrap text-mist">
                                {example.text}
                              </pre>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-ash">
                            No examples available for this problem.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[9px] text-ash">
                      {problemTopics.map((problemTopic) => (
                        <span
                          key={problemTopic}
                          className="rounded border border-white/[0.07] px-2 py-1"
                        >
                          {problemTopic}
                        </span>
                      ))}
                    </div>

                    {currentProblem?.constraints && (
                      <div className="rounded-md border border-white/[0.06] bg-[#080c14] px-3 py-2">
                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ash">
                          Constraints
                        </p>
                        <p className="whitespace-pre-wrap text-[10px] leading-5 text-mist">
                          {currentProblem.constraints}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CODE EDITOR */}
                <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0a0f1a] shadow-2xl mb-4">
                  <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#101828] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#f45d5d]" />
                      <span className="h-2 w-2 rounded-full bg-[#f2c94c]" />
                      <span className="h-2 w-2 rounded-full bg-[#45d483]" />
                      <span className="ml-2 text-[10px] text-ash">
                        solution.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : 'java'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={language}
                        onChange={(event) =>
                          handleLanguageChange(event.target.value)
                        }
                        disabled={executing}
                        className="rounded-md border border-white/[0.08] bg-[#080d16] px-2.5 py-1.5 text-[10px] text-mist outline-none"
                      >
                        <option value="python">Python</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>

                      <button
                        type="button"
                        onClick={runCode}
                        disabled={executing || !code.trim() || !currentProblem}
                        className="rounded-md bg-white px-4 py-1.5 text-[11px] font-semibold text-[#080b13] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-slate disabled:text-ash"
                      >
                        {executing ? 'Running...' : '▶ Run'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    disabled={executing}
                    spellCheck={false}
                    rows={10}
                    className="block w-full resize-y bg-[#070b12] px-4 py-4 font-mono text-[12px] leading-6 text-[#d8def0] outline-none"
                    placeholder={`Write your ${language === 'python' ? 'Python' : language === 'cpp' ? 'C++' : language === 'c' ? 'C' : 'Java'} solution here...`}
                  />

                  {/* EXECUTION RESULT */}
                  {executionResult && (
                    <div className="border-t border-white/[0.07]">
                      <div className="flex items-center justify-between px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ash">
                          Execution Result
                        </p>
                        <span
                          className={
                            executionResult.success
                              ? 'text-[10px] font-medium text-green-400'
                              : executionResult.timed_out
                                ? 'text-[10px] font-medium text-yellow-400'
                                : 'text-[10px] font-medium text-red-400'
                          }
                        >
                          {executionResult.success
                            ? '● Accepted'
                            : executionResult.timed_out
                              ? '● Time Limit'
                              : '● Runtime Error'}
                        </span>
                      </div>

                      {executionResult.stdout && (
                        <div className="border-t border-white/[0.06] p-3">
                          <p className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-ash">
                            Output
                          </p>
                          <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-md bg-[#060910] p-3 font-mono text-[11px] leading-5 text-green-300">
                            {executionResult.stdout}
                          </pre>
                        </div>
                      )}

                      {executionResult.stderr && (
                        <div className="border-t border-white/[0.06] p-3">
                          <p className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-ash">
                            Error
                          </p>
                          <pre className="max-h-36 overflow-auto whitespace-pre-wrap rounded-md bg-[#060910] p-3 font-mono text-[11px] leading-5 text-red-300">
                            {executionResult.stderr}
                          </pre>
                        </div>
                      )}

                      {!executionResult.stdout && !executionResult.stderr && (
                        <div className="border-t border-white/[0.06] p-3">
                          <p className="text-[11px] text-ash">No output produced.</p>
                        </div>
                      )}

                      {testSuiteResult ? (
                        <div className="border-t border-white/[0.06] px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-mist">
                              Test Cases
                            </p>
                            <span
                              className={
                                testSuiteResult.passed === testSuiteResult.total
                                  ? 'text-[9px] font-semibold text-green-400'
                                  : 'text-[9px] font-semibold text-red-400'
                              }
                            >
                              {testSuiteResult.passed}/{testSuiteResult.total} passed
                            </span>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {testSuiteResult.test_cases.map((testCase, index) => (
                              <div
                                key={index}
                                className={`rounded-md border px-3 py-2 ${
                                  testCase.passed
                                    ? 'border-green-400/10 bg-green-400/[0.03]'
                                    : testCase.timed_out
                                      ? 'border-yellow-400/10 bg-yellow-400/[0.03]'
                                      : 'border-red-400/10 bg-red-400/[0.03]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[9px] text-ash">
                                    Case {index + 1}
                                  </span>
                                  <span
                                    className={
                                      testCase.passed
                                        ? 'text-[9px] font-medium text-green-400'
                                        : testCase.timed_out
                                          ? 'text-[9px] font-medium text-yellow-400'
                                          : 'text-[9px] font-medium text-red-400'
                                    }
                                  >
                                    {testCase.passed
                                      ? '✓ Passed'
                                      : testCase.timed_out
                                        ? '◷ Timeout'
                                        : '✕ Failed'}
                                  </span>
                                </div>

                                {!testCase.passed && (
                                  <div className="mt-2 space-y-1 text-[9px]">
                                    <p className="text-ash">
                                      Expected:{' '}
                                      <span className="font-mono text-green-300">
                                        {testCase.expected_output}
                                      </span>
                                    </p>
                                    <p className="text-ash">
                                      Actual:{' '}
                                      <span className="font-mono text-red-300">
                                        {testCase.actual_output || 'No output'}
                                      </span>
                                    </p>
                                    {testCase.error && (
                                      <p className="mt-1 whitespace-pre-wrap text-red-300">
                                        {testCase.error}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-white/[0.06] px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-mist">
                              Test Cases
                            </p>
                            <span className="text-[9px] text-ash">
                              No test cases
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2.5">
                        <p className="text-[10px] text-ash">Stuck? Ask your mentor!</p>
                        <button
                          type="button"
                          onClick={askMentorAboutCode}
                          disabled={loading}
                          className="rounded-md border border-[#5269aa]/30 bg-[#5269aa]/10 px-3 py-1.5 text-[10px] font-semibold text-[#b9c9ff] transition hover:bg-[#5269aa]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? 'Analyzing...' : '🤖 Ask Mentor'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[9px] text-ash/50">
                  Run code before asking the mentor for execution feedback.
                </p>
              </div>
            </section>

            {/* RIGHT SIDEBAR: AI MENTOR */}
            <aside className="hidden xl:flex xl:flex-col min-h-[calc(100vh-56px)] bg-[#090d16] border-l border-white/[0.06]">
              {/* MENTOR HEADER */}
              <div className="border-b border-white/[0.06] px-4 py-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={DSA_MENTOR_LOGO}
                      alt="AI Mentor"
                      className="h-8 w-8 rounded-full object-contain"
                    />
                    <div>
                      <p className="text-xs font-semibold">AI Mentor</p>
                      <p className="text-[9px] text-ash">Guided learning</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] text-green-400/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Online
                  </span>
                </div>
              </div>

              {/* CHAT AREA */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-start min-h-full">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-sm">
                        ◈
                      </div>
                      <p className="text-sm font-semibold">Let's solve together.</p>
                      <p className="mx-auto mt-2 max-w-[260px] text-[10px] leading-5 text-ash/70">
                        I'll guide your thinking, review your code and explain
                        execution errors without immediately giving away the answer.
                      </p>

                      {/* QUICK ACTIONS */}
                      <div className="mt-6">
                        <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-ash/60">
                          Quick actions
                        </p>
                        <QuickActionButton
                          emoji="💡"
                          label="Give me a hint"
                          onClick={() => sendMessage('Give me a hint')}
                          disabled={loading}
                        />
                        <QuickActionButton
                          emoji="🧭"
                          label="Guide me"
                          onClick={() => sendMessage('What should I think about first?')}
                          disabled={loading}
                        />
                        <QuickActionButton
                          emoji="📊"
                          label="Review approach"
                          onClick={() => sendMessage('Explain the optimal approach')}
                          disabled={loading}
                        />
                        <QuickActionButton
                          emoji="⚠️"
                          label="Explain error"
                          onClick={() => sendMessage('Why is my solution wrong?')}
                          disabled={loading}
                        />
                        <QuickActionButton
                          emoji="⏱️"
                          label="Complexity"
                          onClick={() => sendMessage('What is the time and space complexity?')}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={message.role === 'student' ? 'flex justify-end' : 'flex items-start gap-2'}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#5269aa]/30 bg-[#5269aa]/10 text-[9px] text-[#b9c9ff]">
                            ◈
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2.5 text-[11px] leading-5 ${
                            message.role === 'student'
                              ? 'bg-[#3157c8] text-white'
                              : 'border border-white/[0.07] bg-[#0f1419] text-[#d6dced]'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex items-start gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#5269aa]/30 bg-[#5269aa]/10 text-[9px] text-[#b9c9ff]">
                          ◈
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#0f1419] px-3 py-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5269aa] animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5269aa] animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#5269aa] animate-pulse" />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* CHAT INPUT */}
              <div className="border-t border-white/[0.06] bg-[#0b101a] p-3 shrink-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[9px] text-ash/50">AI coaching mode</span>
                  <span className="text-[9px] text-green-400/70">No direct solution unless requested</span>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-[#080d16]">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    rows={3}
                    placeholder="Ask your mentor..."
                    className="w-full resize-none bg-transparent px-3 py-3 text-[11px] leading-5 text-mist outline-none placeholder:text-ash/50"
                  />

                  <div className="flex items-center justify-between border-t border-white/[0.06] px-2 py-2">
                    <button
                      type="button"
                      onClick={handleHint}
                      disabled={loading}
                      className="rounded-md px-2.5 py-1.5 text-[10px] text-ash transition hover:bg-[#5269aa]/10 hover:text-[#cbd5ff] disabled:opacity-50"
                    >
                      💡 Hint
                    </button>

                    <button
                      type="button"
                      onClick={() => sendMessage()}
                      disabled={loading || !input.trim()}
                      className="rounded-md bg-white px-3 py-1.5 text-[10px] font-semibold text-[#080b13] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-slate disabled:text-ash"
                    >
                      {loading ? 'Thinking...' : 'Send →'}
                    </button>
                  </div>
                </div>

                <p className="mt-1.5 text-[8px] text-ash/50">
                  Enter to send · Shift + Enter for new line
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}

/* =========================================================
   APP ROOT
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
