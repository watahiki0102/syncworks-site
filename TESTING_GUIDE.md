# 機能テストガイド

## 実装完了した機能

### 1. 紹介ID（referralId）機能
- URLパラメータ`?ref=<紹介ID>`から紹介IDを取得
- フォームデータに自動的に含まれる
- 送信データに保存される

### 2. 連絡手段選択機能
- 送信完了後にLINE/メールの選択画面を表示
- 選択結果を保存
- LINE選択時の環境変数対応

## テスト手順

### 準備
1. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev
```

2. ブラウザでアクセス
```
http://localhost:3000/form/step1?ref=TEST123
```

### テスト1: 紹介IDの取得と保存

#### 手順
1. 上記URLでStep1ページにアクセス
2. 基本情報を入力（必須項目のみ）
3. Step2、Step3に進む
4. 最終送信を実行

#### 確認ポイント
- [ ] Step1ページが正常に表示される
- [ ] 紹介ID「TEST123」がURLパラメータから取得される
- [ ] フォームデータにreferralIdが含まれる
- [ ] 送信完了画面に遷移する

#### デバッグ方法
ブラウザのDevTools > Consoleで以下を確認：
```javascript
// ローカルストレージの内容確認
console.log(JSON.parse(localStorage.getItem('formStep1')));
console.log(JSON.parse(localStorage.getItem('formSubmissions')));
```

### テスト2: 連絡手段選択

#### 手順
1. 送信完了画面で「LINEで受け取る」をクリック
2. 動作を確認
3. ブラウザの戻るボタンで完了画面に戻る
4. 「メールで受け取る」をクリック
5. 動作を確認

#### 確認ポイント
- [ ] 連絡手段選択画面が表示される
- [ ] LINE選択時の動作（環境変数なしの場合）
- [ ] メール選択時の動作
- [ ] 選択結果がローカルストレージに保存される
- [ ] 選択完了後のメッセージ表示

#### デバッグ方法
```javascript
// 連絡手段選択後のデータ確認
const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
console.log('最新の送信データ:', submissions[submissions.length - 1]);
```

### テスト3: 環境変数ありでのLINE連携

#### 手順
1. `.env.local`ファイルを作成
```bash
NEXT_PUBLIC_LINE_CONNECT_URL=https://line.me/R/ti/p/@test-account
```

2. サーバーを再起動
3. 再度フォーム送信から完了まで実行
4. LINE選択時の動作を確認

#### 確認ポイント
- [ ] 環境変数が正しく読み込まれる
- [ ] LINE選択時に指定URLに遷移する
- [ ] 新しいタブで開く

### テスト4: エラーケース

#### 手順
1. 紹介IDなしでアクセス（`/form/step1`）
2. フォーム送信を実行
3. 完了画面での表示を確認

#### 確認ポイント
- [ ] 紹介IDなしでも正常に動作する
- [ ] referralIdがnullとして保存される
- [ ] 完了画面で紹介IDが表示されない

## 期待される動作

### 正常フロー
```
/form/step1?ref=ABC123
↓
Step1入力 → Step2入力 → Step3入力
↓
送信実行
↓
/form/complete?ticket=submission-123
↓
連絡手段選択（LINE/メール）
↓
選択完了
```

### データ保存
```json
{
  "id": "submission-123",
  "referralId": "ABC123",
  "contactPreference": "line",
  "customerName": "田中 太郎",
  "estimatedPrice": 45000,
  // その他のデータ...
}
```

## トラブルシューティング

### よくある問題

#### 1. 紹介IDが取得できない
- URLパラメータの形式を確認（`?ref=ABC123`）
- `useSearchParams`の動作確認
- ブラウザのキャッシュクリア

#### 2. 連絡手段選択が表示されない
- 完了画面のURLパラメータ確認（`?ticket=<id>`）
- ローカルストレージのデータ確認
- 送信処理の成功確認

#### 3. 環境変数が読み込まれない
- `.env.local`ファイルの場所確認
- ファイル名のスペルミス確認
- サーバーの再起動

#### 4. TypeScriptエラー
```bash
# 型チェック
npx tsc --noEmit

# リンター
npx eslint .
```

## パフォーマンス確認

### 1. ページ読み込み速度
- Step1ページの初期表示
- 完了画面のデータ読み込み

### 2. メモリ使用量
- ローカルストレージの使用量
- フォームデータのサイズ

### 3. ユーザビリティ
- フォーム入力の流れ
- エラーメッセージの表示
- レスポンシブ対応

## 完了条件

すべてのテストが成功し、以下が確認できれば実装完了です：

- [ ] 紹介ID付きURLでの正常動作
- [ ] 紹介IDなしURLでの正常動作
- [ ] 連絡手段選択の正常表示
- [ ] LINE/メール選択の正常動作
- [ ] データの正常保存
- [ ] TypeScriptエラーなし
- [ ] リンターエラーなし
- [ ] 環境変数対応の動作確認
