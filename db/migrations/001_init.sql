CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('student','teacher','admin')),
  display_name TEXT NOT NULL,
  grade_level INT CHECK (grade_level BETWEEN 1 AND 12),
  school_id UUID REFERENCES schools(id),
  consent_status TEXT NOT NULL DEFAULT 'n/a' CHECK (consent_status IN ('required','granted','denied','n/a')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_band TEXT,
  join_code TEXT NOT NULL UNIQUE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_class TEXT NOT NULL CHECK (role_in_class IN ('student','co_teacher')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, user_id)
);

CREATE TABLE rule_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  version INT NOT NULL,
  restricted_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_essay_outline_bullets INT,
  require_citations_for JSONB NOT NULL DEFAULT '[]'::jsonb,
  disallow_direct_answer_modes BOOLEAN NOT NULL DEFAULT true,
  pii_block_enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, version)
);

CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_class_memberships_user ON class_memberships(user_id);
