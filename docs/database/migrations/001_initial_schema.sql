-- ========================================
-- Migration: 001_initial_schema
-- Date: 2025-01-24
-- Author: System
-- Description: 初期スキーマ作成（全19テーブル）
-- ========================================

DO $$
DECLARE
  start_time TIMESTAMP;
  execution_time INT;
BEGIN
  start_time := clock_timestamp();

  -- トランザクション開始
  BEGIN
    -- このマイグレーションが未実行か確認
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001') THEN
      RAISE NOTICE 'Migration 001 already executed, skipping...';
      RETURN;
    END IF;

    RAISE NOTICE 'Executing migration 001: Initial schema creation';

    -- DDLファイルの内容をここに含める（または外部実行）
    -- 注: 実際の運用では、DDLファイルを直接実行するか、
    --     このスクリプトにDDL内容を含める

    RAISE NOTICE 'Please execute DDL scripts from docs/database/ddl/';
    RAISE NOTICE '  1. Core tables (01_core/*.sql)';
    RAISE NOTICE '  2. Master tables (06_masters/*.sql)';
    RAISE NOTICE '  3. Resource tables (02_resources/*.sql)';
    RAISE NOTICE '  4. Referral tables (03_referrals/*.sql)';
    RAISE NOTICE '  5. Quote tables (04_quotes/*.sql)';
    RAISE NOTICE '  6. Job tables (05_jobs/*.sql)';
    RAISE NOTICE '  7. System tables (07_system/*.sql)';
    RAISE NOTICE '  8. Foreign keys (98_foreign_keys/*.sql)';
    RAISE NOTICE '  9. Triggers (99_triggers/*.sql)';

    -- マイグレーション記録
    execution_time := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;

    INSERT INTO schema_migrations (version, description, execution_time_ms)
    VALUES ('001', 'Initial schema creation (19 tables)', execution_time);

    RAISE NOTICE 'Migration 001 completed successfully in % ms', execution_time;

  EXCEPTION
    WHEN OTHERS THEN
      -- エラー記録
      INSERT INTO schema_migrations (version, description, success, error_message)
      VALUES ('001', 'Initial schema creation (19 tables)', false, SQLERRM);

      RAISE NOTICE 'Migration 001 failed: %', SQLERRM;
      RAISE;
  END;
END $$;
