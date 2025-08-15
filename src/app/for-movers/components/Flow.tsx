/**
 * 導入フローを4ステップで説明
 * - 視覚的に分かりやすいステップ表示
 * - 各ステップの詳細説明
 * - レスポンシブデザイン
 */
'use client';

import React from 'react';
import { 
  FileText, 
  Settings, 
  Play, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface FlowStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const flowSteps: FlowStep[] = [
  {
    icon: FileText,
    title: 'STEP1 ご契約',
    description: '初期費用ゼロの成果報酬型契約。必要書類の提出と簡単な審査で開始できます。',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Settings,
    title: 'STEP2 初期設定',
    description: 'アカウント作成から基本情報の登録まで、専門スタッフがサポートいたします。',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: Play,
    title: 'STEP3 テスト運用',
    description: '実際の業務フローに合わせたテスト運用で、システムの使い方を習得できます。',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    icon: CheckCircle,
    title: 'STEP4 利用開始',
    description: '本格運用開始。継続的なサポートとアップデートで、安心してご利用いただけます。',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

export function Flow() {
  return (
    <div className="max-w-screen-xl mx-auto px-4">
      {/* セクションヘッダー */}
      <div className="text-center mb-16">
        <h2 
          id="flow-heading" 
          className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
        >
          導入フロー
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          契約から利用開始まで、4つのステップでスムーズに導入できます
        </p>
      </div>
      
      {/* フローステップ */}
      <div className="relative">
        {/* 接続線（デスクトップのみ） */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 z-0"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {flowSteps.map((step, index) => (
            <div
              key={index}
              className="relative text-center group"
            >
              {/* ステップ番号 */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white border-4 border-gray-200 rounded-full text-lg font-bold text-gray-600 mb-4 relative z-10 group-hover:border-blue-500 transition-colors">
                {index + 1}
              </div>
              
              {/* アイコン */}
              <div className={`inline-flex p-4 rounded-full ${step.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className={`w-8 h-8 ${step.color}`} />
              </div>
              
              {/* タイトル */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>
              
              {/* 説明 */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
              
              {/* 矢印（モバイル・タブレットのみ） */}
              {index < flowSteps.length - 1 && (
                <div className="md:hidden flex justify-center mt-6">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 補足情報 */}
      <div className="text-center mt-16 pt-8 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            最短2週間で導入可能
          </h3>
          <p className="text-blue-800 text-sm">
            標準的な導入では2週間程度で完了します。カスタマイズが必要な場合は、追加で対応いたします。
          </p>
        </div>
      </div>
      
      {/* サポート情報 */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          各ステップで専門スタッフがサポートいたします。お気軽にご相談ください。
        </p>
      </div>
    </div>
  );
}
