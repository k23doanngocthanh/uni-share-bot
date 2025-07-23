-- Fix unique constraint issue and add system default configuration
-- Drop the unique constraint on user_id to allow multiple bot configs per user
ALTER TABLE public.user_bot_configs DROP CONSTRAINT IF EXISTS user_bot_configs_user_id_key;

-- Add system default bot configuration
INSERT INTO user_bot_configs (
  id,
  user_id,
  bot_token,
  bot_username,
  bot_description,
  bot_status,
  use_personal_bot,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '436ab36b-b2fc-44eb-b14a-8052c07050c2', -- System user ID
  '7208604161:AAExB0QL6eg1Hkaw3-iMxfEMnvEtVO6N3sI',
  'consenluutru_bot',
  'UniShare System Bot - Default storage bot',
  'active',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  bot_token = EXCLUDED.bot_token,
  bot_username = EXCLUDED.bot_username,
  bot_status = 'active',
  updated_at = NOW();

-- Add system default storage channel/user (chat ID: 5717458324)
INSERT INTO telegram_channels (
  id,
  channel_id,
  channel_name,
  channel_type,
  is_default,
  bot_config_id,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '5717458324',
  'System Default Storage',
  'private',
  true,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  channel_id = '5717458324',
  channel_name = 'System Default Storage',
  is_default = true,
  updated_at = NOW();
