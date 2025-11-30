-- ============================================
-- Migration: 004_add_constraints_and_indexes
-- Date: 2025-11-30
-- Description: データ整合性向上のための制約とインデックス追加
-- ============================================
--
-- 対応する問題:
-- 1. [高] users外部キーのON DELETE未指定
-- 2. [中] job_assignments時間整合性
-- 3. [中] jobs時間整合性
-- 4. [中] shifts時間整合性（同一時刻禁止）
-- 5. [中] users role/ID整合性
-- 6. [低] 外部キーインデックス不足
--
-- ============================================

BEGIN;

-- ============================================
-- 1. [高優先度] users外部キーのON DELETE動作を明確化
-- ============================================
-- 既存の外部キー制約を削除して再作成

-- 1.1 既存の外部キー制約を削除
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_moving_company;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_employee;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_real_estate_agent;

-- 1.2 ON DELETE SET NULL付きで再作成
-- 理由: 業者/従業員/不動産業者が削除されても、ユーザーアカウント自体は保持する
ALTER TABLE users
  ADD CONSTRAINT fk_users_moving_company
    FOREIGN KEY (moving_company_id) REFERENCES moving_companies(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD CONSTRAINT fk_users_real_estate_agent
    FOREIGN KEY (real_estate_agent_id) REFERENCES real_estate_agents(id) ON DELETE SET NULL;

-- ============================================
-- 2. [中優先度] job_assignments 時間整合性
-- ============================================
ALTER TABLE job_assignments
  ADD CONSTRAINT check_assignment_time_valid
    CHECK (assigned_start_time < assigned_end_time);

-- ============================================
-- 3. [中優先度] jobs 時間整合性
-- ============================================
-- scheduled_start_time と scheduled_end_time の整合性
-- NULLの場合はチェックをスキップ
ALTER TABLE jobs
  ADD CONSTRAINT check_scheduled_time_valid
    CHECK (
      scheduled_start_time IS NULL OR
      scheduled_end_time IS NULL OR
      scheduled_start_time < scheduled_end_time
    );

-- actual_start_time と actual_end_time の整合性
ALTER TABLE jobs
  ADD CONSTRAINT check_actual_time_valid
    CHECK (
      actual_start_time IS NULL OR
      actual_end_time IS NULL OR
      actual_start_time < actual_end_time
    );

-- ============================================
-- 4. [中優先度] shifts 時間整合性の強化
-- ============================================
-- 既存の制約を削除して、同一時刻を禁止する制約に更新
ALTER TABLE shifts DROP CONSTRAINT IF EXISTS check_time_valid;

-- 日マタギ対応 + 同一時刻禁止
-- start_time = end_time の場合は無効（0時間シフト禁止）
ALTER TABLE shifts
  ADD CONSTRAINT check_time_valid
    CHECK (
      start_time <> end_time AND (
        start_time < end_time OR
        (start_time > end_time AND time_slot IS NOT NULL)
      )
    );

-- ============================================
-- 5. [中優先度] users role/ID整合性
-- ============================================
-- role に応じて適切な関連IDが設定されていることを検証
ALTER TABLE users
  ADD CONSTRAINT check_role_id_consistency
    CHECK (
      -- employee: employee_id必須
      (role = 'employee' AND employee_id IS NOT NULL) OR
      -- business_owner: moving_company_id必須
      (role = 'business_owner' AND moving_company_id IS NOT NULL) OR
      -- agent: real_estate_agent_id必須
      (role = 'agent' AND real_estate_agent_id IS NOT NULL) OR
      -- customer/admin: 関連ID不要
      (role IN ('customer', 'admin'))
    );

-- ============================================
-- 6. [低優先度] 外部キーインデックス追加
-- ============================================
-- users.employee_id（まだ存在しない場合のみ）
CREATE INDEX IF NOT EXISTS idx_users_employee ON users(employee_id);

-- users.real_estate_agent_id
CREATE INDEX IF NOT EXISTS idx_users_real_estate_agent ON users(real_estate_agent_id);

-- ============================================
-- 7. [低優先度] 頻出クエリ用複合インデックス
-- ============================================
-- 従業員のシフト検索（従業員ID + 日付 + 開始時刻）
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date_time
  ON shifts(employee_id, date, start_time);

-- 業者別案件検索（業者ID + 予定日 + ステータス）
CREATE INDEX IF NOT EXISTS idx_jobs_company_date_status
  ON jobs(moving_company_id, scheduled_date, status);

-- 業者別見積検索（業者ID + ステータス + 作成日）
CREATE INDEX IF NOT EXISTS idx_quotes_company_status_created
  ON quotes(moving_company_id, status, created_at DESC);

-- ============================================
-- マイグレーション記録
-- ============================================
INSERT INTO schema_migrations (version, description, execution_time_ms)
VALUES ('004', 'Add constraints and indexes for data integrity', 0)
ON CONFLICT (version) DO NOTHING;

COMMIT;
