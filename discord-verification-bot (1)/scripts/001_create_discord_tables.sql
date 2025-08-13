-- Create guild configurations table
CREATE TABLE IF NOT EXISTS guild_configs (
    id SERIAL PRIMARY KEY,
    guild_id VARCHAR(20) UNIQUE NOT NULL,
    verification_method VARCHAR(20) DEFAULT 'button',
    verified_role_id VARCHAR(20),
    verification_channel_id VARCHAR(20),
    welcome_message TEXT DEFAULT 'Welcome! Please verify to access the server.',
    success_message TEXT DEFAULT 'You have been successfully verified!',
    auto_kick_enabled BOOLEAN DEFAULT false,
    auto_kick_time INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification logs table
CREATE TABLE IF NOT EXISTS verification_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    username VARCHAR(100),
    verification_method VARCHAR(20),
    status VARCHAR(20) NOT NULL, -- 'verified', 'kicked', 'banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pending verifications table
CREATE TABLE IF NOT EXISTS pending_verifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    verification_code VARCHAR(10),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, guild_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guild_configs_guild_id ON guild_configs(guild_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_guild_id ON verification_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON verification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_verifications_guild_id ON pending_verifications(guild_id);
CREATE INDEX IF NOT EXISTS idx_pending_verifications_expires_at ON pending_verifications(expires_at);
