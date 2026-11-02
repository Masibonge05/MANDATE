-- MANDATE - Production PostgreSQL Schema & Supabase RLS Policies
-- Designed for PayPal AI Hackathon 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Business Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  business_name TEXT,
  role TEXT DEFAULT 'Financial Admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mandates
CREATE TABLE IF NOT EXISTS public.mandates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  raw_prompt TEXT,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  total_budget NUMERIC(12, 2) NOT NULL CHECK (total_budget >= 0),
  spent_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (spent_amount >= 0),
  reserved_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (reserved_amount >= 0),
  max_transaction_amount NUMERIC(12, 2) NOT NULL CHECK (max_transaction_amount >= 0),
  max_quantity_per_purchase INT NOT NULL DEFAULT 1 CHECK (max_quantity_per_purchase > 0),
  allowed_categories TEXT[] DEFAULT '{}',
  restricted_categories TEXT[] DEFAULT '{}',
  approved_merchants TEXT[] DEFAULT '{}',
  blocked_merchants TEXT[] DEFAULT '{}',
  allow_unknown_merchants BOOLEAN NOT NULL DEFAULT FALSE,
  requires_human_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_threshold NUMERIC(12, 2) DEFAULT 0.00,
  approval_required_categories TEXT[] DEFAULT '{}',
  expiry_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'revoked')),
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mandate Versions (Audit Trail of Policy Changes)
CREATE TABLE IF NOT EXISTS public.mandate_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mandate_id UUID NOT NULL REFERENCES public.mandates(id) ON DELETE CASCADE,
  version INT NOT NULL,
  changes_summary TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI Agents
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agent_type VARCHAR(50) NOT NULL,
  description TEXT,
  api_key_hash TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  assigned_mandate_ids UUID[] DEFAULT '{}',
  rate_limit_per_minute INT NOT NULL DEFAULT 60,
  total_proposals INT NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE RESTRICT,
  mandate_id UUID NOT NULL REFERENCES public.mandates(id) ON DELETE RESTRICT,
  mandate_version INT NOT NULL,
  product_data JSONB NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  agent_reasoning TEXT NOT NULL,
  policy_decision VARCHAR(50) NOT NULL,
  policy_evaluation JSONB NOT NULL,
  ai_review JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'NOT_REQUIRED',
  approval_reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  paypal_payment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Append-Only Audit Events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  mandate_id UUID REFERENCES public.mandates(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read & update their own profile
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Mandates: users can only manage their own mandates
CREATE POLICY "Users access own mandates" ON public.mandates FOR ALL USING (auth.uid() = user_id);

-- Transactions: users can access transactions tied to their mandates
CREATE POLICY "Users access own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Audit Events: users can read their own audit logs (never modified/deleted)
CREATE POLICY "Users read own audit events" ON public.audit_events FOR SELECT USING (auth.uid() = user_id);

