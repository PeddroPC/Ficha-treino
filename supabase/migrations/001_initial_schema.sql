-- ============================================================
-- Supabase Schema Migration: 001_initial_schema.sql
-- Baseado no modelo local existente do FITPROGRESS.
-- ============================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EXERCISES
CREATE TABLE exercises (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL para exercícios públicos do sistema
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. SHEETS
CREATE TABLE sheets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- 3. SHEET EXERCISES
CREATE TABLE sheet_exercises (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sheet_id TEXT NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id),
    "order" INTEGER NOT NULL,
    target_sets INTEGER,
    target_reps_min INTEGER,
    target_reps_max INTEGER,
    target_rest_seconds INTEGER
);

-- 4. LOGS (Treinos Executados)
CREATE TABLE logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sheet_id TEXT REFERENCES sheets(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    notes TEXT,
    perceived_effort INTEGER
);

-- 5. SETS (Séries)
CREATE TABLE sets (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_id TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL REFERENCES exercises(id),
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight_kg NUMERIC,
    rest_seconds INTEGER,
    is_drop_set BOOLEAN DEFAULT false,
    is_pr BOOLEAN DEFAULT false,
    notes TEXT
);

-- 6. METRICS (Avaliações Corporais)
CREATE TABLE metrics (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg NUMERIC,
    body_fat_pct NUMERIC,
    chest_cm NUMERIC,
    waist_cm NUMERIC,
    hip_cm NUMERIC,
    arm_cm NUMERIC,
    thigh_cm NUMERIC,
    calf_cm NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_sheets_user_id ON sheets(user_id);
CREATE INDEX idx_sheet_exercises_sheet_id ON sheet_exercises(sheet_id);
CREATE INDEX idx_logs_user_id_started_at ON logs(user_id, started_at DESC);
CREATE INDEX idx_sets_log_id ON sets(log_id);
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);
CREATE INDEX idx_metrics_user_id_date ON metrics(user_id, date DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheet_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

-- Exercises: Lê se for dono ou se for do sistema. Edita/Deleta apenas se for dono.
CREATE POLICY "exercises_select_policy" ON exercises FOR SELECT USING (auth.uid() = user_id OR is_custom = false);
CREATE POLICY "exercises_insert_policy" ON exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises_update_policy" ON exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercises_delete_policy" ON exercises FOR DELETE USING (auth.uid() = user_id);

-- Sheets
CREATE POLICY "sheets_select_policy" ON sheets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sheets_insert_policy" ON sheets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sheets_update_policy" ON sheets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sheets_delete_policy" ON sheets FOR DELETE USING (auth.uid() = user_id);

-- Sheet Exercises
CREATE POLICY "sheet_exercises_select_policy" ON sheet_exercises FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sheet_exercises_insert_policy" ON sheet_exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sheet_exercises_update_policy" ON sheet_exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sheet_exercises_delete_policy" ON sheet_exercises FOR DELETE USING (auth.uid() = user_id);

-- Logs
CREATE POLICY "logs_select_policy" ON logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_policy" ON logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "logs_update_policy" ON logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "logs_delete_policy" ON logs FOR DELETE USING (auth.uid() = user_id);

-- Sets
CREATE POLICY "sets_select_policy" ON sets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sets_insert_policy" ON sets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sets_update_policy" ON sets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sets_delete_policy" ON sets FOR DELETE USING (auth.uid() = user_id);

-- Metrics
CREATE POLICY "metrics_select_policy" ON metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "metrics_insert_policy" ON metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metrics_update_policy" ON metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "metrics_delete_policy" ON metrics FOR DELETE USING (auth.uid() = user_id);
