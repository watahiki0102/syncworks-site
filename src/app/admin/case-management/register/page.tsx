/**
 * 管理者専用案件登録ページコンポーネント
 * - 要求定義書準拠の実装
 * - 簡易登録と詳細登録のタブ選択
 * - 配車管理画面への遷移と配車登録連携
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

/**
 * 案件登録フォームデータの型定義
 */
interface CaseRegistrationForm {
  // 簡易登録項目
  customerName: string;
  moveDate: string;
  moveTime: string;
  totalPoints: number;
  fromAddress: string;
  toAddress: string;
  contractPrice?: number;
  
  // 詳細登録項目（既存フォームStep1〜Step3と同様）
  customerNameKana: string;
  customerPhone: string;
  customerEmail: string;
  fromPostalCode: string;
  toPostalCode: string;
  itemList: Array<{
    category: string;
    name: string;
    quantity: number;
    points: number;
  }>;
  additionalServices: string[];
  totalCapacity: number;
  estimatedPrice?: number;
  contractDate?: string;
  notes: string;
}

/**
 * 荷物カテゴリの定義（ポイント付き）
 */
const ITEM_CATEGORIES = [
  { 
    name: '家具', 
    items: [
      { name: 'シングルベッド', points: 3 },
      { name: 'ダブルベッド', points: 5 },
      { name: 'ソファ（2人掛け）', points: 4 },
      { name: 'ソファ（3人掛け）', points: 6 },
      { name: 'ダイニングテーブル', points: 3 },
      { name: 'チェア', points: 1 },
      { name: '本棚', points: 2 },
      { name: 'タンス', points: 4 }
    ] 
  },
  { 
    name: '家電', 
    items: [
      { name: '冷蔵庫（小）', points: 4 },
      { name: '冷蔵庫（大）', points: 6 },
      { name: '洗濯機', points: 4 },
      { name: 'テレビ（32インチ以下）', points: 2 },
      { name: 'テレビ（42インチ以上）', points: 3 },
      { name: 'エアコン', points: 3 },
      { name: '電子レンジ', points: 1 },
      { name: '掃除機', points: 1 }
    ] 
  },
  { 
    name: '生活用品', 
    items: [
      { name: '段ボール箱（小）', points: 0.5 },
      { name: '段ボール箱（大）', points: 1 },
      { name: '衣類（1袋）', points: 0.5 },
      { name: '食器類（1箱）', points: 1 },
      { name: '本・雑誌（1箱）', points: 1 },
      { name: '植物', points: 1 },
      { name: 'その他', points: 1 }
    ] 
  }
];

/**
 * 追加サービスの定義
 */
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

/**
 * 時間帯オプション
 */
const TIME_SLOTS = [
  { value: 'morning', label: '午前（9:00-12:00）' },
  { value: 'afternoon', label: '午後（13:00-17:00）' },
  { value: 'evening', label: '夕方（17:00-20:00）' },
  { value: 'custom', label: '時間指定' }
];

export default function CaseRegistrationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'simple' | 'detailed'>('simple');
  const [registrationMode, setRegistrationMode] = useState<'estimate' | 'contract'>('estimate');
  const [formData, setFormData] = useState<CaseRegistrationForm>({
    customerName: '',
    moveDate: '',
    moveTime: '',
    totalPoints: 0,
    fromAddress: '',
    toAddress: '',
    customerNameKana: '',
    customerPhone: '',
    customerEmail: '',
    fromPostalCode: '',
    toPostalCode: '',
    itemList: [],
    additionalServices: [],
    totalCapacity: 0,
    notes: ''
  });

  /**
   * フォームデータの更新
   */
  const updateFormData = (field: keyof CaseRegistrationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 荷物アイテムの追加
   */
  const addItem = (category: string, itemName: string, itemPoints: number) => {
    const newItem = {
      category,
      name: itemName,
      quantity: 1,
      points: itemPoints
    };
    setFormData(prev => ({
      ...prev,
      itemList: [...prev.itemList, newItem]
    }));
  };

  /**
   * 荷物アイテムの削除
   */
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itemList: prev.itemList.filter((_, i) => i !== index)
    }));
  };

  /**
   * 荷物アイテムの数量変更
   */
  const updateItemQuantity = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      itemList: prev.itemList.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    }));
  };

  /**
   * 追加サービスの切り替え
   */
  const toggleAdditionalService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(service)
        ? prev.additionalServices.filter(s => s !== service)
        : [...prev.additionalServices, service]
    }));
  };

  /**
   * 総ポイント数の計算
   */
  useEffect(() => {
    const totalPoints = formData.itemList.reduce((sum, item) => 
      sum + (item.points * item.quantity), 0
    );
    setFormData(prev => ({ ...prev, totalPoints }));
  }, [formData.itemList]);

  /**
   * バリデーション処理
   */
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // 共通バリデーション
    if (!formData.customerName.trim()) {
      errors.push('顧客名は必須です');
    }
    
    if (!formData.moveDate) {
      errors.push('引越し日は必須です');
    } else {
      const moveDate = new Date(formData.moveDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (moveDate < today) {
        errors.push('引越し日は今日以降の日付を選択してください');
      }
    }
    
    if (!formData.fromAddress.trim()) {
      errors.push('引越し元住所は必須です');
    }
    if (!formData.toAddress.trim()) {
      errors.push('引越し先住所は必須です');
    }
    
    // 簡易登録の追加バリデーション
    if (activeTab === 'simple') {
      if (!formData.totalPoints || formData.totalPoints <= 0) {
        errors.push('荷物ポイント数を入力してください');
      }
      if (registrationMode === 'contract' && (!formData.contractPrice || formData.contractPrice <= 0)) {
        errors.push('契約金額を入力してください');
      }
    }
    
    // 詳細登録の追加バリデーション
    if (activeTab === 'detailed') {
      if (formData.itemList.length === 0) {
        errors.push('荷物を最低1つは選択してください');
      }
      if (registrationMode === 'contract') {
        if (!formData.contractPrice || formData.contractPrice <= 0) {
          errors.push('契約金額を入力してください');
        }
        if (!formData.contractDate) {
          errors.push('契約日を入力してください');
        } else {
          const contractDate = new Date(formData.contractDate);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (contractDate > today) {
            errors.push('契約日は今日以前の日付を選択してください');
          }
        }
      }
    }
    
    // メールアドレスの形式チェック（入力されている場合のみ）
    if (formData.customerEmail && formData.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        errors.push('正しいメールアドレス形式で入力してください');
      }
    }
    
    return errors;
  };

  /**
   * フォーム送信処理
   */
  const handleSubmit = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      alert('入力エラー:\n' + errors.join('\n'));
      return;
    }

    // 確認ダイアログ
    const confirmMessage = `以下の内容で案件を登録しますか？

顧客名: ${formData.customerName}
引越し日: ${formData.moveDate}
引越し元: ${formData.fromAddress}
引越し先: ${formData.toAddress}
荷物点数: ${formData.totalPoints}pt
登録タイプ: ${registrationMode === 'contract' ? '契約済み案件' : '見積もり案件'}
登録モード: ${activeTab === 'simple' ? '簡易登録' : '詳細登録'}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // 案件データの生成
      const newCase = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        moveDate: formData.moveDate,
        moveTime: formData.moveTime,
        originAddress: formData.fromAddress,
        destinationAddress: formData.toAddress,
        totalPoints: formData.totalPoints,
        totalCapacity: formData.totalCapacity,
        itemList: formData.itemList,
        additionalServices: formData.additionalServices,
        status: 'pending',
        truckAssignments: [],
        createdAt: new Date().toISOString(),
        contractStatus: registrationMode === 'contract' ? 'contracted' : 'estimate',
        contractDate: registrationMode === 'contract' ? formData.contractDate : undefined,
        estimatedPrice: formData.estimatedPrice,
        contractPrice: formData.contractPrice,
        notes: formData.notes,
        // 管理者登録フラグ
        isManualRegistration: true,
        registeredBy: 'admin',
        requestSource: '手動登録',
        caseStatus: registrationMode === 'contract' ? 'contracted' : 'unanswered'
      };

      // ローカルストレージに保存
      const saved = localStorage.getItem('formSubmissions');
      const submissions = saved ? JSON.parse(saved) : [];
      submissions.push(newCase);
      localStorage.setItem('formSubmissions', JSON.stringify(submissions));

      alert('案件を正常に登録しました！\n配車管理画面に移動し、配車登録を行います。');
      
      // 配車管理画面に遷移し、登録した案件を自動選択状態にする
      router.push(`/admin/dispatch?selectedCase=${newCase.id}&mode=registration`);
    } catch (error) {
      console.error('案件登録エラー:', error);
      alert('案件登録中にエラーが発生しました。もう一度お試しください。');
    }
  };

  /**
   * 今日の日付を取得（YYYY-MM-DD形式）
   */
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">案件登録</h1>
                <p className="text-sm text-gray-600 mt-1">
                  管理者専用の案件直接登録フォーム
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/case-management')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ← 案件管理に戻る
              </button>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              
              {/* 登録モード選択 */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">登録モード選択</h2>
                <div className="space-x-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="estimate"
                      checked={registrationMode === 'estimate'}
                      onChange={(e) => setRegistrationMode(e.target.value as 'estimate' | 'contract')}
                      className="mr-2"
                    />
                    見積もり回答のために登録
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="contract"
                      checked={registrationMode === 'contract'}
                      onChange={(e) => setRegistrationMode(e.target.value as 'estimate' | 'contract')}
                      className="mr-2"
                    />
                    契約済み案件として登録
                  </label>
                </div>
              </div>

              {/* タブ選択 */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('simple')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'simple'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      簡易登録
                    </button>
                    <button
                      onClick={() => setActiveTab('detailed')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'detailed'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      詳細登録
                    </button>
                  </nav>
                </div>
              </div>

              {/* 簡易登録フォーム */}
              {activeTab === 'simple' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">簡易登録</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        顧客名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => updateFormData('customerName', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="田中太郎"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        引越し日 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.moveDate}
                        onChange={(e) => updateFormData('moveDate', e.target.value)}
                        min={getTodayString()}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        予定時間帯
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        荷物ポイント数 <span className="text-red-500">*</span>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        発地 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fromAddress}
                        onChange={(e) => updateFormData('fromAddress', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="東京都渋谷区..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        着地 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.toAddress}
                        onChange={(e) => updateFormData('toAddress', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="神奈川県横浜市..."
                      />
                    </div>
                    
                    {registrationMode === 'contract' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          金額
                        </label>
                        <input
                          type="number"
                          value={formData.contractPrice || ''}
                          onChange={(e) => updateFormData('contractPrice', parseInt(e.target.value) || undefined)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="50000"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 詳細登録フォーム */}
              {activeTab === 'detailed' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">詳細登録</h3>
                  
                  {/* 顧客情報 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">顧客情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          顧客名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => updateFormData('customerName', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="田中太郎"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          顧客名（カナ）
                        </label>
                        <input
                          type="text"
                          value={formData.customerNameKana}
                          onChange={(e) => updateFormData('customerNameKana', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="タナカタロウ"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          電話番号
                        </label>
                        <input
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => updateFormData('customerPhone', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="090-1234-5678"
                        />
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

                  {/* 引越し情報 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">引越し情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          引越し日 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.moveDate}
                          onChange={(e) => updateFormData('moveDate', e.target.value)}
                          min={getTodayString()}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
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
                    
                    <div className="space-y-4 mt-4">
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
                            className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="住所"
                          />
                        </div>
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
                            className="col-span-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="住所"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 荷物・サービス */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">荷物・サービス</h4>
                    
                    {/* 荷物選択 */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">荷物選択</h5>
                      {ITEM_CATEGORIES.map((category) => (
                        <div key={category.name} className="mb-3">
                          <h6 className="text-xs font-medium text-gray-600 mb-1">{category.name}</h6>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
                            {category.items.map((item) => (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => addItem(category.name, item.name, item.points)}
                                className="text-xs bg-gray-100 hover:bg-blue-100 border border-gray-300 rounded px-2 py-1"
                                title={`${item.points}pt`}
                              >
                                + {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 選択済み荷物リスト */}
                    {formData.itemList.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">選択済み荷物</h5>
                        <div className="space-y-1">
                          {formData.itemList.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                              <span className="text-xs">{item.category} - {item.name}</span>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                  className="w-12 border border-gray-300 rounded px-1 py-1 text-xs"
                                />
                                <span className="text-xs text-gray-500">個</span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  削除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          総ポイント数: {formData.totalPoints}pt
                        </div>
                      </div>
                    )}
                    
                    {/* 追加サービス */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">追加サービス</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {ADDITIONAL_SERVICES.map((service) => (
                          <label key={service} className="flex items-center text-xs">
                            <input
                              type="checkbox"
                              checked={formData.additionalServices.includes(service)}
                              onChange={() => toggleAdditionalService(service)}
                              className="mr-1"
                            />
                            {service}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 契約情報 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">契約情報</h4>
                    
                    {registrationMode === 'estimate' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          見積もり金額
                        </label>
                        <input
                          type="number"
                          value={formData.estimatedPrice || ''}
                          onChange={(e) => updateFormData('estimatedPrice', parseInt(e.target.value) || undefined)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="50000"
                        />
                      </div>
                    )}
                    
                    {registrationMode === 'contract' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            契約金額
                          </label>
                          <input
                            type="number"
                            value={formData.contractPrice || ''}
                            onChange={(e) => updateFormData('contractPrice', parseInt(e.target.value) || undefined)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="50000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            契約日
                          </label>
                          <input
                            type="date"
                            value={formData.contractDate || ''}
                            onChange={(e) => updateFormData('contractDate', e.target.value)}
                            max={getTodayString()}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        備考・特記事項
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => updateFormData('notes', e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="特別な要望や注意事項があれば記載してください"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 送信ボタン */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  案件を登録
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 