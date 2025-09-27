/**
 * 統一カレンダーレイアウトコンポーネント
 * - admin/shiftsを基準とした共通レイアウト
 * - 月ビューと日ビューの切り替え
 * - 日付の表示場所
 * - 土日祝の色の変化
 * - カレンダーの日のマスの大きさ
 * - レスポンシブ対応
 * - セクションの白枠の分け方
 */
'use client';

import { ReactNode } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminTabs from '@/components/admin/AdminTabs';

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface UnifiedCalendarLayoutProps {
  // ヘッダー関連
  title: string;
  subtitle: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  backUrl?: string;
  showBackButton?: boolean;
  
  // タブ関連
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  
  // コンテンツ関連
  children: ReactNode;
  
  // サイドパネル関連
  showSidePanel?: boolean;
  sidePanelContent?: ReactNode;
}

export default function UnifiedCalendarLayout({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  backUrl,
  showBackButton = false,
  tabs,
  activeTab,
  onTabChange,
  children,
  showSidePanel = false,
  sidePanelContent
}: UnifiedCalendarLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* ページヘッダー */}
      <AdminPageHeader 
        title={title}
        subtitle={subtitle}
        actions={actions}
        breadcrumbs={breadcrumbs}
        backUrl={backUrl}
        showBackButton={showBackButton}
      />

      {/* タブナビゲーション */}
      <AdminTabs
        variant="calendar"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        className="px-2 sm:px-4 lg:px-6 xl:px-8"
      />

      {/* メインコンテンツ */}
      <main className={`w-full ${showSidePanel ? 'max-w-[75%]' : 'max-w-7xl'} mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 transition-all duration-300`}>
        <div className="px-4 py-2 sm:px-0">
          {/* タブコンテンツ */}
          <div className="bg-white">
            <div className="px-4 py-2 sm:p-3">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* サイドパネル */}
      {showSidePanel && sidePanelContent && (
        <div className="fixed right-0 top-0 h-full w-1/4 bg-white border-l border-gray-200 shadow-lg z-40">
          <div className="p-4">
            {sidePanelContent}
          </div>
        </div>
      )}
    </div>
  );
}
