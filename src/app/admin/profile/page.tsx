'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminProfile() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    description: '',
    experienceYears: '',
    staffCount: '',
    features: [''],
    freeOptions: [''],
    paidOptions: [''],
    nonSupportedItems: [''],
    paymentMethods: {
      creditCard: false,
      electronicPayment: false,
      bankTransfer: false,
      cash: true
    }
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 保存されたデータを読み込み
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFormData({
        companyName: data.companyName || '',
        email: data.email || '',
        phone: data.phone || '',
        postalCode: data.postalCode || '',
        address: data.address || '',
        description: data.description || '',
        experienceYears: data.experienceYears || '',
        staffCount: data.staffCount || '',
        features: data.features || [''],
        freeOptions: data.freeOptions || [''],
        paidOptions: data.paidOptions || [''],
        nonSupportedItems: data.nonSupportedItems || [''],
        paymentMethods: data.paymentMethods || {
          creditCard: false,
          electronicPayment: false,
          bankTransfer: false,
          cash: true
        }
      });
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '事業者名は必須です';
    }

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレス形式で入力してください';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号は必須です';
    }

    if (!formData.address.trim()) {
      newErrors.address = '住所は必須です';
    }

    if (!formData.description.trim()) {
      newErrors.description = '事業コンセプトは必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 実際の実装ではAPIエンドポイントに送信
      const adminData = {
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('adminData', JSON.stringify(adminData));
      setIsSaved(true);
      
      // 3秒後に保存メッセージを消す
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setErrors({ submit: '保存に失敗しました。もう一度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'features' | 'freeOptions' | 'paidOptions' | 'nonSupportedItems') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'features' | 'freeOptions' | 'paidOptions' | 'nonSupportedItems') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'features' | 'freeOptions' | 'paidOptions' | 'nonSupportedItems') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePaymentMethodChange = (method: keyof typeof formData.paymentMethods) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: !prev.paymentMethods[method]
      }
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  基本情報編集
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  事業者情報の編集・更新
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                トップに戻る
              </button>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ロゴ画像 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ロゴ画像
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      <div className="w-24 h-24 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center">
                        {logoPreview ? (
                          <img src={logoPreview} alt="ロゴプレビュー" className="w-20 h-20 object-contain" />
                        ) : (
                          <div className="text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          PNG, JPG, GIF up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 事業者名 */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      事業者名 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.companyName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="株式会社○○○"
                      />
                    </div>
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>

                  {/* メールアドレス */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="admin@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* 電話番号 */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="03-1234-5678"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* 郵便番号 */}
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                      郵便番号
                    </label>
                    <div className="mt-1">
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="150-0001"
                      />
                    </div>
                  </div>

                  {/* 住所 */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      住所 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="東京都渋谷区○○○"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  {/* 事業コンセプト */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      事業コンセプト <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="私たちは、年間700件以上の引越しを手がけるプロ集団です。お客様の大切なお荷物を、安全・確実にお届けすることを最優先に考え、保険完備で万が一のトラブルにも備えています。"
                      />
                    </div>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* 経験年数 */}
                  <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                      経験年数
                    </label>
                    <div className="mt-1">
                      <input
                        id="experienceYears"
                        name="experienceYears"
                        type="number"
                        min="0"
                        value={formData.experienceYears}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="6"
                      />
                    </div>
                  </div>

                  {/* 従業員数 */}
                  <div>
                    <label htmlFor="staffCount" className="block text-sm font-medium text-gray-700">
                      従業員数
                    </label>
                    <div className="mt-1">
                      <input
                        id="staffCount"
                        name="staffCount"
                        type="number"
                        min="1"
                        value={formData.staffCount}
                        onChange={handleInputChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* アピールポイント */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アピールポイント
                    </label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="年間実績700件超"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'features')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('features')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + アピールポイントを追加
                    </button>
                  </div>

                  {/* 無料オプション */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      無料オプション
                    </label>
                    {formData.freeOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'freeOptions')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ハンガーボックス貸出し"
                        />
                        {formData.freeOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'freeOptions')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('freeOptions')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + 無料オプションを追加
                    </button>
                  </div>

                  {/* 有料オプション */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      有料オプション（税込）
                    </label>
                    {formData.paidOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'paidOptions')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="ベッドマットカバー貸出し（800円/枚）"
                        />
                        {formData.paidOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'paidOptions')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('paidOptions')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + 有料オプションを追加
                    </button>
                  </div>

                  {/* 対応不可項目 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      対応不可項目
                    </label>
                    {formData.nonSupportedItems.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'nonSupportedItems')}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="段ボールの事前お届け・初回のみのお引き取り時のみ有料"
                        />
                        {formData.nonSupportedItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem(index, 'nonSupportedItems')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('nonSupportedItems')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + 対応不可項目を追加
                    </button>
                  </div>

                  {/* お支払い対応情報 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      お支払い対応情報
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.creditCard}
                          onChange={() => handlePaymentMethodChange('creditCard')}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">クレジットカード</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.electronicPayment}
                          onChange={() => handlePaymentMethodChange('electronicPayment')}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">電子決済（QRコード）</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.bankTransfer}
                          onChange={() => handlePaymentMethodChange('bankTransfer')}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">銀行振込</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.cash}
                          onChange={() => handlePaymentMethodChange('cash')}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">当日現金支払い</span>
                      </label>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="text-red-600 text-sm">
                      {errors.submit}
                    </div>
                  )}

                  {isSaved && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-800">
                            基本情報を保存しました
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => router.push('/admin/dashboard')}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '保存中...' : '保存する'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 