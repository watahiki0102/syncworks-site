-- ============================================
-- Migration: 002_add_email_to_employees
-- Description: employeesテーブルにemailカラムを追加
-- Date: 2024-11-30
-- ============================================

-- マイグレーション開始
BEGIN;

-- 1. emailカラムを追加
ALTER TABLE employees
ADD COLUMN email VARCHAR(255);

-- 2. コメントを追加
COMMENT ON COLUMN employees.email IS '従業員のメールアドレス';

-- 3. 既存データの更新（usersテーブルからメールアドレスをコピー）
UPDATE employees e
SET email = u.email
FROM users u
WHERE e.user_id = u.id
AND e.email IS NULL;

-- 4. マイグレーション記録を追加
INSERT INTO schema_migrations (version, description, executed_at, success)
VALUES ('002', 'Add email column to employees table', NOW(), true);

COMMIT;

-- ============================================
-- 実行方法:
-- Supabase SQL Editorで上記SQLを実行してください
-- ============================================
