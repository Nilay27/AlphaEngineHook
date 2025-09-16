-- First make sure the on_chain_project_id column exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS on_chain_project_id TEXT;

-- Update specific projects with their blockchain project IDs
-- Project 1: 500 EDU project
UPDATE projects 
SET on_chain_project_id = '0xf8f986041c5b36cecc3d8c07be584dd9c56cd867d3c87a91ab59009b351c4c7c'
WHERE id::text = '2a40c520-575d-46bc-9264-b43f56d7a044' 
AND CAST(prize_amount AS numeric) = 500;

-- Project 2: 750 EDU project
UPDATE projects 
SET on_chain_project_id = '0x78f62f00e7e999c39bf91f5b5da527122c0e4a37c42e229b06a1ddffdf1ed5ba'
WHERE id::text = '27061523-ea39-4f93-a0eb-691fed374427'
AND CAST(prize_amount AS numeric) = 750;

-- Project 3: 1000 EDU project
UPDATE projects 
SET on_chain_project_id = '0x11e5f03e3edac1db13fa20db0a9ce4ea1c9d67d4741dad4d79e56f7455c16e62'
WHERE id::text = '2a40c520-575d-46bc-9264-b43f56d7a044'
AND CAST(prize_amount AS numeric) = 1000;

-- Log the updated rows to verify changes
SELECT id, project_name, prize_amount, on_chain_project_id 
FROM projects 
WHERE id::text IN ('2a40c520-575d-46bc-9264-b43f56d7a044', '27061523-ea39-4f93-a0eb-691fed374427')
ORDER BY id; 