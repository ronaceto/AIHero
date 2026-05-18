-- Data Deletion Requests (GDPR/CCPA Compliance)
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) CHECK (request_type IN ('full_deletion', 'anonymization')),
  reason TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deletion_user_id ON data_deletion_requests(user_id);
CREATE INDEX idx_deletion_status ON data_deletion_requests(status);
