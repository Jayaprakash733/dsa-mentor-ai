// DSA Mentor AI - React Frontend Setup
// This file demonstrates the core frontend structure and components

// ============================================================================
// 1. PACKAGE.JSON DEPENDENCIES
// ============================================================================

/*
{
  "name": "dsa-mentor-ai-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "@monaco-editor/react": "^4.5.0",
    "@shadcn/ui": "^0.8.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.307.0",
    "date-fns": "^2.30.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
*/

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================

// src/types/index.ts

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced';
  created_at: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  tags: string[];
  company_tags: string[];
  solve_count: number;
  acceptance_rate: number;
  examples: any[];
  constraints: string;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: string;
  status: 'Pending' | 'Running' | 'Accepted' | 'Wrong Answer' | 'Runtime Error';
  runtime_ms: number | null;
  memory_mb: number | null;
  test_cases_passed: number | null;
  test_cases_total: number | null;
  submitted_at: string;
}

export interface Progress {
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  current_streak: number;
  accuracy_percentage: number;
  global_rank: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_used?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  problem_id: string | null;
  title: string;
  messages: ChatMessage[];
  current_hint_level: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// 3. API CLIENT SERVICE
// ============================================================================

// src/services/api.ts

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (email: string, username: string, password: string, full_name: string) =>
    apiClient.post('/auth/register', { email, username, password, full_name }),
  
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  refresh: () =>
    apiClient.post('/auth/refresh', {}),
  
  logout: () =>
    apiClient.post('/auth/logout', {}),
};

// Problems API
export const problemsAPI = {
  getAll: (skip = 0, limit = 20, difficulty?: string, topic?: string) =>
    apiClient.get('/problems', { params: { skip, limit, difficulty, topic } }),
  
  getById: (id: string) =>
    apiClient.get(`/problems/${id}`),
  
  create: (data: any) =>
    apiClient.post('/problems', data),
  
  getByTopic: (topic: string) =>
    apiClient.get('/problems', { params: { topic } }),
};

// Submissions API
export const submissionsAPI = {
  submit: (problem_id: string, code: string, language: string) =>
    apiClient.post('/submissions', { problem_id, code, language }),
  
  getAll: (skip = 0, limit = 20) =>
    apiClient.get('/submissions', { params: { skip, limit } }),
  
  getById: (id: string) =>
    apiClient.get(`/submissions/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    apiClient.get('/analytics/dashboard'),
  
  getProgress: () =>
    apiClient.get('/analytics/progress'),
  
  getTopics: () =>
    apiClient.get('/analytics/topics'),
};

// Tutor API
export const tutorAPI = {
  sendMessage: (conversation_id: string | null, problem_id: string | null, message: string, request_type = 'chat') =>
    apiClient.post('/tutor/chat', { conversation_id, problem_id, message, request_type }),
  
  getConversation: (id: string) =>
    apiClient.get(`/tutor/conversations/${id}`),
  
  getHint: (conversation_id: string) =>
    apiClient.post('/tutor/hint', { conversation_id }),
};

// ============================================================================
// 4. STATE MANAGEMENT (Zustand)
// ============================================================================

// src/store/authStore.ts

import { create } from 'zustand';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Fetch user profile
      const userResponse = await apiClient.get('/users/me');
      
      set({
        accessToken: access_token,
        refreshToken: refresh_token,
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string, full_name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(email, username, password, full_name);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User) => set({ user }),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ accessToken, refreshToken });
  },
  clearError: () => set({ error: null }),
}));

// src/store/problemStore.ts

interface ProblemState {
  problems: Problem[];
  selectedProblem: Problem | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    difficulty?: string;
    topic?: string;
    company?: string;
  };

  fetchProblems: (skip?: number, limit?: number) => Promise<void>;
  fetchProblemById: (id: string) => Promise<void>;
  setFilters: (filters: any) => void;
  setSelectedProblem: (problem: Problem) => void;
}

export const useProblemStore = create<ProblemState>((set) => ({
  problems: [],
  selectedProblem: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchProblems: async (skip = 0, limit = 20) => {
    set({ isLoading: true });
    try {
      const response = await problemsAPI.getAll(skip, limit);
      set({ problems: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProblemById: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await problemsAPI.getById(id);
      set({ selectedProblem: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setFilters: (filters) => set({ filters }),
  setSelectedProblem: (problem) => set({ selectedProblem: problem }),
}));

// ============================================================================
// 5. CUSTOM HOOKS
// ============================================================================

// src/hooks/useAuth.ts

import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, register } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  };
};

// src/hooks/useProblems.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { problemsAPI, submissionsAPI } from '../services/api';

export const useProblems = () => {
  const {
    data: problems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['problems'],
    queryFn: () => problemsAPI.getAll().then((res) => res.data),
  });

  return { problems, isLoading, error };
};

export const useProblemById = (id: string) => {
  const {
    data: problem,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => problemsAPI.getById(id).then((res) => res.data),
  });

  return { problem, isLoading, error };
};

export const useSubmitCode = () => {
  return useMutation({
    mutationFn: ({ problem_id, code, language }: { problem_id: string; code: string; language: string }) =>
      submissionsAPI.submit(problem_id, code, language).then((res) => res.data),
  });
};

// src/hooks/useTutor.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { tutorAPI } from '../services/api';

export const useTutor = (conversation_id?: string) => {
  const sendMessage = useMutation({
    mutationFn: ({
      conversation_id,
      problem_id,
      message,
      request_type,
    }: {
      conversation_id?: string;
      problem_id?: string;
      message: string;
      request_type?: string;
    }) => tutorAPI.sendMessage(conversation_id || null, problem_id || null, message, request_type).then((res) => res.data),
  });

  return { sendMessage };
};

// ============================================================================
// 6. COMPONENTS
// ============================================================================

// src/components/layout/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Home, BookOpen, Code, BarChart3, LogOut } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Problems', path: '/problems' },
    { icon: Code, label: 'Tutor', path: '/tutor' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white transition-transform ${open ? 'translate-x-0' : '-translate-x-64'} lg:translate-x-0 lg:static z-40`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold">DSA Mentor</h1>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              location.pathname === path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-slate-800'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

// src/components/problems/ProblemCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Problem } from '../../types';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ProblemCardProps {
  problem: Problem;
  solved?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, solved = false }) => {
  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800',
  };

  return (
    <Link to={`/problems/${problem.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold flex-1">{problem.title}</h3>
          {solved && <CheckCircle className="text-green-500" />}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{problem.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {problem.topic}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {problem.acceptance_rate.toFixed(1)}% pass rate
          </div>
        </div>
      </div>
    </Link>
  );
};

// src/components/editor/CodeEditor.tsx

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onSubmit,
  isLoading = false,
}) => {
  const languages = ['python', 'java', 'cpp', 'javascript', 'c'];

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 text-white p-4 gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="language-select" className="font-medium">
            Language:
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="px-3 py-1 rounded bg-slate-700 text-white"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Editor */}
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
};

// ============================================================================
// 7. PAGES
// ============================================================================

// src/pages/DashboardPage.tsx

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Problems Solved" value={dashboard?.total_solved || 0} />
        <StatCard title="Current Streak" value={dashboard?.current_streak || 0} />
        <StatCard title="Accuracy" value={`${(dashboard?.accuracy_percentage || 0).toFixed(1)}%`} />
        <StatCard title="Global Rank" value={`#${dashboard?.global_rank || 'Unranked'}`} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboard?.weekly_progress || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="problems_solved" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-white rounded-lg p-4 shadow">
    <p className="text-gray-600 text-sm">{title}</p>
    <p className="text-2xl font-bold text-blue-600">{value}</p>
  </div>
);

// src/pages/ProblemsPage.tsx

import React, { useState } from 'react';
import { useProblems } from '../hooks/useProblems';
import { ProblemCard } from '../components/problems/ProblemCard';
import { Loader } from 'lucide-react';

export const ProblemsPage: React.FC = () => {
  const { problems, isLoading } = useProblems();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const filteredProblems = problems?.filter((p) => {
    if (selectedDifficulty && p.difficulty !== selectedDifficulty) return false;
    if (selectedTopic && p.topic !== selectedTopic) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Problems</h1>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Topics</option>
          {/* Dynamic topics */}
        </select>
      </div>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems?.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 8. APP ROUTER
// ============================================================================

// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { useState } from 'react';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {isAuthenticated ? (
          <div className="flex h-screen bg-slate-50">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/problems" element={<ProblemsPage />} />
                {/* Add more routes */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </QueryClientProvider>
  );
}

export default App;

// ============================================================================
// 9. ENVIRONMENT CONFIGURATION
// ============================================================================

// src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================================================================
// 10. TAILWIND CONFIGURATION
// ============================================================================

/*
tailwind.config.js

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
*/

// ============================================================================
// 11. VITE CONFIGURATION
// ============================================================================

/*
vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
*/
