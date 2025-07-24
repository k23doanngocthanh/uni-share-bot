-- Add original_file_name column to preserve file extension
ALTER TABLE documents ADD COLUMN IF NOT EXISTS original_file_name TEXT;

-- Update existing records to copy file_name to original_file_name if null
UPDATE documents 
SET original_file_name = file_name 
WHERE original_file_name IS NULL;
