# DDLスクリプト実行ガイド

## 📁 ディレクトリ構成

```
ddl/
├── 00_setup/              # 初期セットアップ
│   └── create_database.sql
├── 01_core/               # コアエンティティ
│   ├── 01_users.sql
│   └── 02_moving_companies.sql
├── 02_resources/          # リソース管理
│   ├── 01_employees.sql
│   ├── 02_trucks.sql
│   └── 03_shifts.sql
├── 03_referrals/          # 紹介者管理
│   ├── 01_real_estate_agents.sql
│   ├── 02_referrers.sql
│   └── 03_referral_cases.sql
├── 04_quotes/             # 見積フロー
│   ├── 01_quote_requests.sql
│   ├── 02_moving_items.sql
│   ├── 03_quotes.sql
│   └── 04_quote_options.sql
├── 05_jobs/               # 案件管理
│   ├── 01_jobs.sql
│   ├── 02_job_assignments.sql
│   └── 03_reviews.sql
├── 06_masters/            # マスタデータ
│   ├── 01_item_masters.sql
│   ├── 02_pricing_rules.sql
│   ├── 03_options.sql
│   └── 04_season_rules.sql
├── 07_system/             # システム機能
│   └── 01_notifications.sql
├── 98_foreign_keys/       # 外部キー追加
│   └── add_foreign_keys.sql
├── 99_triggers/           # トリガー
│   └── update_timestamps.sql
└── README.md              # このファイル
```

## 🚀 実行手順

### 1. データベース作成

```bash
# PostgreSQLに接続
psql -U postgres

# データベースとロール作成
\i 00_setup/create_database.sql

# syncworks_dbに接続
\c syncworks_db
```

### 2. テーブル作成（順番厳守）

**重要**: 外部キー参照があるため、以下の順番で実行してください。

```bash
# 2.1 コアエンティティ
psql -U syncworks_app -d syncworks_db -f 01_core/01_users.sql
psql -U syncworks_app -d syncworks_db -f 01_core/02_moving_companies.sql

# 2.2 マスタデータ（先に作成）
psql -U syncworks_app -d syncworks_db -f 06_masters/01_item_masters.sql
psql -U syncworks_app -d syncworks_db -f 06_masters/02_pricing_rules.sql
psql -U syncworks_app -d syncworks_db -f 06_masters/03_options.sql
psql -U syncworks_app -d syncworks_db -f 06_masters/04_season_rules.sql

# 2.3 リソース管理
psql -U syncworks_app -d syncworks_db -f 02_resources/01_employees.sql
psql -U syncworks_app -d syncworks_db -f 02_resources/02_trucks.sql

# 2.4 紹介者管理
psql -U syncworks_app -d syncworks_db -f 03_referrals/01_real_estate_agents.sql
psql -U syncworks_app -d syncworks_db -f 03_referrals/02_referrers.sql

# 2.5 見積フロー
psql -U syncworks_app -d syncworks_db -f 04_quotes/01_quote_requests.sql
psql -U syncworks_app -d syncworks_db -f 04_quotes/02_moving_items.sql
psql -U syncworks_app -d syncworks_db -f 04_quotes/03_quotes.sql
psql -U syncworks_app -d syncworks_db -f 04_quotes/04_quote_options.sql

# 2.6 紹介案件（quote_requests作成後）
psql -U syncworks_app -d syncworks_db -f 03_referrals/03_referral_cases.sql

# 2.7 案件管理
psql -U syncworks_app -d syncworks_db -f 05_jobs/01_jobs.sql
psql -U syncworks_app -d syncworks_db -f 05_jobs/02_job_assignments.sql
psql -U syncworks_app -d syncworks_db -f 05_jobs/03_reviews.sql

# 2.8 シフト（jobs作成後）
psql -U syncworks_app -d syncworks_db -f 02_resources/03_shifts.sql

# 2.9 システム機能
psql -U syncworks_app -d syncworks_db -f 07_system/01_notifications.sql
```

### 3. 外部キーとトリガー追加

```bash
# 外部キー追加
psql -U syncworks_app -d syncworks_db -f 98_foreign_keys/add_foreign_keys.sql

# トリガー追加
psql -U syncworks_app -d syncworks_db -f 99_triggers/update_timestamps.sql
```

## 🔄 一括実行スクリプト

すべてを一度に実行する場合:

```bash
cd docs/database/ddl

# Linuxの場合
./execute_all.sh

# Windowsの場合
execute_all.bat
```

## ⚠️ 注意事項

### 実行順序
1. **00_setup**: 最初に実行（データベース作成）
2. **01_core**: コアテーブル
3. **06_masters**: マスタデータ（optionsは04_quotesより先）
4. **02_resources, 03_referrals, 04_quotes**: 順不同（ただしshiftsは最後）
5. **05_jobs**: quotesの後
6. **02_resources/03_shifts.sql**: jobsの後
7. **98_foreign_keys**: すべてのテーブル作成後
8. **99_triggers**: 最後

### 外部キー依存関係
```
users → moving_companies, employees, real_estate_agents
employees → moving_companies
trucks → moving_companies
shifts → employees, jobs, trucks
quote_requests → real_estate_agents
moving_items → quote_requests
quotes → quote_requests, moving_companies
quote_options → quotes, options (★ optionsを先に作成)
referral_cases → referrers, quote_requests
jobs → quotes, moving_companies, real_estate_agents
job_assignments → jobs, employees, trucks
reviews → jobs
```

## 🧹 データベースの削除・再作成

```sql
-- データベースを削除（注意: すべてのデータが消えます）
DROP DATABASE IF EXISTS syncworks_db;

-- ロールを削除
DROP ROLE IF EXISTS syncworks_app;

-- その後、手順1から再実行
```

## 📊 テーブル一覧確認

```sql
-- すべてのテーブル確認
\dt

-- テーブルの詳細確認
\d+ table_name

-- 外部キー確認
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## 🔍 トラブルシューティング

### エラー: relation "xxx" does not exist
**原因**: 外部キー参照先のテーブルが未作成
**解決**: 依存関係を確認し、参照先テーブルを先に作成

### エラー: permission denied
**原因**: 権限不足
**解決**:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO syncworks_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO syncworks_app;
```

### エラー: duplicate key value
**原因**: UNIQUEまたはPRIMARY KEY制約違反
**解決**: データを確認し、重複を削除

## 📚 関連ドキュメント

- [テーブル定義書](../TABLE-DEFINITIONS.md)
- [ER図](../ER-DIAGRAM.md)
- [マイグレーション計画](../migrations/README.md)
- [シードデータ](../seeds/README.md)
