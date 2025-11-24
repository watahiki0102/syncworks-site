# シードデータ実行ガイド

このディレクトリには、データベースの初期データ（シードデータ）を投入するためのSQLファイルとTypeScriptファイルが含まれています。

## 📁 ディレクトリ構成

```
seeds/
├── 01_required/          # 必須マスタデータ（本番環境でも必要）
│   ├── 01_item_masters.sql      # 荷物品目マスタ（37品目）
│   ├── 02_pricing_rules.sql     # 料金ルールマスタ（11ルール）
│   ├── 03_options.sql           # オプションサービスマスタ（27オプション）
│   └── 04_season_rules.sql      # 繁忙期ルールマスタ（19ルール）
│
├── 02_development/       # 開発環境用テストデータ（本番では実行しない）
│   ├── 01_test_users.sql           # テストユーザー（12ユーザー）
│   ├── 02_test_companies.sql       # テスト引越し業者（2社）
│   ├── 03_test_employees.sql       # テスト従業員（4名）
│   ├── 04_test_trucks.sql          # テストトラック（5台）
│   ├── 05_test_agents.sql          # テスト不動産業者（2社）
│   └── 06_test_quote_requests.sql  # テスト見積もり依頼（3件）
│
└── README.md             # このファイル
```

## 🚀 実行方法

### 方法1: SQLファイルを直接実行（PostgreSQL）

#### 必須マスタデータのみ投入（本番環境推奨）

```bash
# データベースに接続
psql -U syncworks_app -d syncworks_db

# 必須マスタデータを順番に実行
\i docs/database/seeds/01_required/01_item_masters.sql
\i docs/database/seeds/01_required/02_pricing_rules.sql
\i docs/database/seeds/01_required/03_options.sql
\i docs/database/seeds/01_required/04_season_rules.sql
```

#### 開発環境用テストデータも投入

```bash
# 必須マスタデータを実行（上記参照）

# テストデータを順番に実行
\i docs/database/seeds/02_development/01_test_users.sql
\i docs/database/seeds/02_development/02_test_companies.sql
\i docs/database/seeds/02_development/03_test_employees.sql
\i docs/database/seeds/02_development/04_test_trucks.sql
\i docs/database/seeds/02_development/05_test_agents.sql
\i docs/database/seeds/02_development/06_test_quote_requests.sql
```

#### 一括実行スクリプト

Windowsの場合：
```cmd
cd docs\database\seeds
psql -U syncworks_app -d syncworks_db -f 01_required\01_item_masters.sql
psql -U syncworks_app -d syncworks_db -f 01_required\02_pricing_rules.sql
psql -U syncworks_app -d syncworks_db -f 01_required\03_options.sql
psql -U syncworks_app -d syncworks_db -f 01_required\04_season_rules.sql
```

### 方法2: Prisma Seedを使用（TypeScript）

#### 前提条件
- Node.jsがインストールされていること
- Prisma Clientが生成されていること

#### 実行手順

1. **package.jsonにseedコマンドを追加**

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

2. **必要なパッケージをインストール**

```bash
npm install -D ts-node @types/node
```

3. **Prisma Clientを生成**

```bash
npx prisma generate
```

4. **シードを実行**

```bash
npx prisma db seed
```

または

```bash
npm run seed
```

#### 環境変数の設定

`.env`ファイルに以下を設定：

```env
DATABASE_URL="postgresql://syncworks_app:password@localhost:5432/syncworks_db"
NODE_ENV="development"  # 本番環境では "production"
```

**注意**: `NODE_ENV=production`の場合、テストユーザーは作成されません。

## 📊 データ概要

### 必須マスタデータ（01_required）

| ファイル | レコード数 | 説明 |
|---------|-----------|------|
| item_masters.sql | 37 | 引越し荷物品目（家具、家電、ダンボール等） |
| pricing_rules.sql | 11 | 料金計算ルール（基本料金、距離料金、時間帯割増等） |
| options.sql | 27 | オプションサービス（梱包、エアコン工事、不用品回収等） |
| season_rules.sql | 19 | 繁忙期・閑散期ルール（2年分） |

### 開発環境用テストデータ（02_development）

| ファイル | レコード数 | 説明 |
|---------|-----------|------|
| test_users.sql | 12 | 管理者、業者オーナー、従業員、不動産業者、顧客 |
| test_companies.sql | 2 | 東京エクスプレス、横浜スピード |
| test_employees.sql | 4 | リーダー2名、ドライバー1名、作業員1名 |
| test_trucks.sql | 5 | 2t/3t/4tトラック |
| test_agents.sql | 2 | 東京不動産、横浜住宅センター |
| test_quote_requests.sql | 3 | 単身、ファミリー、不動産経由 |

## 🔐 テストアカウント情報

**すべてのパスワードは `password123` です**（bcryptでハッシュ化）

| ロール | メールアドレス | 説明 |
|--------|--------------|------|
| admin | admin@syncworks.jp | システム管理者 |
| business_owner | owner1@example.com | 東京エクスプレス オーナー |
| business_owner | owner2@example.com | 横浜スピード オーナー |
| employee | employee1@example.com | 従業員（山田一郎） |
| agent | agent1@realestate.jp | 不動産業者（伊藤美咲） |
| customer | customer1@example.com | 顧客（木村健太） |

## ⚠️ 注意事項

### 本番環境での実行

1. **必須マスタデータのみ実行すること**
   - `01_required/`配下のファイルのみ実行
   - `02_development/`配下は実行しない

2. **データの確認**
   - 実行前にレビューを行うこと
   - 特に料金設定（pricing_rules, season_rules）は要確認

3. **UUIDの変更**
   - 本番環境では固定UUIDではなく`gen_random_uuid()`を使用することを推奨
   - テストデータとの重複を避けるため

### 開発環境での実行

1. **データのリセット**
   ```sql
   -- すべてのシードデータを削除（開発環境のみ）
   TRUNCATE item_masters, pricing_rules, options, season_rules RESTART IDENTITY CASCADE;
   ```

2. **再実行**
   - シードファイルは冪等性があるため、複数回実行しても問題ありません
   - ただし、外部キー制約に注意

## 🔄 データのメンテナンス

### 品目の追加

```sql
INSERT INTO item_masters (category, name, default_points, typical_quantity_per_household, requires_disassembly, is_active)
VALUES ('家具', '新しい品目', 50, 1, false, true);
```

### 料金ルールの更新

```sql
-- 既存ルールを無効化
UPDATE pricing_rules SET is_active = false WHERE id = 'xxx';

-- 新しいルールを追加
INSERT INTO pricing_rules (...) VALUES (...);
```

### 繁忙期ルールの追加（新年度）

```sql
-- 2026年度の繁忙期ルールを追加
INSERT INTO season_rules (name, season_type, start_date, end_date, rate_multiplier, ...)
VALUES ('超繁忙期（3月下旬〜4月上旬）', 'peak_high', '2026-03-20', '2026-04-10', 1.5, ...);
```

## 📝 カスタマイズ

シードデータは以下の項目をカスタマイズできます：

- **料金設定**: `pricing_rules.sql`のbase_price、distance_rate_per_kmなど
- **オプション価格**: `options.sql`のbase_price
- **繁忙期倍率**: `season_rules.sql`のrate_multiplier
- **品目ポイント**: `item_masters.sql`のdefault_points

## 🐛 トラブルシューティング

### エラー: duplicate key value violates unique constraint

原因: 既にデータが存在している
```sql
-- データを削除してから再実行
DELETE FROM item_masters WHERE name = '既存の品目名';
```

### エラー: foreign key constraint

原因: 参照先のデータが存在しない
```sql
-- 依存関係の順序を確認
-- users → companies → employees の順で実行
```

### Prisma Seed エラー

```bash
# Prisma Clientを再生成
npx prisma generate

# データベースをリセット（開発環境のみ）
npx prisma migrate reset
npx prisma db seed
```

## 📚 参考

- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [PostgreSQL INSERT](https://www.postgresql.org/docs/current/sql-insert.html)
- [PostgreSQL COPY](https://www.postgresql.org/docs/current/sql-copy.html)
