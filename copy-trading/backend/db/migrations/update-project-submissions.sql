-- Migration to update project_submissions table
ALTER TABLE project_submissions ADD COLUMN project_id uuid NOT NULL;
ALTER TABLE project_submissions ADD COLUMN freelancer_address text NOT NULL;
ALTER TABLE project_submissions ADD COLUMN repo_owner text NOT NULL;
ALTER TABLE project_submissions ADD COLUMN repo_name text NOT NULL;
ALTER TABLE project_submissions ADD COLUMN pr_number text NOT NULL;
ALTER TABLE project_submissions ADD COLUMN is_merged boolean NOT NULL DEFAULT false; 