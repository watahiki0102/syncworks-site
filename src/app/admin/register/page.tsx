/**
 * 管理者新規登録ページコンポーネント
 * - 事業者アカウントの新規登録機能
 * - フォームバリデーション
 * - ローカルストレージでのデータ保存
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * フォームデータの型定義
 */
interface FormData {
  companyName: string;     // 事業者名
  email: string;          // メールアドレス
  billingEmail: string;   // 請求書送付用メールアドレス
  phone: string;          // 電話番号
  address: string;        // 住所
  password: string;       // パスワード
  confirmPassword: string; // パスワード確認
}

export default function AdminRegister() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    email: '',
    billingEmail: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * フォームのバリデーション
   * @returns バリデーション結果（true: 成功, false: 失敗）
   */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 事業者名
    if (!formData.companyName.trim()) {
      newErrors.companyName = '事業者名は必須です';
    }

    // メールアドレス
    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレス形式で入力してください';
    }

    // 請求書送付用メールアドレス
    if (!formData.billingEmail) {
      newErrors.billingEmail = '請求書送付用メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
      newErrors.billingEmail = '正しいメールアドレス形式で入力してください';
    }

    // 電話番号
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号は必須です';
    }

    // 住所
    if (!formData.address.trim()) {
      newErrors.address = '住所は必須です';
    }

    // パスワード
    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください';
    }

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * フォーム送信時の処理
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 実際の実装ではAPIエンドポイントに送信
      // デモ用にlocalStorageに保存
      const adminData = {
        companyName: formData.companyName,
        email: formData.email,
        billingEmail: formData.billingEmail,
        phone: formData.phone,
        address: formData.address,
        registeredAt: new Date().toISOString()
      };

      localStorage.setItem('adminData', JSON.stringify(adminData));
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminEmail', formData.email);

      // 登録成功後、事業者管理画面に遷移
      router.push('/admin/dashboard');
    } catch (err) {
      setErrors({ submit: '登録に失敗しました。もう一度お試しください。' });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 入力フィールドの変更処理
   * @param e - 入力イベント
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            事業者新規登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            SyncMoving事業者として登録してください
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.companyName ? 'border-red-300' : 'border-gray-300'
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
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 請求書送付用メールアドレス */}
            <div>
              <label htmlFor="billingEmail" className="block text-sm font-medium text-gray-700">
                請求書送付用メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="billingEmail"
                  name="billingEmail"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.billingEmail}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.billingEmail ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="billing@example.com"
                />
              </div>
              {errors.billingEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.billingEmail}</p>
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
                  autoComplete="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="03-1234-5678"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
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
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="東京都渋谷区○○○"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="8文字以上で入力"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* パスワード確認 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                パスワード確認 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="パスワードを再入力"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.submit && (
              <div className="text-red-600 text-sm">
                {errors.submit}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登録中...' : '登録する'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              すでにアカウントをお持ちの方は{' '}
              <Link href="/admin/login" className="text-blue-600 hover:text-blue-500">
                ログイン
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
              <button
                className="text-center w-1/2 bg-gray-500 text-white font-semibold py-2 rounded-lg shadow-sm hover:bg-gray-600 transition text-lg"
                onClick={() => router.push('/admin/login')}
              >
                戻る
              </button>
          </div>
        </div>
      </div>
    </div>
  );
} 