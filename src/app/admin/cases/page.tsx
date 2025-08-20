/**
 * 管理者案件管理ページコンポーネント
 * - 見積もり回答履歴
 * - 見積もり回答依頼通知
 * - 成約実績管理
 * タブで切り替え可能
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import QuoteHistoryPage from './history/page';
import QuoteRequestsPage from './requests/page';
import PerformancePage from './performance/page';

type TabType = 'history' | 'notifications' | 'contracts';

export default function CaseManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const router = useRouter();

  // 未回答依頼数の取得（デモデータ）
  const getPendingCount = () => {
    return 2; // デモ用の固定値
  };

  // 緊急依頼数の取得（デモデータ）
  const getUrgentCount = () => {
    return 1; // デモ用の固定値
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">案件管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  見積もり回答・成約実績の管理
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/cases/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ＋案件登録
                </button>
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  トップに戻る
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* タブナビゲーション */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                見積もり回答履歴
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                見積もり回答依頼通知
                {getPendingCount() > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {getPendingCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contracts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                成約実績管理
              </button>
            </nav>
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 見積もり回答履歴タブ */}
          {activeTab === 'history' && (
            <QuoteHistoryPage />
          )}

          {/* 見積もり回答依頼通知タブ */}
          {activeTab === 'notifications' && (
            <QuoteRequestsPage />
          )}

          {/* 成約実績管理タブ */}
          {activeTab === 'contracts' && (
            <PerformancePage />
          )}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
