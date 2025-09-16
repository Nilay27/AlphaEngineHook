-- Migration to add on_chain_submission_id column to project_submissions table
ALTER TABLE project_submissions ADD COLUMN IF NOT EXISTS on_chain_submission_id TEXT; 