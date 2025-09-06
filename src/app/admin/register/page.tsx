/**
 * 管理者新規登録ページコンポーネント
 * - 事業者アカウントの新規登録機能
 * - 利用種別選択（引越し事業者 / 紹介者）
 * - フォームバリデーション
 * - ローカルストレージでのデータ保存
 */
'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin';

export default function RegisterPage() {
  return (
    <AdminLayout title="事業者管理画面">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ヘッダーセクション */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">事業者管理画面</h1>
            <p className="text-lg text-gray-600">引越し事業者の登録・管理を行います</p>
          </div>
          
          {/* メインコンテンツエリア */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 最新ニュースパネル */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">最新ニュース</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">更新日: 2024/12/28</p>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">2024/12/28</span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">新機能</span>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">NEW</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">自動配車最適化機能をリリース</h3>
                  <p className="text-sm text-gray-600">AIを活用した新しい配車最適化機能により、効率的な配車計画が可能になりました。</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">2024/12/27</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">実績</span>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">NEW</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">月間成約率が過去最高を記録</h3>
                  <p className="text-sm text-gray-600">12月の成約率が85%に達し、過去最高記録を更新しました。</p>
                </div>
              </div>
            </div>

            {/* トレンド情報パネル */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">トレンド情報</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">未回答数</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-600">3件</div>
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">要対応</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">本日の申し込み数</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">5件</div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">今日</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">今月の成約数</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">10件</div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">成約</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">今月の売上</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-yellow-600">¥450,000</div>
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">売上</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">今月の成約率</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-600">85%</div>
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">率</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 管理カテゴリーセクション */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">管理機能</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* 案件管理 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-400 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">案件管理</h3>
                  <p className="text-sm text-gray-600">見積もり・成約管理</p>
                </div>
              </div>

              {/* シフト管理 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-400 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">シフト管理</h3>
                  <p className="text-sm text-gray-600">従業員スケジュール</p>
                </div>
              </div>

              {/* 配車管理 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-400 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">配車管理</h3>
                  <p className="text-sm text-gray-600">トラック配車・稼働</p>
                </div>
              </div>

              {/* 集計管理 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-400 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">集計管理</h3>
                  <p className="text-sm text-gray-600">売上・成約率分析</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 