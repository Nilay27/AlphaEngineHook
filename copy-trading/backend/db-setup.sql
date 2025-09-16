-- LearnLedger Database Schema Setup
-- Run this script to create all the required tables in your Supabase PostgreSQL database

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  project_description TEXT,
  prize_amount NUMERIC(10, 2) DEFAULT 0,
  project_status TEXT NOT NULL DEFAULT 'open',
  project_owner TEXT NOT NULL,
  required_skills TEXT,
  completion_skills TEXT,
  assigned_freelancer TEXT,
  project_repo TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create an index on project_owner to speed up queries
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(project_owner);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);

-- 2. Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL UNIQUE,
  skill_description TEXT
);

-- Create an index on skill_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name);

-- 3. User Skills Table (mapping between users and their skills)
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skill_id UUID NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);

-- 4. Company Table
CREATE TABLE IF NOT EXISTS company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  company_name TEXT NOT NULL,
  short_description TEXT,
  logo_url TEXT,
  edu_ens TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create an index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_wallet ON company(wallet_address);

-- 5. Freelancer Table
CREATE TABLE IF NOT EXISTS freelancer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  freelancer_name TEXT NOT NULL,
  skills TEXT,
  profile_pic_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create an index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_freelancer_wallet ON freelancer(wallet_address);

-- 6. Project Submissions Table
CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  freelancer_address TEXT NOT NULL,
  pr_link TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  pr_number TEXT NOT NULL,
  is_merged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_project ON project_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_freelancer ON project_submissions(freelancer_address);

-- 7. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  course_description TEXT,
  course_fee NUMERIC(10, 2) DEFAULT 0
);

-- 8. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- 9. User Balances Table
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  balance NUMERIC(12, 2) DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create a unique index on user_id to ensure each user has only one balance record
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_balances_user ON user_balances(user_id);

-- Create necessary triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables with updated_at columns
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_company_updated_at
BEFORE UPDATE ON company
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_freelancer_updated_at
BEFORE UPDATE ON freelancer
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_balances_updated_at
BEFORE UPDATE ON user_balances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Insert some initial skills for testing
INSERT INTO skills (skill_name, skill_description) 
VALUES 
  ('React', 'JavaScript library for building user interfaces'),
  ('Next.js', 'React framework for building web applications'),
  ('TypeScript', 'Typed superset of JavaScript'),
  ('Solidity', 'Smart contract programming language'),
  ('Web3', 'Tools for blockchain interaction'),
  ('UI/UX', 'User interface and experience design')
ON CONFLICT (skill_name) DO NOTHING;

-- Done! Your database is now set up for LearnLedger 