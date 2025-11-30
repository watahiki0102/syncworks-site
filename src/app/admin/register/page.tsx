'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserType } from '@/types/referral';
import EmailFieldsGroup, { EmailData, validateEmailData } from '@/components/admin/EmailFieldsGroup';

type RegistrationStep = 'userType' | 'basic' | 'specific' | 'terms';

interface BasicInfo {
  emailData: EmailData;
  password: string;
  confirmPassword: string;
  phone: string;
  postalCode: string;
  address: string;
}

interface MoverInfo {
  companyName: string;
  description: string;
  staffCount: string;
  selectedPrefectures: string[];
}

interface ReferrerInfo {
  displayName: string;
  referrerType: 'company' | 'individual';
  // Company fields
  companyName?: string;
  department?: string;
  // Individual fields
  fullName?: string;
  kana?: string;
  // Bank info
  bankCode: string;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
}

const REGIONS = [
  { name: '北海道・東北', prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', prefectures: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '中部', prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', prefectures: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { name: '四国', prefectures: ['徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] }
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('userType');
  const [userType, setUserType] = useState<UserType>('mover');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    emailData: {
      businessEmail: '',
      billingEmail: '',
      customerEmail: ''
    },
    password: '',
    confirmPassword: '',
    phone: '',
    postalCode: '',
    address: ''
  });

  const [moverInfo, setMoverInfo] = useState<MoverInfo>({
    companyName: '',
    description: '',
    staffCount: '',
    selectedPrefectures: []
  });

  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo>({
    displayName: '',
    referrerType: 'company',
    bankCode: '',
    branchName: '',
    accountNumber: '',
    accountHolder: ''
  });

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');

  const validateBasicInfo = () => {
    const newErrors: Record<string, string> = {};

    // メールアドレスのバリデーション
    const emailErrors = validateEmailData(basicInfo.emailData);
    Object.entries(emailErrors).forEach(([key, value]) => {
      if (value) { newErrors[key] = value; }
    });

    if (!basicInfo.password) { newErrors.password = 'パスワードは必須です'; }
    else if (basicInfo.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    if (basicInfo.password !== basicInfo.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (!basicInfo.phone) { newErrors.phone = '電話番号は必須です'; }
    if (!basicInfo.address) { newErrors.address = '住所は必須です'; }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSpecificInfo = () => {
    const newErrors: Record<string, string> = {};

    if (userType === 'mover') {
      if (!moverInfo.companyName) { newErrors.companyName = '事業者名は必須です'; }
      if (!moverInfo.description) { newErrors.description = '事業コンセプトは必須です'; }
      if (moverInfo.selectedPrefectures.length === 0) {
        newErrors.selectedPrefectures = '対応エリアを1つ以上選択してください';
      }
    } else {
      if (!referrerInfo.displayName) { newErrors.displayName = '表示名は必須です'; }

      if (referrerInfo.referrerType === 'company') {
        if (!referrerInfo.companyName) { newErrors.companyName = '会社名は必須です'; }
      } else {
        if (!referrerInfo.fullName) { newErrors.fullName = '氏名は必須です'; }
        if (!referrerInfo.kana) { newErrors.kana = 'カナは必須です'; }
      }

      if (!referrerInfo.bankCode) { newErrors.bankCode = '銀行名は必須です'; }
      if (!referrerInfo.branchName) { newErrors.branchName = '支店名は必須です'; }
      if (!referrerInfo.accountNumber) { newErrors.accountNumber = '口座番号は必須です'; }
      if (!referrerInfo.accountHolder) { newErrors.accountHolder = '口座名義は必須です'; }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 'basic' && !validateBasicInfo()) { return; }
    if (currentStep === 'specific' && !validateSpecificInfo()) { return; }

    const steps: RegistrationStep[] = ['userType', 'basic', 'specific', 'terms'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const steps: RegistrationStep[] = ['userType', 'basic', 'specific', 'terms'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleRegister = async () => {
    if (!termsAgreed || !privacyAgreed) {
      setErrors({ terms: '利用規約とプライバシーポリシーに同意してください' });
      return;
    }

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          basicInfo,
          moverInfo: userType === 'mover' ? moverInfo : undefined,
          referrerInfo: userType === 'referrer' ? referrerInfo : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // クライアントサイドのログイン状態管理（既存の実装との互換性のため）
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminEmail', basicInfo.emailData.businessEmail);
      localStorage.setItem('userType', userType);

      alert('新規登録が完了しました！');

      // Redirect to appropriate dashboard
      if (userType === 'referrer') {
        router.push('/admin/referrer/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error instanceof Error ? error.message : '登録中にエラーが発生しました。もう一度お試しください。' });
    }
  };

  const handlePrefectureToggle = (pref: string) => {
    setMoverInfo(prev => ({
      ...prev,
      selectedPrefectures: prev.selectedPrefectures.includes(pref)
        ? prev.selectedPrefectures.filter(p => p !== pref)
        : [...prev.selectedPrefectures, pref]
    }));
  };

  const getStepNumber = () => {
    const steps = ['userType', 'basic', 'specific', 'terms'];
    return steps.indexOf(currentStep) + 1;
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">新規会員登録</h1>
          <p className="text-gray-600">SyncWorksへようこそ</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= getStepNumber()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                    }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 ml-4 ${step < getStepNumber() ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {getStepNumber()} of 4
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {currentStep === 'userType' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">利用種別を選択してください</h2>
              <div className="space-y-4">
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${userType === 'mover'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="mover"
                    checked={userType === 'mover'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">引越し事業者として登録</h3>
                      <p className="text-sm text-gray-600">引越しサービスを提供する事業者向け</p>
                    </div>
                  </div>
                </label>

                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${userType === 'referrer'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
                  }`}>
                  <input
                    type="radio"
                    name="userType"
                    value="referrer"
                    checked={userType === 'referrer'}
                    onChange={(e) => setUserType(e.target.value as UserType)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">案件紹介者として登録</h3>
                      <p className="text-sm text-gray-600">引越し案件を紹介する個人・法人向け</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 'basic' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">基本情報</h2>
              <div className="space-y-4">
                <EmailFieldsGroup
                  emailData={basicInfo.emailData}
                  onChange={(field, value) => {
                    setBasicInfo(prev => ({
                      ...prev,
                      emailData: {
                        ...prev.emailData,
                        [field]: value
                      }
                    }));
                  }}
                  errors={{
                    businessEmail: errors.businessEmail,
                    billingEmail: errors.billingEmail,
                    customerEmail: errors.customerEmail
                  }}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={basicInfo.password}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="8文字以上で入力"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    パスワード確認 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={basicInfo.confirmPassword}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="上記と同じパスワードを入力"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="03-1234-5678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    郵便番号
                  </label>
                  <input
                    type="text"
                    value={basicInfo.postalCode}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={basicInfo.address}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="東京都渋谷区..."
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'specific' && userType === 'mover' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">事業者情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    事業者名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={moverInfo.companyName}
                    onChange={(e) => setMoverInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="株式会社○○○"
                  />
                  {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    事業コンセプト <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={moverInfo.description}
                    onChange={(e) => setMoverInfo(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="事業の特徴や強みをご記入ください"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    従業員数
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={moverInfo.staffCount}
                    onChange={(e) => setMoverInfo(prev => ({ ...prev, staffCount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対応エリア <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-md p-4">
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {REGIONS.map(region => (
                          <button
                            key={region.name}
                            type="button"
                            className={`px-3 py-1 rounded border text-sm ${selectedRegion === region.name
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                              }`}
                            onClick={() => setSelectedRegion(selectedRegion === region.name ? '' : region.name)}
                          >
                            {region.name}
                          </button>
                        ))}
                      </div>

                      {selectedRegion && (
                        <div className="grid grid-cols-2 gap-2">
                          {REGIONS.find(r => r.name === selectedRegion)?.prefectures.map(pref => (
                            <label key={pref} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={moverInfo.selectedPrefectures.includes(pref)}
                                onChange={() => handlePrefectureToggle(pref)}
                                className="accent-blue-600"
                              />
                              <span className="text-sm">{pref}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {moverInfo.selectedPrefectures.map(pref => (
                        <span key={pref} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {pref}
                          <button
                            type="button"
                            onClick={() => handlePrefectureToggle(pref)}
                            className="ml-1 text-blue-600 hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.selectedPrefectures && <p className="mt-1 text-sm text-red-600">{errors.selectedPrefectures}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'specific' && userType === 'referrer' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">紹介者情報</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    表示名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={referrerInfo.displayName}
                    onChange={(e) => setReferrerInfo(prev => ({ ...prev, displayName: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="表示名を入力"
                  />
                  {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    種別 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="referrerType"
                        value="company"
                        checked={referrerInfo.referrerType === 'company'}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, referrerType: e.target.value as 'company' | 'individual' }))}
                        className="mr-2"
                      />
                      会社
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="referrerType"
                        value="individual"
                        checked={referrerInfo.referrerType === 'individual'}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, referrerType: e.target.value as 'company' | 'individual' }))}
                        className="mr-2"
                      />
                      個人
                    </label>
                  </div>
                </div>

                {referrerInfo.referrerType === 'company' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        会社名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.companyName || ''}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, companyName: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="会社名を入力"
                      />
                      {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        部署・担当者
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.department || ''}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="部署・担当者を入力"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        氏名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.fullName || ''}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="氏名を入力"
                      />
                      {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        カナ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.kana || ''}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, kana: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.kana ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="カナを入力"
                      />
                      {errors.kana && <p className="mt-1 text-sm text-red-600">{errors.kana}</p>}
                    </div>
                  </>
                )}

                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">振込先情報</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        銀行名 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={referrerInfo.bankCode}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, bankCode: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bankCode ? 'border-red-300' : 'border-gray-300'
                          }`}
                      >
                        <option value="">銀行を選択してください</option>
                        <option value="0001">みずほ銀行</option>
                        <option value="0005">三菱UFJ銀行</option>
                        <option value="0009">三井住友銀行</option>
                        <option value="0010">りそな銀行</option>
                        <option value="0033">ゆうちょ銀行</option>
                      </select>
                      {errors.bankCode && <p className="mt-1 text-sm text-red-600">{errors.bankCode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        支店名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.branchName}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, branchName: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.branchName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="本店、新宿支店など"
                      />
                      {errors.branchName && <p className="mt-1 text-sm text-red-600">{errors.branchName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        口座番号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.accountNumber}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="1234567"
                      />
                      {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        口座名義（全角カナ） <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={referrerInfo.accountHolder}
                        onChange={(e) => setReferrerInfo(prev => ({ ...prev, accountHolder: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.accountHolder ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="カタカナで入力"
                      />
                      {errors.accountHolder && <p className="mt-1 text-sm text-red-600">{errors.accountHolder}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'terms' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">利用規約・プライバシーポリシー</h2>

              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                  <h3 className="font-semibold mb-2">利用規約</h3>
                  <p className="text-sm text-gray-600">
                    本規約は、SyncWorksが提供するサービスの利用条件を定めるものです。
                    ユーザーは本サービスを利用することで本規約に同意したものとみなされます。
                    ...
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50 max-h-40 overflow-y-auto">
                  <h3 className="font-semibold mb-2">プライバシーポリシー</h3>
                  <p className="text-sm text-gray-600">
                    当社は、ユーザーの個人情報の保護に努めます。
                    収集した個人情報は、サービスの提供及び向上のためにのみ使用いたします。
                    ...
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mr-3 accent-blue-600"
                    />
                    <span className="text-sm">利用規約に同意する</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mr-3 accent-blue-600"
                    />
                    <span className="text-sm">プライバシーポリシーに同意する</span>
                  </label>
                </div>

                {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
                {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={currentStep === 'userType' ? () => router.push('/admin/login') : handlePrev}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {currentStep === 'userType' ? 'ログインページへ' : '戻る'}
            </button>

            {currentStep === 'terms' ? (
              <button
                type="button"
                onClick={handleRegister}
                disabled={!termsAgreed || !privacyAgreed}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                登録完了
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}