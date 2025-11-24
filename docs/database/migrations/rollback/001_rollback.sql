-- ========================================
-- Rollback: 001_initial_schema
-- Date: 2025-01-24
-- Description: 初期スキーマの削除（全テーブル削除）
-- WARNING: すべてのデータが削除されます！
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '警告: すべてのテーブルとデータを削除します';
  RAISE NOTICE '中止するには Ctrl+C を押してください';
  RAISE NOTICE '5秒後に実行開始...';

  -- 5秒待機（手動実行時のみ有効）
  PERFORM pg_sleep(5);

  BEGIN
    -- トリガー削除
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_moving_companies_updated_at ON moving_companies;
    DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
    DROP TRIGGER IF EXISTS update_trucks_updated_at ON trucks;
    DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
    DROP TRIGGER IF EXISTS update_real_estate_agents_updated_at ON real_estate_agents;
    DROP TRIGGER IF EXISTS update_referrers_updated_at ON referrers;
    DROP TRIGGER IF EXISTS update_referral_cases_updated_at ON referral_cases;
    DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON quote_requests;
    DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
    DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
    DROP TRIGGER IF EXISTS update_job_assignments_updated_at ON job_assignments;
    DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
    DROP TRIGGER IF EXISTS update_item_masters_updated_at ON item_masters;
    DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_rules;
    DROP TRIGGER IF EXISTS update_options_updated_at ON options;
    DROP TRIGGER IF EXISTS update_season_rules_updated_at ON season_rules;

    DROP FUNCTION IF EXISTS update_updated_at_column();

    -- テーブル削除（依存関係の逆順）
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS job_assignments CASCADE;
    DROP TABLE IF EXISTS shifts CASCADE;
    DROP TABLE IF EXISTS jobs CASCADE;
    DROP TABLE IF EXISTS quote_options CASCADE;
    DROP TABLE IF EXISTS quotes CASCADE;
    DROP TABLE IF EXISTS moving_items CASCADE;
    DROP TABLE IF EXISTS referral_cases CASCADE;
    DROP TABLE IF EXISTS quote_requests CASCADE;
    DROP TABLE IF EXISTS referrers CASCADE;
    DROP TABLE IF EXISTS real_estate_agents CASCADE;
    DROP TABLE IF EXISTS trucks CASCADE;
    DROP TABLE IF EXISTS employees CASCADE;
    DROP TABLE IF EXISTS season_rules CASCADE;
    DROP TABLE IF EXISTS options CASCADE;
    DROP TABLE IF EXISTS pricing_rules CASCADE;
    DROP TABLE IF EXISTS item_masters CASCADE;
    DROP TABLE IF EXISTS moving_companies CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    -- マイグレーション記録削除
    DELETE FROM schema_migrations WHERE version = '001';

    RAISE NOTICE 'Rollback completed: All tables dropped';

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Rollback failed: %', SQLERRM;
      RAISE;
  END;
END $$;
