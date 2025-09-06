/**
 * 新規紹介案件作成ページコンポーネント
 * - 引越し案件紹介者が新規案件を登録する画面
 * - 現在は開発中画面として表示
 */
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
import { Save, User, Package } from 'lucide-react';

interface NewReferralForm {
  // 顧客情報（必須のみ）
  customerName: string;
  customerPhone: string;
  customerArea: string;
  
  // 引越し情報（最重要項目のみ）
  movingDate: string;
  movingType: 'apartment' | 'house' | 'office' | 'other';
  
  // 案件情報（簡潔に）
  referralDescription: string;
}

export default function NewReferralPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<NewReferralForm>>({});
  const [form, setForm] = useState<NewReferralForm>({
    customerName: '',
    customerPhone: '',
    customerArea: '',
    movingDate: '',
    movingType: 'apartment',
    referralDescription: ''
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
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field as keyof NewReferralForm]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewReferralForm> = {};
    
    if (!form.customerName.trim()) {
      newErrors.customerName = '顧客名は必須です';
    }
    
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = '電話番号は必須です';
    } else if (!/^[\d-+()]+$/.test(form.customerPhone)) {
      newErrors.customerPhone = '有効な電話番号を入力してください';
    }
    
    if (!form.customerArea.trim()) {
      newErrors.customerArea = 'エリアは必須です';
    }
    
    if (!form.movingDate) {
      newErrors.movingDate = '引越し希望日は必須です';
    }
    
    if (!form.referralDescription.trim()) {
      newErrors.referralDescription = '案件詳細は必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      // 実際の実装ではAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('新規紹介案件が作成されました');
      router.push('/admin/referrer/referrals');
    } catch (error) {
      console.error('案件作成エラー:', error);
      alert('案件の作成に失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    try {
      // 実際の実装ではAPI呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('下書きとして保存されました');
      router.push('/admin/referrer/referrals');
    } catch (error) {
      console.error('下書き保存エラー:', error);
      alert('下書きの保存に失敗しました。しばらく時間をおいて再度お試しください。');
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={handleSaveAsDraft}
        disabled={saving}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        下書き保存
      </Button>
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? '保存中...' : '案件を公開'}
      </Button>
    </div>
  );

  return (
    <AdminAuthGuard>
      <AdminLayout
        title="新規紹介案件作成"
        actions={actions}
        breadcrumbs={[
          { label: 'ダッシュボード', href: '/admin/referrer/dashboard' },
          { label: '紹介状況リスト', href: '/admin/referrer/referrals' },
          { label: '新規紹介案件作成' }
        ]}
      >
        <div className="space-y-6">
          {/* 顧客情報 */}
          <Card className="p-6">
            <Heading level={2} className="text-xl font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              顧客情報
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="customerName" label="顧客名" required error={errors.customerName} touched={true}>
                <FormInputComponents.TextInput
                  value={form.customerName}
                  onChange={(value) => handleInputChange('customerName', value)}
                  placeholder="顧客名を入力"
                />
              </FormField>
              
              <FormField name="customerPhone" label="電話番号" required error={errors.customerPhone} touched={true}>
                <FormInputComponents.TextInput
                  value={form.customerPhone}
                  onChange={(value) => handleInputChange('customerPhone', value)}
                  placeholder="電話番号を入力"
                />
              </FormField>
              
              <FormField name="area" label="エリア" required error={errors.customerArea} touched={true}>
                <FormInputComponents.TextInput
                  value={form.customerArea}
                  onChange={(value) => handleInputChange('customerArea', value)}
                  placeholder="東京都、神奈川県など"
                />
              </FormField>
            </div>
          </Card>

          {/* 引越し情報 */}
          <Card className="p-6">
            <Heading level={2} className="text-xl font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              引越し情報
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="moveDate" label="引越し希望日" required error={errors.movingDate} touched={true}>
                <FormInputComponents.DateInput
                  value={form.movingDate}
                  onChange={(value) => handleInputChange('movingDate', value)}
                />
              </FormField>
              
              <FormField name="propertyType" label="物件種別" required>
                <select
                  value={form.movingType}
                  onChange={(e) => handleInputChange('movingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">マンション・アパート</option>
                  <option value="house">戸建て</option>
                  <option value="office">オフィス・店舗</option>
                  <option value="other">その他</option>
                </select>
              </FormField>
              
              <FormField name="description" label="案件詳細・備考" required error={errors.referralDescription} touched={true} className="md:col-span-2">
                <textarea
                  value={form.referralDescription}
                  onChange={(e) => handleInputChange('referralDescription', e.target.value)}
                  placeholder="引越しの詳細内容・要望・その他備考を入力してください"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </Card>

        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
