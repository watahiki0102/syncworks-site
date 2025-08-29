# 🧪 SyncWorks テスト実装ガイドライン

> **目的**: 高品質なテストコードの継続的実装のためのベストプラクティス集

## 🎯 **基本方針**

### **1. テスト戦略の優先順位**
```
🥇 Priority 1: ビジネスクリティカル機能
   - 見積もり計算 (pricing.ts)
   - ユーザー認証・認可
   - データ保存・読み込み

🥈 Priority 2: ユーザー体験直結UI
   - フォーム入力・バリデーション  
   - モーダル・ナビゲーション
   - 状態表示・フィードバック

🥉 Priority 3: 内部管理機能
   - 管理画面コンポーネント
   - レポート・分析機能
   - 設定・構成管理
```

### **2. カバレッジ目標**
| 機能種別 | 目標カバレッジ | 理由 |
|---------|---------------|------|
| **ビジネスロジック** | 95%+ | 計算エラー防止 |
| **UI コンポーネント** | 90%+ | ユーザー体験保証 |
| **ユーティリティ関数** | 95%+ | 共通機能の信頼性 |
| **管理機能** | 85%+ | 内部使用の安定性 |

## 🛠️ **テスト実装パターン**

### **1. Reactコンポーネントテスト**

#### **基本パターン**
```typescript
import { render, screen } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  describe('基本機能', () => {
    it('正常にレンダリングされる', () => {
      render(<ComponentName prop1="value1" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Props検証', () => {
    it('プロパティが正しく適用される', () => {
      const { container } = render(<ComponentName variant="primary" />);
      expect(container.firstChild).toHaveClass('primary-class');
    });
  });

  describe('状態管理', () => {
    it('状態変更が正しく反映される', async () => {
      render(<ComponentName />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('更新された状態')).toBeInTheDocument();
      });
    });
  });

  describe('エッジケース', () => {
    it('空の値でもエラーにならない', () => {
      expect(() => {
        render(<ComponentName value="" />);
      }).not.toThrow();
    });
  });
});
```

#### **DOM要素選択のベストプラクティス**
```typescript
// ✅ 推奨: container.firstChildを使用
const { container } = render(<Component />);
const element = container.firstChild as HTMLElement;

// ✅ 推奨: querySelector で具体的なクラス指定
const specificElement = container.querySelector('.target-class');

// ❌ 避ける: screen.getByText()で親要素を取得する複雑な操作
const wrongWay = screen.getByText('テキスト').closest('div')?.parentElement;
```

### **2. カスタムフックテスト**

#### **基本パターン**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.value).toBe(initialValue);
    expect(result.current.loading).toBe(false);
  });

  it('状態更新が正しく動作する', () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('新しい値');
    });
    
    expect(result.current.value).toBe('新しい値');
  });

  it('非同期処理が正しく動作する', async () => {
    const { result } = renderHook(() => useCustomHook());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

### **3. ユーティリティ関数テスト**

#### **純粋関数テスト**
```typescript
import { calculateTotal, formatCurrency } from '../utils';

describe('Utils Functions', () => {
  describe('calculateTotal', () => {
    const testCases = [
      { items: [10, 20, 30], expected: 60 },
      { items: [], expected: 0 },
      { items: [100], expected: 100 },
    ];

    testCases.forEach(({ items, expected }) => {
      it(`${JSON.stringify(items)} の合計が ${expected} になる`, () => {
        expect(calculateTotal(items)).toBe(expected);
      });
    });
  });

  describe('エッジケース', () => {
    it('負の値を含む配列でも正しく計算される', () => {
      expect(calculateTotal([10, -5, 15])).toBe(20);
    });

    it('非数値が混入してもエラーにならない', () => {
      expect(() => calculateTotal([10, 'invalid', 20])).not.toThrow();
    });
  });
});
```

## 🧩 **モック戦略**

### **1. 外部ライブラリのモック**
```typescript
// Lucide React アイコンライブラリ
jest.mock('lucide-react', () => ({
  Star: ({ className, style, ...props }: any) => (
    <div data-testid="star-icon" className={className} style={style} {...props} />
  ),
  ChevronDown: (props: any) => <div data-testid="chevron-down" {...props} />,
}));

// Next.js Router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/test',
    query: {},
  }),
}));
```

### **2. API呼び出しのモック**
```typescript
// API サービスのモック
jest.mock('../services/api', () => ({
  fetchUserData: jest.fn().mockResolvedValue({
    id: 1,
    name: 'テストユーザー',
  }),
  saveUserData: jest.fn().mockResolvedValue({ success: true }),
}));
```

## ⚡ **パフォーマンステスト**

### **1. 実行時間テスト**
```typescript
import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  it('大量データ処理が1秒以内に完了する', () => {
    const startTime = performance.now();
    
    const largeData = Array.from({ length: 10000 }, (_, i) => i);
    const result = processLargeData(largeData);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(1000); // 1秒以内
    expect(result).toBeDefined();
  });
});
```

### **2. メモリリークテスト**
```typescript
describe('Memory Tests', () => {
  it('メモリリークが発生しない', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 繰り返し処理
    for (let i = 0; i < 1000; i++) {
      createAndProcessData();
    }
    
    // ガベージコレクション実行（テスト環境で有効な場合）
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // メモリ増加が10MB以下
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## 📊 **カバレッジ測定のベストプラクティス**

### **1. 効率的なテスト実行**
```bash
# 🎯 推奨: 分割実行で安定性確保
npm run test:components    # UI コンポーネント
npm run test:hooks        # カスタムフック  
npm run test:utils        # ユーティリティ関数

# 🚀 高速実行: 特定パターンのみ
npm test -- --testPathPattern="pricing"
npm test -- --testPathPattern="components/admin"
```

### **2. CI/CD 統合設定**
```yaml
# .github/workflows/test.yml
name: Test Coverage
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with memory optimization
        run: |
          node --max-old-space-size=8192 node_modules/jest/bin/jest.js \
            --coverage \
            --watchAll=false \
            --maxWorkers=2 \
            --forceExit
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

## 🔧 **メモリ最適化設定**

### **1. Jest設定の最適化**
```javascript
// jest.config.js
module.exports = {
  // メモリ効率的な設定
  maxWorkers: 1,
  workerIdleMemoryLimit: '1024MB',
  
  // テストファイル パターン
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}',
  ],
  
  // カバレッジ除外
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/__tests__/',
    '\\.stories\\.',
  ],
  
  // タイムアウト設定
  testTimeout: 30000,
};
```

### **2. Package.json スクリプト**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:memory": "node --max-old-space-size=8192 node_modules/jest/bin/jest.js --coverage --watchAll=false --maxWorkers=1 --forceExit",
    "test:components": "node --max-old-space-size=6144 node_modules/jest/bin/jest.js --coverage --watchAll=false --maxWorkers=1 --testPathPattern=\"components.*test\" --forceExit",
    "test:critical": "npm test -- --testPathPattern=\"pricing|validation|auth\"",
    "test:ui": "npm test -- --testPathPattern=\"components/ui.*test\"",
    "test:admin": "npm test -- --testPathPattern=\"components/admin.*test\""
  }
}
```

## 📋 **チェックリスト**

### **新規コンポーネント追加時**
- [ ] 基本レンダリングテスト
- [ ] Props バリデーションテスト  
- [ ] 状態管理テスト
- [ ] イベントハンドリングテスト
- [ ] エッジケーステスト
- [ ] アクセシビリティテスト

### **新規機能追加時**
- [ ] ユニットテスト実装
- [ ] 統合テスト実装
- [ ] パフォーマンステスト（必要に応じて）
- [ ] カバレッジ確認（目標値達成）
- [ ] CI/CD パイプライン動作確認

### **リファクタリング時**
- [ ] 既存テストの動作確認
- [ ] 新しいロジックのテスト追加
- [ ] カバレッジ維持確認
- [ ] パフォーマンス影響確認

## 🚀 **継続的改善**

### **週次タスク**
- カバレッジレポート確認
- 失敗テストの原因分析
- 新規実装機能のテスト追加

### **月次タスク**  
- テスト実行時間の最適化検討
- 不要なテストコードの整理
- テスト戦略の見直し

### **四半期タスク**
- テストインフラの改善
- 新しいテスト手法の検討・導入
- チーム向けテスト勉強会開催

---

## 💡 **まとめ**

このガイドラインに従って、**継続的に高品質なテストを実装** し、SyncWorksプロジェクトの信頼性を向上させていきましょう。

**重要なのは完璧を目指すことではなく、着実に品質を向上させ続けることです。** 🎯