-- ========================================
-- データベース初期セットアップ
-- Description: データベースとロールの作成
-- Created: 2025-01-24
-- ========================================

-- データベースの作成（既存の場合はスキップ）
CREATE DATABASE syncworks_db
  WITH
  ENCODING = 'UTF8'
  LC_COLLATE = 'ja_JP.UTF-8'
  LC_CTYPE = 'ja_JP.UTF-8'
  TEMPLATE = template0;

-- アプリケーション用ロールの作成
CREATE ROLE syncworks_app WITH LOGIN PASSWORD 'change_this_password';

-- 権限付与
GRANT ALL PRIVILEGES ON DATABASE syncworks_db TO syncworks_app;

-- 拡張機能の有効化
\c syncworks_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 全文検索用

COMMENT ON DATABASE syncworks_db IS 'SyncWorks引越し業者管理システム';
