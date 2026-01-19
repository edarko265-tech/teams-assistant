-- ============================================================
-- Teams Assistant Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- Channels Table
-- ============================================================
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  assistant_enabled BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Channel Members Table (Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (channel_id, user_id)
);

-- Create indexes for channel_members
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);

-- ============================================================
-- Chats Table (1-on-1 conversations)
-- ============================================================
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Chat Participants Table (Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_participants (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

-- Create indexes for chat_participants
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);

-- ============================================================
-- Messages Table
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  sender_id UUID REFERENCES users(id),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  is_assistant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Either channel_id or chat_id must be set, but not both
  CONSTRAINT message_target CHECK (
    (channel_id IS NOT NULL AND chat_id IS NULL) OR
    (channel_id IS NULL AND chat_id IS NOT NULL)
  )
);

-- Create indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- ============================================================
-- Files Table
-- ============================================================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content TEXT, -- For text files, store content for AI context
  uploaded_by UUID REFERENCES users(id),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for files
CREATE INDEX IF NOT EXISTS idx_files_channel ON files(channel_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Channels policies
CREATE POLICY "Anyone can view channels" ON channels
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create channels" ON channels
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Channel creators can update" ON channels
  FOR UPDATE USING (auth.uid() = created_by);

-- Channel members policies
CREATE POLICY "Anyone can view channel members" ON channel_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join channels" ON channel_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave channels" ON channel_members
  FOR DELETE USING (auth.uid() = user_id);

-- Chats policies
CREATE POLICY "Participants can view their chats" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_id = chats.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Chat participants policies
CREATE POLICY "Participants can view chat participants" ON chat_participants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM chat_participants cp2
      WHERE cp2.chat_id = chat_participants.chat_id
    )
  );

CREATE POLICY "Authenticated users can add chat participants" ON chat_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Messages policies
CREATE POLICY "Channel members can view channel messages" ON messages
  FOR SELECT USING (
    channel_id IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_id = messages.chat_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Files policies
CREATE POLICY "Anyone can view channel files" ON files
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload files" ON files
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Uploaders can delete their files" ON files
  FOR DELETE USING (auth.uid() = uploaded_by);

-- ============================================================
-- Storage Bucket for Files
-- ============================================================

-- Create a storage bucket for channel files (run in Storage section)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('channel-files', 'channel-files', true);

-- ============================================================
-- Seed Data (Optional - for initial setup)
-- ============================================================

-- Create a default General channel (will be created by first user)
-- This is handled by the application on first login

-- ============================================================
-- Functions and Triggers
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Helper function to get or create user from auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
