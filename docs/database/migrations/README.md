## マイグレーション実行ガイド

## 📖 概要

マイグレーションは、**既存データを保持したまま**データベース構造を段階的に変更するための仕組みです。

## 📁 ディレクトリ構成

```
migrations/
├── 000_schema_migrations.sql    # マイグレーション管理テーブル
├── 001_initial_schema.sql       # 初期スキーマ作成
├── 002_example_add_column.sql   # （例）カラム追加
├── 003_example_add_table.sql    # （例）テーブル追加
├── rollback/
│   ├── 001_rollback.sql         # 001のロールバック
│   ├── 002_rollback.sql         # 002のロールバック
│   └── 003_rollback.sql         # 003のロールバック
└── README.md                    # このファイル
```

## 🚀 実行手順

### 1. 初回セットアップ

```bash
# 1. マイグレーション管理テーブル作成
psql -U syncworks_app -d syncworks_db -f 000_schema_migrations.sql

# 2. 初期スキーマ作成（実際にはDDLスクリプトを実行）
cd ../ddl
./execute_all.bat  # または execute_all.sh

# 3. マイグレーション記録
cd ../migrations
psql -U syncworks_app -d syncworks_db -f 001_initial_schema.sql
```

### 2. 新しいマイグレーションの実行

```bash
# マイグレーション実行
psql -U syncworks_app -d syncworks_db -f 002_example_add_column.sql

# 実行履歴確認
psql -U syncworks_app -d syncworks_db -c "SELECT * FROM schema_migrations ORDER BY executed_at DESC;"
```

### 3. ロールバック（元に戻す）

```bash
# 最後のマイグレーションを元に戻す
psql -U syncworks_app -d syncworks_db -f rollback/002_rollback.sql

# ロールバック確認
psql -U syncworks_app -d syncworks_db -c "SELECT * FROM schema_migrations ORDER BY executed_at DESC;"
```

## 📝 マイグレーションファイルの作成方法

### テンプレート

```sql
-- ========================================
-- Migration: XXX_description
-- Date: YYYY-MM-DD
-- Author: Your Name
-- Description: 何を変更するか
-- ========================================

DO $$
DECLARE
  start_time TIMESTAMP;
  execution_time INT;
BEGIN
  start_time := clock_timestamp();

  BEGIN
    -- 重複実行防止
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'XXX') THEN
      RAISE NOTICE 'Migration XXX already executed, skipping...';
      RETURN;
    END IF;

    RAISE NOTICE 'Executing migration XXX';

    -- ここに変更内容を記述
    -- 例: ALTER TABLE employees ADD COLUMN qualifications TEXT;

    -- マイグレーション記録
    execution_time := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;

    INSERT INTO schema_migrations (version, description, execution_time_ms)
    VALUES ('XXX', 'Description here', execution_time);

    RAISE NOTICE 'Migration XXX completed in % ms', execution_time;

  EXCEPTION
    WHEN OTHERS THEN
      INSERT INTO schema_migrations (version, description, success, error_message)
      VALUES ('XXX', 'Description here', false, SQLERRM);

      RAISE NOTICE 'Migration XXX failed: %', SQLERRM;
      RAISE;
  END;
END $$;
```

### ロールバックテンプレート

```sql
-- ========================================
-- Rollback: XXX_description
-- Description: マイグレーションXXXを元に戻す
-- ========================================

DO $$
BEGIN
  BEGIN
    -- ここに元に戻す処理を記述
    -- 例: ALTER TABLE employees DROP COLUMN qualifications;

    -- マイグレーション記録削除
    DELETE FROM schema_migrations WHERE version = 'XXX';

    RAISE NOTICE 'Rollback XXX completed';

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Rollback XXX failed: %', SQLERRM;
      RAISE;
  END;
END $$;
```

## 💡 マイグレーションの例

### 例1: カラム追加

**UP (002_add_employee_qualifications.sql)**
```sql
ALTER TABLE employees
ADD COLUMN qualifications TEXT;

COMMENT ON COLUMN employees.qualifications IS '保有資格（運転免許証、フォークリフト等）';
```

**DOWN (rollback/002_rollback.sql)**
```sql
ALTER TABLE employees
DROP COLUMN qualifications;
```

### 例2: テーブル追加

**UP (003_add_audit_log.sql)**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL,
  user_id UUID,
  changes JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

**DOWN (rollback/003_rollback.sql)**
```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
```

### 例3: データ移行

**UP (004_migrate_employee_status.sql)**
```sql
-- 旧statusカラムの値を新形式に変換
UPDATE employees
SET status = CASE
  WHEN old_status = 'A' THEN 'active'
  WHEN old_status = 'I' THEN 'inactive'
  ELSE 'suspended'
END
WHERE old_status IS NOT NULL;

-- 旧カラム削除
ALTER TABLE employees DROP COLUMN old_status;
```

**DOWN (rollback/004_rollback.sql)**
```sql
-- 旧カラム復元
ALTER TABLE employees ADD COLUMN old_status VARCHAR(1);

UPDATE employees
SET old_status = CASE
  WHEN status = 'active' THEN 'A'
  WHEN status = 'inactive' THEN 'I'
  ELSE 'S'
END;
```

## ⚠️ 注意事項

### DO
- ✅ マイグレーションは小さく分割する
- ✅ 必ずロールバックスクリプトも作成する
- ✅ 本番環境適用前にテスト環境で検証する
- ✅ バックアップを取ってから実行する
- ✅ トランザクション内で実行する

### DON'T
- ❌ 大量データの更新を1つのマイグレーションで行わない
- ❌ 外部キー制約を無視しない
- ❌ 本番環境で直接テストしない
- ❌ ロールバック不可能な変更をしない（例: データ削除）

## 🔄 マイグレーションの実行フロー

```
[開発環境]
  1. マイグレーション作成
  2. ローカルで実行・テスト
  3. ロールバックテスト
  ↓
[テスト環境]
  4. テスト環境で実行
  5. 動作確認
  6. 問題あればロールバック
  ↓
[ステージング環境]
  7. 本番相当のデータで実行
  8. パフォーマンス確認
  ↓
[本番環境]
  9. メンテナンスモード有効化
  10. バックアップ取得
  11. マイグレーション実行
  12. 動作確認
  13. メンテナンスモード解除
```

## 📊 マイグレーション履歴の確認

```sql
-- すべてのマイグレーション履歴
SELECT * FROM schema_migrations ORDER BY executed_at DESC;

-- 最新のマイグレーション
SELECT version, description, executed_at
FROM schema_migrations
ORDER BY executed_at DESC
LIMIT 1;

-- 失敗したマイグレーション
SELECT version, description, error_message
FROM schema_migrations
WHERE success = false;
```

## 🛠️ トラブルシューティング

### マイグレーションが途中で失敗した
```sql
-- 失敗したマイグレーションのバージョン確認
SELECT * FROM schema_migrations WHERE success = false;

-- 手動でロールバック
\i rollback/XXX_rollback.sql

-- schema_migrationsから削除
DELETE FROM schema_migrations WHERE version = 'XXX';

-- 修正後、再実行
\i XXX_fixed_migration.sql
```

### ロールバックできない
- データ削除を伴うマイグレーションは完全なロールバック不可
- 事前にバックアップから復元する

### 本番環境でエラー
1. 即座にロールバック実行
2. ログとエラーメッセージを保存
3. バックアップから復元（最終手段）

## 📚 関連ドキュメント

- [DDLスクリプト](../ddl/README.md)
- [テーブル定義書](../TABLE-DEFINITIONS.md)
- [シードデータ](../seeds/README.md)
