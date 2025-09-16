-- Run this command to add the edu_ens column to the existing company table
ALTER TABLE company ADD COLUMN IF NOT EXISTS edu_ens TEXT; 