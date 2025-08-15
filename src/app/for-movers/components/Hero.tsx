/**
 * 引越し事業者向けページのヒーローセクション
 * - 魅力的なタイトルとサブタイトル
 * - 明確なCTAボタン
 * - レスポンシブデザイン
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, Users, Calculator } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-screen-xl mx-auto px-4 py-20 sm:py-24 lg:py-32">
        <div className="text-center">
          {/* アイコン */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Truck className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* メインタイトル */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            地域の引越し業者さまへ
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-blue-100 mt-4">
              — 成果報酬型で高品質リードを獲得
            </span>
          </h1>
          
          {/* サブタイトル */}
          <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
            初期費用ゼロ・価格交渉対応不要・管理画面で配車/割当/請求まで効率化
          </p>
          
          {/* 特徴アイコン */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-blue-100">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span className="text-sm">初期費用ゼロ</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">価格交渉不要</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <span className="text-sm">業務効率化</span>
            </div>
          </div>
          
          {/* CTAボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
          
          {/* 信頼性の証 */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-sm">
              ※ 既に100社以上の引越し業者様にご利用いただいています
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
