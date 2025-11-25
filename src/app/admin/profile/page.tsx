/**
 * 管理者プロフィール編集ページコンポーネント
 * - 事業者基本情報の編集
 * - サービスオプションの管理
 * - 対応エリアの設定
 * - 支払い方法の設定
 */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EmailFieldsGroup, { EmailData, validateEmailData } from '@/components/admin/EmailFieldsGroup';

/**
 * オプションタイプの定義
 */
const OPTION_TYPES = [
  { value: 'free', label: '無料オプション', color: 'text-green-600' },
  { value: 'paid', label: '有料オプション', color: 'text-blue-600' },
  { value: 'nonSupported', label: '対応不可', color: 'text-red-600' },
] as const;

/**
 * オプションタイプの型定義
 */
type OptionType = typeof OPTION_TYPES[number]['value'];

/**
 * オプションアイテムの型定義
 */
type OptionItem = { 
  label: string;      // オプション名
  type: OptionType;   // オプションタイプ
  isDefault: boolean; // デフォルト設定かどうか
};

/**
 * デフォルトオプション設定
 */
const DEFAULT_OPTIONS: OptionItem[] = [
  { label: '🏠 建物養生（壁や床の保護）', type: 'free', isDefault: true },
  { label: '📦 荷造り・荷ほどきの代行', type: 'free', isDefault: true },
  { label: '🪑 家具・家電の分解・組み立て', type: 'free', isDefault: true },
  { label: '🧺 洗濯機取り外し', type: 'free', isDefault: true },
  { label: '❄️ エアコン（本体＋室外機）取り外し', type: 'free', isDefault: true },
  { label: '💡 照明・テレビ配線取り外し', type: 'free', isDefault: true },
  { label: '🚮 不用品の回収・廃棄', type: 'free', isDefault: true },
  { label: '🐾 ペット運搬', type: 'free', isDefault: true },
];

/**
 * 地方・都道府県データ
 * 対応エリア選択用の地域情報
 */
const REGIONS = [
  { name: '北海道・東北', prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '中部', prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', prefectures: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { name: '四国', prefectures: ['徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] }
];

/**
 * 全都道府県のリスト
 */


/**
 * フォームデータの型定義
 */
interface FormData {
  companyName: string;           // 事業者名
  emailData: EmailData;          // メールアドレス情報
  phone: string;                // 電話番号
  postalCode: string;           // 郵便番号
  address: string;              // 住所
  description: string;          // 事業コンセプト
  experienceYears: string;      // 経験年数
  staffCount: string;           // 従業員数
  features: string[];           // アピールポイント
  freeOptions: string[];        // 無料オプション
  paidOptions: string[];        // 有料オプション
  nonSupportedItems: string[];  // 対応不可アイテム
  paymentMethods: {             // 支払い方法
    creditCard: boolean;
    electronicPayment: boolean;
    bankTransfer: boolean;
    cash: boolean;
  };
}

export default function AdminProfile() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    emailData: {
      businessEmail: '',
      billingEmail: '',
      customerEmail: ''
    },
    phone: '',
    postalCode: '',
    address: '',
    description: '',
    experienceYears: '',
    staffCount: '',
    features: [],
    freeOptions: [],
    paidOptions: [],
    nonSupportedItems: [],
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

  /**
   * オプションリストの状態管理
   */
  const [options, setOptions] = useState<OptionItem[]>(DEFAULT_OPTIONS);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionType, setNewOptionType] = useState<OptionType>('free');

  /**
   * サービスエリアの状態管理
   */
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [_newServiceArea, _setNewServiceArea] = useState('');

  /**
   * 対応エリア選択の状態管理
   */
  const [_selectedAreas, _setSelectedAreas] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPrefectures, setSelectedPrefectures] = useState<string[]>([]);

  /**
   * 保存されたデータの読み込み
   * ページ初期化時にローカルストレージから復元
   */
  useEffect(() => {
    // 保存されたデータを読み込み
    const savedData = localStorage.getItem('adminData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setFormData({
        companyName: data.companyName || '',
        emailData: {
          businessEmail: data.email || data.emailData?.businessEmail || '',
          billingEmail: data.billingEmail || data.emailData?.billingEmail || '',
          customerEmail: data.emailData?.customerEmail || ''
        },
        phone: data.phone || '',
        postalCode: data.postalCode || '',
        address: data.address || '',
        description: data.description || '',
        experienceYears: data.experienceYears || '',
        staffCount: data.staffCount || '',
        features: data.features || [],
        freeOptions: data.freeOptions || [],
        paidOptions: data.paidOptions || ['エアコン（本体＋室外機）取り外し', '不用品の回収・廃棄', 'ペット運搬'],
        nonSupportedItems: data.nonSupportedItems || ['ピアノ運搬', '美術品・骨董品運搬'],
        paymentMethods: data.paymentMethods || {
          creditCard: false,
          electronicPayment: false,
          bankTransfer: false,
          cash: true
        }
      });
      setOptions(data.options || DEFAULT_OPTIONS);
      setServiceAreas(data.serviceAreas || []);
    }
  }, []);

  /**
   * フォームのバリデーション
   * @returns バリデーション結果（true: 成功, false: 失敗）
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) {newErrors.companyName = '事業者名は必須です';}
    
    // メールアドレスのバリデーション
    const emailErrors = validateEmailData(formData.emailData);
    Object.entries(emailErrors).forEach(([key, value]) => {
      if (value) {newErrors[key] = value;}
    });
    
    if (!formData.phone.trim()) {newErrors.phone = '電話番号は必須です';}
    if (!formData.address.trim()) {newErrors.address = '住所は必須です';}
    if (!formData.description.trim()) {newErrors.description = '事業コンセプトは必須です';}
    if (!formData.experienceYears.trim()) {newErrors.experienceYears = '経験年数は必須です';}
    if (!formData.staffCount.trim()) {newErrors.staffCount = '従業員数は必須です';}
    if (selectedPrefectures.length === 0) {newErrors.serviceAreas = '対応エリア（都道府県）を1つ以上選択してください';}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * フォーム送信処理
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      options: options,
    }));

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const adminData = {
        ...formData,
        options: options,
        serviceAreas: serviceAreas,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('adminData', JSON.stringify(adminData));
      setIsSaved(true);

      // 3秒後に保存メッセージを消す
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      setErrors({ submit: '保存に失敗しました。もう一度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 入力フィールドの変更処理
   * @param e - 入力イベント
   */
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

  /**
   * 配列フィールドの変更処理
   * @param index - 変更するアイテムのインデックス
   * @param value - 新しい値
   * @param field - 変更するフィールド名
   */
  const handleArrayChange = (index: number, value: string, field: 'features' | 'freeOptions' | 'paidOptions' | 'nonSupportedItems') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  /**
   * 配列フィールドにアイテムを追加
   * @param field - 追加するフィールド名
   */
  const addArrayItem = (field: 'features' | 'freeOptions' | 'paidOptions' | 'nonSupportedItems') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  /**
   * 配列フィールドからアイテムを削除
   * @param index - 削除するアイテムのインデックス
   * @param field - 削除するフィールド名
   */
  const removeArrayItem = (index: number, field: 'features' | 'freeOptions' | 'paidOptions' | 'nonSupportedItems') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  /**
   * 支払い方法の変更処理
   * @param method - 変更する支払い方法
   */
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

  // オプションの種別変更
  const handleOptionTypeChange = (idx: number, type: OptionType) => {
    setOptions(prev => prev.map((_opt, i) => i === idx ? { ..._opt, type } : _opt));
  };

  // オプションの削除
  const handleOptionDelete = (idx: number) => {
    setOptions(prev => prev.filter((_opt, i) => i !== idx));
  };

  // オプションの追加
  const handleOptionAdd = () => {
    if (!newOptionLabel.trim()) {return;}
    setOptions(prev => [
      ...prev,
      { label: newOptionLabel.trim(), type: newOptionType, isDefault: false }
    ]);
    setNewOptionLabel('');
    setNewOptionType('free');
  };

  const typeLabel = (type: OptionType) => OPTION_TYPES.find(t => t.value === type)?.label || '';
  const colorClass = (type: OptionType) => OPTION_TYPES.find(t => t.value === type)?.color || '';

  // 地方選択
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
  };
  // 都道府県チェック
  const handlePrefectureToggle = (pref: string) => {
    setSelectedPrefectures(prev =>
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };
  // タグ削除
  const handleRemovePrefTag = (pref: string) => {
    setSelectedPrefectures(prev => prev.filter(p => p !== pref));
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title="基本情報設定"
          subtitle="事業者情報の編集・更新"
          breadcrumbs={[
            { label: '基本情報設定' }
          ]}
        />
        
        <main className="w-full py-2 px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="px-4 py-2 sm:px-0">
            <div className="w-full max-w-4xl mx-auto">
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
                          <Image src={logoPreview} alt="ロゴプレビュー" width={80} height={80} className="object-contain" />
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
                        <span className="block mt-1 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis text-gray-600">
                          {logoFile ? logoFile.name : '選択されていません'}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          PNG, JPG, GIF <span className="text-red-500">上限：10MB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 事業者名 */}
                  <div className="mb-6">
                    <label htmlFor="companyName" className="block text-base font-medium text-gray-700 mb-1">
                      事業者名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="株式会社○○○"
                    />
                    {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                  </div>

                  {/* メールアドレス項目 */}
                  <EmailFieldsGroup
                    emailData={formData.emailData}
                    onChange={(field, value) => {
                      setFormData(prev => ({
                        ...prev,
                        emailData: {
                          ...prev.emailData,
                          [field]: value
                        }
                      }));
                      // エラーをクリア
                      if (errors[field]) {
                        setErrors(prev => ({
                          ...prev,
                          [field]: ''
                        }));
                      }
                    }}
                    errors={{
                      businessEmail: errors.businessEmail,
                      billingEmail: errors.billingEmail,
                      customerEmail: errors.customerEmail
                    }}
                    className="mb-6"
                  />

                  {/* 電話番号 */}
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-base font-medium text-gray-700 mb-1">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="03-1234-5678"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  {/* 郵便番号 */}
                  <div className="mb-6">
                    <label htmlFor="postalCode" className="block text-base font-medium text-gray-700 mb-1">
                      郵便番号
                    </label>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.postalCode ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="150-0001"
                    />
                    {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
                  </div>

                  {/* 住所 */}
                  <div className="mb-6">
                    <label htmlFor="address" className="block text-base font-medium text-gray-700 mb-1">
                      住所 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="東京都渋谷区○○○"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  {/* 対応エリア */}
                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-700 mb-1">
                      対応エリア <span className="text-red-500">*</span>
                    </label>
                    <div className="px-4 py-5 sm:p-6 bg-white rounded-lg shadow">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2">
                          <div className="mb-2 font-bold text-gray-700">地域を選択</div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {REGIONS.map(region => (
                              <button
                                key={region.name}
                                type="button"
                                className={`px-3 py-1 rounded border ${selectedRegion === region.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                                onClick={() => handleRegionSelect(region.name)}
                              >
                                {region.name}
                              </button>
                            ))}
                          </div>
                          {selectedRegion && (
                            <div>
                              <div className="mb-1 text-sm text-gray-700">都道府県を選択（複数可）</div>
                              <div className="flex gap-2 mb-2">
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs hover:bg-blue-200 border border-blue-200"
                                  onClick={() => {
                                    const prefs = REGIONS.find(r => r.name === selectedRegion)?.prefectures || [];
                                    setSelectedPrefectures(prev => Array.from(new Set([...prev, ...prefs])));
                                  }}
                                >すべて選択</button>
                                <button
                                  type="button"
                                  className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 border border-gray-200"
                                  onClick={() => {
                                    const prefs = REGIONS.find(r => r.name === selectedRegion)?.prefectures || [];
                                    setSelectedPrefectures(prev => prev.filter(p => !prefs.includes(p)));
                                  }}
                                >すべて外す</button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                                {REGIONS.find(r => r.name === selectedRegion)?.prefectures.map(pref => (
                                  <label key={pref} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedPrefectures.includes(pref)}
                                      onChange={() => handlePrefectureToggle(pref)}
                                      className="accent-blue-600"
                                    />
                                    <span>{pref}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedPrefectures.map(pref => (
                              <span key={pref} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {pref}
                                <button type="button" onClick={() => handleRemovePrefTag(pref)} className="ml-1 text-blue-500 hover:text-red-500">×</button>
                              </span>
                            ))}
                          </div>
                          {errors.serviceAreas && <p className="mt-1 text-sm text-red-600">{errors.serviceAreas}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">地域ボタンからエリアを選択し、都道府県をチェックしてください。選択済み都道府県は下部に表示されます。</p>
                    </div>
                  </div>

                  {/* 事業コンセプト */}
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1">
                      事業コンセプト <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="私たちは、年間700件以上の引越しを手がけるプロ集団です。お客様の大切なお荷物を、安全・確実にお届けすることを最優先に考え、保険完備で万が一のトラブルにも備えています。"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>

                  {/* 従業員数 */}
                  <div className="mb-6">
                    <label htmlFor="staffCount" className="block text-base font-medium text-gray-700 mb-1">
                      従業員数
                    </label>
                    <input
                      id="staffCount"
                      name="staffCount"
                      type="number"
                      min="1"
                      value={formData.staffCount}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.staffCount ? 'border-red-300' : 'border-gray-300'}`}
                      placeholder="1"
                    />
                    {errors.staffCount && <p className="mt-1 text-sm text-red-600">{errors.staffCount}</p>}
                  </div>

                  {/* アピールポイント */}
                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      アピールポイント
                    </label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                          className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${errors.features ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="例：年間実績700件超"
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

                  {/* オプション設定まとめUI */}
                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-700 mb-2">オプション設定</label>
                    {/* デフォルト項目 */}
                    <div className="mb-4">
                      <div className="font-bold text-gray-700 mb-2">デフォルト項目</div>
                      {options.filter(o => o.isDefault).map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3 mb-2" style={{ minWidth: 220 }}>
                          <div className="flex items-center w-40">
                            <select
                              value={opt.type}
                              onChange={e => handleOptionTypeChange(options.findIndex(o => o === opt), e.target.value as OptionType)}
                              className={`${colorClass(opt.type)} font-bold w-40 border rounded px-2 py-1`}
                            >
                              {OPTION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{typeLabel(t.value)}</option>
                              ))}
                            </select>
                          </div>
                          <span className="ml-2 text-gray-700">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* 追加項目 */}
                    <div className="mb-4">
                      <div className="font-bold text-gray-700 mb-2">追加項目</div>
                      {options.filter(o => !o.isDefault).map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3 mb-2" style={{ minWidth: 220 }}>
                          <div className="flex items-center w-40">
                            <select
                              value={opt.type}
                              onChange={e => handleOptionTypeChange(options.findIndex(o => o === opt), e.target.value as OptionType)}
                              className={`${colorClass(opt.type)} font-bold w-40 border rounded px-2 py-1`}
                            >
                              {OPTION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{typeLabel(t.value)}</option>
                              ))}
                            </select>
                          </div>
                          <span className="ml-2 text-gray-700">{opt.label}</span>
                          <button
                            type="button"
                            onClick={() => handleOptionDelete(options.findIndex(o => o === opt))}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* 追加項目の追加ボタン */}
                    <div className="flex gap-2 mt-4">
                      <select
                        value={newOptionType}
                        onChange={e => setNewOptionType(e.target.value as OptionType)}
                        className="border rounded px-2 py-1 w-40"
                      >
                        {OPTION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <input
                        value={newOptionLabel}
                        onChange={e => setNewOptionLabel(e.target.value)}
                        className="border rounded px-3 py-1 flex-1"
                        placeholder="新しいオプションを入力"
                      />
                      <button
                        type="button"
                        onClick={handleOptionAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
                      >
                        追加
                      </button>
                    </div>
                  </div>

                  {/* お支払い対応情報 */}
                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-700 mb-2">
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
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      戻る
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
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 
