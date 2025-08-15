# 内部管理画面 - 使用方法・動作確認

## 概要
直リンク専用の内部管理画面です。グローバルナビゲーションには表示されず、URLパラメータまたは環境変数でのみアクセス可能です。

## アクセス方法

### 1. 開発環境（推奨）
開発環境（`NODE_ENV=development`）では、認証なしでアクセス可能：
```
http://localhost:3000/admin/internal
http://localhost:3000/admin/internal/billing-status
http://localhost:3000/admin/internal/accounts
http://localhost:3000/admin/internal/partners
http://localhost:3000/admin/internal/invoices
http://localhost:3000/admin/internal/contacts
http://localhost:3000/admin/internal/news
```

### 2. クエリパラメータ方式
本番環境では、以下のクエリパラメータが必要：
```
/admin/internal?internal=1
/admin/internal/billing-status?internal=1
/admin/internal/accounts?internal=1
/admin/internal/partners?internal=1
/admin/internal/invoices?internal=1
/admin/internal/contacts?internal=1
/admin/internal/news?internal=1
```

### 3. 環境変数方式
`.env.local` ファイルに以下を設定：
```
NEXT_PUBLIC_INTERNAL_CONSOLE=enabled
```

## 機能一覧

### 1. 請求状況管理 (`/admin/internal/billing-status`)
- パートナー別の請求状況を表示
- ステータスのインライン編集（未請求/請求済/入金待ち/入金済/保留）
- 月・パートナーでのフィルタリング
- 金額は税込表示

### 2. アカウント管理 (`/admin/internal/accounts`)
- 管理者アカウントの一覧表示
- 権限の変更（viewer/manager/admin/superadmin）
- アカウントの有効/無効切り替え
- superadminの自己降格・無効化は防止

### 3. 利用業者管理 (`/admin/internal/partners`)
- パートナー企業の一覧表示
- 新規登録モーダル
- 編集モーダル
- 有効/無効切り替え

### 4. 請求管理 (`/admin/internal/invoices`)
- 請求書の発行状況管理
- 入金状況の管理
- 月・パートナーでのフィルタリング
- 統計情報の表示

### 5. お問い合わせ一覧 (`/admin/internal/contacts`)
- お客様からの問い合わせ一覧
- 全文検索機能
- メール・電話番号への直接リンク
- 統計情報の表示

### 6. ニュース編集 (`/admin/internal/news`)
- ニュース記事の一覧表示
- 新規作成・編集フォーム
- 公開/非公開の切り替え
- 削除機能

## セキュリティ

### アクセス制御
- `AdminAuthGuard`: 管理者認証が必要
- `InternalGate`: 内部画面フラグの確認
- グローバルナビゲーションには表示されない

### 権限制御
- superadminの自己降格・無効化は防止
- 適切な権限チェック

## 動作確認手順

### 1. 開発環境での基本アクセス確認
```
# ダッシュボード
http://localhost:3000/admin/internal

# 各機能ページ
http://localhost:3000/admin/internal/billing-status
http://localhost:3000/admin/internal/accounts
http://localhost:3000/admin/internal/partners
http://localhost:3000/admin/internal/invoices
http://localhost:3000/admin/internal/contacts
http://localhost:3000/admin/internal/news
```

### 2. 本番環境でのアクセス確認
```
# クエリパラメータが必要
http://localhost:3000/admin/internal?internal=1
http://localhost:3000/admin/internal/billing-status?internal=1
```

### 3. アクセス制御確認
```
# 本番環境でフラグなしでアクセス → 404エラー
http://localhost:3000/admin/internal
http://localhost:3000/admin/internal/billing-status
```

### 3. 機能確認
- 各テーブルの表示
- 編集機能の動作
- フィルタリング・検索
- 新規作成・削除

## 技術仕様

### 使用技術
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks

### ファイル構成
```
src/
├── app/admin/internal/
│   ├── page.tsx                 # ダッシュボード
│   ├── InternalLayout.tsx       # 内部画面専用レイアウト
│   ├── billing-status/page.tsx  # 請求状況管理
│   ├── accounts/page.tsx        # アカウント管理
│   ├── partners/page.tsx        # 利用業者管理
│   ├── invoices/page.tsx        # 請求管理
│   ├── contacts/page.tsx        # お問い合わせ一覧
│   └── news/page.tsx            # ニュース編集
├── components/admin/
│   └── InternalGate.tsx         # 内部画面アクセス制御
└── types/
    └── internal.ts              # 内部管理画面用型定義
```

### 型定義
- `BillingStatusRow`: 請求状況
- `AccountRow`: アカウント情報
- `PartnerRow`: パートナー情報
- `InvoiceRow`: 請求情報
- `ContactRow`: お問い合わせ
- `NewsItem`: ニュース記事

## 注意事項

1. **直リンク専用**: グローバルナビゲーションには表示されません
2. **アクセス制御**: `?internal=1` パラメータまたは環境変数が必要
3. **管理者認証**: 既存の `AdminAuthGuard` による認証が必要
4. **モックデータ**: 現在はモックデータを使用（実際のAPIに置き換え可能）

## 今後の拡張

- 実際のAPIとの連携
- より詳細な権限制御
- 監査ログの実装
- バッチ処理の追加
- エクスポート機能の追加
