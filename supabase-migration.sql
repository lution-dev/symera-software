-- =====================================================
-- SCRIPT DE MIGRAÇÃO PARA SUPABASE
-- Gerado a partir do schema Drizzle (shared/schema.ts)
-- =====================================================

-- 1. TABELA USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. TABELA EVENTS
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  meeting_url TEXT,
  description TEXT,
  budget INTEGER,
  expenses INTEGER DEFAULT 0,
  attendees INTEGER,
  cover_image_url TEXT,
  status TEXT DEFAULT 'planning',
  feedback_url TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. TABELA TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status TEXT DEFAULT 'todo' NOT NULL,
  priority TEXT DEFAULT 'medium' NOT NULL,
  event_id INTEGER NOT NULL REFERENCES events(id),
  assignee_id TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 4. TABELA TASK_ASSIGNEES
CREATE TABLE IF NOT EXISTS task_assignees (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. TABELA ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 6. TABELA EVENT_TEAM_MEMBERS
CREATE TABLE IF NOT EXISTS event_team_members (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 7. TABELA VENDORS
CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  service TEXT NOT NULL,
  cost INTEGER,
  notes TEXT,
  event_id INTEGER NOT NULL REFERENCES events(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 8. TABELA BUDGET_ITEMS
CREATE TABLE IF NOT EXISTS budget_items (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT,
  due_date TIMESTAMP,
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 9. TABELA EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT,
  due_date TIMESTAMP,
  payment_date TIMESTAMP,
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  vendor_id INTEGER REFERENCES vendors(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 10. TABELA SCHEDULE_ITEMS
CREATE TABLE IF NOT EXISTS schedule_items (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP,
  start_time TEXT NOT NULL,
  location TEXT,
  responsibles TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 11. TABELA DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by_id TEXT NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 12. TABELA PARTICIPANTS
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  origin TEXT DEFAULT 'manual' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 13. TABELA EVENT_FEEDBACKS
CREATE TABLE IF NOT EXISTS event_feedbacks (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),
  feedback_id TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 14. TABELA FEEDBACK_METRICS
CREATE TABLE IF NOT EXISTS feedback_metrics (
  id SERIAL PRIMARY KEY,
  feedback_id TEXT NOT NULL REFERENCES event_feedbacks(feedback_id),
  viewed_at TIMESTAMP,
  submitted_at TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_id ON activity_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_members_event_id ON event_team_members(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_event_id ON schedule_items(event_id);
CREATE INDEX IF NOT EXISTS idx_documents_event_id ON documents(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_feedbacks_event_id ON event_feedbacks(event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_feedbacks_feedback_id ON event_feedbacks(feedback_id);

-- =====================================================
-- PRONTO! Execute este script no SQL Editor do Supabase
-- =====================================================
