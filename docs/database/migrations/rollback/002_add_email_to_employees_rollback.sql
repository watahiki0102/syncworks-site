-- ============================================
-- Rollback: 002_add_email_to_employees
-- Description: employeesテーブルからemailカラムを削除
-- ============================================

BEGIN;

-- 1. emailカラムを削除
ALTER TABLE employees
DROP COLUMN IF EXISTS email;

-- 2. マイグレーション記録を削除
DELETE FROM schema_migrations WHERE version = '002';

COMMIT;
