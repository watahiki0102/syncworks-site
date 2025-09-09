/**
 * 料金設定 Step2 ページコンポーネント
 * - トラック種別別の料金設定
 * - 車種係数と距離料金の設定
 * - オプション料金の管理
 * - トラック管理機能
 */
'use client';

import { useState, useEffect, useReducer } from 'react';
import TruckManagementModal from './components/TruckManagementModal';
import { useRouter } from 'next/navigation';
import { PricingRule, OptionItem } from '@/types/pricing';

/**
 * トラック種別の定義
 */
const TRUCK_TYPES = [
  "軽トラ",
  "2tショート",
  "2tロング",
  "3t",
  "4t",
  "4t複数",
  "特別対応"
];

/**
 * 作業人数の定義
 */


/**
 * ポイント範囲の定義（1～9999、1刻みで詳細設定可能）
 */
const POINT_RANGE = Array.from({ length: 9999 }, (_, i) => i + 1);

/**
 * デフォルト料金設定
 */
const DEFAULT_PRICING = [
  { truckType: "軽トラ", minPoint: 1, maxPoint: 100, price: 15000 },
  { truckType: "2tショート", minPoint: 101, maxPoint: 250, price: 25000 },
  { truckType: "2tロング", minPoint: 251, maxPoint: 350, price: 35000 },
  { truckType: "3t", minPoint: 351, maxPoint: 450, price: 45000 },
  { truckType: "4t", minPoint: 451, maxPoint: 600, price: 60000 },
  { truckType: "4t複数", minPoint: 601, maxPoint: 800, price: 80000 },
  { truckType: "特別対応", minPoint: 801, maxPoint: 1000, price: 100000 },
];

/**
 * デフォルト車種係数
 */
const DEFAULT_TRUCK_COEFFICIENTS = [
  { truckType: "軽トラ", coefficient: 1.0 },
  { truckType: "2tショート", coefficient: 1.2 },
  { truckType: "2tロング", coefficient: 1.4 },
  { truckType: "3t", coefficient: 1.6 },
  { truckType: "4t", coefficient: 1.8 },
  { truckType: "4t複数", coefficient: 2.0 },
  { truckType: "特別対応", coefficient: 2.5 },
];

/**
 * デフォルト距離料金
 */
const DEFAULT_DISTANCE_RANGES = [
  { maxDistance: 10, basePrice: 0 },
  { maxDistance: 20, basePrice: 2000 },
  { maxDistance: 30, basePrice: 4000 },
  { maxDistance: 50, basePrice: 6000 },
  { maxDistance: 100, basePrice: 10000 },
  { maxDistance: 999, basePrice: 15000 },
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
 * 料金設定で管理するトラック情報の型定義
 */
interface PricingTruck {
  id: string;              // トラックID
  name: string;            // トラック名
  plateNumber: string;     // ナンバープレート
  truckType: string;       // トラック種別
  capacityKg: number;      // 積載量（kg）
  basePrice: number;       // 基本料金
  status: 'active' | 'inactive'; // ステータス
  description?: string;    // 説明
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
 * デフォルトオプション設定
 */
const DEFAULT_OPTIONS: OptionItem[] = [
  { id: 'opt-1', label: '🏠 建物養生（壁や床の保護）', type: 'free' as const, isDefault: true },
  { id: 'opt-2', label: '📦 荷造り・荷ほどきの代行', type: 'free' as const, isDefault: true },
  { id: 'opt-3', label: '🪑 家具・家電の分解・組み立て', type: 'free' as const, isDefault: true },
  { id: 'opt-4', label: '🧺 洗濯機取り外し', type: 'free' as const, isDefault: true },
  { id: 'opt-5', label: '❄️ エアコン（本体＋室外機）取り外し', type: 'free' as const, isDefault: true },
  { id: 'opt-6', label: '💡 照明・テレビ配線取り外し', type: 'free' as const, isDefault: true },
  { id: 'opt-7', label: '🚮 不用品の回収・廃棄', type: 'free' as const, isDefault: true },
  { id: 'opt-8', label: '🐾 ペット運搬', type: 'free' as const, isDefault: true },
];

export default function PricingStep2Page() {
  const router = useRouter();
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<OptionItem[]>(DEFAULT_OPTIONS);
  // オプション追加フォーム用のreducer
  interface OptionFormState {
    newOptionLabel: string;
    newOptionType: OptionType;
    newOptionPrice: number;
    newOptionUnit: string;
    newOptionMinPoint: number | undefined;
    newOptionMaxPoint: number | undefined;
    optionErrors: { [optionId: string]: string };
    optionAddError: string;
  }

  type OptionFormAction = 
    | { type: 'SET_LABEL'; payload: string }
    | { type: 'SET_TYPE'; payload: OptionType }
    | { type: 'SET_PRICE'; payload: number }
    | { type: 'SET_UNIT'; payload: string }
    | { type: 'SET_MIN_POINT'; payload: number | undefined }
    | { type: 'SET_MAX_POINT'; payload: number | undefined }
    | { type: 'SET_ERRORS'; payload: { [optionId: string]: string } }
    | { type: 'SET_ADD_ERROR'; payload: string }
    | { type: 'SET_NEW_OPTION_LABEL'; payload: string }
    | { type: 'SET_NEW_OPTION_TYPE'; payload: OptionType }
    | { type: 'SET_NEW_OPTION_PRICE'; payload: number }
    | { type: 'SET_NEW_OPTION_UNIT'; payload: string }
    | { type: 'RESET_FORM' };

  const initialOptionFormState: OptionFormState = {
    newOptionLabel: '',
    newOptionType: 'free',
    newOptionPrice: 0,
    newOptionUnit: '',
    newOptionMinPoint: undefined,
    newOptionMaxPoint: undefined,
    optionErrors: {},
    optionAddError: ''
  };

  function optionFormReducer(state: OptionFormState, action: OptionFormAction): OptionFormState {
    switch (action.type) {
      case 'SET_LABEL':
        return { ...state, newOptionLabel: action.payload };
      case 'SET_TYPE':
        return { ...state, newOptionType: action.payload };
      case 'SET_PRICE':
        return { ...state, newOptionPrice: action.payload };
      case 'SET_UNIT':
        return { ...state, newOptionUnit: action.payload };
      case 'SET_MIN_POINT':
        return { ...state, newOptionMinPoint: action.payload };
      case 'SET_MAX_POINT':
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
  const [rowErrorIds, setRowErrorIds] = useState<Set<string>>(new Set());
  const [optionAddError, setOptionAddError] = useState<string>('');
  const [optionErrors, setOptionErrors] = useState<string[]>([]);

  /**
   * 車種係数設定用state
   */
  const [truckCoefficients, setTruckCoefficients] = useState<TruckCoefficient[]>([]);
  const [distanceRanges, setDistanceRanges] = useState<DistanceRange[]>([]);


  /**
   * トラック管理用state
   */
  const [pricingTrucks, setPricingTrucks] = useState<PricingTruck[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<PricingTruck | null>(null);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [truckFormData, setTruckFormData] = useState({
    name: '',
    plateNumber: '',
    truckType: '',
    capacityKg: 1000,
    basePrice: 0,
    status: 'active' as 'active' | 'inactive',
    description: '',
  });

  /**
   * 初期データの読み込み
   * - 料金ルール、車種係数、距離料金、オプション設定を復元
   */
  useEffect(() => {
    const savedPricing = localStorage.getItem('pricingStep2');
    if (savedPricing) {
      setPricingRules(JSON.parse(savedPricing));
    } else {
      // デフォルト料金を設定
      const defaultPricing = DEFAULT_PRICING.map((rule, index) => ({
        id: `pricing-${index}`,
        truckType: rule.truckType,
        minPoint: rule.minPoint,
        maxPoint: rule.maxPoint,
        price: rule.price
      }));
      setPricingRules(defaultPricing);
    }

    // 車種係数の読み込み
    const savedCoefficients = localStorage.getItem('truckCoefficients');
    if (savedCoefficients) {
      setTruckCoefficients(JSON.parse(savedCoefficients));
    } else {
      const defaultCoefficients = DEFAULT_TRUCK_COEFFICIENTS.map((coef, index) => ({
        id: `coef-${index}`,
        truckType: coef.truckType,
        coefficient: coef.coefficient
      }));
      setTruckCoefficients(defaultCoefficients);
    }

    // 距離料金の読み込み
    const savedDistance = localStorage.getItem('distanceRanges');
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

    // トラックデータの読み込み
    const savedTrucks = localStorage.getItem('pricingTrucks');
    if (savedTrucks) {
      setPricingTrucks(JSON.parse(savedTrucks));
    } else {
      // デフォルトのトラックデータ
      const defaultTrucks: PricingTruck[] = [
        {
          id: 'truck-1',
          name: '軽トラA',
          plateNumber: '品川 500 あ 1234',
          truckType: '軽トラ',
          capacityKg: 500,
          basePrice: 15000,
          status: 'active',
          description: '小型荷物用',
        },
        {
          id: 'truck-2',
          name: '2tショートA',
          plateNumber: '品川 500 い 5678',
          truckType: '2tショート',
          capacityKg: 1000,
          basePrice: 25000,
          status: 'active',
          description: '一般家庭用',
        },
        {
          id: 'truck-3',
          name: '4tロングA',
          plateNumber: '品川 500 う 9012',
          truckType: '4t',
          capacityKg: 2000,
          basePrice: 60000,
          status: 'active',
          description: '大型荷物用',
        },
      ];
      setPricingTrucks(defaultTrucks);
    }

    setIsLoading(false);
  }, []);

  /**
   * 料金ルールの自動保存
   */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep2', JSON.stringify(pricingRules));
    }
  }, [pricingRules, isLoading]);

  /**
   * 車種係数の自動保存
   */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('truckCoefficients', JSON.stringify(truckCoefficients));
    }
  }, [truckCoefficients, isLoading]);

  /**
   * 距離料金の自動保存
   */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('distanceRanges', JSON.stringify(distanceRanges));
    }
  }, [distanceRanges, isLoading]);

  /**
   * トラックデータの自動保存
   */
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingTrucks', JSON.stringify(pricingTrucks));
    }
  }, [pricingTrucks, isLoading]);

  /**
   * オプション設定の自動保存
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optionPricingStep2');
      if (saved) {
        setOptions(JSON.parse(saved));
      }
    }
  }, []);

  /**
   * 料金ルールの追加
   * - バリデーション後、新しい料金ルールを追加
   */
  const addPricingRule = () => {
    const errors: string[] = [];
    if (!newTruckType) errors.push('トラック種別を選択してください');
    if (newPricingMaxPoint === undefined) errors.push('ポイント最大値は必須です');
    if (newPricingPrice === undefined) errors.push('料金は必須です');
    const lastRule = pricingRules[pricingRules.length - 1];
    const newMinPoint = lastRule && lastRule.maxPoint !== undefined ? lastRule.maxPoint + 1 : 1;
    if (newPricingMaxPoint !== undefined && newPricingMaxPoint <= newMinPoint) errors.push('最大値は前の行の最大値より大きい値を選択してください');
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
      setOptionAddError('最低1行は必要です');
      return;
    }
    setPricingRules(pricingRules.filter(rule => rule.id !== id));
    setOptionAddError('');
  };

  /**
   * 料金ルールの更新
   * @param id 更新するルールのID
   * @param field 更新するフィールド
   * @param value 新しい値
   */
  const updatePricingRule = (id: string, field: keyof PricingRule, value: any) => {
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
    if (ruleIndex === -1) return;
    
    const rule = pricingRules[ruleIndex];
    const prevRule = ruleIndex > 0 ? pricingRules[ruleIndex - 1] : null;
    
    // 新しい最小値を計算
    const newMinPoint = prevRule && prevRule.maxPoint !== undefined ? prevRule.maxPoint + 1 : 1;
    
    // 最大値の妥当性チェック
    if (newMaxPoint <= newMinPoint) {
      setOptionAddError('最大値は前の行の最大値より大きい値を選択してください');
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
    setOptionAddError('');
  };



  // 車種係数更新
  const updateTruckCoefficient = (id: string, coefficient: number) => {
    setTruckCoefficients(prev => prev.map(coef =>
      coef.id === id ? { ...coef, coefficient: Math.max(0.1, coefficient) } : coef
    ));
  };

  // 新しい車種追加用state
  const [newTruckTypeForCoefficient, setNewTruckTypeForCoefficient] = useState<string>('');
  const [newTruckCoefficient, setNewTruckCoefficient] = useState<number>(1.0);
  const [truckTypeError, setTruckTypeError] = useState<string>('');

  // 車種追加
  const addTruckType = () => {
    if (!newTruckTypeForCoefficient.trim()) {
      setTruckTypeError('車種名は必須です');
      return;
    }
    
    // 重複チェック
    if (truckCoefficients.some(coef => coef.truckType === newTruckTypeForCoefficient.trim())) {
      setTruckTypeError('この車種は既に登録されています');
      return;
    }

    const newTruck: TruckCoefficient = {
      id: `coef-${Date.now()}`,
      truckType: newTruckTypeForCoefficient.trim(),
      coefficient: newTruckCoefficient
    };

    setTruckCoefficients(prev => [...prev, newTruck]);
    setNewTruckTypeForCoefficient('');
    setNewTruckCoefficient(1.0);
    setTruckTypeError('');
  };

  // 車種削除
  const removeTruckType = (id: string) => {
    const truckToRemove = truckCoefficients.find(coef => coef.id === id);
    if (!truckToRemove) return;

    // 料金設定で使用されているかチェック
    const isUsedInPricing = pricingRules.some(rule => rule.truckType === truckToRemove.truckType);
    if (isUsedInPricing) {
      setTruckTypeError(`「${truckToRemove.truckType}」は料金設定で使用されているため削除できません`);
      return;
    }

    setTruckCoefficients(prev => prev.filter(coef => coef.id !== id));
    setTruckTypeError('');
  };

  // 距離料金更新
  const updateDistanceRange = (id: string, field: keyof DistanceRange, value: any) => {
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

  // 料金計算例（車種係数×距離加算額）
  const calculateExamplePrice = (truckType: string, distance: number) => {
    const coefficient = truckCoefficients.find(coef => coef.truckType === truckType)?.coefficient || 1.0;
    const distancePrice = distanceRanges.find(range => 
      distance <= range.maxDistance
    )?.basePrice || 0;
    
    return Math.round(coefficient * distancePrice);
  };

  // トラック管理関数
  const addPricingTruck = () => {
    if (!truckFormData.name || !truckFormData.plateNumber || !truckFormData.truckType) {
      alert('車両名、ナンバープレート、トラック種別は必須です');
      return;
    }

    const newTruck: PricingTruck = {
      id: `truck-${Date.now()}`,
      ...truckFormData,
    };

    setPricingTrucks(prev => [...prev, newTruck]);
    setTruckFormData({
      name: '',
      plateNumber: '',
      truckType: '',
      capacityKg: 1000,
      basePrice: 0,
      status: 'active',
      description: '',
    });
    setShowTruckModal(false);
  };

  const updatePricingTruck = (updatedTruck: PricingTruck) => {
    setPricingTrucks(prev => prev.map(truck => 
      truck.id === updatedTruck.id ? updatedTruck : truck
    ));
    setSelectedTruck(null);
    setShowTruckModal(false);
  };

  const deletePricingTruck = (truckId: string) => {
    if (window.confirm('このトラックを削除しますか？')) {
      setPricingTrucks(prev => prev.filter(truck => truck.id !== truckId));
    }
  };

  const openTruckModal = (truck?: PricingTruck) => {
    if (truck) {
      setSelectedTruck(truck);
      setTruckFormData({
        name: truck.name,
        plateNumber: truck.plateNumber,
        truckType: truck.truckType,
        capacityKg: truck.capacityKg,
        basePrice: truck.basePrice,
        status: truck.status,
        description: truck.description || '',
      });
    } else {
      setSelectedTruck(null);
      setTruckFormData({
        name: '',
        plateNumber: '',
        truckType: '',
        capacityKg: 1000,
        basePrice: 0,
        status: 'active',
        description: '',
      });
    }
    setShowTruckModal(true);
  };

  // validatePricingのエラーを画面上部に表示、エラー行は赤枠
  const validatePricing = (): { isValid: boolean; errors: string[]; errorIds: Set<string> } => {
    const errors: string[] = [];
    const errorIds = new Set<string>();
    if (pricingRules.length === 0) {
      errors.push('最低1つの料金設定が必要です');
      return { isValid: false, errors, errorIds };
    }
    const combinations = new Set();
    for (let i = 0; i < pricingRules.length; i++) {
      const rule = pricingRules[i];
      const key = `${rule.truckType}-${rule.minPoint}-${rule.maxPoint}`;
      if (combinations.has(key)) {
        errors.push(`重複: ${rule.truckType} × ${rule.minPoint} - ${rule.maxPoint}の設定が重複しています`);
        errorIds.add(rule.id);
      } else {
        combinations.add(key);
      }
      if (!rule.truckType) {
        errors.push(`行${i+1}: トラック種別を選択してください`);
        errorIds.add(rule.id);
      }
      if (rule.price === undefined || rule.price < 0) {
        errors.push(`行${i+1}: 料金は0円以上で入力してください`);
        errorIds.add(rule.id);
      }
    }
    for (let i = 0; i < pricingRules.length - 1; i++) {
      const currentRule = pricingRules[i];
      const nextRule = pricingRules[i + 1];
      if (currentRule.maxPoint !== undefined && nextRule.minPoint !== undefined) {
        if (currentRule.maxPoint + 1 !== nextRule.minPoint) {
          errors.push(`ポイント範囲の連続性エラー: ${currentRule.truckType}(${currentRule.minPoint}-${currentRule.maxPoint}) と ${nextRule.truckType}(${nextRule.minPoint}-${nextRule.maxPoint}) の間が連続していません`);
          errorIds.add(currentRule.id);
          errorIds.add(nextRule.id);
        }
      }
    }
    return { isValid: errors.length === 0, errors, errorIds };
  };



  // オプション追加
  const handleAddOption = () => {
    if (!optionFormState.newOptionLabel.trim()) {
      setOptionAddError('オプション名は必須です');
      return;
    }
    if (optionFormState.newOptionType === 'paid' && (!optionFormState.newOptionPrice || optionFormState.newOptionPrice < 0)) {
      setOptionAddError('有料オプションは金額を0円以上で入力してください');
      return;
    }
    if (optionFormState.newOptionMinPoint === undefined || optionFormState.newOptionMaxPoint === undefined) {
      setOptionAddError('ポイント最小値・最大値は必須です');
      return;
    }
    if (optionFormState.newOptionMinPoint >= optionFormState.newOptionMaxPoint) {
      setOptionAddError('最大値は最小値より大きい値を入力してください');
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
        minPoint: optionFormState.newOptionMinPoint,
        maxPoint: optionFormState.newOptionMaxPoint,
      }
    ]);
    optionFormDispatch({ type: 'RESET_FORM' });
    setOptionAddError('');
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
      const aValue: any = a[sortField];
      const bValue: any = b[sortField];
      
      // undefinedの場合は最後に配置
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
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
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // handleNextでバリデーションエラーを画面上部に表示
  const handleNext = () => {
    const validation = validatePricing();
    setPricingErrors(validation.errors);
    setRowErrorIds(validation.errorIds);
    if (!validation.isValid) return;
    router.push('/pricing/step3');
  };

  // 前へ戻る
  const handleBack = () => {
    router.push('/pricing/step1');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            💰 料金設定
          </h1>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">1</div>
              <span className="ml-2">ポイント設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span className="ml-2">料金設定</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
              <span className="ml-2">シーズン設定</span>
            </div>
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">📋 設定内容</h2>
          <p className="text-gray-700">
            トラック種別とポイント範囲に応じた料金を設定します。
            ポイント最小値は自動設定され、最大値のみ選択できます。各設定は連続したポイント範囲で管理されます。
          </p>
        </div>

        {/* 料金設定 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">💰 料金設定</h2>
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
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th 
                      className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('truckType')}
                    >
                      <div className="flex items-center justify-between">
                        トラック種別
                        <span className="text-xs">{getSortIcon('truckType')}</span>
                      </div>
                    </th>
                    <th 
                      className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('minPoint')}
                    >
                      <div className="flex items-center justify-between">
                        ポイント範囲
                        <span className="text-xs">{getSortIcon('minPoint')}</span>
                      </div>
                    </th>
                    <th 
                      className="border border-gray-200 px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-between">
                        料金
                        <span className="text-xs">{getSortIcon('price')}</span>
                      </div>
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">追加・削除</th>
                  </tr>
                </thead>
                <tbody>
                  {sortPricingRules(pricingRules).map((rule, index) => (
                    <tr key={rule.id} className={`hover:bg-gray-50 ${rowErrorIds.has(rule.id) ? 'border-2 border-red-500' : ''}`}>
                      <td className="border border-gray-200 px-4 py-2">
                        <select
                          value={rule.truckType}
                          onChange={e => updatePricingRule(rule.id, 'truckType', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">トラック種別を選択</option>
                          {TRUCK_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                          {truckCoefficients
                            .filter(coef => !TRUCK_TYPES.includes(coef.truckType))
                            .map(coef => (
                              <option key={coef.truckType} value={coef.truckType}>{coef.truckType}</option>
                            ))
                          }
                        </select>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{rule.minPoint}</span>
                          <span className="text-gray-500">～</span>
                          <select
                            value={rule.maxPoint ?? ''}
                            onChange={e => updateMaxPoint(rule.id, e.target.value ? parseInt(e.target.value) : 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">最大値</option>
                            {POINT_RANGE.filter(point => point > rule.minPoint).map(point => (
                              <option key={point} value={point}>{point}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={rule.price ?? ''}
                          onChange={e => updatePricingRule(rule.id, 'price', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full min-w-[60px] max-w-[100px] px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right"
                          placeholder="料金"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <button
                          onClick={() => removePricingRule(rule.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >🗑️ 削除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* 料金設定追加フォーム */}
          <div className="flex flex-wrap gap-2 mt-4 items-end bg-blue-50 p-4 rounded">
            <select
              value={newTruckType}
              onChange={e => setNewTruckType(e.target.value)}
              className="border rounded px-2 py-1 min-w-[120px]"
            >
              <option value="">トラック種別を選択</option>
              {TRUCK_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              {truckCoefficients
                .filter(coef => !TRUCK_TYPES.includes(coef.truckType))
                .map(coef => (
                  <option key={coef.truckType} value={coef.truckType}>{coef.truckType}</option>
                ))
              }
            </select>
            <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">{pricingRules.length > 0 ? (pricingRules[pricingRules.length-1].maxPoint!+1) : 1}</span>
            <span className="text-gray-500">～</span>
            <select
              value={newPricingMaxPoint ?? ''}
              onChange={e => setNewPricingMaxPoint(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border rounded px-2 py-1 min-w-[80px]"
            >
              <option value="">最大値</option>
              {POINT_RANGE.filter(point => pricingRules.length === 0 || point > pricingRules[pricingRules.length-1].maxPoint!).map(point => (
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

        {/* 料金計算例 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 料金設定例</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 各設定は「トラック種別 × ポイント範囲」で管理</p>
            <p>• ポイント最小値は自動設定（前の行の最大値 + 1）</p>
            <p>• 最初の行は最小値1から開始</p>
            <p>• 例：1行目 1-100、2行目 101-250、3行目 251-350...</p>
          </div>
        </div>

        {/* 車種係数設定 */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🚛 車種係数設定</h2>
          <p className="text-sm text-gray-600 mb-4">
            各車種の係数を設定します。この係数は距離加算額に乗算されます。
          </p>
          
          {truckTypeError && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded p-3 mb-4">
              {truckTypeError}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">車種</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">係数</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {truckCoefficients.map((coef) => (
                  <tr key={coef.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="text-gray-800">{coef.truckType}</span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={coef.coefficient}
                        onChange={e => updateTruckCoefficient(coef.id, parseFloat(e.target.value) || 1.0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right"
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        onClick={() => removeTruckType(coef.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="この車種を削除"
                      >
                        🗑️ 削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 車種追加フォーム */}
          <div className="flex flex-wrap gap-2 mt-4 items-end bg-blue-50 p-4 rounded">
            <input
              type="text"
              value={newTruckTypeForCoefficient}
              onChange={e => setNewTruckTypeForCoefficient(e.target.value)}
              className="border rounded px-3 py-1 min-w-[150px]"
              placeholder="新しい車種名"
            />
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={newTruckCoefficient}
              onChange={e => setNewTruckCoefficient(parseFloat(e.target.value) || 1.0)}
              className="border rounded px-2 py-1 min-w-[80px]"
              placeholder="係数"
            />
            <button
              onClick={addTruckType}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
            >
              ＋ 車種追加
            </button>
          </div>
        </div>

        {/* 距離加算額設定 */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">📍 距離加算額設定</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            距離範囲ごとの基本加算額を設定します。車種係数と乗算して最終料金が算出されます。
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">距離範囲（km）</th>
                  {TRUCK_TYPES.map(type => (
                    <th key={type} className="border border-gray-200 px-4 py-2 text-left">{type}</th>
                  ))}
                  {truckCoefficients
                    .filter(coef => !TRUCK_TYPES.includes(coef.truckType))
                    .map(coef => (
                      <th key={coef.truckType} className="border border-gray-200 px-4 py-2 text-left">{coef.truckType}</th>
                    ))
                  }
                  <th className="border border-gray-200 px-4 py-2 text-left">基本加算額</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {distanceRanges.map((range, index) => {
                  const prevMaxDistance = index > 0 ? distanceRanges[index - 1].maxDistance : 0;
                  const distanceRangeText = index === 0 ? `〜${range.maxDistance}km` : `${prevMaxDistance + 1}〜${range.maxDistance}km`;
                  
                  return (
                    <tr key={range.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600 text-sm">{distanceRangeText}</span>
                          <input
                            type="number"
                            min="1"
                            value={range.maxDistance}
                            onChange={e => updateDistanceRange(range.id, 'maxDistance', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-sm"
                          />
                          <span className="text-gray-500 text-sm">km</span>
                        </div>
                      </td>
                      {TRUCK_TYPES.map(type => (
                        <td key={type} className="border border-gray-200 px-4 py-2 text-center text-sm text-gray-600">
                          ¥{Math.round((truckCoefficients.find(c => c.truckType === type)?.coefficient || 1.0) * range.basePrice).toLocaleString()}
                        </td>
                      ))}
                      {truckCoefficients
                        .filter(coef => !TRUCK_TYPES.includes(coef.truckType))
                        .map(coef => (
                          <td key={coef.truckType} className="border border-gray-200 px-4 py-2 text-center text-sm text-gray-600">
                            ¥{Math.round(coef.coefficient * range.basePrice).toLocaleString()}
                          </td>
                        ))
                      }
                      <td className="border border-gray-200 px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={range.basePrice}
                          onChange={e => updateDistanceRange(range.id, 'basePrice', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right text-sm"
                          placeholder="基本額"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <button
                          onClick={() => removeDistanceRange(range.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >🗑️ 削除</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* 距離範囲追加フォーム */}
          <div className="mt-4">
            <button
              onClick={addDistanceRange}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
              ＋ 距離範囲追加
            </button>
          </div>
        </div>

        {/* 料金計算例（車種係数×距離加算額） */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🧮 料金計算例（車種係数×距離加算額）</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {truckCoefficients.map((coef) => (
              <div key={coef.id} className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-gray-800 mb-2">{coef.truckType}</h4>
                <div className="space-y-1 text-sm">
                  <div>係数: {coef.coefficient}</div>
                  <div>10km: ¥{calculateExamplePrice(coef.truckType, 10).toLocaleString()}</div>
                  <div>30km: ¥{calculateExamplePrice(coef.truckType, 30).toLocaleString()}</div>
                  <div>50km: ¥{calculateExamplePrice(coef.truckType, 50).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>• 計算式: 車種係数 × 距離加算額 = 最終料金</p>
            <p>• 例：軽トラ（係数1.0）× 30km（加算額4,000円）= 4,000円</p>
            <p>• 例：4t（係数1.8）× 50km（加算額6,000円）= 10,800円</p>
          </div>
        </div>

        {/* オプション料金設定 */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🛠️ オプション料金設定</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">オプション名</th>
                  <th className="border border-gray-200 px-6 py-2 text-left">種別</th>
                  <th className="border border-gray-200 px-2 py-2 text-left">金額（円）</th>
                  <th className="border border-gray-200 px-2 py-2 text-left">単位数量</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">備考</th>
                </tr>
              </thead>
              <tbody>
                {options.map((opt, idx) => (
                  <tr key={opt.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">
                      {opt.isDefault ? (
                        <span className="text-gray-800">{opt.label}</span>
                      ) : (
                        <input
                          type="text"
                          value={opt.label}
                          onChange={e => handleOptionLabelChange(opt.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </td>
                    <td className="border border-gray-200 px-6 py-2">
                      <select
                        value={opt.type}
                        onChange={e => handleOptionTypeChange(opt.id, e.target.value as OptionType)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {OPTION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-2 py-2">
                      <input
                        type="text"
                        value={opt.type === 'individual' || opt.type === 'free' ? '' : (opt.price ?? 0).toLocaleString()}
                        onChange={e => {
                          const value = e.target.value;
                          if (/[^\u0000-\u007f]+/.test(value)) {
                            setOptionErrors(prev => ({ ...prev, [opt.id]: '※半角数値のみ' }));
                            return;
                          } else {
                            setOptionErrors(prev => ({ ...prev, [opt.id]: '' }));
                            const num = value.replace(/,/g, '');
                            handleOptionPriceChange(opt.id, parseInt(num) || 0);
                          }
                        }}
                        className={`w-full min-w-[60px] max-w-[100px] px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right ${opt.type === 'individual' || opt.type === 'free' ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                        disabled={opt.type === 'individual' || opt.type === 'free'}
                      />
                      {optionFormState.optionErrors[opt.id] && (
                        <div className="text-red-600 text-xs mt-1">{optionFormState.optionErrors[opt.id]}</div>
                      )}
                    </td>
                    <td className="border border-gray-200 px-2 py-2">
                      {opt.type === 'individual' || opt.type === 'free' || opt.label === '🏠 建物養生（壁や床の保護）' ? (
                        <select disabled className="w-full min-w-[60px] max-w-[100px] px-1 py-1 border border-gray-300 rounded bg-gray-200 cursor-not-allowed text-right">
                          <option value=""></option>
                        </select>
                      ) : (
                        <select
                          value={opt.unit ?? ''}
                          onChange={e => handleOptionUnitChange(opt.id, e.target.value)}
                          className="w-full min-w-[60px] max-w-[100px] px-1 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-right"
                        >
                          <option value=""></option>
                          {[...Array(100)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <input
                        type="text"
                        value={opt.remarks ?? ''}
                        onChange={e => handleOptionRemarksChange(opt.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                      {!opt.isDefault && (
                        <button
                          onClick={() => handleDeleteOption(opt.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >🗑️ 削除</button>
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
                min="0"
                value={optionFormState.newOptionPrice}
                onChange={e => optionFormDispatch({ type: 'SET_NEW_OPTION_PRICE', payload: parseInt(e.target.value) || 0 })}
                className="border rounded px-2 py-1 min-w-[80px]"
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
              type="number"
              min="0"
              value={optionFormState.newOptionPrice}
              onChange={e => optionFormDispatch({ type: 'SET_NEW_OPTION_PRICE', payload: parseInt(e.target.value) || 0 })}
              className="border rounded px-2 py-1 min-w-[60px] max-w-[100px] text-right"
              placeholder="料金"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
            >追加</button>
          </div>
           {optionAddError && <div className="text-red-600 text-sm mt-2">{optionAddError}</div>}
        </div>

                {/* トラック管理 */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">🚚 トラック管理</h2>
            <button
              onClick={() => openTruckModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ＋ トラック追加
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">車両名</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">ナンバープレート</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">トラック種別</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">積載量</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">基本料金</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">ステータス</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">説明</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {pricingTrucks.map((truck) => (
                  <tr key={truck.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 font-medium">
                      {truck.name}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {truck.plateNumber}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {truck.truckType}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      {truck.capacityKg.toLocaleString()}kg
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      ¥{truck.basePrice.toLocaleString()}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        truck.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {truck.status === 'active' ? '稼働中' : '停止中'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                      {truck.description || '-'}
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openTruckModal(truck)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deletePricingTruck(truck.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pricingTrucks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>登録済みのトラックがありません</p>
              <p className="text-sm mt-1">「＋ トラック追加」ボタンからトラックを追加してください</p>
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="bg-gray-400 text-white px-6 py-3 rounded hover:bg-gray-500 transition"
          >
            ← 戻る
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
          >
            次へ →
          </button>
        </div>
      </div>

      {/* トラック管理モーダル */}
      {showTruckModal && (
        <TruckManagementModal
          selectedTruck={selectedTruck}
          truckFormData={truckFormData}
          setTruckFormData={setTruckFormData}
          setShowTruckModal={setShowTruckModal}
          addPricingTruck={addPricingTruck}
          updatePricingTruck={updatePricingTruck}
          truckTypes={TRUCK_TYPES}
        />
      )}
    </main>
  );
} 