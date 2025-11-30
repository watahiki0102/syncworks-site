-- ============================================
-- Rollback: 004_add_constraints_and_indexes
-- Date: 2025-11-30
-- Description: 004のロールバック
-- ============================================

BEGIN;

-- ============================================
-- 7. 複合インデックスを削除
-- ============================================
DROP INDEX IF EXISTS idx_shifts_employee_date_time;
DROP INDEX IF EXISTS idx_jobs_company_date_status;
DROP INDEX IF EXISTS idx_quotes_company_status_created;

-- ============================================
-- 6. 外部キーインデックスを削除
-- ============================================
DROP INDEX IF EXISTS idx_users_employee;
DROP INDEX IF EXISTS idx_users_real_estate_agent;

-- ============================================
-- 5. users role/ID整合性制約を削除
-- ============================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_role_id_consistency;

-- ============================================
-- 4. shifts 時間制約を元に戻す
-- ============================================
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS check_time_valid;

-- 元の制約を復元（同一時刻許可版）
ALTER TABLE shifts
  ADD CONSTRAINT check_time_valid
    CHECK (start_time < end_time OR (start_time > end_time AND time_slot IS NOT NULL));

-- ============================================
-- 3. jobs 時間整合性制約を削除
-- ============================================
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS check_scheduled_time_valid;
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS check_actual_time_valid;

-- ============================================
-- 2. job_assignments 時間整合性制約を削除
-- ============================================
ALTER TABLE job_assignments DROP CONSTRAINT IF EXISTS check_assignment_time_valid;

-- ============================================
-- 1. users外部キーを元に戻す（ON DELETE未指定）
-- ============================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_moving_company;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_employee;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_real_estate_agent;

-- ON DELETE未指定で再作成
ALTER TABLE users
  ADD CONSTRAINT fk_users_moving_company
    FOREIGN KEY (moving_company_id) REFERENCES moving_companies(id);

ALTER TABLE users
  ADD CONSTRAINT fk_users_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE users
  ADD CONSTRAINT fk_users_real_estate_agent
    FOREIGN KEY (real_estate_agent_id) REFERENCES real_estate_agents(id);

-- ============================================
-- マイグレーション記録を削除
-- ============================================
DELETE FROM schema_migrations WHERE version = '004';

COMMIT;
