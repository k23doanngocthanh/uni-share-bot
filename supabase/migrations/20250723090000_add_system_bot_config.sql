-- Add system default bot configuration
INSERT INTO user_bot_configs (
  id,
  user_id,
  bot_token,
  bot_username,
  bot_description,
  use_personal_bot,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- System bot ID
  '00000000-0000-0000-0000-000000000000', -- System user ID
  '7208604161:AAExB0QL6eg1Hkaw3-iMxfEMnvEtVO6N3sI',
  'consenluutru_bot',
  'UniShare System Bot',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  bot_token = EXCLUDED.bot_token,
  bot_username = EXCLUDED.bot_username,
  updated_at = NOW();

-- Add system chat/group configuration for receiving files
CREATE TABLE IF NOT EXISTS telegram_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('private', 'group', 'channel')),
  is_default BOOLEAN DEFAULT false,
  bot_config_id UUID REFERENCES user_bot_configs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default channel for system bot
INSERT INTO telegram_channels (
  channel_id,
  channel_name,
  channel_type,
  is_default,
  bot_config_id
) VALUES (
  '-1001234567890', -- Replace with your actual channel/group ID
  'UniShare Storage Channel',
  'channel',
  true,
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (channel_id) DO UPDATE SET
  is_default = EXCLUDED.is_default,
  updated_at = NOW();

-- Enable RLS
ALTER TABLE telegram_channels ENABLE ROW LEVEL SECURITY;

-- Allow public read access to default channels
CREATE POLICY "Allow public read access to default channels" ON telegram_channels
  FOR SELECT USING (is_default = true);

-- Allow authenticated users to manage their own channels
CREATE POLICY "Users can manage their own channels" ON telegram_channels
  FOR ALL USING (
    bot_config_id IN (
      SELECT id FROM user_bot_configs WHERE user_id = auth.uid()
    )
  );
