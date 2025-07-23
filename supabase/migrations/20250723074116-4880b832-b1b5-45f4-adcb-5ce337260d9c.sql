-- Create documents table for storing file metadata
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_id TEXT NOT NULL UNIQUE,  -- Telegram file_id
  file_unique_id TEXT,           -- Telegram file_unique_id for backup
  description TEXT,
  school TEXT,
  major TEXT,
  tags TEXT[] DEFAULT '{}',
  uploaded_by TEXT,              -- Telegram username
  telegram_user_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can view documents (public sharing)
CREATE POLICY "Anyone can view documents" 
ON public.documents 
FOR SELECT 
USING (true);

-- Users can insert documents (using telegram_user_id as identifier)
CREATE POLICY "Users can insert their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);  -- We'll handle validation in the bot

-- Users can update/delete their own documents
CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (telegram_user_id = CAST(auth.jwt() ->> 'telegram_user_id' AS BIGINT));

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (telegram_user_id = CAST(auth.jwt() ->> 'telegram_user_id' AS BIGINT));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_documents_school ON public.documents(school);
CREATE INDEX idx_documents_major ON public.documents(major);
CREATE INDEX idx_documents_tags ON public.documents USING GIN(tags);
CREATE INDEX idx_documents_telegram_user_id ON public.documents(telegram_user_id);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);