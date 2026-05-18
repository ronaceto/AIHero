-- Parents table (for COPPA compliance)
CREATE TABLE IF NOT EXISTS parents (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  consent_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parents_student_id ON parents(student_id);
CREATE INDEX idx_parents_email ON parents(email);
