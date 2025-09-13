/**
 * 荷物アイテム関連の統一型定義
 * 既存コードとの互換性を保ちながら型定義を統一
 */

// 基本アイテム情報（ItemInfoと完全互換）
export interface BaseItemInfo {
  id: string;
  category: string;
  name: string;
  quantity: number;
  points: number;
  additionalCost?: number;
}

// 価格計算用アイテム（CargoItemの拡張版、既存と互換性維持）
export interface PricingItemInfo extends BaseItemInfo {
  weight?: number;  // CargoItemとの互換性
}

// 料金設定用アイテム（ItemPointと完全互換）
export interface PricingConfigItemInfo extends BaseItemInfo {
  defaultPoints: number;
  additionalCost: number;  // 必須フィールド化
}

// マスタ定義用アイテム（ItemDefinitionと互換）
export interface MasterItemInfo {
  name: string;
  defaultPoints: number;
  category?: string;  // オプション追加
}

// ビジネス用アイテム（MovingItemとの橋渡し）
export interface BusinessItemInfo extends BaseItemInfo {
  size?: 'S' | 'M' | 'L' | 'XL';
  weight?: number;
  isFragile?: boolean;
  requiresDisassembly?: boolean;
  notes?: string;
}

// 既存型との変換ユーティリティ

/**
 * ItemInfoからCargoItemへの変換（既存コード用）
 */
export function itemInfoToCargoItem(item: BaseItemInfo): {
  name: string;
  points: number;
  quantity: number;
  weight?: number;
} {
  return {
    name: item.name,
    points: item.points,
    quantity: item.quantity,
    weight: (item as any).weight
  };
}

/**
 * CargoItemからItemInfoへの変換
 */
export function cargoItemToItemInfo(item: {
  name: string;
  points: number;
  quantity: number;
  weight?: number;
}, id: string = '', category: string = ''): BaseItemInfo {
  return {
    id,
    category,
    name: item.name,
    quantity: item.quantity,
    points: item.points,
    additionalCost: 0
  };
}

/**
 * ItemDefinitionからBaseItemInfoへの変換
 */
export function itemDefinitionToItemInfo(
  definition: { name: string; defaultPoints: number },
  id: string,
  category: string,
  quantity: number = 1
): BaseItemInfo {
  return {
    id,
    category,
    name: definition.name,
    quantity,
    points: definition.defaultPoints,
    additionalCost: 0
  };
}

// 型ガード関数
export function isBaseItemInfo(item: any): item is BaseItemInfo {
  return item && 
    typeof item.id === 'string' &&
    typeof item.category === 'string' &&
    typeof item.name === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.points === 'number';
}

export function isPricingConfigItemInfo(item: any): item is PricingConfigItemInfo {
  return isBaseItemInfo(item) &&
    typeof (item as any).defaultPoints === 'number' &&
    typeof item.additionalCost === 'number';
}

// 後方互換性のためのエイリアス
export type UnifiedItemInfo = BaseItemInfo;
export type UnifiedCargoItem = PricingItemInfo;
export type UnifiedItemPoint = PricingConfigItemInfo;
export type UnifiedItemDetail = BaseItemInfo;  // ItemDetailと同等