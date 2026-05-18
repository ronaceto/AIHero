-- Quiz Attempts and Results
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INT,
  total_points INT,
  percentage_score DECIMAL(5,2),
  time_taken_seconds INT,
  is_passed BOOLEAN,
  attempt_number INT DEFAULT 1,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student_id ON quiz_attempts(student_id);
