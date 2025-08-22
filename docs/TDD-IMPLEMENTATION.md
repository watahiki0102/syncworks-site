# TDD実装ガイド

## 概要

t-wadaさんの提唱するTDD（テスト駆動開発）アプローチに基づいて、既存のコードベースを大幅にリファクタリングしました。UIUXを一切変更せず、内部品質・保守性・テスタビリティを向上させました。

## アーキテクチャの改善

### 1. 純粋関数の分離 (`src/lib/pure-functions.ts`)

副作用のない純粋関数を集約し、完全にテスト可能な設計を実現しました。

```typescript
// 例: 税込み価格計算
export const calculateTaxIncluded = (basePrice: number, taxRate: number): number => {
  if (basePrice < 0) throw new Error('基本価格は0以上である必要があります');
  if (taxRate < 0 || taxRate > 1) throw new Error('税率は0から1の間である必要があります');
  
  return Math.floor(basePrice * (1 + taxRate));
};
```

**特徴:**
- 同じ入力に対して常に同じ出力
- 副作用なし
- 100%テスト可能
- エラー条件の明確化

### 2. ビジネスロジックの抽出 (`src/lib/business-logic.ts`)

純粋関数を組み合わせた高レベルなドメインロジックを実装しました。

```typescript
// 例: 引越し見積もりの計算
export const calculateMovingEstimate = (params: EstimateParams) => {
  // バリデーション（純粋関数）
  validateEstimateParams(params);
  
  // 計算（純粋関数の組み合わせ）
  const baseFare = calculateBaseFare(params.distance, baseRate);
  const fareWithSurcharge = calculateTimeSurcharge(baseFare, params.timeSlot);
  const total = calculateTaxIncluded(subtotal, params.taxRate);
  
  return { baseFare, total, /* ... */ };
};
```

**特徴:**
- 複雑なビジネスルールを純粋関数で表現
- 副作用は外部から注入
- テスト時にモック化しやすい構造

### 3. サービス層の分離 (`src/lib/services.ts`)

副作用（I/O操作）を含む層を依存性注入可能な設計にしました。

```typescript
export class EstimateService {
  constructor(
    private apiClient: ApiClient,
    private notificationService: NotificationService,
    private storageService: StorageService
  ) {}

  async createEstimate(data: EstimateData) {
    // ビジネスロジックで計算（純粋関数）
    const estimate = businessLogic.calculateMovingEstimate(data);
    
    // 副作用（依存性注入されたサービス）
    await this.apiClient.post('/api/estimates', estimate);
    await this.notificationService.sendEmail(/* ... */);
    
    return { success: true, estimate };
  }
}
```

**特徴:**
- 依存性注入による疎結合
- テスト時に簡単にモック化可能
- 副作用の分離

## テスト戦略

### 1. 純粋関数のユニットテスト

```typescript
describe('mathUtils.calculateTaxIncluded', () => {
  test('正常な税込み価格を計算', () => {
    expect(calculateTaxIncluded(1000, 0.1)).toBe(1100);
  });
  
  test('境界値のテスト', () => {
    expect(calculateTaxIncluded(0, 0.1)).toBe(0);
  });
  
  test('不正な値でエラーを投げる', () => {
    expect(() => calculateTaxIncluded(-1, 0.1))
      .toThrow('基本価格は0以上である必要があります');
  });
});
```

**カバレッジ:**
- 正常ケース
- 境界値テスト
- エラーケース
- エッジケース

### 2. ビジネスロジックのテスト

```typescript
describe('movingEstimateLogic.calculateMovingEstimate', () => {
  test('正常な見積もり計算', () => {
    const result = calculateMovingEstimate(validParams);
    expect(result.total).toBeGreaterThan(result.subtotal);
  });
  
  test('時間帯割増の適用', () => {
    const morningResult = calculateMovingEstimate({ ...params, timeSlot: 'early_morning' });
    const normalResult = calculateMovingEstimate({ ...params, timeSlot: 'normal' });
    expect(morningResult.timeSurcharge).toBeGreaterThan(normalResult.timeSurcharge);
  });
});
```

### 3. サービス層のモックテスト

```typescript
describe('EstimateService', () => {
  let service: EstimateService;
  const mockApiClient = { post: jest.fn(), get: jest.fn() };
  
  beforeEach(() => {
    service = new EstimateService(mockApiClient, mockNotificationService, mockStorageService);
  });
  
  test('正常な見積もり作成フロー', async () => {
    mockApiClient.post.mockResolvedValue({ id: 'estimate_123' });
    
    const result = await service.createEstimate(validData);
    
    expect(result.success).toBe(true);
    expect(mockApiClient.post).toHaveBeenCalledWith('/api/estimates', expect.any(Object));
  });
});
```

## パフォーマンス最適化

### 1. 純粋関数の最適化

```typescript
test('大量の税計算処理', () => {
  const startTime = performance.now();
  
  for (let i = 0; i < 10000; i++) {
    calculateTaxIncluded(1000 + i, 0.1);
  }
  
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100); // 100ms以内
});
```

### 2. 並行処理の活用

```typescript
test('並行見積もり計算', async () => {
  const estimates = Array.from({ length: 100 }, (_, i) => 
    Promise.resolve(calculateMovingEstimate({ ...params, distance: 50 + i }))
  );
  
  const results = await Promise.all(estimates);
  expect(results).toHaveLength(100);
});
```

## TDDサイクルの実践

### Red-Green-Refactor サイクル

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く  
3. **Refactor**: コードを改善（テストは通したまま）

### 例: 新機能追加のTDDフロー

```typescript
// 1. Red: 失敗するテストを書く
test('割引率計算', () => {
  expect(calculateDiscountRate(1000, 100)).toBe(0.1);
});

// 2. Green: 最小限のコードでテストを通す
export const calculateDiscountRate = (original: number, discounted: number): number => {
  return (original - discounted) / original;
};

// 3. Refactor: エラーハンドリングを追加
export const calculateDiscountRate = (original: number, discounted: number): number => {
  if (original <= 0) throw new Error('元価格は正の数である必要があります');
  if (discounted < 0) throw new Error('割引後価格は0以上である必要があります');
  
  return (original - discounted) / original;
};
```

## 品質メトリクス

### テストカバレッジ目標

- **純粋関数**: 95%以上
- **ビジネスロジック**: 90%以上  
- **サービス層**: 80%以上

### パフォーマンス基準

- **純粋関数**: 1万回実行が100ms以内
- **ビジネスロジック**: 1000回実行が200ms以内
- **サービス層**: モック使用時100ms以内

## 実行方法

```bash
# テスト実行
npm test

# 監視モード
npm run test:watch

# カバレッジレポート
npm run test:coverage

# TypeScript型チェック
npx tsc --noEmit
```

## ファイル構造

```
src/lib/
├── pure-functions.ts          # 純粋関数
├── business-logic.ts          # ビジネスロジック
├── services.ts               # サービス層
├── error-handling.ts         # エラーハンドリング
├── __tests__/
│   ├── pure-functions.test.ts      # 純粋関数テスト
│   ├── business-logic.test.ts      # ビジネスロジックテスト  
│   ├── services.test.ts            # サービス層テスト
│   ├── error-handling.test.ts      # エラーハンドリングテスト
│   └── performance.test.ts         # パフォーマンステスト
├── jest.config.js            # Jest設定
└── jest.setup.js            # テストセットアップ
```

## まとめ

この実装により以下を実現しました：

✅ **完全なテストカバレッジ**: 純粋関数は100%テスト可能  
✅ **高いメンテナンス性**: 責任分離と依存性注入  
✅ **優れたパフォーマンス**: 最適化された純粋関数  
✅ **堅牢なエラーハンドリング**: 包括的なエラー管理  
✅ **スケーラブルな設計**: 新機能追加が容易  
✅ **UIUXの保持**: 既存の機能・レイアウトは完全に保持

t-wadaさんのTDDプリンシパルに従い、テストファーストの開発サイクルで継続的な品質向上が可能な基盤を構築しました。