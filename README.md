
# DSA Mentor AI

An AI-powered DSA learning assistant that helps students learn Data Structures and Algorithms through interactive, step-by-step guidance.

Instead of directly providing the solution, DSA Mentor AI encourages students to understand the problem, think about the approach, evaluate their answers, and progressively reach the optimized solution.

---

## 🚀 Features

- 🤖 AI-powered DSA tutoring
- 💬 Interactive step-by-step conversations
- 📚 Topic-based DSA learning
- 🎯 Difficulty selection
- 💡 Progressive hints
- 🧠 Student answer evaluation
- 🔄 Persistent chat sessions
- 💾 Redis-based conversation history
- 📜 Recent chat history
- ↩️ Resume previous conversations
- 🗑️ Delete conversations
- 📎 PDF and image upload UI
- ⚡ FastAPI backend
- ⚛️ React + TypeScript frontend
- 🎨 Tailwind CSS UI
- 🐳 Docker support
- 🗄️ Database schema and migrations

---

## 🧠 How DSA Mentor AI Works

The tutor follows a guided learning approach rather than immediately revealing the answer.

```text
Student asks a DSA question
          ↓
Understand the Problem
          ↓
Think About the Approach
          ↓
Brute Force Approach
          ↓
Optimization
          ↓
Choose Data Structure / Algorithm
          ↓
Analyze Complexity
          ↓
Implement Code
````

The system can evaluate the student's answers and continue the learning conversation based on their progress.

---

## 📚 Supported DSA Topics

* Arrays
* Strings
* Hashing
* Two Pointers
* Sliding Window
* Linked List
* Stack
* Queue
* Binary Search
* Sorting
* Recursion
* Backtracking
* Trees
* BST
* Heap / Priority Queue
* Graphs
* Greedy
* Dynamic Programming
* Bit Manipulation

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* React Router

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn
* LangChain
* RAG Pipeline
* Redis

### Database & Infrastructure

* PostgreSQL
* Alembic
* Redis
* Docker
* Docker Compose

---

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │     Student         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI         │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌──────────────┐  ┌────────────┐
       │ RAG / AI   │   │ Conversation │  │ PostgreSQL │
       │  Pipeline  │   │   Manager    │  │  Database  │
       └────────────┘   └──────┬───────┘  └────────────┘
                               │
                               ▼
                         ┌───────────┐
                         │   Redis   │
                         │  History  │
                         └───────────┘
```

---

## 📂 Project Structure

```text
dsa-ai-chat/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── ai/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── migrations/
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── scripts/
│
├── database_schema.sql
├── docker-compose.yml
└── .gitignore
```

---

## 🔌 API Endpoints

### Chat

```text
POST /api/v1/chat
```

Used for normal DSA tutoring conversations and hint requests.

### Recent Conversations

```text
GET /api/v1/chat/history
```

Returns recent conversation summaries for the frontend sidebar.

### Conversation Messages

```text
GET /api/v1/chat/history/{session_id}
```

Loads the messages belonging to a specific conversation.

### Delete Conversation

```text
DELETE /api/v1/chat/history/{session_id}
```

Deletes a conversation and its history entry.

---

## 💾 Conversation Management

Conversation state is maintained using Redis.

Each conversation stores information such as:

```text
Session ID
Problem
Topic
Difficulty
Current Learning Step
Hint Level
Tutor Question
Student Answer
Conversation Messages
Conversation Metadata
```

The frontend can therefore:

```text
Create New Chat
      ↓
Chat with AI Mentor
      ↓
Save Conversation
      ↓
Show in Recent Chats
      ↓
Open Previous Chat
      ↓
Continue Learning
```

---

## ⚙️ Running Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Jayaprakash733/dsa-mentor-ai.git

cd dsa-mentor-ai
```

---

### 2. Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🔐 Environment Variables

Create your own `.env` file for environment-specific configuration and API credentials.

Example:

```env
REDIS_URL=redis://localhost:6379/0
```

API keys and secrets should never be committed to GitHub.

The project uses `.gitignore` to prevent environment files and generated dependencies from being committed.

---

## 🐳 Docker

The project includes Docker configuration for running the required services.

```bash
docker-compose up --build
```

---

## 🔮 Future Improvements

* User authentication and authorization
* Complete PDF question processing
* Complete image-based problem solving
* Code execution environment
* DSA progress analytics
* Personalized problem recommendations
* More AI models
* Production deployment
* CI/CD pipeline
* Automated testing
* Monitoring and logging

---

## 🎯 Goal

The goal of DSA Mentor AI is to make DSA preparation more interactive and effective by helping students develop problem-solving skills instead of simply copying solutions.

---

## 👨‍💻 Author

**Jayaprakash Sahani**

B.Tech Computer Science Engineering

---

## 📄 License

This project is developed for educational and learning purposes.

````

