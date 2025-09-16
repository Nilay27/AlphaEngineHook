-- First, create temporary columns
ALTER TABLE project_submissions 
  ADD COLUMN project_id_new UUID,
  ADD COLUMN pr_number_new TEXT;

-- Convert existing data
UPDATE project_submissions 
SET project_id_new = project_id::UUID,
    pr_number_new = pr_number::TEXT;

-- Drop old columns
ALTER TABLE project_submissions 
  DROP COLUMN project_id,
  DROP COLUMN pr_number;

-- Rename new columns
ALTER TABLE project_submissions 
  RENAME COLUMN project_id_new TO project_id;
ALTER TABLE project_submissions 
  RENAME COLUMN pr_number_new TO pr_number;

-- Add constraints
ALTER TABLE project_submissions
  ALTER COLUMN project_id SET NOT NULL,
  ALTER COLUMN pr_number SET NOT NULL;
