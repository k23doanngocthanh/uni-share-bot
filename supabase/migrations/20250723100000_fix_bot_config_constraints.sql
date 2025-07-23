-- Remove unique constraint on user_id to allow multiple bot configs per user
ALTER TABLE public.user_bot_configs DROP CONSTRAINT IF EXISTS user_bot_configs_user_id_key;

-- Update system bot configuration with correct channel information
-- First get the group chat ID from the invite link
-- Note: You need to get the actual chat ID using the bot or manually

-- Add the default group/channel for system bot
INSERT INTO telegram_channels (
  channel_id,
  channel_name,
  channel_type,
  is_default,
  bot_config_id
) VALUES (
  '-1002345678901', -- Replace with actual group ID from https://t.me/+qg472Vj7HoBiZDM9
  'UniShare Storage Group',
  'group',
  true,
  '550e8400-e29b-41d4-a716-446655440000' -- system bot UUID from previous migration
) ON CONFLICT (channel_id) DO UPDATE SET
  is_default = EXCLUDED.is_default,
  channel_name = EXCLUDED.channel_name,
  updated_at = NOW();

-- Update user_bot_configs to allow multiple configurations per user
-- Add a new field to distinguish between different bot purposes
ALTER TABLE public.user_bot_configs 
ADD COLUMN IF NOT EXISTS bot_purpose TEXT DEFAULT 'personal';

-- Update system bot with purpose
UPDATE public.user_bot_configs 
SET bot_purpose = 'system' 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Create unique constraint on user_id + bot_purpose instead
ALTER TABLE public.user_bot_configs 
ADD CONSTRAINT user_bot_configs_user_purpose_unique 
UNIQUE (user_id, bot_purpose);

-- Function to get actual group ID from invite link (for reference)
-- You need to:
-- 1. Add the bot to the group using the invite link
-- 2. Send any message to the group 
-- 3. Use getUpdates API to get the chat_id
-- 4. Update the channel_id above with the real value

-- Example API call to get chat ID:
-- https://api.telegram.org/bot7208604161:AAExB0QL6eg1Hkaw3-iMxfEMnvEtVO6N3sI/getUpdates

COMMENT ON TABLE telegram_channels IS 'To get actual group ID: 1) Add bot to group, 2) Send message, 3) Call getUpdates API, 4) Update channel_id';
