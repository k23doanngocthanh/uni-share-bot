-- Create user_profiles table for extended user information
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  school TEXT,
  major TEXT,
  bio TEXT,
  avatar_url TEXT,
  telegram_user_id BIGINT,
  telegram_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_bot_configs table for bot configurations
CREATE TABLE public.user_bot_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  use_personal_bot BOOLEAN NOT NULL DEFAULT false,
  bot_token TEXT,
  bot_username TEXT,
  bot_description TEXT,
  bot_status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'error'
  bot_webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bot_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.user_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for user_bot_configs
CREATE POLICY "Users can view their own bot config" 
ON public.user_bot_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot config" 
ON public.user_bot_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot config" 
ON public.user_bot_configs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot config" 
ON public.user_bot_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_bot_configs_updated_at
  BEFORE UPDATE ON public.user_bot_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_telegram_user_id ON public.user_profiles(telegram_user_id);
CREATE INDEX idx_user_bot_configs_user_id ON public.user_bot_configs(user_id);
CREATE INDEX idx_user_bot_configs_bot_status ON public.user_bot_configs(bot_status);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_bot_configs (user_id, use_personal_bot)
  VALUES (NEW.id, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and bot config when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create a view for document statistics
CREATE OR REPLACE VIEW public.document_stats AS
SELECT 
  school,
  major,
  COUNT(*) as document_count,
  COUNT(DISTINCT telegram_user_id) as contributor_count,
  MAX(created_at) as last_upload
FROM public.documents
WHERE school IS NOT NULL AND major IS NOT NULL
GROUP BY school, major
ORDER BY document_count DESC;

-- Create a function to get user's document count
CREATE OR REPLACE FUNCTION public.get_user_document_count(user_telegram_id BIGINT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.documents
    WHERE telegram_user_id = user_telegram_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
