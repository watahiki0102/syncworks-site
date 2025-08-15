/**
 * 業務改善インパクトの数値KPI表示
 * - 3つの主要な改善効果を数値で訴求
 * - 視覚的に分かりやすいアイコンとレイアウト
 * - 注釈付きで信頼性を確保
 */
'use client';

import React from 'react';
import { 
  TrendingDown, 
  Clock, 
  TrendingUp, 
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ImpactStat {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
  color: string;
  bgColor: string;
}

const impactStats: ImpactStat[] = [
  {
    icon: TrendingDown,
    title: '価格交渉対応ゼロ',
    value: '見積対応時間',
    change: '-40%',
    changeType: 'decrease',
    description: '価格交渉が不要なため、見積もり対応時間を大幅に短縮',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: Clock,
    title: '日次配車計画の調整',
    value: '調整時間',
    change: '-35%',
    changeType: 'decrease',
    description: '管理画面での効率的な配車管理により調整時間を削減',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: TrendingUp,
    title: '顧客単価の維持/向上',
    value: '単価向上',
    change: '+15%',
    changeType: 'increase',
    description: '高品質なサービス提供により顧客単価を向上',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: Users,
    title: '管理オペレーション',
    value: '業務効率化',
    change: '-30%',
    changeType: 'decrease',
    description: '統合管理システムにより管理業務を効率化',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export function ImpactStats() {
  return (
    <div className="max-w-screen-xl mx-auto px-4">
      {/* セクションヘッダー */}
      <div className="text-center mb-16">
        <h2 
          id="impact-heading" 
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
        >
          導入による業務改善インパクト
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          実際の導入事例に基づく、具体的な改善効果をご紹介します
        </p>
      </div>
      
      {/* インパクト統計グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {impactStats.map((stat, index) => (
          <div
            key={index}
            className="text-center group"
          >
            {/* アイコン */}
            <div className={`inline-flex p-4 rounded-full ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            
            {/* タイトル */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {stat.title}
            </h3>
            
            {/* 数値と変化 */}
            <div className="mb-3">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className={`text-3xl font-bold ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} flex items-center justify-center gap-1`}>
                {stat.changeType === 'increase' ? (
                  <ArrowUp className="w-5 h-5" />
                ) : (
                  <ArrowDown className="w-5 h-5" />
                )}
                {stat.change}
              </div>
            </div>
            
            {/* 説明 */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
      
      {/* 注釈 */}
      <div className="text-center">
        <div className="inline-block bg-gray-50 rounded-lg px-6 py-4 border border-gray-200">
          <p className="text-gray-600 text-sm">
            <span className="font-medium">※ 数値は導入事例により異なります</span>
            <br />
            実際の効果は、事業規模や既存システムの状況により変動する場合があります
          </p>
        </div>
      </div>
      
      {/* 補足情報 */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          詳細な導入事例やカスタマイズについて、お気軽にお問い合わせください
        </p>
      </div>
    </div>
  );
}
