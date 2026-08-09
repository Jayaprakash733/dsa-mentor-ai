-- DSA Mentor AI - PostgreSQL Database Schema
-- This file contains all tables, relationships, and indexes

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_experience_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE problem_difficulty AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE submission_status AS ENUM ('Pending', 'Running', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded');
CREATE TYPE progress_status AS ENUM ('Not Started', 'In Progress', 'Completed', 'Reviewing');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    company VARCHAR(100),
    experience_level user_experience_level DEFAULT 'Beginner',
    preferred_languages TEXT[] DEFAULT '{"Python"}',
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    
    -- Social
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    
    -- Settings
    theme VARCHAR(20) DEFAULT 'dark',
    notifications_enabled BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- PROBLEMS TABLE
-- ============================================================================

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty problem_difficulty NOT NULL,
    
    -- Classification
    topic VARCHAR(100) NOT NULL, -- 'Arrays', 'Trees', 'DP', 'Graphs', etc.
    tags TEXT[] DEFAULT '{}', -- ['Array', 'Two Pointer', 'Binary Search']
    company_tags TEXT[] DEFAULT '{}', -- ['Amazon', 'Google', 'Microsoft']
    
    -- Content
    problem_statement TEXT NOT NULL,
    examples JSONB, -- [{input: "...", output: "...", explanation: "..."}]
    constraints TEXT,
    follow_up TEXT,
    
    -- Code Templates
    function_signatures JSONB, -- {python: "...", java: "...", cpp: "..."}
    
    -- Resources
    editorial_content TEXT,
    editorial_complexity_analysis TEXT,
    video_url VARCHAR(500),
    detailed_explanation TEXT,
    
    -- Metadata
    attempt_count INTEGER DEFAULT 0,
    solve_count INTEGER DEFAULT 0,
    acceptance_rate FLOAT DEFAULT 0,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_company_tags ON problems USING GIN (company_tags);
CREATE INDEX idx_problems_tags ON problems USING GIN (tags);
CREATE INDEX idx_problems_created_by ON problems(created_by);

-- ============================================================================
-- SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    
    -- Code Details
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL, -- 'Python', 'Java', 'C++', 'JavaScript'
    
    -- Execution Results
    status submission_status DEFAULT 'Pending',
    runtime_ms INTEGER,
    memory_mb FLOAT,
    test_cases_passed INTEGER,
    test_cases_total INTEGER,
    error_message TEXT,
    
    -- Metadata
    submission_number INTEGER, -- 1st, 2nd, 3rd attempt
    is_accepted BOOLEAN DEFAULT false,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);

-- ============================================================================
-- PROGRESS TABLE (User Overall Progress)
-- ============================================================================

CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Problem Counts
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    
    -- Streaks
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_solved_at TIMESTAMP WITH TIME ZONE,
    
    -- Statistics
    accuracy_percentage FLOAT DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    average_time_per_problem FLOAT DEFAULT 0,
    
    -- Ranking
    global_rank INTEGER,
    percentile_rank FLOAT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_global_rank ON progress(global_rank);

-- ============================================================================
-- TOPIC ACCURACY TABLE (User Performance by Topic)
-- ============================================================================

CREATE TABLE topic_accuracy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,
    
    -- Performance Metrics
    solved_count INTEGER DEFAULT 0,
    attempted_count INTEGER DEFAULT 0,
    accuracy_percentage FLOAT DEFAULT 0,
    average_time_minutes FLOAT DEFAULT 0,
    
    -- Weak/Strong Indicator
    is_weak_topic BOOLEAN DEFAULT false,
    is_strong_topic BOOLEAN DEFAULT false,
    
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, topic),
    CONSTRAINT valid_accuracy CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100)
);

CREATE INDEX idx_topic_accuracy_user_id ON topic_accuracy(user_id);
CREATE INDEX idx_topic_accuracy_topic ON topic_accuracy(topic);
CREATE INDEX idx_topic_accuracy_is_weak ON topic_accuracy(is_weak_topic);

-- ============================================================================
-- CONVERSATIONS TABLE (AI Tutor Chat History)
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    
    -- Conversation Meta
    title VARCHAR(255),
    description TEXT,
    
    -- Messages JSONB Structure:
    -- [{
    --   id: UUID,
    --   role: 'user' | 'assistant',
    --   content: string,
    --   timestamp: ISO 8601,
    --   tool_used?: 'hint' | 'explain' | 'code_review',
    --   metadata?: {...}
    -- }]
    messages JSONB DEFAULT '[]',
    
    -- Hint System
    current_hint_level INTEGER DEFAULT 0, -- 0-6 (None, Hint1, Hint2, DryRun, Pseudo, OptCode, Analysis)
    max_hint_level INTEGER DEFAULT 6,
    
    -- Conversation State
    is_completed BOOLEAN DEFAULT false,
    is_reviewed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_problem_id ON conversations(problem_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- ============================================================================
-- DOCUMENTS TABLE (For RAG - PDFs, Notes, etc.)
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- File Information
    file_url VARCHAR(500) NOT NULL, -- Cloudinary or S3 URL
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20), -- 'pdf', 'txt', 'md', 'pptx'
    file_size_bytes INTEGER,
    
    -- Content
    content TEXT, -- Full text extracted
    raw_content JSONB, -- Metadata and original content
    
    -- Processing
    chunks_count INTEGER DEFAULT 0,
    is_indexed BOOLEAN DEFAULT false,
    is_processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    
    -- Classification
    category VARCHAR(100), -- 'DSA Notes', 'Algorithm', 'Interview Prep'
    tags TEXT[] DEFAULT '{}',
    difficulty problem_difficulty,
    
    -- Metadata
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    source_url VARCHAR(500), -- If from web
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_is_indexed ON documents(is_indexed);

-- ============================================================================
-- DOCUMENT CHUNKS TABLE (For RAG Vector Storage)
-- ============================================================================

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    
    -- Embedding Vector (384 dimensions for bge-small-en-v1.5)
    embedding vector(384),
    
    -- Metadata for retrieval
    metadata JSONB DEFAULT '{}', -- {page_num, section, source_doc, etc}
    
    -- Search metadata
    content_hash VARCHAR(64), -- For deduplication
    char_count INTEGER,
    token_count INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_chunk_index CHECK (chunk_index >= 0)
);

CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_document_chunks_chunk_index ON document_chunks(chunk_index);

-- ============================================================================
-- QUIZZES TABLE
-- ============================================================================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Quiz Configuration
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty problem_difficulty,
    quiz_type VARCHAR(50), -- 'mcq', 'coding', 'mixed'
    
    -- Questions JSONB Structure:
    -- [{
    --   id: UUID,
    --   question: string,
    --   type: 'mcq' | 'coding' | 'true_false' | 'fill_blank',
    --   options?: [{id, text, is_correct}],
    --   correct_answer?: string,
    --   explanation?: string,
    --   code_template?: string
    -- }]
    questions JSONB NOT NULL,
    
    -- User Answers JSONB Structure:
    -- [{question_id, user_answer, is_correct, time_taken_seconds}]
    answers JSONB DEFAULT '[]',
    
    -- Score
    score FLOAT DEFAULT 0,
    max_score FLOAT DEFAULT 100,
    percentage FLOAT DEFAULT 0,
    
    -- Timing
    time_limit_minutes INTEGER,
    actual_time_taken_minutes FLOAT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'submitted'
    is_submitted BOOLEAN DEFAULT false,
    
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX idx_quizzes_topic ON quizzes(topic);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- ============================================================================
-- FLASHCARDS TABLE
-- ============================================================================

CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Flashcard Content
    topic VARCHAR(100) NOT NULL,
    front TEXT NOT NULL, -- Question/prompt
    back TEXT NOT NULL, -- Answer/explanation
    
    -- Visual Content
    front_image_url VARCHAR(500),
    back_image_url VARCHAR(500),
    
    -- Difficulty
    difficulty problem_difficulty DEFAULT 'Medium',
    
    -- Learning Metrics
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    retention_level FLOAT DEFAULT 0, -- 0-1 (Spaced Repetition Algorithm)
    
    next_review_at TIMESTAMP WITH TIME ZONE,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_due_for_review BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_topic ON flashcards(topic);
CREATE INDEX idx_flashcards_is_due ON flashcards(is_due_for_review);

-- ============================================================================
-- LEARNING PATHS TABLE
-- ============================================================================

CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Path Configuration
    path_type VARCHAR(50) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced', 'Amazon', 'Google'
    path_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Topics JSONB Structure:
    -- [{
    --   name: string,
    --   order: number,
    --   status: 'Not Started' | 'In Progress' | 'Completed',
    --   completed_at?: ISO 8601,
    --   problems_solved: number,
    --   problems_total: number
    -- }]
    topics JSONB NOT NULL,
    
    current_topic VARCHAR(100),
    current_topic_index INTEGER DEFAULT 0,
    
    -- Progress
    progress_percentage FLOAT DEFAULT 0,
    total_problems INTEGER DEFAULT 0,
    completed_problems INTEGER DEFAULT 0,
    
    -- Timeline
    estimated_completion_date DATE,
    actual_completion_date DATE,
    
    is_completed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_path_type ON learning_paths(path_type);

-- ============================================================================
-- GAMIFICATION TABLE
-- ============================================================================

CREATE TABLE gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- XP System
    xp_points INTEGER DEFAULT 0,
    xp_level INTEGER DEFAULT 1,
    xp_progress_to_next_level FLOAT DEFAULT 0,
    
    -- Badges JSONB Structure:
    -- [{
    --   id: string,
    --   name: string,
    --   description: string,
    --   icon_url: string,
    --   earned_at: ISO 8601,
    --   rarity: 'common' | 'rare' | 'epic'
    -- }]
    badges JSONB DEFAULT '[]',
    total_badges_earned INTEGER DEFAULT 0,
    
    -- Leaderboard
    leaderboard_rank INTEGER,
    leaderboard_score INTEGER DEFAULT 0,
    
    -- Achievements
    total_challenges_completed INTEGER DEFAULT 0,
    daily_challenges_today INTEGER DEFAULT 0,
    weekly_challenges_completed INTEGER DEFAULT 0,
    
    -- Streaks
    problem_streak INTEGER DEFAULT 0,
    challenge_streak INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gamification_user_id ON gamification(user_id);
CREATE INDEX idx_gamification_leaderboard_rank ON gamification(leaderboard_rank);
CREATE INDEX idx_gamification_xp_points ON gamification(xp_points);

-- ============================================================================
-- DAILY CHALLENGES TABLE
-- ============================================================================

CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Challenge Definition
    challenge_date DATE NOT NULL UNIQUE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty problem_difficulty,
    xp_reward INTEGER DEFAULT 50,
    
    -- Challenge Data
    completion_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date);

-- ============================================================================
-- USER DAILY CHALLENGE PROGRESS TABLE
-- ============================================================================

CREATE TABLE user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
    
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_daily_challenges_user_id ON user_daily_challenges(user_id);
CREATE INDEX idx_user_daily_challenges_is_completed ON user_daily_challenges(is_completed);

-- ============================================================================
-- INTERVIEW MODE SESSIONS TABLE
-- ============================================================================

CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Meta
    title VARCHAR(255),
    company VARCHAR(100), -- 'Amazon', 'Google', etc.
    difficulty problem_difficulty,
    
    -- Questions JSONB
    questions JSONB NOT NULL, -- Array of problem IDs and metadata
    
    -- Responses
    responses JSONB DEFAULT '[]', -- Array of user responses
    
    -- Scoring
    total_score FLOAT DEFAULT 0,
    max_score FLOAT DEFAULT 100,
    
    -- Feedback JSONB
    feedback JSONB, -- AI-generated feedback
    
    duration_minutes INTEGER,
    
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);

-- ============================================================================
-- CODE REVIEW CACHE TABLE
-- ============================================================================

CREATE TABLE code_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    code TEXT NOT NULL,
    language VARCHAR(20) NOT NULL,
    
    -- Review Data JSONB Structure:
    -- {
    --   syntax: {has_error, error_message},
    --   logic: {score, issues},
    --   optimization: {score, suggestions},
    --   naming: {score, suggestions},
    --   readability: {score, suggestions},
    --   edge_cases: {score, missing_cases},
    --   complexity: {time: "O(...)", space: "O(...)"},
    --   memory_usage: {estimated_bytes, optimization_tips}
    -- }
    review_data JSONB NOT NULL,
    
    ai_feedback TEXT,
    suggested_improvements TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_code_reviews_user_id ON code_reviews(user_id);

-- ============================================================================
-- SEARCH LOG TABLE (For Analytics)
-- ============================================================================

CREATE TABLE search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    query_text VARCHAR(500) NOT NULL,
    search_type VARCHAR(50), -- 'semantic', 'keyword', 'hybrid'
    
    results_count INTEGER DEFAULT 0,
    clicked_result_id UUID, -- Which result was clicked
    
    search_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    notification_type VARCHAR(50), -- 'daily_reminder', 'revision_reminder', 'milestone', 'challenge'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    related_entity_type VARCHAR(50), -- 'problem', 'challenge', 'learning_path'
    related_entity_id UUID,
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- User Dashboard View
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.username,
    p.total_solved,
    p.current_streak,
    p.accuracy_percentage,
    p.global_rank,
    (SELECT COUNT(*) FROM topic_accuracy WHERE user_id = u.id AND is_weak_topic = true) AS weak_topics_count,
    (SELECT COUNT(*) FROM topic_accuracy WHERE user_id = u.id AND is_strong_topic = true) AS strong_topics_count,
    g.xp_points,
    g.xp_level,
    g.leaderboard_rank
FROM users u
LEFT JOIN progress p ON u.id = p.user_id
LEFT JOIN gamification g ON u.id = g.user_id;

-- Topic Recommendations View
CREATE VIEW topic_recommendations AS
SELECT 
    user_id,
    topic,
    accuracy_percentage,
    attempted_count,
    CASE 
        WHEN accuracy_percentage < 50 THEN 'High Priority'
        WHEN accuracy_percentage < 70 THEN 'Medium Priority'
        ELSE 'Review'
    END AS recommendation_level
FROM topic_accuracy
WHERE attempted_count > 0
ORDER BY accuracy_percentage ASC;

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update user's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to multiple tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER problems_updated_at BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER progress_updated_at BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER topic_accuracy_updated_at BEFORE UPDATE ON topic_accuracy
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional)
-- ============================================================================

-- Insert sample topics for problems
INSERT INTO problems (title, description, difficulty, topic, tags, company_tags, problem_statement, examples, constraints, function_signatures)
VALUES (
    'Two Sum',
    'Find two numbers that add up to a target',
    'Easy',
    'Arrays',
    ARRAY['Array', 'Hash Table', 'Two Pointer'],
    ARRAY['Google', 'Amazon', 'Meta'],
    'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.',
    '[{"input": "[2, 7, 11, 15], target = 9", "output": "[0, 1]", "explanation": "nums[0] + nums[1] == 9, we return [0, 1]."}]'::jsonb,
    '2 <= nums.length <= 104, -109 <= nums[i] <= 109, -109 <= target <= 109',
    '{"python": "def twoSum(nums: List[int], target: int) -> List[int]:", "java": "public int[] twoSum(int[] nums, int target) {"}'::jsonb
);

-- Create indexes for full-text search
CREATE INDEX idx_problems_description_search ON problems USING GIN(to_tsvector(''english'', description));
CREATE INDEX idx_documents_content_search ON documents USING GIN(to_tsvector(''english'', content));

-- ============================================================================
-- PERMISSIONS (Optional - Adjust based on your architecture)
-- ============================================================================

-- Create read-only role for analytics
CREATE ROLE analytics_reader WITH LOGIN PASSWORD 'analytics_password';
GRANT CONNECT ON DATABASE dsa_mentor_ai TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. All IDs use UUID for better distributed system scalability
-- 2. All timestamps use TIMESTAMP WITH TIME ZONE for consistency across regions
-- 3. Embedding vector is stored with 384 dimensions (bge-small-en-v1.5)
-- 4. JSONB columns allow flexible schema for AI-related data
-- 5. Indexes are strategically placed on frequently queried columns
-- 6. CASCADE delete ensures referential integrity
-- 7. Views provide convenient aggregated data access
-- 8. Constraints ensure data validity
