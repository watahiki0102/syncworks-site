/**
 * 料金設定メイン選択ページコンポーネント
 * - 3つの設定項目から選択
 * - 各設定の進捗状況を表示
 * - 設定完了状況の管理
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

/**
 * 設定項目の型定義
 */
interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  isCompleted: boolean;
  isRequired: boolean;
}

export default function PricingMainPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingItem[]>([]);

  /**
   * 設定項目の初期化
   */
  useEffect(() => {
    const settingItems: SettingItem[] = [
      {
        id: 'rates',
        title: '料金基準設定',
        description: '荷物ポイント設定とトラック種別の料金、車種係数、距離料金、オプション料金',
        icon: '⚙️',
        path: '/pricing/rates',
        isCompleted: false,
        isRequired: true
      },
      {
        id: 'season',
        title: 'シーズン加算設定',
        description: '繁忙期・閑散期の料金調整',
        icon: '🌸',
        path: '/pricing/season',
        isCompleted: false,
        isRequired: false
      }
    ];

    // 各設定の完了状況をチェック
    const updatedSettings = settingItems.map(setting => {
      let isCompleted = false;
      
      switch (setting.id) {
        case 'rates':
          isCompleted = !!(localStorage.getItem('itemPointSettings') && localStorage.getItem('truckPricingRules'));
          break;
        case 'season':
          isCompleted = !!localStorage.getItem('pricingStep3');
          break;
      }
      
      return { ...setting, isCompleted };
    });

    setSettings(updatedSettings);
  }, []);

  /**
   * 設定項目をクリックした時の処理
   */
  const handleSettingClick = (path: string) => {
    router.push(path);
  };


  return (
    <main className="min-h-screen bg-gray-50">
      {/* ページヘッダー */}
      <AdminPageHeader
        title="⚙️ 料金設定"
        subtitle="料金設定に必要な項目を選択して設定してください"
        breadcrumbs={[
          { label: '料金設定' }
        ]}
      />

      <div className="w-full max-w-4xl mx-auto py-10 px-2 sm:px-4 lg:px-6 xl:px-8">


        {/* 設定項目一覧 */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {settings.map((setting) => (
            <div
              key={setting.id}
              onClick={() => handleSettingClick(setting.path)}
              className={`bg-white shadow-md rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                setting.isCompleted 
                  ? 'border-2 border-green-500 bg-green-50' 
                  : 'border-2 border-gray-200'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{setting.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  {setting.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 text-center">
                  {setting.description}
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    setting.isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {setting.isCompleted ? '完了' : '未完了'}
                  </span>
                  {setting.isRequired && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      必須
                    </span>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 text-center">💡 設定の流れ</h3>
          <div className="text-sm text-gray-700 space-y-1 text-center">
            <p>• <strong>料金基準設定</strong>：荷物ポイント設定とトラック種別別の料金、車種係数、距離料金、オプション料金、トラック管理（必須）</p>
            <p>• <strong>シーズン加算設定</strong>：繁忙期・閑散期の料金調整（任意）</p>
            <p>• 各設定は独立して行うことができ、完了した設定は緑色で表示されます</p>
          </div>
        </div>

      </div>
    </main>
  );
}
