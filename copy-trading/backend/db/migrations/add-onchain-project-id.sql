-- Migration to add on_chain_project_id column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS on_chain_project_id TEXT;

-- Update existing projects to use formatted UUID as a fallback
-- This is a temporary solution, ideally these should be updated with actual blockchain project IDs
-- UPDATE projects
-- SET on_chain_project_id = '0x' || replace(project_id::text, '-', '') || repeat('0', 64 - length(replace(project_id::text, '-', '')))
-- WHERE on_chain_project_id IS NULL; 