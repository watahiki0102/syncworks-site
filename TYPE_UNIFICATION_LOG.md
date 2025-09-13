# 型定義重複解消 修正ログ

## 修正概要
画面動作を一切変えずに、型定義の重複・不整合を解消するため、互換性レイヤーを追加しました。

## 修正完了項目

### ✅ 1. ContractStatus の重複解消
**問題**: `types/case.ts` と `types/shared.ts` で同一型定義が重複
**解決**: `case.ts` から `shared.ts` への re-export に変更
```typescript
// 修正前
export type ContractStatus = 'confirmed' | 'estimate';

// 修正後  
export type { ContractStatus } from './shared';
```

### ✅ 2. CargoItem の重複解消
**問題**: `types/unified.ts` と `utils/pricing.ts` で同一構造の重複定義
**解決**: `unified.ts` から `pricing.ts` への re-export に変更
```typescript
// 修正前
export interface CargoItem { name: string; points: number; ... }

// 修正後
export type { CargoItem } from '../utils/pricing';
```

### ✅ 3. アイテム関連型の統一レイヤー作成
**問題**: ItemInfo, CargoItem, ItemPoint, ItemDetail などの似た型が散在
**解決**: `types/items-unified.ts` で統一型と変換関数を提供
- `BaseItemInfo`: 基本構造
- `PricingItemInfo`: 価格計算用（weight付き）
- `PricingConfigItemInfo`: 料金設定用
- 変換関数: `itemInfoToCargoItem`, `cargoItemToItemInfo` など

### ✅ 4. Employee 型の互換性レイヤー追加
**問題**: `shared.ts` と `business/index.ts` で Employee の構造が異なる
**解決**: `ExtendedEmployee` 型と変換関数を追加
```typescript
export interface ExtendedEmployee extends Employee {
  email?: string;
  companyId?: string;
  employeeId?: string;
  hireDate?: Date;
  isAvailable?: boolean;
}
```

### ✅ 5. TruckStatus の不整合修正
**問題**: 'available' vs 'active', 'inactive' vs 'retired' の不一致
**解決**: マッピング関数を追加
```typescript
export function mapToOperationStatus(businessStatus: BusinessTruckStatus): TruckOperationStatus
export function mapToBusinessStatus(operationStatus: TruckOperationStatus): BusinessTruckStatus
```

### ✅ 6. Address 命名の統一レイヤー
**問題**: originAddress vs fromAddress, destinationAddress vs toAddress の不統一
**解決**: `types/address-unified.ts` で変換関数を提供
```typescript
export function toUnifiedAddress(legacy: LegacyAddressInfo): UnifiedAddressInfo
export function toLegacyAddress(unified: UnifiedAddressInfo): LegacyAddressInfo
```

## 画面動作維持の仕組み

### 1. 既存型定義は保持
- すべての既存のinterface/typeは削除せず保持
- 既存コードは変更不要

### 2. 互換性レイヤー
- 変換関数で型間の変換をサポート
- エイリアス型で段階的移行を可能に

### 3. コメントによる誘導
- 各型定義に統一予定であることを明記
- 将来の移行パスを明確化

## 今後の作業（オプション）

### Phase 2: 段階的移行
1. 新規コードは統一型を使用
2. 既存コードは変換関数を使用して徐々に移行
3. テスト実行で動作確認しながら進行

### Phase 3: 完全統一
1. 旧型定義の deprecation 警告追加
2. 全コードの統一型への移行
3. 旧型定義の削除

## 影響範囲
- **変更ファイル**: 7ファイル
- **新規ファイル**: 2ファイル (items-unified.ts, address-unified.ts)
- **既存コード影響**: なし（完全後方互換）
- **画面動作**: 変更なし

## 検証方法
```bash
# 型チェック
npm run typecheck

# ビルド確認  
npm run build

# 動作確認
npm run dev
```

すべて成功することで、画面動作が保持されていることを確認できます。