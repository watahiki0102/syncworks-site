'use client';

import { useState, useEffect } from 'react';
import { PaymentMethod, PaymentStatus } from '@/types/case';
import { ITEM_CATEGORIES } from '@/constants/items';
import { IntermediaryService } from '../../lib/normalize';

interface CaseFormProps {
  onSubmit: (_formData: any) => void;
  initialData?: any;
}

interface FormData {
  // 顧客基本情報
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // 住所情報
  fromAddress: string;
  toAddress: string;
  fromPostalCode: string;
  toPostalCode: string;
  
  // 引っ越し日（3つの希望日）
  moveDate1: string;
  moveDate2: string;
  moveDate3: string;
  moveTime1: string;
  moveTime2: string;
  moveTime3: string;
  
  // 荷量・作業オプション
  totalPoints: number;
  additionalServices: string[];
  customAdditionalServices: string;
  
  // 見積金額
  estimatedPrice: number;
  taxRate: number;
  priceTaxIncluded: number;
  
  // 契約情報
  contractStatus: 'estimate' | 'confirmed';
  
  // 支払情報
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // 仲介元情報
  intermediaryMode: 'existing' | 'new';
  sourceType: string;
  newIntermediaryName: string;
  
  // その他
  notes: string;
}

const ADDITIONAL_SERVICES = [
  "🏠 建物養生（壁や床の保護）",
  "📦 荷造り・荷ほどきの代行", 
  "🪑 家具・家電の分解・組み立て",
  "🧺 洗濯機取り外し・取り付け",
  "❄️ エアコン取り外し・取り付け",
  "💡 照明・配線工事",
  "🚮 不用品の回収・廃棄",
  "🐾 ペット運搬",
  "🚚 特殊車両の手配"
];

const TIME_SLOTS = [
  { value: 'morning', label: '午前（9:00-12:00）' },
  { value: 'afternoon', label: '午後（13:00-17:00）' },
  { value: 'evening', label: '夕方（17:00-20:00）' },
  { value: 'custom', label: '時間指定' }
];

const PAYMENT_METHODS: PaymentMethod[] = ['銀行振込', '現金', 'クレジットカード', '請求書'];
const PAYMENT_STATUSES: PaymentStatus[] = ['未請求', '請求済', '入金待ち', '入金済', '保留'];

export default function CaseForm({ onSubmit, initialData }: CaseFormProps) {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    fromAddress: '',
    toAddress: '',
    fromPostalCode: '',
    toPostalCode: '',
    moveDate1: '',
    moveDate2: '',
    moveDate3: '',
    moveTime1: '',
    moveTime2: '',
    moveTime3: '',
    totalPoints: 0,
    additionalServices: [],
    customAdditionalServices: '',
    estimatedPrice: 0,
    taxRate: 10,
    priceTaxIncluded: 0,
    contractStatus: 'estimate',
    paymentMethod: '銀行振込',
    paymentStatus: '未請求',
    intermediaryMode: 'existing',
    sourceType: '',
    newIntermediaryName: '',
    notes: ''
  });

  const [customService, setCustomService] = useState<string>('');
  const [showEstimateModal, setShowEstimateModal] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // 仲介元のテストデータを設定
  useEffect(() => {
    IntermediaryService.initializeTestData();
  }, []);

  // 追加サービスに手書き項目を追加
  const addCustomService = () => {
    if (customService.trim()) {
      const newServices = [...formData.additionalServices, customService.trim()];
      updateFormData('additionalServices', newServices);
      setCustomService('');
    }
  };

  useEffect(() => {
    // 税込金額の自動計算
    const taxIncluded = Math.round(formData.estimatedPrice * (1 + formData.taxRate / 100));
    setFormData(prev => ({ ...prev, priceTaxIncluded: taxIncluded }));
  }, [formData.estimatedPrice, formData.taxRate]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必須項目のバリデーション
    if (!formData.customerName.trim()) {
      newErrors.customerName = '顧客名は必須です';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = '電話番号は必須です';
    }

    if (!formData.fromAddress.trim()) {
      newErrors.fromAddress = '引越し元住所は必須です';
    }

    if (!formData.toAddress.trim()) {
      newErrors.toAddress = '引越し先住所は必須です';
    }

    if (!formData.moveDate1) {
      newErrors.moveDate1 = '第1希望の引越し日は必須です';
    }

    if (formData.estimatedPrice < 0) {
      newErrors.estimatedPrice = '見積金額は0以上で入力してください';
    }

    // 仲介元のバリデーション
    if (formData.intermediaryMode === 'existing' && !formData.sourceType) {
      newErrors.sourceType = '仲介元の選択は必須です';
    }
    
    if (formData.intermediaryMode === 'new') {
      if (!formData.newIntermediaryName.trim()) {
        newErrors.newIntermediaryName = '新しい仲介元名は必須です';
      } else if (formData.newIntermediaryName.trim().toLowerCase() === 'syncmoving') {
        newErrors.newIntermediaryName = 'SyncMovingは他社案件として登録できません';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // 新規仲介元の場合は保存して sourceType に設定
      if (formData.intermediaryMode === 'new' && formData.newIntermediaryName.trim()) {
        const newName = formData.newIntermediaryName.trim();
        IntermediaryService.addName(newName);
        
        // 送信データの sourceType を新規仲介元名に設定
        const submissionData = {
          ...formData,
          sourceType: newName
        };
        onSubmit(submissionData);
      } else {
        onSubmit(formData);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { 
      style: 'currency', 
      currency: 'JPY' 
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 顧客基本情報 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">顧客基本情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              顧客名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => updateFormData('customerName', e.target.value)}
              className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="田中太郎"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => updateFormData('customerPhone', e.target.value)}
              className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerPhone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="090-1234-5678"
            />
            {errors.customerPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => updateFormData('customerEmail', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="customer@example.com"
            />
          </div>
        </div>
      </div>

      {/* 仲介元情報 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">仲介元情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              仲介元の選択方法
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center text-gray-900">
                <input
                  type="radio"
                  value="existing"
                  checked={formData.intermediaryMode === 'existing'}
                  onChange={(e) => updateFormData('intermediaryMode', e.target.value as 'existing' | 'new')}
                  className="mr-2"
                />
                既存から選択
              </label>
              <label className="inline-flex items-center text-gray-900">
                <input
                  type="radio"
                  value="new"
                  checked={formData.intermediaryMode === 'new'}
                  onChange={(e) => updateFormData('intermediaryMode', e.target.value as 'existing' | 'new')}
                  className="mr-2"
                />
                新規追加
              </label>
            </div>
          </div>

          {formData.intermediaryMode === 'existing' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仲介元 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sourceType}
                onChange={(e) => updateFormData('sourceType', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sourceType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">仲介元を選択してください</option>
                {IntermediaryService.getSelectOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.sourceType && (
                <p className="mt-1 text-sm text-red-600">{errors.sourceType}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新しい仲介元名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.newIntermediaryName}
                onChange={(e) => updateFormData('newIntermediaryName', e.target.value)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.newIntermediaryName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例：引越し価格ガイド、ズバット引越し比較、LIFULL引越し等"
              />
              {errors.newIntermediaryName && (
                <p className="mt-1 text-sm text-red-600">{errors.newIntermediaryName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                登録後、次回以降は選択肢に表示されます
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 住所情報 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">住所情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              引越し元住所 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={formData.fromPostalCode}
                onChange={(e) => updateFormData('fromPostalCode', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="郵便番号"
              />
              <input
                type="text"
                value={formData.fromAddress}
                onChange={(e) => updateFormData('fromAddress', e.target.value)}
                className={`col-span-3 border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fromAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="住所"
              />
            </div>
            {errors.fromAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.fromAddress}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              引越し先住所 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={formData.toPostalCode}
                onChange={(e) => updateFormData('toPostalCode', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="郵便番号"
              />
              <input
                type="text"
                value={formData.toAddress}
                onChange={(e) => updateFormData('toAddress', e.target.value)}
                className={`col-span-3 border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.toAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="住所"
              />
            </div>
            {errors.toAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.toAddress}</p>
            )}
          </div>
        </div>
      </div>

      {/* 引っ越し日（3つの希望日） */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">引っ越し希望日</h3>
        <p className="text-sm text-gray-600 mb-4">最大3つまで希望日を入力できます</p>
        
        {/* 第1希望 */}
        <div className="space-y-4 mb-6">
          <h4 className="text-md font-medium text-gray-900">第1希望 <span className="text-red-500">*</span></h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={formData.moveDate1}
                onChange={(e) => updateFormData('moveDate1', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.moveDate1 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.moveDate1 && (
                <p className="mt-1 text-sm text-red-600">{errors.moveDate1}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間帯</label>
              <select
                value={formData.moveTime1}
                onChange={(e) => updateFormData('moveTime1', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 第2希望 */}
        <div className="space-y-4 mb-6">
          <h4 className="text-md font-medium text-gray-900">第2希望</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={formData.moveDate2}
                onChange={(e) => updateFormData('moveDate2', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間帯</label>
              <select
                value={formData.moveTime2}
                onChange={(e) => updateFormData('moveTime2', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 第3希望 */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">第3希望</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input
                type="date"
                value={formData.moveDate3}
                onChange={(e) => updateFormData('moveDate3', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間帯</label>
              <select
                value={formData.moveTime3}
                onChange={(e) => updateFormData('moveTime3', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 荷量・作業オプションと見積金額 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">荷量・作業オプションと見積金額</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <button
                type="button"
                onClick={() => setShowEstimateModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors"
              >
                荷物を入力して算出
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                荷物情報を入力して見積を計算します
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                荷物ポイント数
              </label>
              <input
                type="number"
                value={formData.totalPoints || ''}
                onChange={(e) => updateFormData('totalPoints', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="10.5"
                step="0.5"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                見積金額（税抜）
              </label>
              <input
                type="number"
                value={formData.estimatedPrice || ''}
                onChange={(e) => updateFormData('estimatedPrice', parseInt(e.target.value) || 0)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimatedPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50000"
                min="0"
              />
              {errors.estimatedPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedPrice}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              追加サービス
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {ADDITIONAL_SERVICES.map((service) => (
                <label key={service} className="flex items-center text-sm text-gray-900">
                  <input
                    type="checkbox"
                    checked={formData.additionalServices.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFormData('additionalServices', [...formData.additionalServices, service]);
                      } else {
                        updateFormData('additionalServices', formData.additionalServices.filter(s => s !== service));
                      }
                    }}
                    className="mr-2"
                  />
                  {service}
                </label>
              ))}
            </div>
            
            {/* カスタムサービス追加機能 */}
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カスタムサービスを追加
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="サービス名を入力してください"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomService()}
                />
                <button
                  type="button"
                  onClick={addCustomService}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  追加
                </button>
              </div>
            </div>

            {/* 自由記述追加サービス */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他追加サービス（自由記述）
              </label>
              <textarea
                value={formData.customAdditionalServices}
                onChange={(e) => updateFormData('customAdditionalServices', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="特別なサービスや詳細な要求事項があれば自由にご記入ください"
              />
              <p className="text-xs text-gray-500 mt-1">上記のサービス以外で必要なものがあれば記入してください</p>
            </div>

            {/* 追加されたサービス一覧 */}
            {formData.additionalServices.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">選択されたサービス:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.additionalServices.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => {
                          const newServices = formData.additionalServices.filter(s => s !== service);
                          updateFormData('additionalServices', newServices);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
          
        {/* 税率と税込金額の表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              税率（%）
            </label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              税込金額
            </label>
            <div className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-lg font-semibold text-gray-900">
              {formatCurrency(formData.priceTaxIncluded)}
            </div>
          </div>
        </div>
      </div>

      {/* 契約情報 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">契約情報</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約ステータス
            </label>
            <select
              value={formData.contractStatus}
              onChange={(e) => updateFormData('contractStatus', e.target.value as any)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="estimate">見積</option>
              <option value="confirmed">契約済み</option>
            </select>
          </div>
        </div>
      </div>

      {/* 支払情報 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">支払情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              支払方法
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => updateFormData('paymentMethod', e.target.value as PaymentMethod)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              支払状況
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => updateFormData('paymentStatus', e.target.value as PaymentStatus)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 備考 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">備考・特記事項</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="特別な要望や注意事項があれば記載してください"
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-medium shadow-md hover:shadow-lg transition-all"
        >
          案件を登録
        </button>
      </div>

      {/* 見積モーダル */}
      {showEstimateModal && (
        <EstimateModal
          isOpen={showEstimateModal}
          onClose={() => setShowEstimateModal(false)}
          onCalculate={(_result) => {
            updateFormData('totalPoints', _result.totalPoints);
            updateFormData('estimatedPrice', _result.estimatedPrice);
            setShowEstimateModal(false);
          }}
        />
      )}
    </form>
  );
}

// 見積計算モーダルコンポーネント
interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (result: { totalPoints: number; estimatedPrice: number }) => void;
}

function EstimateModal({ isOpen, onClose, onCalculate }: EstimateModalProps) {
  const [items, setItems] = useState<Record<string, number>>({});
  const [boxOption, setBoxOption] = useState<string>('');
  const [boxCount, setBoxCount] = useState<number>(0);

  const boxSizeOptions = [
    "🏠 10箱未満（荷物が少ない）",
    "🏠 10〜20箱（1R / 1K の目安）",
    "🏠 21〜30箱（1LDK / 2K の目安）",
    "🏠 31〜50箱（2LDK / 3K の目安）",
    "🏠 51箱以上（3LDK / 4K以上の目安）"
  ];

  const handleQuantityChange = (itemName: string, increment: boolean) => {
    setItems(prev => {
      const current = prev[itemName] || 0;
      return {
        ...prev,
        [itemName]: increment ? current + 1 : Math.max(0, current - 1)
      };
    });
  };

  const getItemPoints = (itemName: string): number => {
    for (const category of ITEM_CATEGORIES) {
      for (const item of category.items) {
        if (item.name === itemName) {
          return item.defaultPoints;
        }
      }
    }
    return 2; // デフォルト
  };

  const getDanballPoints = (danballOption: string): number => {
    if (danballOption.includes('10箱未満')) return 5;
    if (danballOption.includes('10〜20箱')) return 10;
    if (danballOption.includes('21〜30箱')) return 15;
    if (danballOption.includes('31〜50箱')) return 25;
    if (danballOption.includes('51箱以上')) return boxCount > 50 ? Math.floor(boxCount / 10) * 5 : 40;
    return 0;
  };

  const calculateEstimate = () => {
    let totalPoints = 0;
    
    // アイテムポイントの計算
    Object.entries(items).forEach(([itemName, quantity]) => {
      if (quantity > 0) {
        totalPoints += getItemPoints(itemName) * quantity;
      }
    });
    
    // 段ボールポイントの追加
    if (boxOption) {
      totalPoints += getDanballPoints(boxOption);
    }
    
    // 基本料金の計算
    let estimatedPrice = 25000; // 基本料金
    
    if (totalPoints <= 50) {
      estimatedPrice = 25000;
    } else if (totalPoints <= 75) {
      estimatedPrice = 35000;
    } else if (totalPoints <= 100) {
      estimatedPrice = 45000;
    } else if (totalPoints <= 150) {
      estimatedPrice = 60000;
    } else {
      estimatedPrice = 80000;
    }
    
    // ポイント数による追加料金
    estimatedPrice += totalPoints * 500;
    
    return { totalPoints, estimatedPrice };
  };

  const handleCalculateAndApply = () => {
    const result = calculateEstimate();
    onCalculate(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">荷物情報入力</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* 家具・家電の数量入力 */}
        {ITEM_CATEGORIES.map((category) => (
          <div key={category.category} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium mb-3 text-gray-900">{category.category}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {category.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-white p-2 rounded border">
                  <label className="flex-1 text-sm text-gray-900">{item.name}</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.name, false)}
                      className="px-2 py-1 bg-gray-200 text-gray-900 rounded text-sm hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                      {items[item.name] || 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.name, true)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* 段ボール目安 */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-3 text-gray-900">段ボール目安</h4>
          <div className="space-y-2">
            {boxSizeOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="boxOption"
                  value={option}
                  checked={boxOption === option}
                  onChange={(e) => setBoxOption(e.target.value)}
                  className="form-radio text-blue-600"
                />
                <span className="text-sm text-gray-900">{option}</span>
              </label>
            ))}
            {boxOption?.includes('51箱以上') && (
              <div className="mt-2 ml-6">
                <label className="block text-sm font-medium text-gray-700">
                  必要箱数を入力
                </label>
                <input
                  type="number"
                  value={boxCount}
                  onChange={(e) => setBoxCount(Number(e.target.value))}
                  min={50}
                  className="mt-1 w-32 px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                  placeholder="例：60"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* 計算結果プレビュー */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">計算結果プレビュー</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">総ポイント数: </span>
              <span className="font-medium">{calculateEstimate().totalPoints}pt</span>
            </div>
            <div>
              <span className="text-blue-700">見積金額: </span>
              <span className="font-medium">
                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(calculateEstimate().estimatedPrice)}
              </span>
            </div>
          </div>
        </div>
        
        {/* ボタン */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            キャンセル
          </button>
          <button
            onClick={handleCalculateAndApply}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            算出結果を適用
          </button>
        </div>
      </div>
    </div>
  );
}
