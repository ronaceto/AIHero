-- Prompts and Responses
CREATE TABLE IF NOT EXISTS prompts_responses (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id INT REFERENCES classes(id) ON DELETE SET NULL,
  tool_type VARCHAR(100),
  user_prompt TEXT NOT NULL,
  ai_response TEXT,
  model VARCHAR(50),
  grade_level INT,
  response_time_ms INT,
  tokens_used INT,
  cost_cents INT,
  is_appropriate BOOLEAN,
  flagged_reason VARCHAR(255),
  teacher_reviewed BOOLEAN DEFAULT FALSE,
  teacher_feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prompts_student_id ON prompts_responses(student_id);
CREATE INDEX idx_prompts_class_id ON prompts_responses(class_id);
CREATE INDEX idx_prompts_created_at ON prompts_responses(created_at);
CREATE INDEX idx_prompts_flagged ON prompts_responses(flagged_reason);
