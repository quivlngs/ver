-- Add verification queue table for bot communication
CREATE TABLE IF NOT EXISTS verification_queue (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'verify', 'kick', etc.
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add email field to verification_logs
ALTER TABLE verification_logs 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add index for faster processing
CREATE INDEX IF NOT EXISTS idx_verification_queue_unprocessed 
ON verification_queue (processed, created_at) 
WHERE processed = FALSE;
