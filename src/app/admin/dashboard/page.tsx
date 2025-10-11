/**
 * 管理者事業者管理画面ページコンポーネント（改善版）
 * - シンプルなヘッダーレイアウト
 * - 縦並びメニュー配置
 * - 設定機能の統合
 * - ニュース機能
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { AdminLayout, AdminCard, AdminBadge } from '@/components/admin';

/**
 * トレンド情報パネルコンポーネント
 * - 未回答数、本日の受注数、申し込み数、売上、受注率、平均評価を表示
 */
function TrendPanel({ unansweredCount, todayApplications, monthlyContracts, sales, contractRate }: {
  unansweredCount: number;  // 未回答数
  todayApplications: number; // 本日の申し込み数
  monthlyContracts: number; // 今月の受注数
  sales: number;            // 今月の売上
  contractRate: number;     // 今月の受注率
}) {
  return (
    <AdminCard title="トレンド情報" icon="📊" padding="sm" className="h-full">
      <div className="space-y-2">
        {/* 未回答数 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-25 dark:from-red-900/20 dark:to-red-800/10 rounded-lg border-l-4 border-red-400 dark:border-red-500">
          <div className="text-xl">❗</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">未回答数</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {unansweredCount}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">件</span>
            </div>
          </div>
        </div>
        
        {/* 本日の申し込み数 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg border-l-4 border-blue-400 dark:border-blue-500">
          <div className="text-xl">📝</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">本日の申し込み数</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayApplications}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">件</span>
            </div>
          </div>
        </div>
        
        {/* 今月の受注数 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-25 dark:from-green-900/20 dark:to-green-800/10 rounded-lg border-l-4 border-green-400 dark:border-green-500">
          <div className="text-xl">🎯</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">今月の受注数</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {monthlyContracts}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">件</span>
            </div>
          </div>
        </div>
        
        {/* 今月の売上 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-25 dark:from-amber-900/20 dark:to-amber-800/10 rounded-lg border-l-4 border-amber-400 dark:border-amber-500">
          <div className="text-xl">💰</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">今月の売上</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ¥{sales.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* 今月の受注率 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-25 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg border-l-4 border-purple-400 dark:border-purple-500">
          <div className="text-xl">📊</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">今月の受注率</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {contractRate}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">%</span>
            </div>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

/**
 * ニュースパネルコンポーネント
 */
function NewsPanel() {
  const news = [
    { 
      date: "2024/12/28", 
      title: "自動配車最適化機能をリリース",
      content: "AI を活用した新しい配車最適化機能により、効率的な配車計画が可能になりました。",
      category: "新機能",
      isNew: true
    },
    { 
      date: "2024/12/27", 
      title: "月間受注率が過去最高を記録",
      content: "12月の受注率が85%に達し、過去最高記録を更新しました。",
      category: "実績",
      isNew: true
    },
    { 
      date: "2024/12/26", 
      title: "案件管理システムUI刷新",
      content: "より使いやすく直感的な案件管理画面にリニューアルしました。",
      category: "改善",
      isNew: false
    },
    { 
      date: "2024/12/25", 
      title: "配車効率20%向上を達成",
      content: "システム改善により、前月比で配車効率が大幅に向上しました。",
      category: "実績",
      isNew: false
    },
    { 
      date: "2024/12/24", 
      title: "シフト自動調整機能を追加",
      content: "従業員のシフト管理がより簡単になる自動調整機能を導入しました。",
      category: "新機能",
      isNew: false
    }
  ];

  const getCategoryVariant = (category: string): 'primary' | 'success' | 'warning' | 'default' => {
    switch (category) {
      case '新機能': return 'primary';
      case '実績': return 'success';
      case '改善': return 'warning';
      default: return 'default';
    }
  };

  return (
    <AdminCard 
      title="最新ニュース" 
      icon="📰" 
      subtitle="更新日: 2024/12/28"
      padding="sm"
      className="h-full"
    >
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-3 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AdminBadge variant="default" size="sm">{item.date}</AdminBadge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">{item.title}</h3>
                  <div className="flex gap-1">
                    <AdminBadge variant={getCategoryVariant(item.category)} size="sm">
                      {item.category}
                    </AdminBadge>
                    {item.isNew && (
                      <AdminBadge variant="danger" size="sm">NEW</AdminBadge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export default function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [adminEmail, setAdminEmail] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminEmail(email);
    }
  }, []);



  const sales = 450000;
  const contractRate = 70;
  const unansweredCount = 3;  // 未回答数
  const todayApplications = 5; // 本日の申し込み数
  const monthlyContracts = 10; // 今月の受注数

  const settingsActions = null; // AdminLayoutの設定メニューに統一

  return (
    <AdminAuthGuard>
      <AdminLayout
        title="事業者管理画面"
        actions={settingsActions}
      >
         {/* PC・タブレット・スマホ対応：レスポンシブレイアウト */}
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-h-[calc(100vh-200px)] max-w-7xl mx-auto px-4">
           {/* 左列：ニュースと主要メニュー（2列分の幅） */}
           <div className="space-y-6 w-full xl:col-span-2">
             {/* 最新ニュース */}
             <div className="h-auto xl:h-1/2">
               <NewsPanel />
             </div>
             
             {/* メニューカード群を1列（スマホ）→2列（タブレット以上）の配置 */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
               {/* 案件管理 */}
               <Link href="/admin/cases" className="block">
                 <AdminCard
                   title="案件管理"
                   subtitle="案件・支払対象一覧"
                   icon="📋"
                   className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-800 border-orange-200 dark:border-orange-700 min-h-[120px]"
                   padding="sm"
                 >
                   <div className="text-gray-900 dark:text-gray-100">
                     <AdminBadge variant="warning" size="sm">{unansweredCount > 0 ? `${unansweredCount}件未対応` : '対応済'}</AdminBadge>
                   </div>
                 </AdminCard>
               </Link>

              {/* 従業員管理 */}
              <Link href="/admin/shifts" className="block">
                <AdminCard
                  title="従業員管理"
                  subtitle="従業員の稼働スケジュール管理"
                  icon="👥"
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-teal-50 to-white dark:from-gray-800 dark:to-gray-800 border-teal-200 dark:border-teal-700 min-h-[120px]"
                  padding="sm"
                >
                  <div className="text-gray-900 dark:text-gray-100">
                    <AdminBadge variant="info" size="sm">5人稼働中</AdminBadge>
                  </div>
                </AdminCard>
              </Link>

              {/* 配車管理 */}
              <Link href="/admin/dispatch" className="block">
               <AdminCard
                 title="配車管理"
                 subtitle="トラックの稼働スケジュール管理"
                 icon="🚚"
                 className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800 border-indigo-200 dark:border-indigo-700 min-h-[120px]"
                 padding="sm"
               >
                 <div className="text-gray-900 dark:text-gray-100">
                   <AdminBadge variant="success" size="sm">3台稼働中</AdminBadge>
                 </div>
               </AdminCard>
              </Link>

              {/* 受注実績管理 */}
              <Link href="/admin/analytics" className="block">
               <AdminCard
                 title="受注実績管理"
                 subtitle="引越し受注件数と売上実績の確認"
                 icon="📊"
                 className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800 border-purple-200 dark:border-purple-700 min-h-[120px]"
                 padding="sm"
               >
                 <div className="text-gray-900 dark:text-gray-100">
                   <AdminBadge variant="info" size="sm">今月{contractRate}%</AdminBadge>
                 </div>
               </AdminCard>
              </Link>
            </div>
          </div>

          {/* 右列：トレンド情報（1列分の幅） */}
          <div className="w-full h-auto xl:h-full xl:col-span-1">
            <TrendPanel
              unansweredCount={unansweredCount}
              todayApplications={todayApplications}
              monthlyContracts={monthlyContracts}
              sales={sales}
              contractRate={contractRate}
            />
          </div>
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}