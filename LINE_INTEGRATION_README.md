# LINE連携設定ガイド

## 概要
引っ越し見積もりフォームにLINE連携機能を追加しました。ユーザーが送信完了後に連絡手段としてLINEを選択できるようになります。

## 環境変数の設定

### 1. .env.localファイルの作成
プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を追加してください：

```bash
# LINE公式アカウント連携URL（任意）
NEXT_PUBLIC_LINE_CONNECT_URL=https://line.me/R/ti/p/@your-line-account

# その他の環境変数
# NEXT_PUBLIC_API_URL=https://api.example.com
```

### 2. LINE連携URLの設定
`NEXT_PUBLIC_LINE_CONNECT_URL`には以下のいずれかを設定してください：

- **LINE公式アカウントの友だち追加URL**
  - 例：`https://line.me/R/ti/p/@your-line-account`
  - LINE公式アカウントの管理画面で取得可能

- **LIFFアプリのURL**
  - 例：`https://liff.line.me/your-liff-id`
  - LINE Developersコンソールで作成

- **カスタムLINE連携ページのURL**
  - 独自のLINE連携ページがある場合

## 動作フロー

### 1. 紹介ID付きでのアクセス
```
/form/step1?ref=ABC123
```
- URLの`ref`パラメータから紹介IDを取得
- フォームデータに自動的に含まれる
- 画面には表示されない（内部処理のみ）

### 2. フォーム送信完了後
1. 見積もり入力完了
2. 送信処理実行（referralIdを含む）
3. 完了画面（`/form/complete?ticket=<id>`）に遷移

### 3. 連絡手段選択
完了画面で以下の2つの選択肢が表示されます：

#### LINE選択時
- **環境変数が設定されている場合**
  - 指定されたLINE連携URLに遷移
  - 新しいタブで開く

- **環境変数が設定されていない場合**
  - 案内ポップアップを表示
  - 「LINE公式アカウントを友だち追加してください」
  - 選択内容は`contactPreference='line'`で保存

#### メール選択時
- `contactPreference='email'`で保存
- 「受付メールを送信しました」のトースト表示

## データ構造

### 送信データに含まれる項目
```typescript
interface CompleteFormData {
  // 既存項目...
  referralId?: string | null;           // 紹介ID
  contactPreference?: 'line' | 'email'; // 連絡手段
}
```

### ローカルストレージの保存
- `formStep1`: Step1の入力データ（referralId含む）
- `formSubmissions`: 送信完了データ（referralId、contactPreference含む）

## テスト方法

### 1. 紹介ID付きでのアクセス
```bash
# ブラウザで以下のURLにアクセス
http://localhost:3000/form/step1?ref=TEST123
```

### 2. フォーム入力から送信完了まで
1. Step1: 基本情報入力
2. Step2: 荷物情報入力
3. Step3: 作業オプション選択
4. 送信実行
5. 完了画面で連絡手段選択

### 3. 動作確認ポイント
- [ ] URLの`ref`パラメータが正しく取得される
- [ ] 送信データに`referralId`が含まれる
- [ ] 完了画面で連絡手段選択が表示される
- [ ] LINE選択時の動作（環境変数あり/なし）
- [ ] メール選択時の動作
- [ ] 選択結果がローカルストレージに保存される

## トラブルシューティング

### 環境変数が読み込まれない
- `.env.local`ファイルが正しい場所にあるか確認
- ファイル名のスペルミスがないか確認
- サーバーを再起動

### 紹介IDが取得できない
- URLパラメータの形式が正しいか確認（`?ref=ABC123`）
- `useSearchParams`が正しく動作しているか確認

### 連絡手段選択が表示されない
- 完了画面のURLパラメータが正しいか確認（`?ticket=<id>`）
- ローカルストレージのデータ構造を確認

## 今後の拡張

### API連携
現在はローカルストレージを使用していますが、実際の運用では以下を検討してください：

```typescript
// 見積もり送信API
POST /api/estimates
{
  // 既存項目...
  referralId: string | null,
  contactPreference?: 'line' | 'email'
}

// 連絡手段更新API
PATCH /api/estimates/:id/contact-preference
{
  contactPreference: 'line' | 'email'
}
```

### LINE Bot連携
- LINE Messaging APIを使用した自動応答
- 見積もり状況の通知
- カスタマーサポート

### 分析・追跡
- 紹介IDによるコンバージョン分析
- 連絡手段選択の傾向分析
- A/Bテストの実施
