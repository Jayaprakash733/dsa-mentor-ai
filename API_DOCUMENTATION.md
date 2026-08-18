# DSA Mentor AI - API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Response Format
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Authentication Endpoints

### 1. Register
**POST** `/auth/register`

Register a new user account.

#### Request Body
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "secure_password",
  "full_name": "John Doe"
}
```

#### Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "avatar_url": null,
  "experience_level": "Beginner",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Error Responses
```json
{
  "detail": "Email already registered"
}
```

---

### 2. Login
**POST** `/auth/login`

Authenticate user and get access/refresh tokens.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

#### Response (200)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Error Responses
```json
{
  "detail": "Invalid credentials"
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh`

Refresh access token using refresh token.

#### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200)
```json
{
  "access_token": "new_access_token...",
  "token_type": "bearer"
}
```

---

### 4. Logout
**POST** `/auth/logout`

Logout user and invalidate tokens.

#### Response (200)
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. Forgot Password
**POST** `/auth/forgot-password`

Request password reset link.

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Response (200)
```json
{
  "message": "Password reset email sent"
}
```

---

### 6. Reset Password
**POST** `/auth/reset-password`

Reset password with token from email.

#### Request Body
```json
{
  "token": "reset_token_from_email",
  "new_password": "new_secure_password"
}
```

#### Response (200)
```json
{
  "message": "Password reset successfully"
}
```

---

## User Endpoints

### 1. Get Current User Profile
**GET** `/users/me`

Get the current authenticated user's profile.

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "bio": "Learning DSA",
  "avatar_url": "https://cdn.example.com/avatar.jpg",
  "company": "Tech Company",
  "experience_level": "Intermediate",
  "preferred_languages": ["Python", "Java"],
  "theme": "dark",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Update User Profile
**PUT** `/users/me`

Update the current user's profile.

#### Request Body (All fields optional)
```json
{
  "full_name": "John Doe Updated",
  "bio": "Learning DSA and building projects",
  "avatar_url": "https://cdn.example.com/new-avatar.jpg",
  "company": "New Company",
  "experience_level": "Advanced",
  "preferred_languages": ["Python", "Java", "C++"],
  "theme": "light"
}
```

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe Updated",
  "bio": "Learning DSA and building projects",
  "avatar_url": "https://cdn.example.com/new-avatar.jpg",
  "company": "New Company",
  "experience_level": "Advanced",
  "preferred_languages": ["Python", "Java", "C++"],
  "theme": "light",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

### 3. Get User Profile by ID
**GET** `/users/{user_id}`

Get another user's public profile.

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "username",
  "full_name": "John Doe",
  "bio": "Learning DSA",
  "avatar_url": "https://cdn.example.com/avatar.jpg",
  "experience_level": "Intermediate"
}
```

---

### 4. Delete User Account
**DELETE** `/users/me`

Delete the current user's account (irreversible).

#### Response (200)
```json
{
  "message": "Account deleted successfully"
}
```

---

## Problems Endpoints

### 1. Get All Problems
**GET** `/problems`

Get list of all problems with optional filtering.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| skip | integer | No | Number of problems to skip (default: 0) |
| limit | integer | No | Number of problems to return (default: 20, max: 100) |
| difficulty | string | No | Filter by difficulty (Easy, Medium, Hard) |
| topic | string | No | Filter by topic (Arrays, Trees, DP, etc.) |
| company | string | No | Filter by company (Google, Amazon, etc.) |
| tags | array | No | Filter by tags |

#### Example Request
```
GET /problems?difficulty=Medium&topic=Arrays&limit=10
```

#### Response (200)
```json
{
  "total": 1500,
  "count": 10,
  "problems": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Two Sum",
      "description": "Find two numbers that add up to a target",
      "difficulty": "Easy",
      "topic": "Arrays",
      "tags": ["Array", "Hash Table", "Two Pointer"],
      "company_tags": ["Google", "Amazon", "Meta"],
      "solve_count": 5234,
      "acceptance_rate": 47.3
    }
  ]
}
```

---

### 2. Get Problem Details
**GET** `/problems/{problem_id}`

Get detailed information about a specific problem.

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Two Sum",
  "description": "Find two numbers that add up to a target",
  "problem_statement": "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target...",
  "difficulty": "Easy",
  "topic": "Arrays",
  "tags": ["Array", "Hash Table", "Two Pointer"],
  "company_tags": ["Google", "Amazon"],
  "examples": [
    {
      "input": "[2, 7, 11, 15], target = 9",
      "output": "[0, 1]",
      "explanation": "nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ],
  "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9",
  "function_signatures": {
    "python": "def twoSum(nums: List[int], target: int) -> List[int]:",
    "java": "public int[] twoSum(int[] nums, int target) {",
    "cpp": "vector<int> twoSum(vector<int>& nums, int target) {"
  },
  "editorial_content": "## Solution Explanation...",
  "video_url": "https://youtube.com/...",
  "attempt_count": 8234,
  "solve_count": 5234,
  "acceptance_rate": 47.3,
  "follow_up": "Can you improve the space complexity?"
}
```

---

### 3. Create Problem (Admin)
**POST** `/problems`

Create a new problem (admin only).

#### Request Body
```json
{
  "title": "New Problem",
  "description": "Problem description",
  "difficulty": "Medium",
  "topic": "Graphs",
  "tags": ["Graph", "BFS", "DFS"],
  "company_tags": ["Google"],
  "examples": [
    {
      "input": "...",
      "output": "...",
      "explanation": "..."
    }
  ],
  "constraints": "..."
}
```

#### Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440099",
  "title": "New Problem",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 4. Update Problem (Admin)
**PUT** `/problems/{problem_id}`

Update a problem (admin only).

#### Request Body
```json
{
  "title": "Updated Problem",
  "description": "Updated description",
  "difficulty": "Hard"
}
```

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated Problem",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

### 5. Delete Problem (Admin)
**DELETE** `/problems/{problem_id}`

Delete a problem (admin only).

#### Response (200)
```json
{
  "message": "Problem deleted successfully"
}
```

---

### 6. Get Topics
**GET** `/problems/topics`

Get all available problem topics.

#### Response (200)
```json
{
  "topics": [
    "Arrays",
    "Strings",
    "Trees",
    "Graphs",
    "Dynamic Programming",
    "Greedy",
    "Backtracking",
    "Sliding Window",
    "Two Pointers",
    "Stack & Queue"
  ]
}
```

---

## Submissions Endpoints

### 1. Submit Code
**POST** `/submissions`

Submit code solution for a problem.

#### Request Body
```json
{
  "problem_id": "550e8400-e29b-41d4-a716-446655440001",
  "code": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
  "language": "Python"
}
```

#### Response (201)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "problem_id": "550e8400-e29b-41d4-a716-446655440001",
  "language": "Python",
  "status": "Running",
  "submitted_at": "2024-01-15T10:35:00Z"
}
```

---

### 2. Get User Submissions
**GET** `/submissions`

Get all submissions by current user.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| skip | integer | Number of submissions to skip (default: 0) |
| limit | integer | Number of submissions to return (default: 20) |
| problem_id | string | Filter by problem |
| status | string | Filter by status (Pending, Running, Accepted, etc.) |

#### Response (200)
```json
{
  "total": 150,
  "count": 20,
  "submissions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "problem_id": "550e8400-e29b-41d4-a716-446655440001",
      "language": "Python",
      "status": "Accepted",
      "runtime_ms": 34,
      "memory_mb": 13.2,
      "test_cases_passed": 100,
      "test_cases_total": 100,
      "submitted_at": "2024-01-15T10:35:00Z"
    }
  ]
}
```

---

### 3. Get Submission Details
**GET** `/submissions/{submission_id}`

Get detailed information about a specific submission.

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "problem_id": "550e8400-e29b-41d4-a716-446655440001",
  "code": "def twoSum(nums, target):\n...",
  "language": "Python",
  "status": "Accepted",
  "runtime_ms": 34,
  "memory_mb": 13.2,
  "test_cases_passed": 100,
  "test_cases_total": 100,
  "error_message": null,
  "is_accepted": true,
  "submitted_at": "2024-01-15T10:35:00Z"
}
```

---

## AI Tutor Endpoints

### 1. Send Message to Tutor
**POST** `/tutor/chat`

Send a message to the AI tutor.

#### Request Body
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440300",
  "problem_id": "550e8400-e29b-41d4-a716-446655440001",
  "message": "How should I approach this problem?",
  "request_type": "chat"
}
```

#### Response (200)
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440300",
  "response": "Great question! For the Two Sum problem, let's think about the approach:\n\n1. **Brute Force**: Check every pair of numbers. Time: O(n²)\n2. **Optimized**: Use a hash map to store seen numbers...",
  "hint_level": 0,
  "suggestions": [
    "Try using a hash map",
    "Think about the trade-off between time and space",
    "Consider the problem step by step"
  ]
}
```

---

### 2. Get Conversation History
**GET** `/tutor/conversations/{conversation_id}`

Get the chat history of a conversation.

#### Response (200)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440300",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "problem_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Two Sum Discussion",
  "messages": [
    {
      "id": "msg_1",
      "role": "user",
      "content": "How should I approach this problem?",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "msg_2",
      "role": "assistant",
      "content": "Great question! For the Two Sum problem...",
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "current_hint_level": 0,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Get Next Hint
**POST** `/tutor/hint`

Get the next level hint for a problem.

#### Request Body
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440300"
}
```

#### Response (200)
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440300",
  "hint_level": 1,
  "hint": "Try to use a hash map (dictionary in Python) to store the numbers you've seen so far...",
  "next_steps": [
    "1. Iterate through the array",
    "2. For each number, check if its complement exists in the map",
    "3. If yes, return the indices; if no, add the number to the map"
  ]
}
```

---

### 4. Request Code Review
**POST** `/tutor/code-review`

Get AI code review for submitted solution.

#### Request Body
```json
{
  "code": "def twoSum(nums, target):\n...",
  "language": "Python",
  "problem_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

#### Response (200)
```json
{
  "review": {
    "syntax": {
      "has_error": false
    },
    "logic": {
      "score": 9,
      "issues": []
    },
    "optimization": {
      "score": 8,
      "suggestions": ["Consider using defaultdict for cleaner code"]
    },
    "naming": {
      "score": 9,
      "suggestions": []
    },
    "readability": {
      "score": 8,
      "suggestions": ["Add a docstring explaining the function"]
    },
    "edge_cases": {
      "score": 8,
      "missing_cases": []
    },
    "complexity": {
      "time": "O(n)",
      "space": "O(n)"
    }
  },
  "ai_feedback": "Excellent solution! Your approach using a hash map is optimal...",
  "overall_score": 8.3
}
```

---

## RAG Search Endpoints

### 1. Semantic Search
**POST** `/rag/search`

Search the knowledge base using semantic search.

#### Request Body
```json
{
  "query": "How to implement binary search in Python?",
  "search_type": "semantic",
  "limit": 5
}
```

#### Response (200)
```json
{
  "results": [
    {
      "document_id": "550e8400-e29b-41d4-a716-446655440400",
      "chunk_id": "chunk_1",
      "content": "Binary search is an efficient algorithm for finding a target value within a sorted array...",
      "relevance_score": 0.92,
      "metadata": {
        "source": "Algorithms.pdf",
        "section": "Chapter 3: Search Algorithms",
        "page": 45
      }
    }
  ]
}
```

---

### 2. Upload Document
**POST** `/rag/upload`

Upload a document (PDF, TXT, MD) to the knowledge base.

#### Request (multipart/form-data)
```
POST /rag/upload
Content-Type: multipart/form-data

file: <binary PDF/TXT/MD file>
title: "Data Structures Notes"
category: "DSA Notes"
tags: ["Trees", "Graphs"]
```

#### Response (201)
```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440401",
  "title": "Data Structures Notes",
  "file_name": "data-structures.pdf",
  "status": "processing",
  "message": "Document uploaded. Processing has started."
}
```

---

### 3. Get Documents
**GET** `/rag/documents`

Get list of uploaded documents.

#### Response (200)
```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440401",
      "title": "Data Structures Notes",
      "file_name": "data-structures.pdf",
      "file_type": "pdf",
      "category": "DSA Notes",
      "is_indexed": true,
      "chunks_count": 156,
      "uploaded_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### 4. Delete Document
**DELETE** `/rag/documents/{document_id}`

Delete a document from the knowledge base.

#### Response (200)
```json
{
  "message": "Document deleted successfully"
}
```

---

## Analytics Endpoints

### 1. Get Dashboard Stats
**GET** `/analytics/dashboard`

Get user's dashboard statistics.

#### Response (200)
```json
{
  "total_solved": 156,
  "easy_solved": 89,
  "medium_solved": 54,
  "hard_solved": 13,
  "current_streak": 7,
  "max_streak": 21,
  "accuracy_percentage": 72.5,
  "global_rank": 1245,
  "percentile_rank": 85.3,
  "weak_topics": ["Graphs", "DP"],
  "strong_topics": ["Arrays", "Trees"],
  "weekly_progress": [
    {"day": "Mon", "problems_solved": 3},
    {"day": "Tue", "problems_solved": 2},
    {"day": "Wed", "problems_solved": 5}
  ]
}
```

---

### 2. Get Progress Data
**GET** `/analytics/progress`

Get detailed progress analytics.

#### Response (200)
```json
{
  "progress_by_difficulty": {
    "Easy": 89,
    "Medium": 54,
    "Hard": 13
  },
  "progress_by_topic": {
    "Arrays": 23,
    "Trees": 18,
    "DP": 12,
    "Graphs": 8
  },
  "accuracy_by_topic": {
    "Arrays": 85.2,
    "Trees": 78.9,
    "DP": 65.3,
    "Graphs": 58.2
  }
}
```

---

### 3. Get Topic Analytics
**GET** `/analytics/topics`

Get detailed analytics for all topics.

#### Response (200)
```json
{
  "topics": [
    {
      "topic": "Arrays",
      "solved": 23,
      "attempted": 27,
      "accuracy": 85.2,
      "average_time_minutes": 12.5,
      "is_weak_topic": false,
      "is_strong_topic": true,
      "last_attempted": "2024-01-15T09:30:00Z"
    }
  ]
}
```

---

## Quiz Endpoints

### 1. Generate Quiz
**POST** `/quiz/generate`

Generate a quiz on a specific topic.

#### Request Body
```json
{
  "topic": "Arrays",
  "difficulty": "Medium",
  "question_count": 10,
  "question_types": ["mcq", "coding"]
}
```

#### Response (201)
```json
{
  "quiz_id": "550e8400-e29b-41d4-a716-446655440500",
  "topic": "Arrays",
  "difficulty": "Medium",
  "questions": [
    {
      "id": "q_1",
      "question": "What is the time complexity of binary search?",
      "type": "mcq",
      "options": [
        {"id": "a", "text": "O(n)"},
        {"id": "b", "text": "O(log n)"},
        {"id": "c", "text": "O(n log n)"}
      ]
    }
  ]
}
```

---

### 2. Submit Quiz
**POST** `/quiz/submit`

Submit quiz answers.

#### Request Body
```json
{
  "quiz_id": "550e8400-e29b-41d4-a716-446655440500",
  "answers": [
    {"question_id": "q_1", "answer": "b"},
    {"question_id": "q_2", "answer": "a"}
  ]
}
```

#### Response (200)
```json
{
  "quiz_id": "550e8400-e29b-41d4-a716-446655440500",
  "score": 85,
  "max_score": 100,
  "percentage": 85.0,
  "correct_count": 8,
  "total_count": 10,
  "results": [
    {
      "question_id": "q_1",
      "is_correct": true,
      "user_answer": "b",
      "correct_answer": "b",
      "explanation": "Binary search divides the search space in half..."
    }
  ]
}
```

---

## Error Responses

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error in request |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400,
  "error_code": "VALIDATION_ERROR"
}
```

---

## Rate Limiting

All API endpoints are rate-limited:

- **Default**: 100 requests per hour per user
- **Auth endpoints**: 5 requests per hour per IP
- **Upload**: 10 requests per hour per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## WebSocket Endpoints

### Live Chat Connection
**WS** `/ws/chat/{conversation_id}`

Establish WebSocket connection for real-time chat.

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat/conv_id');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello!',
    request_type: 'chat'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Response:', data.response);
};
```

#### Message Format
```json
{
  "type": "message",
  "content": "What is binary search?",
  "request_type": "chat"
}
```

#### Response
```json
{
  "type": "message",
  "response": "Binary search is...",
  "hint_level": 0,
  "timestamp": "2024-01-15T10:35:00Z"
}
```

---

## Testing Endpoints

### Health Check
**GET** `/health`

Check if the API is running.

#### Response (200)
```json
{
  "status": "healthy"
}
```

### API Status
**GET** `/status`

Get detailed API status information.

#### Response (200)
```json
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "vector_db": "connected",
  "version": "1.0.0",
  "uptime_seconds": 3456789
}
```

---

## Pagination

Most list endpoints support pagination:

### Query Parameters
```
skip=0&limit=20
```

### Response Format
```json
{
  "total": 1500,
  "count": 20,
  "skip": 0,
  "limit": 20,
  "data": []
}
```

---

## Filtering & Sorting

### Filtering
```
GET /problems?difficulty=Medium&topic=Arrays&company=Google
```

### Sorting
```
GET /submissions?sort_by=submitted_at&order=desc
```

---

## References

- Base URL: `http://localhost:8000/api/v1`
- Documentation: `http://localhost:8000/docs` (Swagger UI)
- Alternative Docs: `http://localhost:8000/redoc` (ReDoc)

---

**Last Updated**: January 2024
**Version**: 1.0.0
