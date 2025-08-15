/**
 * 事業者管理画面の機能紹介グリッド
 * - 6つの主要機能をカード形式で紹介
 * - 各機能の詳細説明とアイコン
 * - レスポンシブグリッドレイアウト
 */
'use client';

import React from 'react';
import { 
  Calendar, 
  Users, 
  Truck, 
  Clock, 
  FileText, 
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: Calendar,
    title: '配車管理カレンダー（日/週/月）',
    description: '案件詳細へのアンカー、確定/未確定フィルタ、重なり回避表示',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    icon: Users,
    title: '案件割り当て',
    description: '一覧と詳細を同一画面で確認、編集は専用ページへ統一',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    icon: Truck,
    title: 'トラック登録/編集',
    description: '＋ボタンのモーダルで新規/編集、不要アイコンや稼働スケジュール表示なし',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    icon: Clock,
    title: '作業者割り当て（シフト）',
    description: 'トラック×時間スロットに対して人を割当、日ビュー、稼働棒グラフ',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    icon: FileText,
    title: '案件管理',
    description: '見積履歴/依頼通知/実績（手数料差引額）と、時間帯割増・依頼元種別・自動完了',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  {
    icon: BarChart3,
    title: '集計管理',
    description: '成約推移(折れ線)、対応数(棒)、コスト(総労働時間)、トラック種別割合・稼働',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  }
];

export function FeatureGrid() {
  return (
    <div className="max-w-screen-xl mx-auto px-4">
      {/* セクションヘッダー */}
      <div className="text-center mb-16">
        <h2 
          id="features-heading" 
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
        >
          管理画面の主要機能
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          配車から請求まで、引越し業者の業務を効率化する6つの機能をご紹介します
        </p>
      </div>
      
      {/* 機能グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* アイコン */}
            <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
              <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
            </div>
            
            {/* タイトル */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              {feature.title}
            </h3>
            
            {/* 説明 */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
            
            {/* 装飾要素 */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.color} opacity-5 rounded-full -translate-y-10 translate-x-10`}></div>
            
            {/* ホバー時のチェックマーク */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        ))}
      </div>
      
      {/* 補足情報 */}
      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-500 text-sm">
          各機能は直感的な操作で、特別な研修なしでご利用いただけます
        </p>
      </div>
    </div>
  );
}
