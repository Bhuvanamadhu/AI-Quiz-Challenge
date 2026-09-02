-- Migration: Add started_at and completed_at timing columns to quiz_attempts and leaderboard tables

ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
