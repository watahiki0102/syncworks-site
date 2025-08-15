/**
 * 不動産登録フォーム
 * - 自社登録と紹介登録の両方に対応
 * - インラインバリデーション
 * - 非同期重複チェック
 * - 送信処理
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  RegisterMode, 
  CompanyInfo, 
  ReferralInfo, 
  FormErrors, 
  FormValidationErrors 
} from '@/types/realEstate';

interface FormData {
  company: CompanyInfo;
  referral?: ReferralInfo;
}

interface RealEstateRegisterFormProps {
  mode: RegisterMode;
  referrer: string | null;
}

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

export function RealEstateRegisterForm({ mode, referrer }: RealEstateRegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    company: {
      name: '',
      licenseNo: '',
      repName: '',
      contactName: '',
      dept: '',
      tel: '',
      email: '',
      address: '',
      websiteUrl: '',
      prefectures: []
    },
            referral: mode === 'referral' ? {
          kind: 'existing' as const,
          name: '',
          contact: '',
          note: ''
        } : undefined
  });

  // モード変更時にフォームデータをリセット
  useEffect(() => {
    if (mode === 'referral' && !formData.referral) {
      setFormData(prev => ({
        ...prev,
        referral: {
          kind: 'existing' as const,
          name: '',
          contact: '',
          note: ''
        }
      }));
    } else if (mode === 'self' && formData.referral) {
      setFormData(prev => {
        const { referral, ...rest } = prev;
        return rest;
      });
    }
  }, [mode]);

  // フィールド値の更新
  const handleInputChange = (field: string, value: string | string[]) => {
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof FormData],
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          [field]: value
        }
      }));
    }
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 都道府県の選択/解除
  const handlePrefectureChange = (prefecture: string) => {
    const current = formData.company.prefectures;
    const updated = current.includes(prefecture)
      ? current.filter(p => p !== prefecture)
      : [...current, prefecture];
    
    handleInputChange('prefectures', updated);
  };

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // 会社情報の必須チェック
    if (!formData.company.name.trim()) {
      newErrors['company.name'] = '会社名を入力してください';
    }
    if (!formData.company.licenseNo.trim()) {
      newErrors['company.licenseNo'] = '免許番号を入力してください';
    }
    if (!formData.company.repName.trim()) {
      newErrors['company.repName'] = '代表者名を入力してください';
    }
    if (!formData.company.contactName.trim()) {
      newErrors['company.contactName'] = '担当者氏名を入力してください';
    }
    if (!formData.company.dept.trim()) {
      newErrors['company.dept'] = '部署を入力してください';
    }
    if (!formData.company.tel.trim()) {
      newErrors['company.tel'] = '電話番号を入力してください';
    }
    if (!formData.company.email.trim()) {
      newErrors['company.email'] = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company.email)) {
      newErrors['company.email'] = '正しいメールアドレスを入力してください';
    }
    if (!formData.company.address.trim()) {
      newErrors['company.address'] = '住所を入力してください';
    }

    // 紹介モードの場合の追加チェック
    if (mode === 'referral' && formData.referral) {
      if (!formData.referral.name.trim()) {
        newErrors['referral.name'] = '紹介者名を入力してください';
      }
      if (!formData.referral.contact.trim()) {
        newErrors['referral.contact'] = '連絡先を入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 重複チェック
  const checkDuplicate = async (field: string, value: string) => {
    try {
      const response = await fetch('/api/real-estates/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (!result.isValid) {
          setValidationErrors(prev => ({
            ...prev,
            [field]: result.message || '既に登録されています'
          }));
          return false;
        }
      }
    } catch (error) {
      console.error('重複チェックエラー:', error);
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        mode,
        referrer,
        ...formData
      };

      const response = await fetch('/api/real-estates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        router.push('/real-estates/register/thanks');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || '送信に失敗しました。再度お試しください。' });
      }
    } catch (error) {
      setErrors({ submit: '送信に失敗しました。再度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  // エラーメッセージの取得
  const getFieldError = (field: string): string => {
    return errors[field] || validationErrors[field] || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 送信エラー */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* 紹介者情報（紹介モードの場合） */}
      {mode === 'referral' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900">紹介者情報</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                紹介者区分 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.referral?.kind || 'existing'}
                onChange={(e) => handleInputChange('referral.kind', e.target.value)}
                className="form-input w-full"
              >
                <option value="existing">既存事業者</option>
                <option value="individual">個人</option>
                <option value="other">その他</option>
              </select>
            </div>
            
            <div>
              <Input
                label="紹介者名・事業者名"
                value={formData.referral?.name || ''}
                onChange={(e) => handleInputChange('referral.name', e.target.value)}
                error={getFieldError('referral.name')}
                required
                placeholder="紹介者のお名前または事業者名"
              />
            </div>
            
            <div>
              <Input
                label="連絡先"
                value={formData.referral?.contact || ''}
                onChange={(e) => handleInputChange('referral.contact', e.target.value)}
                error={getFieldError('referral.contact')}
                required
                placeholder="メールアドレスまたは電話番号"
              />
            </div>
            
            <div>
              <Input
                label="紹介メモ"
                value={formData.referral?.note || ''}
                onChange={(e) => handleInputChange('referral.note', e.target.value)}
                placeholder="紹介の経緯や特記事項があれば"
              />
            </div>
          </div>
        </div>
      )}

      {/* 会社情報 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">会社情報</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="会社名"
            value={formData.company.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={getFieldError('company.name')}
            required
            placeholder="株式会社○○"
          />
          
          <Input
            label="免許番号"
            value={formData.company.licenseNo}
            onChange={(e) => handleInputChange('licenseNo', e.target.value)}
            onBlur={(e) => checkDuplicate('licenseNo', e.target.value)}
            error={getFieldError('company.licenseNo')}
            required
            placeholder="宅地建物取引業免許番号"
          />
          
          <Input
            label="代表者名"
            value={formData.company.repName}
            onChange={(e) => handleInputChange('repName', e.target.value)}
            error={getFieldError('company.repName')}
            required
            placeholder="代表取締役 ○○ ○○"
          />
          
          <Input
            label="担当者氏名"
            value={formData.company.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            error={getFieldError('company.contactName')}
            required
            placeholder="担当者のお名前"
          />
          
          <Input
            label="部署"
            value={formData.company.dept}
            onChange={(e) => handleInputChange('dept', e.target.value)}
            error={getFieldError('company.dept')}
            required
            placeholder="営業部、管理部など"
          />
          
          <Input
            label="電話番号"
            value={formData.company.tel}
            onChange={(e) => handleInputChange('tel', e.target.value)}
            error={getFieldError('company.tel')}
            required
            placeholder="03-1234-5678"
          />
          
          <Input
            label="メールアドレス"
            type="email"
            value={formData.company.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={(e) => checkDuplicate('email', e.target.value)}
            error={getFieldError('company.email')}
            required
            placeholder="example@company.com"
          />
          
          <Input
            label="WebサイトURL"
            type="url"
            value={formData.company.websiteUrl}
            onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        
        <div>
          <Input
            label="住所"
            value={formData.company.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={getFieldError('company.address')}
            required
            placeholder="〒123-4567 東京都○○区○○1-2-3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            取扱エリア
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {PREFECTURES.map((prefecture) => (
              <label key={prefecture} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.company.prefectures.includes(prefecture)}
                  onChange={() => handlePrefectureChange(prefecture)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{prefecture}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 同意事項 */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="privacy-agreement"
            required
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="privacy-agreement" className="text-sm text-gray-700">
            個人情報の取り扱いについて同意し、<a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>に同意します。
            <span className="text-red-500">*</span>
          </label>
        </div>
        
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms-agreement"
            required
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="terms-agreement" className="text-sm text-gray-700">
            <a href="/terms" className="text-blue-600 hover:underline">利用規約</a>に同意します。
            <span className="text-red-500">*</span>
          </label>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
          className="md:w-auto md:px-8"
        >
          登録を完了する
        </Button>
      </div>
    </form>
  );
}
