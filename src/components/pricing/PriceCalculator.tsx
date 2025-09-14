/**
 * 料金計算コンポーネント
 * 統一された料金計算ロジックを使用（src/utils/pricing.tsから）
 */
'use client';

import { useState, useEffect } from 'react';
import { ITEM_CATEGORIES } from '@/constants/items';
import { 
  calculateEstimate, 
  calculateTotalPoints, 
  getRecommendedTruckTypes,
  formatPriceJPY,
  type CargoItem,
  type WorkOption,
  type EstimateResult
} from '@/utils/pricing';
import { ItemPoint, PricingRule, OptionItem } from '@/types/pricing';

interface PriceCalculationResult {
  totalPoints: number;
  estimatedPrice: number;
  truckSize: string;
  detailedEstimate: EstimateResult;
}

interface PriceCalculatorProps {
  items: Record<string, number>;
  boxOption?: string;
  boxCount?: number;
  distance?: number;
  selectedOptions?: string[];
  onCalculate?: (result: PriceCalculationResult) => void;
}

// 作業オプションの定義
const WORK_OPTIONS: WorkOption[] = [
  { name: '建物養生', price: 5000, selected: false },
  { name: '荷造り・荷ほどき代行', price: 8000, selected: false },
  { name: '家具・家電分解・組み立て', price: 10000, selected: false },
  { name: '洗濯機取り外し・取り付け', price: 3000, selected: false },
  { name: 'エアコン取り外し・取り付け', price: 15000, selected: false },
  { name: '照明・配線工事', price: 12000, selected: false },
  { name: '不用品回収・廃棄', price: 5000, selected: false },
  { name: 'ペット運搬', price: 3000, selected: false },
  { name: '特殊車両手配', price: 20000, selected: false },
];

export default function PriceCalculator({ 
  items, 
  boxOption = '', 
  boxCount = 0,
  distance = 0,
  selectedOptions = [],
  onCalculate 
}: PriceCalculatorProps) {
  const [calculationResult, setCalculationResult] = useState<PriceCalculationResult | null>(null);
  const [savedItemPoints, setSavedItemPoints] = useState<ItemPoint[]>([]);
  const [savedPricingRules, setSavedPricingRules] = useState<PricingRule[]>([]);
  const [savedOptions, setSavedOptions] = useState<OptionItem[]>([]);

  // LocalStorageから設定を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const itemPointsData = localStorage.getItem('itemPointSettings');
      if (itemPointsData) {
        setSavedItemPoints(JSON.parse(itemPointsData));
      }
      
      const pricingRulesData = localStorage.getItem('truckPricingRules');
      if (pricingRulesData) {
        setSavedPricingRules(JSON.parse(pricingRulesData));
      }
      
      const optionsData = localStorage.getItem('serviceOptions');
      if (optionsData) {
        setSavedOptions(JSON.parse(optionsData));
      }
    }
  }, []);

  // アイテムのポイントを取得（保存された設定を優先）
  const getItemPoints = (itemName: string): number => {
    // まず保存された設定から探す
    const savedItem = savedItemPoints.find(item => item.name === itemName);
    if (savedItem) {
      return savedItem.points;
    }
    
    // 保存された設定がない場合はデフォルト値を使用
    for (const category of ITEM_CATEGORIES) {
      const item = category.items.find(i => i.name === itemName);
      if (item) {
        return item.defaultPoints;
      }
    }
    return 0;
  };

  // 段ボールポイントの計算
  const getDanballPoints = (danballOption: string): number => {
    if (danballOption.includes('10箱未満')) return 5;
    if (danballOption.includes('10〜20箱')) return 10;
    if (danballOption.includes('21〜30箱')) return 15;
    if (danballOption.includes('31〜40箱')) return 20;
    if (danballOption.includes('41〜50箱')) return 25;
    if (danballOption.includes('51箱以上')) return boxCount > 50 ? Math.floor(boxCount / 10) * 5 : 40;
    return 0;
  };

  // 推奨トラック種別を取得（保存された料金ルールから）
  const getRecommendedTruck = (totalPoints: number): string => {
    if (savedPricingRules.length > 0) {
      // 保存された料金ルールから最適なトラックを選択
      const suitableRule = savedPricingRules.find(rule => 
        totalPoints >= rule.minPoint && 
        (rule.maxPoint === undefined || totalPoints <= rule.maxPoint)
      );
      if (suitableRule) {
        return suitableRule.truckType;
      }
    }
    
    // フォールバック：デフォルトロジックを使用
    const recommendations = getRecommendedTruckTypes(totalPoints, 0);
    return recommendations.length > 0 ? recommendations[0] : '軽トラック';
  };

  // 料金計算
  const calculateEstimateResult = (): PriceCalculationResult => {
    // CargoItem配列を作成
    const cargoItems: CargoItem[] = Object.entries(items)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemName, quantity]) => ({
        name: itemName,
        points: getItemPoints(itemName),
        quantity,
        weight: 0 // 重量は未使用
      }));

    // 段ボールポイントを追加
    if (boxOption) {
      const danballPoints = getDanballPoints(boxOption);
      if (danballPoints > 0) {
        cargoItems.push({
          name: '段ボール',
          points: danballPoints,
          quantity: 1,
          weight: 0
        });
      }
    }

    // 作業オプションを設定（保存された設定を優先）
    const workOptions: WorkOption[] = savedOptions.length > 0 
      ? savedOptions.map(option => ({
          name: option.label,
          price: option.price || 0,
          selected: selectedOptions.includes(option.label)
        }))
      : WORK_OPTIONS.map(option => ({
          ...option,
          selected: selectedOptions.includes(option.name)
        }));

    // 推奨トラック種別を取得
    const totalPoints = calculateTotalPoints(cargoItems);
    const recommendedTruck = getRecommendedTruck(totalPoints);

    // 詳細な見積もり計算
    const detailedEstimate = calculateEstimate({
      truckType: recommendedTruck,
      items: cargoItems,
      options: workOptions,
      distance: distance,
      timeSurcharges: [], // 時間帯追加料金は未使用
      taxRate: 0.1 // 10%
    });

    return {
      totalPoints,
      estimatedPrice: detailedEstimate.total,
      truckSize: recommendedTruck,
      detailedEstimate
    };
  };

  // 自動計算
  useEffect(() => {
    const result = calculateEstimateResult();
    setCalculationResult(result);
    if (onCalculate) {
      onCalculate(result);
    }
  }, [items, boxOption, boxCount, distance, selectedOptions, savedItemPoints, savedPricingRules, savedOptions]);

  return {
    calculationResult,
    calculateEstimate: calculateEstimateResult
  };
}

// フックとして使用する場合
export function usePriceCalculator(
  items: Record<string, number>, 
  boxOption?: string, 
  boxCount?: number,
  distance?: number,
  selectedOptions?: string[]
) {
  const [calculationResult, setCalculationResult] = useState<PriceCalculationResult | null>(null);
  const [savedItemPoints, setSavedItemPoints] = useState<ItemPoint[]>([]);
  const [savedPricingRules, setSavedPricingRules] = useState<PricingRule[]>([]);
  const [savedOptions, setSavedOptions] = useState<OptionItem[]>([]);

  // LocalStorageから設定を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const itemPointsData = localStorage.getItem('itemPointSettings');
      if (itemPointsData) {
        setSavedItemPoints(JSON.parse(itemPointsData));
      }
      
      const pricingRulesData = localStorage.getItem('truckPricingRules');
      if (pricingRulesData) {
        setSavedPricingRules(JSON.parse(pricingRulesData));
      }
      
      const optionsData = localStorage.getItem('serviceOptions');
      if (optionsData) {
        setSavedOptions(JSON.parse(optionsData));
      }
    }
  }, []);

  // アイテムのポイントを取得（保存された設定を優先）
  const getItemPoints = (itemName: string): number => {
    // まず保存された設定から探す
    const savedItem = savedItemPoints.find(item => item.name === itemName);
    if (savedItem) {
      return savedItem.points;
    }
    
    // 保存された設定がない場合はデフォルト値を使用
    for (const category of ITEM_CATEGORIES) {
      const item = category.items.find(i => i.name === itemName);
      if (item) {
        return item.defaultPoints;
      }
    }
    return 0;
  };

  // 段ボールポイントの計算
  const getDanballPoints = (danballOption: string): number => {
    if (danballOption.includes('10箱未満')) return 5;
    if (danballOption.includes('10〜20箱')) return 10;
    if (danballOption.includes('21〜30箱')) return 15;
    if (danballOption.includes('31〜40箱')) return 20;
    if (danballOption.includes('41〜50箱')) return 25;
    if (danballOption.includes('51箱以上')) return boxCount && boxCount > 50 ? Math.floor(boxCount / 10) * 5 : 40;
    return 0;
  };

  // 推奨トラック種別を取得（保存された料金ルールから）
  const getRecommendedTruck = (totalPoints: number): string => {
    if (savedPricingRules.length > 0) {
      // 保存された料金ルールから最適なトラックを選択
      const suitableRule = savedPricingRules.find(rule => 
        totalPoints >= rule.minPoint && 
        (rule.maxPoint === undefined || totalPoints <= rule.maxPoint)
      );
      if (suitableRule) {
        return suitableRule.truckType;
      }
    }
    
    // フォールバック：デフォルトロジックを使用
    const recommendations = getRecommendedTruckTypes(totalPoints, 0);
    return recommendations.length > 0 ? recommendations[0] : '軽トラック';
  };

  // 料金計算
  const calculateEstimateResult = (): PriceCalculationResult => {
    // CargoItem配列を作成
    const cargoItems: CargoItem[] = Object.entries(items)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemName, quantity]) => ({
        name: itemName,
        points: getItemPoints(itemName),
        quantity,
        weight: 0 // 重量は未使用
      }));

    // 段ボールポイントを追加
    if (boxOption) {
      const danballPoints = getDanballPoints(boxOption);
      if (danballPoints > 0) {
        cargoItems.push({
          name: '段ボール',
          points: danballPoints,
          quantity: 1,
          weight: 0
        });
      }
    }

    // 作業オプションを設定（保存された設定を優先）
    const workOptions: WorkOption[] = savedOptions.length > 0 
      ? savedOptions.map(option => ({
          name: option.label,
          price: option.price || 0,
          selected: selectedOptions?.includes(option.label) || false
        }))
      : WORK_OPTIONS.map(option => ({
          ...option,
          selected: selectedOptions?.includes(option.name) || false
        }));

    // 推奨トラック種別を取得
    const totalPoints = calculateTotalPoints(cargoItems);
    const recommendedTruck = getRecommendedTruck(totalPoints);

    // 詳細な見積もり計算
    const detailedEstimate = calculateEstimate({
      truckType: recommendedTruck,
      items: cargoItems,
      options: workOptions,
      distance: distance || 0,
      timeSurcharges: [], // 時間帯追加料金は未使用
      taxRate: 0.1 // 10%
    });

    return {
      totalPoints,
      estimatedPrice: detailedEstimate.total,
      truckSize: recommendedTruck,
      detailedEstimate
    };
  };

  // 自動計算
  useEffect(() => {
    const result = calculateEstimateResult();
    setCalculationResult(result);
  }, [items, boxOption, boxCount, distance, selectedOptions, savedItemPoints, savedPricingRules, savedOptions]);

  return {
    calculationResult,
    calculateEstimate: calculateEstimateResult
  };
}
