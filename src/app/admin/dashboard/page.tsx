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
import { AdminLayout, AdminCard, AdminButton, AdminBadge } from '@/components/admin';
import React from 'react';

/**
 * トレンド情報パネルコンポーネント
 * - 未回答数、本日の成約数、申し込み数、売上、成約率、平均評価を表示
 */
function TrendPanel({ unansweredCount, todayApplications, monthlyContracts, sales, contractRate }: {
  unansweredCount: number;  // 未回答数
  todayApplications: number; // 本日の申し込み数
  monthlyContracts: number; // 今月の成約数
  sales: number;            // 今月の売上
  contractRate: number;     // 今月の成約率
}) {
  return (
    <AdminCard title="トレンド情報" icon="📊" padding="sm">
      <div className="space-y-3">
        {/* 未回答数 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-25 rounded-lg border-l-4 border-red-400">
          <div className="text-xl">❗</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">未回答数</div>
            <div className="text-2xl font-bold text-red-600">
              {unansweredCount}
              <span className="text-sm font-normal text-gray-600 ml-1">件</span>
            </div>
          </div>
          <AdminBadge variant="danger" size="sm">{unansweredCount > 0 ? '要対応' : '対応済み'}</AdminBadge>
        </div>
        
        {/* 本日の申し込み数 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg border-l-4 border-blue-400">
          <div className="text-xl">📝</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">本日の申し込み数</div>
            <div className="text-2xl font-bold text-blue-600">
              {todayApplications}
              <span className="text-sm font-normal text-gray-600 ml-1">件</span>
            </div>
          </div>
          <AdminBadge variant="primary" size="sm">今日</AdminBadge>
        </div>
        
        {/* 今月の成約数 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-25 rounded-lg border-l-4 border-green-400">
          <div className="text-xl">🎯</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">今月の成約数</div>
            <div className="text-2xl font-bold text-green-600">
              {monthlyContracts}
              <span className="text-sm font-normal text-gray-600 ml-1">件</span>
            </div>
          </div>
          <AdminBadge variant="success" size="sm">成約</AdminBadge>
        </div>
        
        {/* 今月の売上 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-25 rounded-lg border-l-4 border-amber-400">
          <div className="text-xl">💰</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">今月の売上</div>
            <div className="text-2xl font-bold text-amber-600">
              ¥{sales.toLocaleString()}
            </div>
          </div>
          <AdminBadge variant="warning" size="sm">売上</AdminBadge>
        </div>
        
        {/* 今月の成約率 */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-25 rounded-lg border-l-4 border-purple-400">
          <div className="text-xl">📊</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">今月の成約率</div>
            <div className="text-2xl font-bold text-purple-600">
              {contractRate}
              <span className="text-sm font-normal text-gray-600 ml-1">%</span>
            </div>
          </div>
          <AdminBadge variant="info" size="sm">率</AdminBadge>
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
      title: "月間成約率が過去最高を記録",
      content: "12月の成約率が85%に達し、過去最高記録を更新しました。",
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
    >
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AdminBadge variant="default" size="sm">{item.date}</AdminBadge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 flex-1">{item.title}</h3>
                  <div className="flex gap-1">
                    <AdminBadge variant={getCategoryVariant(item.category)} size="sm">
                      {item.category}
                    </AdminBadge>
                    {item.isNew && (
                      <AdminBadge variant="danger" size="sm">NEW</AdminBadge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

export default function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminEmail(email);
    }
  }, []);

  const handleLogout = () => {
    if (!window.confirm('本当にログアウトしますか？')) return;
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminAutoLoginExpiry');
    localStorage.removeItem('adminRememberMe');
    router.push('/admin/login');
  };

  const sales = 450000;
  const contractRate = 70;
  const unansweredCount = 3;  // 未回答数
  const todayApplications = 5; // 本日の申し込み数
  const monthlyContracts = 10; // 今月の成約数

  const settingsActions = null; // AdminLayoutの設定メニューに統一

  return (
    <AdminAuthGuard>
      <AdminLayout
        title="事業者管理画面"
        actions={settingsActions}
      >
        {/* 13インチPC最適化：3列レイアウトを2列に調整 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左列：ニュースと主要メニュー */}
          <div className="space-y-6">
            {/* 最新ニュース */}
            <NewsPanel />
            
            {/* メニューカード群を2列で配置 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 案件管理 */}
              <Link href="/admin/cases" className="block">
                <AdminCard
                  title="案件管理"
                  subtitle="見積もり・成約管理"
                  icon="📋"
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-white border-orange-200"
                  padding="md"
                >
                  <AdminBadge variant="warning" size="sm">{unansweredCount > 0 ? `${unansweredCount}件未対応` : '対応済み'}</AdminBadge>
                </AdminCard>
              </Link>

              {/* シフト管理 */}
              <Link href="/admin/shifts" className="block">
                <AdminCard
                  title="シフト管理"
                  subtitle="従業員スケジュール"
                  icon="👥"
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-teal-50 to-white border-teal-200"
                  padding="md"
                >
                  <AdminBadge variant="info" size="sm">5人稼働中</AdminBadge>
                </AdminCard>
              </Link>

              {/* 配車管理 */}
              <Link href="/admin/dispatch" className="block">
                <AdminCard
                  title="配車管理"
                  subtitle="トラック配車・稼働"
                  icon="🚚"
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-indigo-50 to-white border-indigo-200"
                  padding="md"
                >
                  <AdminBadge variant="primary" size="sm">3台稼働中</AdminBadge>
                </AdminCard>
              </Link>

              {/* 集計管理 */}
              <Link href="/admin/analytics" className="block">
                <AdminCard
                  title="集計管理"
                  subtitle="売上・成約率分析"
                  icon="📊"
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white border-purple-200"
                  padding="md"
                >
                  <AdminBadge variant="success" size="sm">{contractRate}% 成約率</AdminBadge>
                </AdminCard>
              </Link>
            </div>
          </div>

          {/* 右列：トレンド情報 */}
          <div>
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