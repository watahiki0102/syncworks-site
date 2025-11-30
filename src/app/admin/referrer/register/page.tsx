/**
 * 引越し案件紹介者新規登録ページコンポーネント
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReferrerType } from '@/types/referral';

export default function ReferrerRegisterPage() {
  const router = useRouter();
  const [_referrerType, _setReferrerType] = useState<ReferrerType>('company');
  const [_isLoading, _setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="text-center">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900">
            引越し案件紹介者新規登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            引越し案件紹介者として登録してください
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              この画面は現在開発中です
            </p>
            <p className="text-sm text-gray-600 mb-6">
              引越し案件紹介者の登録機能は近日公開予定です
            </p>
            <button
              className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition"
              onClick={() => router.push('/admin/login')}
            >
              ログイン画面に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
