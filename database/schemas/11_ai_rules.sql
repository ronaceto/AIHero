-- AI Custom Rules (Teacher Configuration)
CREATE TABLE IF NOT EXISTS ai_rules (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  rule_description TEXT,
  rule_type VARCHAR(100) CHECK (rule_type IN ('restrict_topic', 'require_citation', 'limit_length', 'enforce_academic_integrity')),
  condition_data JSONB,
  action VARCHAR(50) CHECK (action IN ('reject', 'warn', 'approve')),
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rules_class_id ON ai_rules(class_id);
CREATE INDEX idx_rules_is_active ON ai_rules(is_active);
