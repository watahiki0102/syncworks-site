'use client';

import { useState, useEffect } from 'react';
import { EstimateInputMode, MoveDateKind, PaymentMethod, PaymentStatus } from '@/types/case';

interface CaseFormProps {
  estimateMode: EstimateInputMode;
  onSubmit: (formData: any) => void;
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
  
  // 引っ越し日
  moveDateKind: MoveDateKind;
  moveDate: string;
  moveTime: string;
  
  // 荷量・作業オプション
  totalPoints: number;
  additionalServices: string[];
  
  // 見積金額
  estimatedPrice: number;
  taxRate: number;
  priceTaxIncluded: number;
  
  // 契約情報
  contractStatus: 'estimate' | 'confirmed' | 'canceled' | 'completed';
  isContracted: boolean;
  
  // 支払情報
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
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

export default function CaseForm({ estimateMode, onSubmit, initialData }: CaseFormProps) {
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    fromAddress: '',
    toAddress: '',
    fromPostalCode: '',
    toPostalCode: '',
    moveDateKind: '希望日',
    moveDate: '',
    moveTime: '',
    totalPoints: 0,
    additionalServices: [],
    estimatedPrice: 0,
    taxRate: 10,
    priceTaxIncluded: 0,
    contractStatus: 'estimate',
    isContracted: false,
    paymentMethod: '銀行振込',
    paymentStatus: '未請求',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    // 契約済みトグルがONの場合、ステータスをconfirmedに固定
    if (formData.isContracted) {
      setFormData(prev => ({ ...prev, contractStatus: 'confirmed' }));
    }
  }, [formData.isContracted]);

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

    if (!formData.moveDate) {
      newErrors.moveDate = '引越し日は必須です';
    }

    if (formData.moveDateKind === '確定日' && !formData.moveDate) {
      newErrors.moveDate = '確定日は必須です';
    }

    if (formData.estimatedPrice < 0) {
      newErrors.estimatedPrice = '見積金額は0以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="customer@example.com"
            />
          </div>
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
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="郵便番号"
              />
              <input
                type="text"
                value={formData.fromAddress}
                onChange={(e) => updateFormData('fromAddress', e.target.value)}
                className={`col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="郵便番号"
              />
              <input
                type="text"
                value={formData.toAddress}
                onChange={(e) => updateFormData('toAddress', e.target.value)}
                className={`col-span-3 border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
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

      {/* 引っ越し日 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">引っ越し日</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日付の種類
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="希望日"
                  checked={formData.moveDateKind === '希望日'}
                  onChange={(e) => updateFormData('moveDateKind', e.target.value as MoveDateKind)}
                  className="mr-2"
                />
                希望日
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="確定日"
                  checked={formData.moveDateKind === '確定日'}
                  onChange={(e) => updateFormData('moveDateKind', e.target.value as MoveDateKind)}
                  className="mr-2"
                />
                確定日
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                引越し日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.moveDate}
                onChange={(e) => updateFormData('moveDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.moveDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.moveDate && (
                <p className="mt-1 text-sm text-red-600">{errors.moveDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                時間帯
              </label>
              <select
                value={formData.moveTime}
                onChange={(e) => updateFormData('moveTime', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">選択してください</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 荷量・作業オプション */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">荷量・作業オプション</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              荷物ポイント数
            </label>
            <input
              type="number"
              value={formData.totalPoints || ''}
              onChange={(e) => updateFormData('totalPoints', parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="10.5"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              追加サービス
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ADDITIONAL_SERVICES.map((service) => (
                <label key={service} className="flex items-center text-sm">
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
          </div>
        </div>
      </div>

      {/* 見積金額 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">見積金額</h3>
        <div className="space-y-4">
          {estimateMode === 'calc' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  距離（km）
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作業時間（時間）
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
                  step="0.5"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  見積もり計算
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                税抜金額
              </label>
              <input
                type="number"
                value={formData.estimatedPrice || ''}
                onChange={(e) => updateFormData('estimatedPrice', parseInt(e.target.value) || 0)}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimatedPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50000"
                min="0"
              />
              {errors.estimatedPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                税率（%）
              </label>
              <input
                type="number"
                value={formData.taxRate}
                onChange={(e) => updateFormData('taxRate', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
      </div>

      {/* 契約情報 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">契約情報</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isContracted}
                onChange={(e) => updateFormData('isContracted', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">契約済み</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約ステータス
            </label>
            <select
              value={formData.contractStatus}
              onChange={(e) => updateFormData('contractStatus', e.target.value as any)}
              disabled={formData.isContracted}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="estimate">見積もり</option>
              <option value="confirmed">契約済み</option>
              <option value="canceled">キャンセル</option>
              <option value="completed">完了</option>
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
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
    </form>
  );
}
