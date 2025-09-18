/**
 * 管理者案件管理ページコンポーネント
 * - 案件一覧（統合ビュー）
 * - 支払対象
 * タブで切り替え可能
 */
'use client';

import { useState, useEffect } from 'react';
import AdminButton from '@/components/admin/AdminButton';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTabs from '@/components/admin/AdminTabs';
import UnifiedCasesPage from './unified/page';
import PerformancePage from './performance/page';
import { IntermediaryService } from './lib/normalize';
import { generateUnifiedTestData, getPendingCount } from './lib/unifiedData';

type TabType = 'unified' | 'contracts';

export default function CaseManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('unified');
  const [pendingCount, setPendingCount] = useState<number>(0);

  // 未回答依頼数の計算
  useEffect(() => {
    // 仲介元のテストデータを初期化
    IntermediaryService.initializeTestData();
    
    const unifiedData = generateUnifiedTestData();
    const pendingCases = getPendingCount(unifiedData);
    setPendingCount(pendingCases);
  }, []);

  const tabs = [
    { id: 'unified', label: '案件一覧', count: pendingCount },
    { id: 'contracts', label: '支払対象一覧' }
  ];

  const actions = (
    <>
      <AdminButton 
        variant="primary" 
        icon="+" 
        onClick={() => window.location.href = '/admin/cases/register'}
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
          subtitle="案件・支払対象一覧"
          actions={actions}
          breadcrumbs={[
            { label: '案件管理' }
          ]}
        />

        <div className="bg-white border-b">
          <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
            <AdminTabs 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as TabType)}
            />
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="w-full py-2 px-2 sm:px-4 lg:px-6 xl:px-8">
          {/* 案件一覧タブ */}
          {activeTab === 'unified' && (
            <UnifiedCasesPage />
          )}

          {/* 支払対象一覧タブ */}
          {activeTab === 'contracts' && (
            <PerformancePage />
          )}
        </main>
      </div>
    </AdminAuthGuard>
  );
}