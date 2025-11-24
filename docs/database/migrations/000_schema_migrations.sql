-- ========================================
-- マイグレーション管理テーブルの作成
-- Description: マイグレーション履歴を記録
-- Created: 2025-01-24
-- ========================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  description TEXT NOT NULL,
  executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

CREATE INDEX idx_schema_migrations_executed_at ON schema_migrations(executed_at DESC);

COMMENT ON TABLE schema_migrations IS 'マイグレーション履歴管理テーブル';
COMMENT ON COLUMN schema_migrations.version IS 'マイグレーションバージョン（例: 001, 002）';
COMMENT ON COLUMN schema_migrations.description IS 'マイグレーションの説明';
COMMENT ON COLUMN schema_migrations.executed_at IS '実行日時';
COMMENT ON COLUMN schema_migrations.execution_time_ms IS '実行時間（ミリ秒）';
COMMENT ON COLUMN schema_migrations.success IS '成功フラグ';
COMMENT ON COLUMN schema_migrations.error_message IS 'エラーメッセージ（失敗時）';

-- 初回レコード挿入
INSERT INTO schema_migrations (version, description)
VALUES ('000', 'Initialize schema_migrations table')
ON CONFLICT (version) DO NOTHING;
