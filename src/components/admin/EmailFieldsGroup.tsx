/**
 * メールアドレス項目の共通コンポーネント
 * - 事業者メールアドレス
 * - 請求支払関連メールアドレス
 * - 引越顧客用メールアドレス
 */
'use client';

import React from 'react';

export interface EmailData {
  businessEmail: string;      // 事業者メールアドレス
  billingEmail: string;       // 請求支払関連メールアドレス
  customerEmail: string;      // 引越顧客用メールアドレス
}

interface EmailFieldsGroupProps {
  emailData: EmailData;
  onChange: (field: keyof EmailData, value: string) => void;
  errors?: Partial<Record<keyof EmailData, string>>;
  className?: string;
}

export default function EmailFieldsGroup({
  emailData,
  onChange,
  errors = {},
  className = ""
}: EmailFieldsGroupProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>注意:</strong> 各メールアドレスには同じアドレスを入力することも可能ですが、用途に応じて適切に使い分けることをお勧めします。
            </p>
          </div>
        </div>
      </div>
      {/* 事業者メールアドレス */}
      <div>
        <label htmlFor="businessEmail" className="block text-base font-medium text-gray-700 mb-1">
          事業者メールアドレス <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          管理者ログインや各種通知に使用されるメインのメールアドレスです
        </p>
        <input
          id="businessEmail"
          name="businessEmail"
          type="email"
          required
          value={emailData.businessEmail}
          onChange={(e) => onChange('businessEmail', e.target.value)}
          className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${
            errors.businessEmail ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="admin@example.com"
        />
        {errors.businessEmail && <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>}
      </div>

      {/* 請求支払関連メールアドレス */}
      <div>
        <label htmlFor="billingEmail" className="block text-base font-medium text-gray-700 mb-1">
          請求支払関連メールアドレス <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          請求や支払関連の書類送付に使用されます
        </p>
        <input
          id="billingEmail"
          name="billingEmail"
          type="email"
          required
          value={emailData.billingEmail}
          onChange={(e) => onChange('billingEmail', e.target.value)}
          className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${
            errors.billingEmail ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="billing@example.com"
        />
        {errors.billingEmail && <p className="mt-1 text-sm text-red-600">{errors.billingEmail}</p>}
      </div>

      {/* 引越顧客用メールアドレス */}
      <div>
        <label htmlFor="customerEmail" className="block text-base font-medium text-gray-700 mb-1">
          引越顧客用メールアドレス <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-2">
          引越しのお客様とのやり取りに使用されるメールアドレスです
        </p>
        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          required
          value={emailData.customerEmail}
          onChange={(e) => onChange('customerEmail', e.target.value)}
          className={`appearance-none block w-full px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base ${
            errors.customerEmail ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="customer@example.com"
        />
        {errors.customerEmail && <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>}
      </div>
    </div>
  );
}

/**
 * バリデーション関数
 */
export const validateEmailData = (emailData: EmailData): Partial<Record<keyof EmailData, string>> => {
  const errors: Partial<Record<keyof EmailData, string>> = {};
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailData.businessEmail) {
    errors.businessEmail = '事業者メールアドレスは必須です';
  } else if (!emailPattern.test(emailData.businessEmail)) {
    errors.businessEmail = '正しいメールアドレス形式で入力してください';
  }
  
  if (!emailData.billingEmail) {
    errors.billingEmail = '請求支払関連メールアドレスは必須です';
  } else if (!emailPattern.test(emailData.billingEmail)) {
    errors.billingEmail = '正しいメールアドレス形式で入力してください';
  }
  
  if (!emailData.customerEmail) {
    errors.customerEmail = '引越顧客用メールアドレスは必須です';
  } else if (!emailPattern.test(emailData.customerEmail)) {
    errors.customerEmail = '正しいメールアドレス形式で入力してください';
  }
  
  return errors;
};
