/**
 * 最下部のCTAセクション
 * - メインのCTAボタン
 * - 補助リンク
 * - 魅力的なデザイン
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

export function CTA() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 text-center">
      {/* メインCTA */}
      <div className="mb-8">
        <h2 
          id="cta-heading" 
          className="text-3xl sm:text-4xl font-bold text-white mb-4"
        >
          まずは無料で始めませんか？
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          初期費用ゼロで、成果報酬型の新しいビジネスモデルを体験してください
        </p>
        
        {/* メインCTAボタン */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="/admin/vendors/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            aria-label="事業者登録ページへ移動"
          >
            無料で始める
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 text-white border-2 border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            機能一覧を見る
          </Link>
        </div>
      </div>
      
      {/* 信頼性の証 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center text-white">
          <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
          <span className="text-sm font-medium">初期費用ゼロ</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <Star className="w-8 h-8 text-yellow-400 mb-2" />
          <span className="text-sm font-medium">100社以上が利用中</span>
        </div>
        <div className="flex flex-col items-center text-white">
          <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
          <span className="text-sm font-medium">成果報酬のみ</span>
        </div>
      </div>
      
      {/* 補足情報 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-white mb-2">
          ご利用開始までの流れ
        </h3>
        <p className="text-blue-100 text-sm mb-4">
          お申し込みから最短2週間でご利用開始いただけます。専門スタッフが丁寧にサポートいたします。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-md hover:bg-white/30 transition-colors border border-white/30"
          >
            詳細を聞く
          </Link>
          <Link
            href="tel:0120-000-000"
            className="inline-flex items-center px-4 py-2 bg-white/20 text-white text-sm font-medium rounded-md hover:bg-white/30 transition-colors border border-white/30"
          >
            お電話での相談
          </Link>
        </div>
      </div>
      
      {/* 注意事項 */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <p className="text-blue-200 text-xs">
          ※ 成果報酬は案件成立時に発生します。詳細は契約書にてご確認ください。
        </p>
      </div>
    </div>
  );
}
