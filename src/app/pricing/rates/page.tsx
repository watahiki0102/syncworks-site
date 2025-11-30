/**
 * 料金基準設定ページコンポーネント
 * - 荷物ポイント設定と料金設定の統合画面
 * - トグル形式で機能を切り替え
 * - 全ての機能を保持
 */
'use client';

import { useState, useEffect, useReducer, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PricingRule, OptionItem, ItemPoint } from '@/types/pricing';
import { SimulationPanel } from '@/components/pricing';
import { ITEM_CATEGORIES } from '@/constants/items';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

// トラック種別は料金設定から動的に取得されるため、定数としての定義は不要
// 料金設定テーブルで入力されたトラック種別がuniqueTruckTypesとして使用される
// デフォルト値はAPIから取得したデータを使用

/**
 * ポイント範囲の定義（1～9999、1刻みで詳細設定可能）
 */
const POINT_RANGE = Array.from({ length: 9999 }, (_, i) => i + 1);

/**
 * デフォルト距離料金（より実用的な距離料金設定）
 */
const DEFAULT_DISTANCE_RANGES = [
  { maxDistance: 5, basePrice: 0 },
  { maxDistance: 10, basePrice: 1500 },
  { maxDistance: 20, basePrice: 3000 },
  { maxDistance: 30, basePrice: 5000 },
  { maxDistance: 50, basePrice: 8000 },
  { maxDistance: 100, basePrice: 12000 },
  { maxDistance: 200, basePrice: 18000 },
  { maxDistance: 999, basePrice: 25000 },
];

/**
 * 車種係数の型定義
 */
interface TruckCoefficient {
  id: string;              // 係数ID
  truckType: string;       // トラック種別
  coefficient: number;     // 係数値
}

/**
 * 距離範囲の型定義
 */
interface DistanceRange {
  id: string;              // 範囲ID
  maxDistance: number;     // 最大距離のみ指定
  basePrice: number;       // 基本加算額（軽トラ基準）
}

/**
 * オプションタイプの定義
 */
const OPTION_TYPES = [
  { value: 'free', label: '無料オプション', color: 'text-green-600' },
  { value: 'paid', label: '定額オプション', color: 'text-blue-600' },
  { value: 'individual', label: '個別見積もり', color: 'text-blue-600' },
  { value: 'nonSupported', label: '対応不可', color: 'text-red-600' },
] as const;

/**
 * オプションタイプの型定義
 */
type OptionType = typeof OPTION_TYPES[number]['value'];

/**
 * デフォルトオプション設定（より実用的なオプション設定）
 */
const DEFAULT_OPTIONS: OptionItem[] = [
  { id: 'opt-1', label: '🏠 建物養生（壁や床の保護）', type: 'free', isDefault: true },
  { id: 'opt-2', label: '📦 荷造り・荷ほどきの代行', type: 'paid', price: 3000, isDefault: true },
  { id: 'opt-3', label: '🪑 家具・家電の分解・組み立て', type: 'paid', price: 5000, isDefault: true },
  { id: 'opt-4', label: '🧺 洗濯機取り外し・取り付け', type: 'paid', price: 2000, isDefault: true },
  { id: 'opt-5', label: '❄️ エアコン（本体＋室外機）取り外し・取り付け', type: 'paid', price: 8000, isDefault: true },
  { id: 'opt-6', label: '💡 照明・テレビ配線取り外し・取り付け', type: 'paid', price: 3000, isDefault: true },
  { id: 'opt-7', label: '🚮 不用品の回収・廃棄', type: 'individual', isDefault: true },
  { id: 'opt-8', label: '🐾 ペット運搬', type: 'paid', price: 2000, isDefault: true },
  { id: 'opt-9', label: '🚚 特殊車両の手配', type: 'individual', isDefault: true },
  { id: 'opt-10', label: '📦 段ボール提供', type: 'paid', price: 500, isDefault: true },
  { id: 'opt-11', label: '🕐 夜間・早朝作業', type: 'paid', price: 10000, isDefault: true },
  { id: 'opt-12', label: '🏢 オフィス移転', type: 'paid', price: 15000, isDefault: true },
];

export default function PricingRatesPage() {
  const router = useRouter();
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<OptionItem[]>(DEFAULT_OPTIONS);

  // 荷物ポイント設定用のstate
  const [itemPoints, setItemPoints] = useState<ItemPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // シミュレーション機能用のstate
  const [isSimulationEnabled, setIsSimulationEnabled] = useState(false);
  const [simulationItems, setSimulationItems] = useState<Array<{ id: string, name: string, points: number, quantity: number }>>([]);

  // サイドバーの折りたたみ状態
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // オプション追加フォーム用のreducer
  interface OptionFormState {
    newOptionLabel: string;
    newOptionType: OptionType;
    newOptionPrice: number;
    newOptionUnit: string;
    newOptionRemarks: string;
    newOptionMinPoint: number;
    newOptionMaxPoint: number;
    optionErrors: { [optionId: string]: string };
    optionAddError: string;
  }

  type OptionFormAction =
    | { type: 'SET_NEW_OPTION_LABEL'; payload: string }
    | { type: 'SET_NEW_OPTION_TYPE'; payload: OptionType }
    | { type: 'SET_NEW_OPTION_PRICE'; payload: number }
    | { type: 'SET_NEW_OPTION_UNIT'; payload: string }
    | { type: 'SET_NEW_OPTION_REMARKS'; payload: string }
    | { type: 'SET_NEW_OPTION_MIN_POINT'; payload: number }
    | { type: 'SET_NEW_OPTION_MAX_POINT'; payload: number }
    | { type: 'SET_ERRORS'; payload: { [optionId: string]: string } }
    | { type: 'SET_ADD_ERROR'; payload: string }
    | { type: 'RESET_FORM' };

  const initialOptionFormState: OptionFormState = {
    newOptionLabel: '',
    newOptionType: 'free',
    newOptionPrice: 0,
    newOptionUnit: '',
    newOptionRemarks: '',
    newOptionMinPoint: 1,
    newOptionMaxPoint: 100,
    optionErrors: {},
    optionAddError: ''
  };

  function optionFormReducer(state: OptionFormState, action: OptionFormAction): OptionFormState {
    switch (action.type) {
      case 'SET_NEW_OPTION_LABEL':
        return { ...state, newOptionLabel: action.payload };
      case 'SET_NEW_OPTION_TYPE':
        return { ...state, newOptionType: action.payload };
      case 'SET_NEW_OPTION_PRICE':
        return { ...state, newOptionPrice: action.payload };
      case 'SET_NEW_OPTION_UNIT':
        return { ...state, newOptionUnit: action.payload };
      case 'SET_NEW_OPTION_REMARKS':
        return { ...state, newOptionRemarks: action.payload };
      case 'SET_NEW_OPTION_MIN_POINT':
        return { ...state, newOptionMinPoint: action.payload };
      case 'SET_NEW_OPTION_MAX_POINT':
        return { ...state, newOptionMaxPoint: action.payload };
      case 'SET_ERRORS':
        return { ...state, optionErrors: action.payload };
      case 'SET_ADD_ERROR':
        return { ...state, optionAddError: action.payload };
      case 'RESET_FORM':
        return initialOptionFormState;
      default:
        return state;
    }
  }

  const [optionFormState, optionFormDispatch] = useReducer(optionFormReducer, initialOptionFormState);
  const [newPricingMaxPoint, setNewPricingMaxPoint] = useState<number | undefined>(undefined);
  const [newPricingPrice, setNewPricingPrice] = useState<number | undefined>(undefined);

  /**
   * ソート用のstate
   */
  const [sortField, setSortField] = useState<'truckType' | 'minPoint' | 'maxPoint' | 'price'>('minPoint');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  /**
   * 料金設定追加用state
   */
  const [newTruckType, setNewTruckType] = useState<string>('');
  const [pricingErrors, setPricingErrors] = useState<string[]>([]);
  const [_setRowErrorIds] = useState<Set<string>>(new Set());

  /**
   * 車種係数設定用state
   */
  const [truckCoefficients, setTruckCoefficients] = useState<TruckCoefficient[]>([]);
  const [distanceRanges, setDistanceRanges] = useState<DistanceRange[]>([]);

  // シミュレーション機能の関数
  const addSimulationItem = (item: { id: string, name: string, points: number, quantity?: number }) => {
    setSimulationItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: item.quantity || i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeSimulationItem = (id: string) => {
    setSimulationItems(prev => prev.filter(item => item.id !== id));
  };

  const updateSimulationQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeSimulationItem(id);
      return;
    }
    setSimulationItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const clearSimulation = () => {
    setSimulationItems([]);
  };

  // 荷物ポイント設定用の関数
  const updatePoints = (id: string, points: number) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, points: Math.max(0, points) } : item
    ));
  };

  const updateAdditionalCost = (id: string, cost: number) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, additionalCost: Math.max(0, cost) } : item
    ));
  };

  const resetToDefault = (id: string) => {
    setItemPoints(itemPoints.map(item =>
      item.id === id ? { ...item, points: item.defaultPoints, additionalCost: 0 } : item
    ));
  };

  const filteredItems = itemPoints.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...ITEM_CATEGORIES.map(cat => cat.category)];

  /**
   * 初期データの読み込み
   * - 荷物ポイント設定、料金ルール、車種係数、距離料金、オプション設定を復元
   */
  useEffect(() => {
    // 荷物ポイント設定の読み込み
    const DATA_VERSION = 'v2.3';
    const savedVersion = typeof window !== 'undefined' ? localStorage.getItem('itemPointSettings_version') : null;

    if (savedVersion !== DATA_VERSION) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('itemPointSettings');
        localStorage.setItem('itemPointSettings_version', DATA_VERSION);
      }
    }

    const savedPoints = typeof window !== 'undefined' ? localStorage.getItem('itemPointSettings') : null;
    if (savedPoints) {
      setItemPoints(JSON.parse(savedPoints));
    } else {
      // 新しいデフォルトポイントを設定
      const defaultPoints = ITEM_CATEGORIES.flatMap(category =>
        category.items.map((item, index) => {
          let realPoints = item.defaultPoints;

          if (category.category === '大型家具') {
            if (item.name.includes('ベッド')) {
              realPoints = item.name.includes('シングル') ? 20 :
                item.name.includes('セミダブル') ? 25 :
                  item.name.includes('ダブル') ? 30 :
                    item.name.includes('クイーン') ? 35 :
                      item.name.includes('キング') ? 40 :
                        item.name.includes('2段') ? 32 : 25;
            } else if (item.name.includes('ソファ')) {
              realPoints = item.name.includes('1人') ? 12 :
                item.name.includes('2人') ? 20 :
                  item.name.includes('3人') ? 28 :
                    item.name.includes('L字') ? 32 : 20;
            } else if (item.name.includes('テーブル')) {
              realPoints = item.name.includes('小') ? 6 :
                item.name.includes('中') ? 12 :
                  item.name.includes('大') ? 20 :
                    item.name.includes('ダイニング') ? 16 :
                      item.name.includes('こたつ') ? 14 : 12;
            } else if (item.name.includes('タンス') || item.name.includes('クローゼット')) {
              realPoints = item.name.includes('大') ? 24 :
                item.name.includes('中') ? 16 :
                  item.name.includes('小') ? 12 : 16;
            } else if (item.name.includes('本棚')) {
              realPoints = item.name.includes('大') ? 12 :
                item.name.includes('中') ? 8 :
                  item.name.includes('小') ? 5 : 8;
            } else if (item.name.includes('デスク')) {
              realPoints = item.name.includes('大') ? 10 :
                item.name.includes('学習') ? 8 :
                  item.name.includes('パソコン') ? 6 : 8;
            } else if (item.name.includes('食器棚')) {
              realPoints = 15;
            } else if (item.name.includes('キャビネット')) {
              realPoints = 10;
            } else if (item.name.includes('チェスト')) {
              realPoints = 8;
            } else if (item.name.includes('ワードローブ')) {
              realPoints = 20;
            } else {
              realPoints = 10;
            }
          } else if (category.category === '家電製品') {
            if (item.name.includes('冷蔵庫')) {
              realPoints = item.name.includes('小') ? 6 :
                item.name.includes('中') ? 10 :
                  item.name.includes('大') ? 15 :
                    item.name.includes('業務用') ? 20 : 10;
            } else if (item.name.includes('洗濯機')) {
              realPoints = item.name.includes('ドラム') ? 8 :
                item.name.includes('縦型') ? 6 :
                  item.name.includes('二槽式') ? 5 : 6;
            } else if (item.name.includes('テレビ')) {
              realPoints = item.name.includes('32インチ以下') ? 3 :
                item.name.includes('43インチ') ? 5 :
                  item.name.includes('55インチ') ? 7 :
                    item.name.includes('65インチ以上') ? 10 :
                      item.name.includes('小') ? 3 :
                        item.name.includes('中') ? 5 :
                          item.name.includes('大') ? 8 : 5;
            } else if (item.name.includes('エアコン')) {
              realPoints = 5;
            } else if (item.name.includes('電子レンジ')) {
              realPoints = 2;
            } else if (item.name.includes('炊飯器')) {
              realPoints = 1;
            } else if (item.name.includes('掃除機')) {
              realPoints = 2;
            } else if (item.name.includes('オーブン')) {
              realPoints = 3;
            } else if (item.name.includes('食洗機')) {
              realPoints = 4;
            } else if (item.name.includes('プリンター')) {
              realPoints = 2;
            } else if (item.name.includes('パソコン')) {
              realPoints = 1;
            } else if (item.name.includes('ステレオ')) {
              realPoints = 3;
            } else {
              realPoints = 3;
            }
          } else if (category.category === '小型家具') {
            if (item.name.includes('椅子')) {
              realPoints = item.name.includes('オフィス') ? 3 :
                item.name.includes('ダイニング') ? 2 :
                  item.name.includes('折りたたみ') ? 1 : 2;
            } else if (item.name.includes('スツール')) {
              realPoints = 1;
            } else if (item.name.includes('サイドテーブル')) {
              realPoints = 2;
            } else if (item.name.includes('コーヒーテーブル')) {
              realPoints = 3;
            } else if (item.name.includes('ラック')) {
              realPoints = 4;
            } else if (item.name.includes('カラーボックス')) {
              realPoints = 3;
            } else if (item.name.includes('ハンガーラック')) {
              realPoints = 2;
            } else {
              realPoints = 3;
            }
          } else if (category.category === '特殊荷物') {
            if (item.name.includes('ピアノ')) {
              realPoints = item.name.includes('グランド') ? 50 :
                item.name.includes('アップライト') ? 35 :
                  item.name.includes('電子') ? 8 : 35;
            } else if (item.name.includes('金庫')) {
              realPoints = item.name.includes('大') ? 25 :
                item.name.includes('中') ? 15 :
                  item.name.includes('小') ? 8 : 15;
            } else if (item.name.includes('仏壇')) {
              realPoints = 12;
            } else if (item.name.includes('神棚')) {
              realPoints = 3;
            } else if (item.name.includes('美術品')) {
              realPoints = 5;
            } else {
              realPoints = 10;
            }
          } else {
            realPoints = Math.max(item.defaultPoints, 2);
          }

          return {
            id: `${category.category}-${index}`,
            category: category.category,
            name: item.name,
            points: realPoints,
            defaultPoints: realPoints,
            additionalCost: 0
          };
        })
      );
      setItemPoints(defaultPoints);
    }

    // 料金設定の読み込み（APIから取得したトラック種別を使用）
    const loadPricingAndTruckTypes = async () => {
      try {
        const response = await fetch('/api/truck-types');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          // トラック係数を設定
          const dbCoefficients = result.data.map((t: { id: string; name: string; coefficient: number }) => ({
            id: t.id,
            truckType: t.name,
            coefficient: t.coefficient
          }));
          setTruckCoefficients(dbCoefficients);

          // 料金設定を読み込み（localStorageを優先）
          const savedPricing = typeof window !== 'undefined' ? localStorage.getItem('truckPricingRules') : null;
          if (savedPricing) {
            setPricingRules(JSON.parse(savedPricing));
          } else {
            // APIから取得したデータでデフォルト料金を設定
            let cumulativePoint = 0;
            const defaultPricing = result.data.map((t: { id: string; name: string; basePrice: number; maxPoints: number }, index: number) => {
              const minPoint = cumulativePoint + 1;
              const maxPoint = t.maxPoints || (minPoint + 49);
              cumulativePoint = maxPoint;
              return {
                id: `pricing-${index}`,
                truckType: t.name,
                minPoint,
                maxPoint,
                price: t.basePrice || 15000
              };
            });
            setPricingRules(defaultPricing);
          }
          return;
        }
      } catch {
        console.warn('APIからの取得に失敗、localStorageを使用');
      }

      // APIから取得できなかった場合はlocalStorageを使用
      const savedPricing = typeof window !== 'undefined' ? localStorage.getItem('truckPricingRules') : null;
      if (savedPricing) {
        setPricingRules(JSON.parse(savedPricing));
      }

      const savedCoefficients = typeof window !== 'undefined' ? localStorage.getItem('truckCoefficients') : null;
      if (savedCoefficients) {
        setTruckCoefficients(JSON.parse(savedCoefficients));
      }
    };
    loadPricingAndTruckTypes();

    // 距離料金の読み込み
    const savedDistance = typeof window !== 'undefined' ? localStorage.getItem('distanceRanges') : null;
    if (savedDistance) {
      setDistanceRanges(JSON.parse(savedDistance));
    } else {
      const defaultDistance = DEFAULT_DISTANCE_RANGES.map((range, index) => ({
        id: `dist-${index}`,
        maxDistance: range.maxDistance,
        basePrice: range.basePrice
      }));
      setDistanceRanges(defaultDistance);
    }

    // オプション設定の読み込み
    const savedOptions = typeof window !== 'undefined' ? localStorage.getItem('serviceOptions') : null;
    if (savedOptions) {
      setOptions(JSON.parse(savedOptions));
    }

    setIsLoading(false);
  }, []);

  /**
   * 荷物ポイント設定の自動保存
   */
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('itemPointSettings', JSON.stringify(itemPoints));
    }
  }, [itemPoints, isLoading]);

  /**
   * 料金ルールの自動保存
   */
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('truckPricingRules', JSON.stringify(pricingRules));
    }
  }, [pricingRules, isLoading]);

  /**
   * 車種係数の自動保存（localStorage + API）
   */
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('truckCoefficients', JSON.stringify(truckCoefficients));

      // APIにも保存（バックグラウンドで実行）
      const saveTruckTypesToAPI = async () => {
        try {
          await fetch('/api/truck-types', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              truckTypes: truckCoefficients.map((coef, index) => ({
                id: coef.id.startsWith('coef-') ? undefined : coef.id,
                name: coef.truckType,
                coefficient: coef.coefficient,
                sortOrder: (index + 1) * 10
              }))
            })
          });
        } catch {
          console.log('APIへの保存に失敗、localStorageのみ使用');
        }
      };
      saveTruckTypesToAPI();
    }
  }, [truckCoefficients, isLoading]);

  /**
   * 距離料金の自動保存
   */
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('distanceRanges', JSON.stringify(distanceRanges));
    }
  }, [distanceRanges, isLoading]);

  /**
   * オプション設定の自動保存
   */
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined') {
      localStorage.setItem('serviceOptions', JSON.stringify(options));
    }
  }, [options, isLoading]);

  /**
   * 料金ルールの追加
   * - バリデーション後、新しい料金ルールを追加
   */
  const addPricingRule = () => {
    const errors: string[] = [];
    if (!newTruckType) {errors.push('トラック種別を選択してください');}
    if (newPricingMaxPoint === undefined) {errors.push('ポイント最大値は必須です');}
    if (newPricingPrice === undefined) {errors.push('料金は必須です');}
    const lastRule = pricingRules[pricingRules.length - 1];
    const newMinPoint = lastRule && lastRule.maxPoint !== undefined ? lastRule.maxPoint + 1 : 1;
    if (newPricingMaxPoint !== undefined && newPricingMaxPoint <= newMinPoint) {errors.push('最大値は前の行の最大値より大きい値を選択してください');}
    if (errors.length > 0) {
      setPricingErrors(errors);
      return;
    }
    setPricingRules(prev => [
      ...prev,
      {
        id: `pricing-${Date.now()}`,
        truckType: newTruckType,
        minPoint: newMinPoint,
        maxPoint: newPricingMaxPoint,
        price: newPricingPrice,
      }
    ]);
    setNewTruckType('');
    setNewPricingMaxPoint(undefined);
    setNewPricingPrice(undefined);
    setPricingErrors([]);
  };

  /**
   * 料金ルールの削除
   * @param id 削除するルールのID
   */
  const removePricingRule = (id: string) => {
    if (pricingRules.length <= 1) {
      setPricingErrors(['最低1行は必要です']);
      return;
    }
    setPricingRules(pricingRules.filter(rule => rule.id !== id));
    setPricingErrors([]);
  };

  /**
   * 料金ルールの更新
   * @param id 更新するルールのID
   * @param field 更新するフィールド
   * @param value 新しい値
   */
  const updatePricingRule = (id: string, field: keyof PricingRule, value: PricingRule[keyof PricingRule]) => {
    setPricingRules(pricingRules.map(rule =>
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  /**
   * 最大値更新時の最小値自動調整
   * @param id 更新するルールのID
   * @param newMaxPoint 新しい最大ポイント値
   */
  const updateMaxPoint = (id: string, newMaxPoint: number) => {
    const ruleIndex = pricingRules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {return;}

    const rule = pricingRules[ruleIndex];
    const prevRule = ruleIndex > 0 ? pricingRules[ruleIndex - 1] : null;

    // 新しい最小値を計算
    const newMinPoint = prevRule && prevRule.maxPoint !== undefined ? prevRule.maxPoint + 1 : 1;

    // 最大値の妥当性チェック
    if (newMaxPoint <= newMinPoint) {
      setPricingErrors(['最大値は前の行の最大値より大きい値を選択してください']);
      return;
    }

    // 次の行の最小値も調整
    const updatedRules = [...pricingRules];
    updatedRules[ruleIndex] = { ...rule, minPoint: newMinPoint, maxPoint: newMaxPoint };

    // 後続の行の最小値を再計算
    for (let i = ruleIndex + 1; i < updatedRules.length; i++) {
      const currentRule = updatedRules[i];
      const prevRule = updatedRules[i - 1];
      if (prevRule.maxPoint !== undefined) {
        updatedRules[i] = { ...currentRule, minPoint: prevRule.maxPoint + 1 };
      }
    }

    setPricingRules(updatedRules);
    setPricingErrors([]);
  };



  // 車種係数更新
  const updateTruckCoefficient = (id: string, coefficient: number) => {
    setTruckCoefficients(prev => prev.map(coef =>
      coef.id === id ? { ...coef, coefficient: Math.max(0.1, coefficient) } : coef
    ));
  };

  // 料金設定から一意のトラック種別リストを生成
  const uniqueTruckTypes = useMemo(() => {
    const types = pricingRules
      .map(rule => rule.truckType)
      .filter((type): type is string => !!type && type.trim() !== '');
    return [...new Set(types)];
  }, [pricingRules]);

  // トラック種別が追加されたら係数も自動追加
  useEffect(() => {
    uniqueTruckTypes.forEach(type => {
      if (!truckCoefficients.some(coef => coef.truckType === type)) {
        setTruckCoefficients(prev => [
          ...prev,
          { id: `coef-${Date.now()}-${type}`, truckType: type, coefficient: 1.0 }
        ]);
      }
    });
  }, [uniqueTruckTypes, truckCoefficients]);

  // 車種は料金設定テーブルから自動的に追加されるため、
  // 手動追加/削除の機能は不要になりました

  // 距離料金更新
  const updateDistanceRange = (id: string, field: keyof DistanceRange, value: DistanceRange[keyof DistanceRange]) => {
    setDistanceRanges(prev => prev.map(range =>
      range.id === id ? { ...range, [field]: value } : range
    ));
  };

  // 距離料金追加
  const addDistanceRange = () => {
    const lastRange = distanceRanges[distanceRanges.length - 1];
    const newMaxDistance = lastRange ? lastRange.maxDistance + 10 : 10;

    const newRange: DistanceRange = {
      id: `dist-${Date.now()}`,
      maxDistance: newMaxDistance,
      basePrice: 0
    };
    setDistanceRanges(prev => [...prev, newRange]);
  };

  // 距離料金削除
  const removeDistanceRange = (id: string) => {
    setDistanceRanges(prev => prev.filter(range => range.id !== id));
  };

  // validatePricingのエラーを画面上部に表示、エラー行は赤枠
  const validatePoints = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (itemPoints.length === 0) {
      errors.push("荷物ポイントが設定されていません");
      return { isValid: false, errors };
    }

    // 負の値チェック
    const negativeItems = itemPoints.filter(item => item.points < 0 || item.additionalCost < 0);
    if (negativeItems.length > 0) {
      errors.push("ポイントと加算金は0以上にしてください");
    }

    return { isValid: errors.length === 0, errors };
  };




  // オプション追加
  const handleAddOption = () => {
    if (!optionFormState.newOptionLabel.trim()) {
      optionFormDispatch({ type: 'SET_ADD_ERROR', payload: 'オプション名は必須です' });
      return;
    }
    if (optionFormState.newOptionType === 'paid' && (!optionFormState.newOptionPrice || optionFormState.newOptionPrice < 0)) {
      optionFormDispatch({ type: 'SET_ADD_ERROR', payload: '有料オプションは金額を0円以上で入力してください' });
      return;
    }
    setOptions(prev => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        label: optionFormState.newOptionLabel.trim(),
        type: optionFormState.newOptionType,
        price: optionFormState.newOptionType === 'paid' ? optionFormState.newOptionPrice : undefined,
        isDefault: false,
        unit: optionFormState.newOptionUnit,
        remarks: optionFormState.newOptionRemarks,
      }
    ]);
    optionFormDispatch({ type: 'RESET_FORM' });
  };

  // オプション削除
  const handleDeleteOption = (id: string) => {
    setOptions(prev => prev.filter(opt => opt.id !== id));
  };

  // オプション種別変更
  const handleOptionTypeChange = (id: string, type: OptionType) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, type, price: type === 'paid' ? (opt.price || 0) : undefined } : opt));
  };

  // オプション名変更
  const handleOptionLabelChange = (id: string, label: string) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, label } : opt));
  };

  // オプション金額変更
  const handleOptionPriceChange = (id: string, price: number) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, price } : opt));
  };

  // オプション単位変更
  const handleOptionUnitChange = (id: string, unit: string) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, unit } : opt));
  };

  // オプション備考変更
  const handleOptionRemarksChange = (id: string, remarks: string) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, remarks } : opt));
  };



  // ソート機能
  const sortPricingRules = (rules: PricingRule[]) => {
    return [...rules].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // undefinedの場合は最後に配置
      if (aValue === undefined && bValue === undefined) {return 0;}
      if (aValue === undefined) {return 1;}
      if (bValue === undefined) {return -1;}

      // 数値の場合は数値として比較
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 文字列の場合は文字列として比較
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  };

  const handleSort = (field: 'truckType' | 'minPoint' | 'maxPoint' | 'price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: 'truckType' | 'minPoint' | 'maxPoint' | 'price') => {
    if (sortField !== field) {return '↕️';}
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // 荷物ポイント設定の保存
  const handleSavePoints = () => {
    const validation = validatePoints();
    if (!validation.isValid) {
      alert(`エラーがあります:\n${validation.errors.join('\n')}`);
      return;
    }
    alert('荷物ポイント設定を保存しました！');
  };



  // 配車管理画面へ遷移
  const handleDispatchManagement = () => {
    router.push('/admin/dispatch');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // スクロール関数
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // ヘッダーの高さを考慮
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ページヘッダー */}
      <div className="bg-white shadow-sm">
        <AdminPageHeader
          title="⚙️ 料金基準設定"
          breadcrumbs={[
            { label: '料金設定', href: '/pricing' },
            { label: '料金基準設定' }
          ]}
          backUrl="/pricing"
        />
      </div>

      {/* シミュレーション切り替えボタン（固定位置） */}
      <button
        onClick={() => setIsSimulationEnabled(!isSimulationEnabled)}
        className={`fixed top-24 transition-all duration-300 shadow-lg z-50 px-6 py-3 rounded-lg font-semibold text-sm ${
          isSimulationEnabled
            ? 'bg-blue-600 text-white hover:bg-blue-700 right-[calc(33.333%+1rem)]'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 right-4'
        }`}
      >
        {isSimulationEnabled ? 'シミュレーション ON' : 'シミュレーション OFF'}
      </button>

      <div className="flex">
        {/* サイドメニュー */}
        <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-56'} bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 fixed left-0 top-[100px] bottom-0 overflow-y-auto transition-all duration-300`} style={{ zIndex: 40 }}>
          {/* 折りたたみボタン */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700"
              title={isSidebarCollapsed ? 'メニューを開く' : 'メニューを閉じる'}
            >
              {isSidebarCollapsed ? '»' : '«'}
            </button>
          </div>

          <nav className="p-2 space-y-1">
            <button
              onClick={() => scrollToSection('item-points')}
              className="w-full text-left px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center group"
              title="荷物ポイント設定"
            >
              <span className="text-lg mr-2.5">📦</span>
              {!isSidebarCollapsed && <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">荷物ポイント設定</span>}
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full text-left px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center group"
              title="料金設定"
            >
              <span className="text-lg mr-2.5">💰</span>
              {!isSidebarCollapsed && <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">料金設定</span>}
            </button>
            <button
              onClick={() => scrollToSection('truck-coefficient')}
              className="w-full text-left px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center group"
              title="距離・車種別料金設定"
            >
              <span className="text-lg mr-2.5">🚛</span>
              {!isSidebarCollapsed && <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">距離・車種別料金</span>}
            </button>
            <button
              onClick={() => scrollToSection('options')}
              className="w-full text-left px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center group"
              title="オプション料金設定"
            >
              <span className="text-lg mr-2.5">🛠️</span>
              {!isSidebarCollapsed && <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">オプション料金設定</span>}
            </button>
            <button
              onClick={() => scrollToSection('truck-management')}
              className="w-full text-left px-3 py-2.5 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center group"
              title="トラック管理"
            >
              <span className="text-lg mr-2.5">🚚</span>
              {!isSidebarCollapsed && <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">トラック管理</span>}
            </button>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <div className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-56'} ${isSimulationEnabled ? 'pr-[33.333333%]' : ''} transition-all duration-300`}>
          <main className="py-6 px-3 md:px-4 lg:px-6 text-sm">
            <div className="w-full">

              {/* 荷物ポイント設定 */}
              <div id="item-points" className="bg-white shadow-md rounded-lg p-4 scroll-mt-20 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-lg mr-2">📦</span>
                  荷物ポイント設定
                </h2>

                  {/* 説明 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">📋 設定内容</h3>
                    <p className="text-xs text-gray-700">
                      各荷物のポイントを設定します。このポイント合計に基づいてトラックサイズが自動判定されます。
                      荷物の重さや大きさに応じてポイントを調整してください。
                    </p>
                    <div className="mt-2 p-2 bg-white border border-blue-200 rounded">
                      <p className="text-xs font-medium text-blue-800">📦 ポイント基準</p>
                      <p className="text-xs text-gray-700">1ポイント = 段ボールMサイズ1個分（50×35×35cm）</p>
                    </div>
                  </div>

                  {/* 検索・フィルター */}
                  <div className="bg-white shadow-md rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          検索
                        </label>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="荷物名で検索..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          カテゴリ
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>
                              {category === 'all' ? 'すべて' : category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 参考例 */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 ポイント参考例（1ポイント=段ボール中1個分：50×35×35cm）</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• 小物（1-3ポイント）：炊飯器、電子レンジ、スツールなど</p>
                      <p>• 中型荷物（4-8ポイント）：テレビ、洗濯機、デスクなど</p>
                      <p>• 大型荷物（20-32ポイント）：シングルベッド、2人ソファ、タンスなど</p>
                      <p>• 特大荷物（35ポイント以上）：ダブルベッド、大型冷蔵庫、ワードローブなど</p>
                      <p>• 特殊荷物（30ポイント以上）：アップライトピアノ、グランドピアノ、大型金庫など</p>
                    </div>
                  </div>

                  {/* ポイント設定 */}
                  <div className="bg-white shadow-md rounded-lg p-6">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        該当する荷物が見つかりません。
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ITEM_CATEGORIES.map(category => {
                          const categoryItems = filteredItems.filter(item => item.category === category.category);
                          if (categoryItems.length === 0) {return null;}

                          return (
                            <div key={category.category} className="border border-gray-200 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-gray-800 mb-3">🗂 {category.category}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoryItems.map(item => (
                                  <div key={item.id} className="border border-gray-200 rounded p-3 min-h-[200px]">
                                    <div className="flex justify-between items-start mb-3">
                                      <span className="text-sm font-medium text-gray-800 flex-1 pr-2">{item.name}</span>
                                      <button
                                        onClick={() => resetToDefault(item.id)}
                                        className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                                        title="デフォルト値にリセット"
                                      >
                                        🔄
                                      </button>
                                    </div>

                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">ポイント</label>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="number"
                                            min="0"
                                            value={item.points}
                                            onChange={(e) => updatePoints(item.id, parseInt(e.target.value) || 0)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                          />
                                          <span className="text-xs text-gray-500">pt</span>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">加算料金</label>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="number"
                                            min="0"
                                            value={item.additionalCost}
                                            onChange={(e) => updateAdditionalCost(item.id, parseInt(e.target.value) || 0)}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                          />
                                          <span className="text-xs text-gray-500">円</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-3 space-y-1">
                                      <div className="text-xs text-gray-400">
                                        ※追加料金が必要な場合のみ入力
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        デフォルト: {item.defaultPoints}pt
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 荷物ポイント設定の保存ボタン */}
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleSavePoints}
                      className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
                    >
                      💾 荷物ポイント設定を保存
                    </button>
                  </div>
              </div>

              {/* 料金設定 */}
              <div id="pricing" className="bg-white shadow-md rounded-lg p-4 scroll-mt-20 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-lg mr-2">💰</span>
                  料金設定
                </h2>
                  {/* 説明 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">📋 設定内容</h3>
                    <p className="text-xs text-gray-700">
                      トラック種別とポイント範囲に応じた料金を設定します。
                      ポイント最小値は自動設定され、最大値のみ選択できます。各設定は連続したポイント範囲で管理されます。
                    </p>
                  </div>

                    {pricingErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-300 text-red-700 rounded p-2 mb-4">
                        <ul className="list-disc pl-5">
                          {pricingErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                      </div>
                    )}

                    {pricingRules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        料金設定がありません。上記の「＋ 料金設定追加」ボタンで追加してください。
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-gray-50">
                              <th
                                className="border border-gray-200 px-2 md:px-4 py-2 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('truckType')}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-xs md:text-sm">トラック種別</span>
                                  <span className="text-xs">{getSortIcon('truckType')}</span>
                                </div>
                              </th>
                              <th
                                className="border border-gray-200 px-2 md:px-4 py-2 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('minPoint')}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-xs md:text-sm">ポイント範囲</span>
                                  <span className="text-xs">{getSortIcon('minPoint')}</span>
                                </div>
                              </th>
                              <th
                                className="border border-gray-200 px-2 md:px-4 py-2 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('price')}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-xs md:text-sm">料金（円）</span>
                                  <span className="text-xs">{getSortIcon('price')}</span>
                                </div>
                              </th>
                              <th className="border border-gray-200 px-2 md:px-4 py-2 text-center text-xs md:text-sm">削除</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortPricingRules(pricingRules).map((rule, _index) => (
                              <tr key={rule.id} className="hover:bg-gray-50">
                                <td className="border border-gray-200 px-2 md:px-4 py-2 text-center">
                                  <input
                                    type="text"
                                    value={rule.truckType}
                                    onChange={e => updatePricingRule(rule.id, 'truckType', e.target.value)}
                                    className="w-full px-1 md:px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                                    placeholder="トラック種別"
                                  />
                                </td>
                                <td className="border border-gray-200 px-2 md:px-4 py-2 text-center">
                                  <div className="flex items-center justify-center space-x-1 md:space-x-2">
                                    <span className="text-gray-600 text-xs md:text-sm bg-gray-100 px-1 md:px-2 py-1 rounded">{rule.minPoint}</span>
                                    <span className="text-gray-500 text-xs md:text-sm">～</span>
                                    <select
                                      value={rule.maxPoint ?? ''}
                                      onChange={e => updateMaxPoint(rule.id, e.target.value ? parseInt(e.target.value) : 0)}
                                      className="w-full px-1 md:px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                                    >
                                      <option value="">最大値</option>
                                      {POINT_RANGE.filter(point => point > rule.minPoint).map(point => (
                                        <option key={point} value={point}>{point}</option>
                                      ))}
                                    </select>
                                  </div>
                                </td>
                                <td className="border border-gray-200 px-2 md:px-4 py-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={rule.price ?? ''}
                                    onChange={e => updatePricingRule(rule.id, 'price', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="w-full min-w-[50px] md:min-w-[60px] max-w-[80px] md:max-w-[100px] px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-xs md:text-sm"
                                    placeholder="料金"
                                  />
                                </td>
                                <td className="border border-gray-200 px-2 md:px-4 py-2 text-center">
                                  <button
                                    onClick={() => removePricingRule(rule.id)}
                                    className="text-red-600 hover:text-red-800 text-xs md:text-sm"
                                  >🗑️</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* 料金設定追加フォーム */}
                    <div className="flex flex-wrap gap-2 mt-4 items-end bg-blue-50 p-4 rounded">
                      <input
                        type="text"
                        value={newTruckType}
                        onChange={e => setNewTruckType(e.target.value)}
                        className="border rounded px-2 py-1 min-w-[120px]"
                        placeholder="トラック種別"
                      />
                      <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{pricingRules.length > 0 ? (pricingRules[pricingRules.length - 1].maxPoint! + 1) : 1}</span>
                      <span className="text-gray-500">～</span>
                      <select
                        value={newPricingMaxPoint ?? ''}
                        onChange={e => setNewPricingMaxPoint(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="border rounded px-2 py-1 min-w-[80px]"
                      >
                        <option value="">最大値</option>
                        {POINT_RANGE.filter(point => pricingRules.length === 0 || point > pricingRules[pricingRules.length - 1].maxPoint!).map(point => (
                          <option key={point} value={point}>{point}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={newPricingPrice ?? ''}
                        onChange={e => setNewPricingPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="border rounded px-2 py-1 min-w-[80px]"
                        placeholder="料金"
                      />
                      <button
                        type="button"
                        onClick={addPricingRule}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
                      >追加</button>
                    </div>
              </div>

              {/* 距離・車種別料金設定 */}
              <div id="truck-coefficient" className="bg-white shadow-md rounded-lg p-4 scroll-mt-20 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-lg mr-2">🚛</span>
                  距離・車種別料金設定
                </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">📋 設定内容</h3>
                    <p className="text-xs text-gray-700 mb-1">
                      距離範囲と車種ごとの料金を一覧で設定します。
                    </p>
                    <p className="text-xs text-gray-700">
                      • 最終料金 = 車種係数 × 基本加算額<br/>
                      • 表内の金額は自動計算された各車種の実際の加算料金です
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-1 md:px-2 py-1 text-center text-[10px] md:text-xs">距離範囲（km）</th>
                          {uniqueTruckTypes.map(type => {
                            const coef = truckCoefficients.find(c => c.truckType === type);
                            return (
                              <th key={type} className="border border-gray-200 px-1 md:px-2 py-1 text-center">
                                <div className="flex flex-col gap-0.5 whitespace-nowrap items-center">
                                  <span className="text-[10px] md:text-xs font-semibold">{type}</span>
                                  <div className="flex items-center gap-0.5 md:gap-1">
                                    <span className="text-[8px] md:text-[10px] text-gray-500">係数:</span>
                                    <input
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      value={coef?.coefficient || 1.0}
                                      onChange={e => coef && updateTruckCoefficient(coef.id, parseFloat(e.target.value) || 1.0)}
                                      className="w-10 md:w-12 px-0.5 md:px-1 py-0.5 border border-gray-300 rounded text-[8px] md:text-[10px] text-right focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                          <th className="border border-gray-200 px-1 md:px-2 py-1 text-center text-[10px] md:text-xs">基本加算額（円）</th>
                          <th className="border border-gray-200 px-1 md:px-2 py-1 text-center text-[10px] md:text-xs">削除</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distanceRanges.map((range, index) => {
                          const prevMaxDistance = index > 0 ? distanceRanges[index - 1].maxDistance : 0;
                          const distanceRangeText = index === 0 ? `〜${range.maxDistance}km` : `${prevMaxDistance + 1}〜${range.maxDistance}km`;

                          return (
                            <tr key={range.id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 px-1 md:px-2 py-1 text-right">
                                <div className="flex items-center justify-end space-x-0.5 md:space-x-1">
                                  <span className="text-gray-600 text-[10px] md:text-xs">{distanceRangeText}</span>
                                  <input
                                    type="number"
                                    min="1"
                                    value={range.maxDistance}
                                    onChange={e => updateDistanceRange(range.id, 'maxDistance', parseInt(e.target.value) || 0)}
                                    className="w-12 md:w-16 px-0.5 md:px-1 py-0.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-[10px] md:text-xs"
                                  />
                                  <span className="text-gray-500 text-[10px] md:text-xs">km</span>
                                </div>
                              </td>
                              {uniqueTruckTypes.map(type => {
                                const coef = truckCoefficients.find(c => c.truckType === type);
                                return (
                                  <td key={type} className="border border-gray-200 px-1 md:px-2 py-1 text-center text-[10px] md:text-xs text-gray-600">
                                    {Math.round((coef?.coefficient || 1.0) * range.basePrice).toLocaleString()}円
                                  </td>
                                );
                              })}
                              <td className="border border-gray-200 px-1 md:px-2 py-1 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={range.basePrice}
                                  onChange={e => updateDistanceRange(range.id, 'basePrice', parseInt(e.target.value) || 0)}
                                  className="w-12 md:w-16 px-0.5 md:px-1 py-0.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-[10px] md:text-xs"
                                  placeholder="基本額"
                                />
                              </td>
                              <td className="border border-gray-200 px-1 md:px-2 py-1 text-center">
                                <button
                                  onClick={() => removeDistanceRange(range.id)}
                                  className="text-red-600 hover:text-red-800 text-[10px] md:text-xs"
                                >🗑️</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 距離範囲追加ボタン */}
                  <div className="mt-3">
                    <button
                      onClick={addDistanceRange}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition text-sm"
                    >
                      ＋ 距離範囲追加
                    </button>
                  </div>
              </div>

              {/* オプション料金設定 */}
              <div id="options" className="bg-white shadow-md rounded-lg p-4 scroll-mt-20 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-lg mr-2">🛠️</span>
                  オプション料金設定
                </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">オプション名</th>
                          <th className="border border-gray-200 px-2 md:px-6 py-2 text-left text-xs md:text-sm">種別</th>
                          <th className="border border-gray-200 px-1 md:px-2 py-2 text-left text-xs md:text-sm">金額（円）</th>
                          <th className="border border-gray-200 px-1 md:px-2 py-2 text-left text-xs md:text-sm">単位数量</th>
                          <th className="border border-gray-200 px-2 md:px-4 py-2 text-left text-xs md:text-sm">備考</th>
                          <th className="border border-gray-200 px-1 md:px-2 py-2 text-center text-xs md:text-sm">削除</th>
                        </tr>
                      </thead>
                      <tbody>
                        {options.map((opt, _idx) => (
                          <tr key={opt.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-2 md:px-4 py-2">
                              {opt.isDefault ? (
                                <span className="text-gray-800 text-xs md:text-sm">{opt.label}</span>
                              ) : (
                                <input
                                  type="text"
                                  value={opt.label}
                                  onChange={e => handleOptionLabelChange(opt.id, e.target.value)}
                                  className="w-full px-1 md:px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                                  required
                                />
                              )}
                            </td>
                            <td className="border border-gray-200 px-2 md:px-6 py-2">
                              <select
                                value={opt.type}
                                onChange={e => handleOptionTypeChange(opt.id, e.target.value as OptionType)}
                                className="w-full px-1 md:px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                                style={{ whiteSpace: 'nowrap' }}
                                required
                              >
                                {OPTION_TYPES.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="border border-gray-200 px-1 md:px-2 py-2">
                              <input
                                type="text"
                                value={opt.type === 'individual' || opt.type === 'free' ? '' : (opt.price ?? 0).toLocaleString()}
                                onChange={e => {
                                  const value = e.target.value;
                                  if (/[^\u0000-\u007f]+/.test(value)) {
                                    optionFormDispatch({ type: 'SET_ERRORS', payload: { ...optionFormState.optionErrors, [opt.id]: '※半角数値のみ' } });
                                    return;
                                  } else {
                                    optionFormDispatch({ type: 'SET_ERRORS', payload: { ...optionFormState.optionErrors, [opt.id]: '' } });
                                    const num = value.replace(/,/g, '');
                                    handleOptionPriceChange(opt.id, parseInt(num) || 0);
                                  }
                                }}
                                className={`w-full min-w-[50px] md:min-w-[60px] max-w-[80px] md:max-w-[100px] px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-xs md:text-sm ${opt.type === 'individual' || opt.type === 'free' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                                disabled={opt.type === 'individual' || opt.type === 'free'}
                                placeholder="金額"
                                required={opt.type === 'paid'}
                              />
                              {optionFormState.optionErrors[opt.id] && (
                                <div className="text-red-600 text-[10px] md:text-xs mt-1">{optionFormState.optionErrors[opt.id]}</div>
                              )}
                            </td>
                            <td className="border border-gray-200 px-1 md:px-2 py-2">
                              {opt.type === 'individual' || opt.type === 'free' ? (
                                <select disabled className="w-full min-w-[50px] md:min-w-[60px] max-w-[80px] md:max-w-[100px] px-1 py-1 border border-gray-300 rounded bg-gray-200 cursor-not-allowed text-right text-xs md:text-sm">
                                  <option value=""></option>
                                </select>
                              ) : (
                                <select
                                  value={opt.unit ?? ''}
                                  onChange={e => handleOptionUnitChange(opt.id, e.target.value)}
                                  className="w-full min-w-[50px] md:min-w-[60px] max-w-[80px] md:max-w-[100px] px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-xs md:text-sm"
                                  required
                                >
                                  <option value=""></option>
                                  {[...Array(100)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="border border-gray-200 px-2 md:px-4 py-2">
                              <input
                                type="text"
                                value={opt.remarks ?? ''}
                                onChange={e => handleOptionRemarksChange(opt.id, e.target.value)}
                                className="w-full px-1 md:px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm"
                              />
                            </td>
                            <td className="border border-gray-200 px-1 md:px-2 py-2 text-center">
                              {opt.isDefault ? (
                                <span className="text-gray-400 text-xs md:text-sm">－</span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteOption(opt.id)}
                                  className="text-red-600 hover:text-red-800 text-xs md:text-sm"
                                >🗑️</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* 追加フォーム */}
                  <div className="flex flex-wrap gap-2 mt-4 items-end">
                    <input
                      type="text"
                      value={optionFormState.newOptionLabel}
                      onChange={e => optionFormDispatch({ type: 'SET_NEW_OPTION_LABEL', payload: e.target.value })}
                      className="border rounded px-3 py-1 flex-1 min-w-[180px]"
                      placeholder="新しいオプション名"
                    />
                    <select
                      value={optionFormState.newOptionType}
                      onChange={e => optionFormDispatch({ type: 'SET_NEW_OPTION_TYPE', payload: e.target.value as OptionType })}
                      className="border rounded px-2 py-1 min-w-[120px]"
                    >
                      {OPTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {optionFormState.newOptionType === 'paid' && (
                      <input
                        type="text"
                        value={optionFormState.newOptionPrice || ''}
                        onChange={e => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          optionFormDispatch({ type: 'SET_NEW_OPTION_PRICE', payload: parseInt(value) || 0 });
                        }}
                        className="border rounded px-2 py-1 min-w-[80px]"
                        placeholder="金額"
                      />
                    )}
                    {optionFormState.newOptionType !== 'paid' && (
                      <input
                        type="text"
                        disabled
                        className="border rounded px-2 py-1 min-w-[80px] bg-gray-100 cursor-not-allowed"
                        placeholder="金額"
                      />
                    )}
                    <input
                      type="text"
                      value={optionFormState.newOptionUnit}
                      onChange={e => optionFormDispatch({ type: 'SET_NEW_OPTION_UNIT', payload: e.target.value })}
                      className="border rounded px-2 py-1 min-w-[80px]"
                      placeholder="単位数量"
                    />
                    <input
                      type="text"
                      value={optionFormState.newOptionRemarks}
                      onChange={e => optionFormDispatch({ type: 'SET_NEW_OPTION_REMARKS', payload: e.target.value })}
                      className="border rounded px-2 py-1 min-w-[120px]"
                      placeholder="備考"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
                    >追加</button>
                  </div>
                  {optionFormState.optionAddError && <div className="text-red-600 text-sm mt-2">{optionFormState.optionAddError}</div>}
              </div>

              {/* トラック管理 */}
              <div id="truck-management" className="bg-white shadow-md rounded-lg p-4 scroll-mt-20 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="text-lg mr-2">🚚</span>
                  トラック管理
                </h2>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    トラックの登録・管理は配車管理画面で行います
                  </p>
                  <button
                    onClick={handleDispatchManagement}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    🚚 配車管理画面へ
                  </button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {isSimulationEnabled && (
        <SimulationPanel
          items={simulationItems}
          onRemoveItem={removeSimulationItem}
          onUpdateQuantity={updateSimulationQuantity}
          onClearAll={clearSimulation}
          onClose={() => setIsSimulationEnabled(false)}
          onAddItem={(itemId: string, itemName: string, points: number) => {
            addSimulationItem({ id: itemId, name: itemName, points });
          }}
        />
      )}
    </div>
  );
} 
