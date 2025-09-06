'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heading } from '@/components/ui/Typography';
import { FormField } from '@/components/ui/FormField';
import FormInputComponents from '@/components/ui/FormInput';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { AdminLayout } from '@/components/admin';
import { Save, Building2, User } from 'lucide-react';
import { ReferrerType } from '@/types/referral';

interface ReferrerProfile {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  address: {
    postalCode: string;
    prefecture: string;
    city: string;
    address1: string;
    address2?: string;
  };
  referrerType: ReferrerType;
  // 会社用フィールド
  companyName?: string;
  department?: string;
  contactPerson?: string;
  billingInfo?: string;
  // 個人用フィールド
  fullName?: string;
  kana?: string;
  taxCategory?: string;
  withholdingTax?: boolean;
  // 振込先情報
  bankAccount: {
    bankCode: string;
    branchName: string;
    accountNumber: string;
    accountHolder: string;
  };
  termsAgreed: boolean;
  updatedAt: string;
}

export default function ReferrerProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ReferrerProfile>({
    id: 'REF-USER-001',
    displayName: '引越し案件紹介者',
    email: 'referrer@example.com',
    phone: '03-1234-5678',
    address: {
      postalCode: '100-0001',
      prefecture: '東京都',
      city: '千代田区',
      address1: '千代田1-1-1',
      address2: ''
    },
    referrerType: 'company',
    companyName: '引越し案件紹介株式会社',
    department: '営業部',
    contactPerson: '田中太郎',
    billingInfo: '請求書は月末締め翌月末支払い',
    bankAccount: {
      bankCode: '0001',
      branchName: '本店',
      accountNumber: '1234567',
      accountHolder: 'ヒッコシジゲンショウカイカブシキガイシャ'
    },
    termsAgreed: true,
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    const userType = localStorage.getItem('userType');

    if (!isLoggedIn || userType !== 'referrer') {
      router.push('/admin/login');
      return;
    }

    setIsLoading(false);
  }, [router]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ReferrerProfile] as any),
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleBankAccountChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value
      }
    }));
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      // 実際の実装ではAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新日時を更新
      setProfile(prev => ({
        ...prev,
        updatedAt: new Date().toISOString()
      }));
      
      alert('プロフィールが更新されました');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const actions = (
    <Button
      onClick={handleSave}
      disabled={saving}
      className="bg-green-600 hover:bg-green-700 text-white min-w-[100px] flex items-center justify-center"
    >
      <Save className="w-4 h-4 mr-2" />
      {saving ? '保存中...' : '保存'}
    </Button>
  );

  return (
    <AdminAuthGuard>
      <AdminLayout
        title="プロフィール管理"
        actions={actions}
        breadcrumbs={[
          { label: 'プロフィール管理' }
        ]}
      >
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card className="p-6">
            <Heading level={2} className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              基本情報
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="displayName" label="表示名" required>
                <FormInputComponents.TextInput
                  value={profile.displayName}
                  onChange={(value) => handleInputChange('displayName', value)}
                  placeholder="表示名を入力"
                />
              </FormField>
              
              <FormField name="email" label="メールアドレス" required>
                <FormInputComponents.TextInput
                  type="email"
                  value={profile.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="メールアドレスを入力"
                />
              </FormField>
              
              <FormField name="phone" label="電話番号" required>
                <FormInputComponents.TextInput
                  value={profile.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="電話番号を入力"
                />
              </FormField>
              
              <FormField name="type" label="紹介者種別" required>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="referrerType"
                      value="company"
                      checked={profile.referrerType === 'company'}
                      onChange={(e) => handleInputChange('referrerType', e.target.value)}
                      className="mr-2"
                    />
                    <Building2 className="w-4 h-4 mr-1" />
                    会社
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="referrerType"
                      value="individual"
                      checked={profile.referrerType === 'individual'}
                      onChange={(e) => handleInputChange('referrerType', e.target.value)}
                      className="mr-2"
                    />
                    <User className="w-4 h-4 mr-1" />
                    個人
                  </label>
                </div>
              </FormField>
            </div>
          </Card>

          {/* 種別別フィールド */}
          {profile.referrerType === 'company' ? (
            <Card className="p-6">
              <Heading level={2} className="text-xl font-semibold mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                会社情報
              </Heading>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="companyName" label="会社名" required>
                  <FormInputComponents.TextInput
                    value={profile.companyName || ''}
                    onChange={(value) => handleInputChange('companyName', value)}
                    placeholder="会社名を入力"
                  />
                </FormField>
                
                <FormField name="department" label="部署・担当者">
                  <FormInputComponents.TextInput
                    value={profile.department || ''}
                    onChange={(value) => handleInputChange('department', value)}
                    placeholder="部署・担当者を入力"
                  />
                </FormField>
                
                <FormField name="billingInfo" label="請求先情報">
                  <FormInputComponents.TextInput
                    value={profile.billingInfo || ''}
                    onChange={(value) => handleInputChange('billingInfo', value)}
                    placeholder="請求先情報を入力"
                  />
                </FormField>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <Heading level={2} className="text-xl font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                個人情報
              </Heading>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="name" label="氏名" required>
                  <FormInputComponents.TextInput
                    value={profile.fullName || ''}
                    onChange={(value) => handleInputChange('fullName', value)}
                    placeholder="氏名を入力"
                  />
                </FormField>
                
                <FormField name="nameKana" label="カナ" required>
                  <FormInputComponents.TextInput
                    value={profile.kana || ''}
                    onChange={(value) => handleInputChange('kana', value)}
                    placeholder="カナを入力"
                  />
                </FormField>
                
                <FormField name="taxCategory" label="税務区分">
                  <FormInputComponents.TextInput
                    value={profile.taxCategory || ''}
                    onChange={(value) => handleInputChange('taxCategory', value)}
                    placeholder="税務区分を入力"
                  />
                </FormField>
                
                <FormField name="withholding" label="源泉徴収">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.withholdingTax || false}
                      onChange={(e) => handleInputChange('withholdingTax', e.target.checked)}
                      className="mr-2"
                    />
                    源泉徴収の対象
                  </label>
                </FormField>
              </div>
            </Card>
          )}

          {/* 住所情報 */}
          <Card className="p-6">
            <Heading level={2} className="text-xl font-semibold mb-4">
              住所情報
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="postalCode" label="郵便番号" required>
                <FormInputComponents.TextInput
                  value={profile.address.postalCode}
                  onChange={(value) => handleAddressChange('postalCode', value)}
                  placeholder="123-4567"
                />
              </FormField>
              
              <FormField name="prefecture" label="都道府県" required>
                <FormInputComponents.TextInput
                  value={profile.address.prefecture}
                  onChange={(value) => handleAddressChange('prefecture', value)}
                  placeholder="都道府県を入力"
                />
              </FormField>
              
              <FormField name="city" label="市区町村" required>
                <FormInputComponents.TextInput
                  value={profile.address.city}
                  onChange={(value) => handleAddressChange('city', value)}
                  placeholder="市区町村を入力"
                />
              </FormField>
              
              <FormField name="address" label="番地・建物名" required>
                <FormInputComponents.TextInput
                  value={profile.address.address1}
                  onChange={(value) => handleAddressChange('address1', value)}
                  placeholder="番地・建物名を入力"
                />
              </FormField>
              
              <FormField name="building" label="建物名・部屋番号">
                <FormInputComponents.TextInput
                  value={profile.address.address2 || ''}
                  onChange={(value) => handleAddressChange('address2', value)}
                  placeholder="建物名・部屋番号を入力"
                />
              </FormField>
            </div>
          </Card>

          {/* 振込先情報 */}
          <Card className="p-6">
            <Heading level={2} className="text-xl font-semibold mb-4">
              振込先情報
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="bankName" label="銀行名" required>
                <select
                  value={profile.bankAccount.bankCode}
                  onChange={(e) => handleBankAccountChange('bankCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">銀行を選択してください</option>
                  <option value="0001">みずほ銀行</option>
                  <option value="0005">三菱UFJ銀行</option>
                  <option value="0009">三井住友銀行</option>
                  <option value="0010">りそな銀行</option>
                  <option value="0017">埼玉りそな銀行</option>
                  <option value="0033">ゆうちょ銀行</option>
                </select>
              </FormField>
              
              <FormField name="branchName" label="支店名" required>
                <FormInputComponents.TextInput
                  value={profile.bankAccount.branchName}
                  onChange={(value) => handleBankAccountChange('branchName', value)}
                  placeholder="本店、新宿支店など"
                />
              </FormField>
              
              <FormField name="accountNumber" label="口座番号" required>
                <FormInputComponents.TextInput
                  value={profile.bankAccount.accountNumber}
                  onChange={(value) => handleBankAccountChange('accountNumber', value)}
                  placeholder="1234567"
                />
              </FormField>
              
              <div className="md:col-span-2">
                <FormField name="accountName" label="口座名義（全角カナ）" required>
                  <FormInputComponents.TextInput
                    value={profile.bankAccount.accountHolder}
                    onChange={(value) => handleBankAccountChange('accountHolder', value)}
                    placeholder="カタカナで入力"
                  />
                </FormField>
              </div>
            </div>
          </Card>


          {/* 規約同意 */}
          <Card className="p-6">
            <Heading level={2} className="text-xl font-semibold mb-4">
              規約・利用条件
            </Heading>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.termsAgreed}
                  onChange={(e) => handleInputChange('termsAgreed', e.target.checked)}
                  className="mr-3"
                  required
                />
                利用規約とプライバシーポリシーに同意する
              </label>
              
              <p className="text-sm text-gray-600">
                最終更新: {new Date(profile.updatedAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
