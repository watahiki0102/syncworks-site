-- ============================================
-- Migration: 003_add_unavailable_status_to_shifts
-- Date: 2025-11-30
-- Description: shiftsテーブルのstatus制約にunavailableを追加
-- ============================================

BEGIN;

-- 1. 既存のCHECK制約を削除
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS shifts_status_check;

-- 2. 新しいCHECK制約を追加（unavailableを含む）
ALTER TABLE shifts ADD CONSTRAINT shifts_status_check
  CHECK (status IN ('scheduled', 'working', 'completed', 'cancelled', 'unavailable'));

-- 3. マイグレーション記録
INSERT INTO schema_migrations (version, description, execution_time_ms)
VALUES ('003', 'Add unavailable status to shifts table', 0)
ON CONFLICT (version) DO NOTHING;

COMMIT;
