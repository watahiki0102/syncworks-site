/**
 * 管理者案件管理ページコンポーネント
 * - 見積もり回答履歴
 * - 見積もり回答依頼通知
 * - 成約実績管理
 * タブで切り替え可能
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import AdminButton from '@/components/admin/AdminButton';
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
  const _getUrgentCount = () => {
    return 1; // デモ用の固定値
  };

  const tabs = [
    { id: 'history', label: '見積もり回答履歴' },
    { id: 'notifications', label: '見積もり回答依頼通知', count: getPendingCount() },
    { id: 'contracts', label: '成約実績管理' }
  ];

  const actions = (
    <>
      <AdminButton 
        variant="primary" 
        icon="+" 
        onClick={() => router.push('/admin/cases/register')}
      >
        案件登録
      </AdminButton>
    </>
  );

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title="案件管理"
          subtitle="見積もり回答・成約実績の管理"
          actions={actions}
          breadcrumbs={[
            { label: '案件管理' }
          ]}
        />

        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdminTabs 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as TabType)}
            />
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
