'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import React from 'react';

// トレンド情報カードのコンポーネント
function TrendPanel({ applicationCount, sales, contractRate, averageRating }: {
  applicationCount: number;
  sales: number;
  contractRate: number;
  averageRating: number;
}) {
  return (
    <div className="w-full lg:w-80 space-y-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-lg flex-shrink-0 relative mt-6 lg:mt-0">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-gray-200 shadow-sm pb-2">トレンド情報</h2>
      {/* 集計データ風カード */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-100 to-blue-50 p-5 rounded-xl shadow border-l-4 border-blue-400">
        <div className="text-4xl">📋</div>
        <div>
          <div className="text-xs text-gray-900">今月の申し込み</div>
          <div className="text-2xl font-extrabold text-blue-700 tracking-tight">{applicationCount}<span className="text-base font-medium text-gray-900 ml-1">件</span></div>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-gradient-to-r from-green-100 to-green-50 p-5 rounded-xl shadow border-l-4 border-green-400">
        <div className="text-4xl">💰</div>
        <div>
          <div className="text-xs text-gray-900">今月の売上</div>
          <div className="text-2xl font-extrabold text-green-700 tracking-tight">¥{sales.toLocaleString()}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-gradient-to-r from-purple-100 to-purple-50 p-5 rounded-xl shadow border-l-4 border-purple-400">
        <div className="text-4xl">🕒</div>
        <div>
          <div className="text-xs text-gray-900">今月の成約率</div>
          <div className="text-2xl font-extrabold text-purple-700 tracking-tight">{contractRate}<span className="text-base font-medium text-gray-900 ml-1">%</span></div>
        </div>
      </div>
      <a href="/reviews/1" className="block">
        <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-100 to-yellow-50 p-5 rounded-xl shadow border-l-4 border-yellow-400 hover:shadow-lg transition-all duration-300 hover:scale-102">
          <div className="text-4xl">⭐</div>
          <div>
            <div className="text-xs text-gray-900">平均評価</div>
            <div className="text-2xl font-extrabold text-yellow-600 tracking-tight">{averageRating}<span className="text-base font-medium text-gray-900 ml-1">/5.0</span></div>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function AdminDashboard(props: {
  applicationCount?: number;
  sales?: number;
  contractRate?: number;
  averageRating?: number;
}) {
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
        router.push('/admin/login');
    };

    // デフォルト値
    const applicationCount = props.applicationCount ?? 12;
    const sales = props.sales ?? 450000;
    const contractRate = props.contractRate ?? 70;
    const averageRating = props.averageRating ?? 4.8;

    return (
        <AdminAuthGuard>
            <div className="min-h-screen bg-gray-50">
                {/* ヘッダー */}
                <header className="bg-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    事業者管理画面
                                </h1>
                                <p className="text-sm text-gray-900 mt-1">
                                    ログイン中: {adminEmail}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                ログアウト
                            </button>
                        </div>
                    </div>
                </header>

                {/* メインコンテンツ */}
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="flex gap-8 flex-col lg:flex-row">
                            {/* メニューカード */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* 価格設定 */}
                                <Link href="/pricing/step1" className="block">
                                    <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102">
                                        <div className="p-7 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">💰</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-blue-600">料金設定</h3>
                                                <p className="text-sm text-gray-900">ポイント設定、料金体系の管理</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                {/* 申し込み管理 */}
                                <Link href="/admin/quotes" className="block">
                                    <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102">
                                        <div className="p-7 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">📋</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-green-600">見積もり回答履歴</h3>
                                                <p className="text-sm text-gray-900">お客様への見積もり回答履歴</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                {/* 基本情報編集 */}
                                <Link href="/admin/profile" className="block">
                                    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102">
                                        <div className="p-7 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">⚙️</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-purple-600">基本情報編集</h3>
                                                <p className="text-sm text-gray-900">事業者情報の編集・更新</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                {/* 成約実績管理 */}
                                <Link href="/admin/contracts" className="block">
                                    <div className="bg-gradient-to-br from-red-50 to-white border-2 border-red-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102">
                                        <div className="p-7 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-3xl">📊</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-red-600">成約実績管理</h3>
                                                <p className="text-sm text-gray-900">成約実績と売上の管理・分析</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                {/* 見積もり回答依頼通知 */}
                                <Link href="/admin/notifications" className="block">
                                    <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-400 rounded-2xl shadow-md hover:shadow-2xl transition-transform duration-300 hover:scale-102">
                                        <div className="p-7 flex items-center gap-4">
                                            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-3xl">🔔</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-orange-600">見積もり回答依頼通知</h3>
                                                <p className="text-sm text-gray-900">お客様からの見積もり依頼の管理</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            {/* トレンドデータ */}
                            <TrendPanel
                              applicationCount={applicationCount}
                              sales={sales}
                              contractRate={contractRate}
                              averageRating={averageRating}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </AdminAuthGuard>
    );
}