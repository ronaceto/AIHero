CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_mode TEXT NOT NULL CHECK (tool_mode IN (
    'explain_simply','quiz_me','study_guide_maker','essay_brainstormer',
    'project_idea_generator','code_helper','teacher_approved_prompt_builder'
  )),
  topic TEXT,
  grade_level_applied INT CHECK (grade_level_applied BETWEEN 1 AND 12),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('student','assistant','system')),
  content TEXT NOT NULL,
  model_name TEXT,
  token_in INT,
  token_out INT,
  policy_status TEXT NOT NULL DEFAULT 'allowed' CHECK (policy_status IN ('allowed','blocked','modified')),
  policy_reason_code TEXT,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  grade_level INT CHECK (grade_level BETWEEN 1 AND 12),
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('mcq','short_answer','true_false')),
  prompt TEXT NOT NULL,
  options JSONB,
  answer_key JSONB NOT NULL,
  explanation TEXT
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score_percent NUMERIC(5,2),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES quiz_items(id) ON DELETE CASCADE,
  student_answer JSONB,
  is_correct BOOLEAN NOT NULL,
  feedback TEXT
);

CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  topic TEXT,
  source TEXT NOT NULL CHECK (source IN ('ai_generated','manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('again','hard','good','easy')),
  interval_days INT NOT NULL DEFAULT 1,
  next_due_at TIMESTAMPTZ NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_student_due ON flashcard_reviews(student_id, next_due_at);
