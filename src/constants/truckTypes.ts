/**
 * トラック種別の定数定義
 * 引っ越し業界で使用される標準的なトラック種別を定義
 */

export interface TruckTypeDefinition {
  id: string;
  name: string;
  displayName: string;
  capacityKg: number;
  maxPoints: number;
  description: string;
}

/**
 * 利用可能なトラック種別の定義
 * 各トラック種別の積載量と最大荷物ポイントを設定
 */
export const TRUCK_TYPES: TruckTypeDefinition[] = [
  {
    id: '2tショート',
    name: '2tショート',
    displayName: '2トンショート',
    capacityKg: 1000,
    maxPoints: 50,
    description: '小型引っ越しに適した2トンショートトラック'
  },
  {
    id: '2tロング',
    name: '2tロング',
    displayName: '2トンロング',
    capacityKg: 1500,
    maxPoints: 75,
    description: '中型引っ越しに適した2トンロングトラック'
  },
  {
    id: '4t',
    name: '4t',
    displayName: '4トン',
    capacityKg: 2000,
    maxPoints: 100,
    description: '大型引っ越しに適した4トントラック'
  },
  {
    id: '6t',
    name: '6t',
    displayName: '6トン',
    capacityKg: 3000,
    maxPoints: 150,
    description: '大規模引っ越しに適した6トントラック'
  },
  {
    id: '10t',
    name: '10t',
    displayName: '10トン',
    capacityKg: 5000,
    maxPoints: 250,
    description: '超大規模引っ越しに適した10トントラック'
  }
];

/**
 * トラック種別のID一覧
 */
export const TRUCK_TYPE_IDS = TRUCK_TYPES.map(type => type.id);

/**
 * トラック種別の表示名一覧
 */
export const TRUCK_TYPE_NAMES = TRUCK_TYPES.map(type => type.displayName); 