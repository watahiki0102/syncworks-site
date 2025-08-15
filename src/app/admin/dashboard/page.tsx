/**
 * 管理者ダッシュボードページコンポーネント（改善版）
 * - シンプルなヘッダーレイアウト
 * - 縦並びメニュー配置
 * - 設定機能の統合
 * - ニュース機能
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminAuthGuard from '@/components/AdminAuthGuard';
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
    <div className="w-full space-y-2 border border-gray-200 rounded-2xl p-3 bg-white shadow-lg h-full min-h-[520px]">
      <h2 className="text-base font-bold text-gray-900 mb-2 border-b-2 border-gray-200 shadow-sm pb-1">トレンド情報</h2>
      
      {/* 未回答数 */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-red-50 p-2 rounded-xl shadow border-l-4 border-red-400">
        <div className="text-lg">❗</div>
        <div>
          <div className="text-xs text-gray-900">未回答数</div>
          <div className="text-lg font-extrabold text-red-700 tracking-tight">{unansweredCount}<span className="text-xs font-medium text-gray-900 ml-1">件</span></div>
        </div>
      </div>
      
      {/* 本日の申し込み数 */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 p-2 rounded-xl shadow border-l-4 border-blue-400">
        <div className="text-lg">📝</div>
        <div>
          <div className="text-xs text-gray-900">本日の申し込み数</div>
          <div className="text-lg font-extrabold text-blue-700 tracking-tight">{todayApplications}<span className="text-xs font-medium text-gray-900 ml-1">件</span></div>
        </div>
      </div>
      
      {/* 今月の成約数 */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 p-2 rounded-xl shadow border-l-4 border-green-400">
        <div className="text-lg">🎯</div>
        <div>
          <div className="text-xs text-gray-900">今月の成約数</div>
          <div className="text-lg font-extrabold text-green-700 tracking-tight">{monthlyContracts}<span className="text-xs font-medium text-gray-900 ml-1">件</span></div>
        </div>
      </div>
      
      {/* 今月の売上 */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-50 p-2 rounded-xl shadow border-l-4 border-amber-400">
        <div className="text-lg">💰</div>
        <div>
          <div className="text-xs text-gray-900">今月の売上</div>
          <div className="text-lg font-extrabold text-amber-700 tracking-tight">¥{sales.toLocaleString()}</div>
        </div>
      </div>
      
      {/* 今月の成約率 */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 p-2 rounded-xl shadow border-l-4 border-purple-400">
        <div className="text-lg">📊</div>
        <div>
          <div className="text-xs text-gray-900">今月の成約率</div>
          <div className="text-lg font-extrabold text-purple-700 tracking-tight">{contractRate}<span className="text-xs font-medium text-gray-900 ml-1">%</span></div>
        </div>
      </div>
    </div>
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '新機能': return 'bg-blue-100 text-blue-800';
      case '実績': return 'bg-green-100 text-green-800';
      case '改善': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-3 border border-gray-200 min-h-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="text-lg">📰</span>
          最新ニュース
        </h2>
        <span className="text-xs text-gray-500">更新日: 2024/12/28</span>
      </div>
      
      <div className="space-y-2 max-h-44 overflow-y-auto">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">{item.date}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-1 mb-0.5">
                  <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                  <div className="flex gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    {item.isNew && (
                      <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-1">{item.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const settingsRef = useRef<HTMLDivElement>(null);

  // 設定メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

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

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">事業者管理画面</h1>
                <p className="text-sm text-gray-600 mt-1">ログイン中: {adminEmail}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* 基本情報設定メニュー */}
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-lg">⚙️</span>
                    <span>設定</span>
                  </button>
                  
                  {/* 設定ドロップダウン */}
                  {showSettings && (
                    <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-2">
                        <Link
                          href="/pricing/step1"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowSettings(false)}
                        >
                          <span className="text-lg">💰</span>
                          <div>
                            <div className="font-medium">料金設定</div>
                            <div className="text-xs text-gray-500">ポイント・料金体系</div>
                          </div>
                        </Link>
                        <Link
                          href="/admin/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setShowSettings(false)}
                        >
                          <span className="text-lg">📝</span>
                          <div>
                            <div className="font-medium">基本情報設定</div>
                            <div className="text-xs text-gray-500">事業者情報の編集</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>

                {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-min">
            {/* 最新ニュース - 2列分の幅を取る */}
            <div className="lg:col-span-2">
              <NewsPanel />
            </div>

            {/* 案件管理 */}
            <div className="lg:col-start-1">
              <Link href="/admin/case-management" className="block h-full">
                <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102 h-full min-h-[120px]">
                  <div className="p-3 flex items-center gap-2 h-full">
                    <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center text-lg">📋</div>
                    <div>
                      <h3 className="text-base font-bold text-orange-600">案件管理</h3>
                      <p className="text-xs text-gray-900">見積もり履歴・通知・成約実績の統合管理</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* シフト管理 */}
            <div className="lg:col-start-2">
              <Link href="/admin/shifts" className="block h-full">
                <div className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102 h-full min-h-[120px]">
                  <div className="p-3 flex items-center gap-2 h-full">
                    <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center text-lg">👥</div>
                    <div>
                      <h3 className="text-base font-bold text-teal-600">シフト管理</h3>
                      <p className="text-xs text-gray-900">従業員の稼働スケジュール管理</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* 配車管理 */}
            <div className="lg:col-start-1">
              <Link href="/admin/dispatch" className="block h-full">
                <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102 h-full min-h-[120px]">
                  <div className="p-3 flex items-center gap-2 h-full">
                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-lg">🚚</div>
                    <div>
                      <h3 className="text-base font-bold text-indigo-600">配車管理</h3>
                      <p className="text-xs text-gray-900">トラックの稼働スケジュール管理</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* 集計管理 */}
            <div className="lg:col-start-2">
              <Link href="/admin/analytics" className="block h-full">
                <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102 h-full min-h-[120px]">
                  <div className="p-3 flex items-center gap-2 h-full">
                    <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-lg">📊</div>
                    <div>
                      <h3 className="text-base font-bold text-purple-600">集計管理</h3>
                      <p className="text-xs text-gray-900">成約率・売上などのKPI分析</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* トレンド情報 - 右列に配置 */}
            <div className="lg:col-start-3 lg:row-start-1 lg:row-end-4">
              <TrendPanel
                unansweredCount={unansweredCount}
                todayApplications={todayApplications}
                monthlyContracts={monthlyContracts}
                sales={sales}
                contractRate={contractRate}
              />
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}