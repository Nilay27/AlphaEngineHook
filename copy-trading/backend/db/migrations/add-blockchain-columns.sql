-- Add blockchain-related columns to project_submissions table
ALTER TABLE project_submissions
ADD COLUMN IF NOT EXISTS blockchain_submission_id TEXT,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_submissions_blockchain_submission_id ON project_submissions(blockchain_submission_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_blockchain_tx_hash ON project_submissions(blockchain_tx_hash); 