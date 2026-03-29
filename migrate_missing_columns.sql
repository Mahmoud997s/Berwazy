-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
