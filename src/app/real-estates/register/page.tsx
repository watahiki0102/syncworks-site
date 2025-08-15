/**
 * 不動産登録画面
 * - 自社登録と紹介登録の2モード対応
 * - URLパラメータによる初期化
 * - レスポンシブレイアウト
 */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { RealEstateRegisterForm } from './components/RealEstateRegisterForm';
import { ReferralToggle } from './components/ReferralToggle';
import { RegisterMode } from '@/types/realEstate';

function RealEstateRegisterContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<RegisterMode>('self');
  const [referrer, setReferrer] = useState<string | null>(null);

  useEffect(() => {
    // URLパラメータから初期値を設定
    const modeParam = searchParams.get('mode');
    const referrerParam = searchParams.get('referrer');
    
    if (modeParam === 'referral') {
      setMode('referral');
    }
    
    if (referrerParam) {
      setReferrer(referrerParam);
    }
  }, [searchParams]);

  const handleModeChange = (newMode: RegisterMode) => {
    setMode(newMode);
    // 自社登録モードに切り替えた場合は紹介者情報をクリア
    if (newMode === 'self') {
      setReferrer(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            不動産事業者登録
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            引越し業者とのマッチングで、お客様の不動産取引をサポートします。
            無料でご登録いただけます。
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {/* モード切替 */}
          <div className="mb-8">
            <ReferralToggle 
              mode={mode} 
              onModeChange={handleModeChange} 
            />
          </div>

          {/* 登録フォーム */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <RealEstateRegisterForm 
              mode={mode}
              referrer={referrer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealEstateRegisterPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          </div>
        </div>
      }>
        <RealEstateRegisterContent />
      </Suspense>
    </Layout>
  );
}
