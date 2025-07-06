'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// トラック種別の定義
const TRUCK_TYPES = [
  "軽トラ",
  "2tショート",
  "2tロング",
  "3t",
  "4t",
  "4t複数",
  "特別対応"
];

// 作業人数の定義
const WORKER_COUNTS = [1, 2, 3, 4, 5, 6];

// ポイント範囲の定義（1～9999、1刻みで詳細設定可能）
const POINT_RANGE = Array.from({ length: 9999 }, (_, i) => i + 1);

// 初期データ
const DEFAULT_PRICING = [
  { truckType: "軽トラ", minPoint: 1, maxPoint: 100, price: 15000 },
  { truckType: "2tショート", minPoint: 101, maxPoint: 250, price: 25000 },
  { truckType: "2tロング", minPoint: 251, maxPoint: 350, price: 35000 },
  { truckType: "3t", minPoint: 351, maxPoint: 450, price: 45000 },
  { truckType: "4t", minPoint: 451, maxPoint: 600, price: 60000 },
  { truckType: "4t複数", minPoint: 601, maxPoint: 800, price: 80000 },
  { truckType: "特別対応", minPoint: 801, maxPoint: 1000, price: 100000 },
];

interface PricingRule {
  id: string;
  truckType: string;
  minPoint: number;
  maxPoint: number | undefined;
  price: number | undefined;
}

// オプション型
const OPTION_TYPES = [
  { value: 'free', label: '無料オプション', color: 'text-green-600' },
  { value: 'paid', label: '定額オプション', color: 'text-blue-600' },
  { value: 'individual', label: '個別見積もり', color: 'text-blue-600' },
  { value: 'nonSupported', label: '対応不可', color: 'text-red-600' },
] as const;
type OptionType = typeof OPTION_TYPES[number]['value'];
interface OptionItem {
  id: string;
  label: string;
  type: OptionType;
  price?: number; // 有料のみ
  isDefault?: boolean;
  unit?: string;
  remarks?: string; // Added missing property
  minPoint?: number;
  maxPoint?: number;
}
const DEFAULT_OPTIONS: OptionItem[] = [
  { id: 'opt-1', label: '🏠 建物養生（壁や床の保護）', type: 'free', isDefault: true },
  { id: 'opt-2', label: '📦 荷造り・荷ほどきの代行', type: 'free', isDefault: true },
  { id: 'opt-3', label: '🪑 家具・家電の分解・組み立て', type: 'free', isDefault: true },
  { id: 'opt-4', label: '🧺 洗濯機取り外し', type: 'free', isDefault: true },
  { id: 'opt-5', label: '❄️ エアコン（本体＋室外機）取り外し', type: 'free', isDefault: true },
  { id: 'opt-6', label: '💡 照明・テレビ配線取り外し', type: 'free', isDefault: true },
  { id: 'opt-7', label: '🚮 不用品の回収・廃棄', type: 'free', isDefault: true },
  { id: 'opt-8', label: '🐾 ペット運搬', type: 'free', isDefault: true },
];

export default function PricingStep1Page() {
  const router = useRouter();
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [options, setOptions] = useState<OptionItem[]>(DEFAULT_OPTIONS);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionType, setNewOptionType] = useState<OptionType>('free');
  const [newOptionPrice, setNewOptionPrice] = useState<number>(0);
  const [newOptionUnit, setNewOptionUnit] = useState<string>('');
  const [newOptionMinPoint, setNewOptionMinPoint] = useState<number | undefined>(undefined);
  const [newOptionMaxPoint, setNewOptionMaxPoint] = useState<number | undefined>(undefined);
  const [optionErrors, setOptionErrors] = useState<{ [optionId: string]: string }>({});
  const [optionAddError, setOptionAddError] = useState('');
  const [newPricingMaxPoint, setNewPricingMaxPoint] = useState<number | undefined>(undefined);
  const [newPricingPrice, setNewPricingPrice] = useState<number | undefined>(undefined);
  
  // ソート用のstate
  const [sortField, setSortField] = useState<'truckType' | 'minPoint' | 'maxPoint' | 'price'>('minPoint');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // 料金設定追加用state
  const [newTruckType, setNewTruckType] = useState<string>('');
  const [pricingErrors, setPricingErrors] = useState<string[]>([]);
  const [rowErrorIds, setRowErrorIds] = useState<Set<string>>(new Set());

  // 初期データの読み込み
  useEffect(() => {
    const savedPricing = localStorage.getItem('pricingStep1');
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
    setIsLoading(false);
  }, []);

  // 自動保存
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pricingStep1', JSON.stringify(pricingRules));
    }
  }, [pricingRules, isLoading]);

  // オプション自動保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optionPricingStep1');
      if (saved) {
        setOptions(JSON.parse(saved));
      }
    }
  }, []);

  // 料金ルールの追加
  const addPricingRule = () => {
    let errors: string[] = [];
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

  // 料金ルールの削除
  const removePricingRule = (id: string) => {
    if (pricingRules.length <= 1) {
      setOptionAddError('最低1行は必要です');
      return;
    }
    setPricingRules(pricingRules.filter(rule => rule.id !== id));
    setOptionAddError('');
  };

  // 料金ルールの更新
  const updatePricingRule = (id: string, field: keyof PricingRule, value: any) => {
    setPricingRules(pricingRules.map(rule =>
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  // 最大値更新時の最小値自動調整
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

  // 料金計算
  const calculateTotalPrice = (rule: PricingRule) => {
    return rule.price ?? 0;
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

  // 追加フォームのバリデーション
  const isAddOptionMinMaxError =
    newOptionMinPoint === undefined || newOptionMaxPoint === undefined || newOptionMinPoint >= newOptionMaxPoint;

  // オプション追加
  const handleAddOption = () => {
    if (!newOptionLabel.trim()) {
      setOptionAddError('オプション名は必須です');
      return;
    }
    if (newOptionType === 'paid' && (!newOptionPrice || newOptionPrice < 0)) {
      setOptionAddError('有料オプションは金額を0円以上で入力してください');
      return;
    }
    if (newOptionMinPoint === undefined || newOptionMaxPoint === undefined) {
      setOptionAddError('ポイント最小値・最大値は必須です');
      return;
    }
    if (newOptionMinPoint >= newOptionMaxPoint) {
      setOptionAddError('最大値は最小値より大きい値を入力してください');
      return;
    }
    setOptions(prev => [
      ...prev,
      {
        id: `opt-${Date.now()}`,
        label: newOptionLabel.trim(),
        type: newOptionType,
        price: newOptionType === 'paid' ? newOptionPrice : undefined,
        isDefault: false,
        unit: newOptionUnit,
        minPoint: newOptionMinPoint,
        maxPoint: newOptionMaxPoint,
      }
    ]);
    setNewOptionLabel('');
    setNewOptionType('free');
    setNewOptionPrice(0);
    setNewOptionUnit('');
    setNewOptionMinPoint(undefined);
    setNewOptionMaxPoint(undefined);
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

  // オプション最大値変更
  const handleOptionMaxPointChange = (id: string, maxPoint: number) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, maxPoint } : opt));
  };

  // オプション最小値変更
  const handleOptionMinPointChange = (id: string, minPoint: number) => {
    setOptions(prev => prev.map(opt => opt.id === id ? { ...opt, minPoint } : opt));
  };

  // ソート機能
  const sortPricingRules = (rules: PricingRule[]) => {
    return [...rules].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
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
              <span className="ml-2">距離加算</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">4</div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">💰 料金設定</h2>
            <button
              onClick={addPricingRule}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              ＋ 料金設定追加
            </button>
          </div>

          {/* 料金設定追加フォーム */}
          <div className="flex flex-wrap gap-2 mb-4 items-end bg-blue-50 p-4 rounded">
            <select
              value={newTruckType}
              onChange={e => setNewTruckType(e.target.value)}
              className="border rounded px-2 py-1 min-w-[120px]"
            >
              <option value="">トラック種別を選択</option>
              {TRUCK_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
                      {optionErrors[opt.id] && (
                        <div className="text-red-600 text-xs mt-1">{optionErrors[opt.id]}</div>
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
              value={newOptionLabel}
              onChange={e => setNewOptionLabel(e.target.value)}
              className="border rounded px-3 py-1 flex-1 min-w-[180px]"
              placeholder="新しいオプション名"
            />
            <select
              value={newOptionType}
              onChange={e => setNewOptionType(e.target.value as OptionType)}
              className="border rounded px-2 py-1 min-w-[120px]"
            >
              {OPTION_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {newOptionType === 'paid' && (
              <input
                type="text"
                min="0"
                value={newOptionPrice}
                onChange={e => setNewOptionPrice(parseInt(e.target.value) || 0)}
                className="border rounded px-2 py-1 min-w-[80px]"
                placeholder="金額"
              />
            )}
            <input
              type="text"
              value={newOptionUnit}
              onChange={e => setNewOptionUnit(e.target.value)}
              className="border rounded px-2 py-1 min-w-[80px]"
              placeholder="単位数量"
            />
            <input
              type="number"
              min="0"
              value={newPricingMaxPoint ?? ''}
              onChange={e => setNewPricingMaxPoint(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border rounded px-2 py-1 min-w-[60px] max-w-[100px] text-right"
              placeholder="最大値"
            />
            <input
              type="number"
              min="0"
              value={newPricingPrice ?? ''}
              onChange={e => setNewPricingPrice(e.target.value ? parseInt(e.target.value) : undefined)}
              className="border rounded px-2 py-1 min-w-[60px] max-w-[100px] text-right"
              placeholder="料金"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
            >追加</button>
          </div>
          {isAddOptionMinMaxError && <div className="text-red-600 text-xs mt-1">※ 最小値・最大値は必須かつ最大値は最小値より大きい値を入力してください</div>}
          {optionAddError && <div className="text-red-600 text-sm mt-2">{optionAddError}</div>}
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
    </main>
  );
} 