/**
 * SyncWorksトップページ
 * - PC・モバイル両対応のレスポンシブデザイン
 * - 標準HTML要素とTailwind CSSを使用
 * - 適切なサイズ調整
 */
'use client';

import React from 'react';
import { Handshake, Calculator, HomeIcon, Settings, ArrowRight, Star, CheckCircle, Users } from 'lucide-react';
import { Layout } from '@/components/layout';

export default function Home() {
  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#2d3f50] to-[#3498db] dark:from-slate-900 dark:to-blue-900 text-white min-h-[70vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-white mb-6 animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              引越しを、もっと<br className="sm:hidden" />シンプルに
            </h1>
            <p className="text-blue-100 mb-8 leading-relaxed animate-fade-in-up text-base sm:text-lg md:text-xl lg:text-2xl px-2 sm:px-4 md:px-0 max-w-3xl mx-auto" style={{ animationDelay: '0.2s' }}>
              SyncWorksは、引越しのマッチングを通じて、<br className="hidden md:block" />
              スムーズな住まいの移転をサポートします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up px-2 sm:px-4 md:px-0" style={{ animationDelay: '0.4s' }}>
              <button 
                className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg w-full sm:w-auto text-sm sm:text-base md:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                onClick={() => window.location.href = '/form/step1'}
              >
                無料見積もりを始める
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                className="border-2 border-white text-white hover:bg-white/10 hover:border-white/80 backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base md:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium transition-colors duration-200"
                onClick={() => document.getElementById('service')?.scrollIntoView({ behavior: 'smooth' })}
              >
                サービス詳細を見る
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* サービス概要セクション */}
      <section id="service" className="bg-white dark:bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            引越しマッチングサービス「SyncMoving」
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
            SyncMovingは、不動産契約後のお客様と地域の引越し業者をつなぐ、相見積もり支援サービスです。<br className="hidden md:block" />
            条件入力は一度だけ、上位3社から自動で見積もりが届き、価格交渉不要で安心して選べます。
          </p>
        </div>
      </section>

      {/* サービスの特徴セクション */}
      <section className="bg-gray-50 dark:bg-slate-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="mb-6 text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              選ばれる理由
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl">
              SyncWorksが多くのお客様に選ばれる理由をご紹介します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* 特徴1 */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Handshake className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                </div>
                <h3 className="mb-3 md:mb-4 text-blue-600 text-lg sm:text-xl md:text-2xl font-semibold">
                  引越しマッチング
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
                  地域の信頼できる引越し業者から、条件に合った業者を自動でご案内します。
                  厳選された優良業者のみと提携しています。
                </p>
              </div>
            </div>

            {/* 特徴2 */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Calculator className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
                </div>
                <h3 className="mb-3 md:mb-4 text-green-600 text-lg sm:text-xl md:text-2xl font-semibold">
                  安心の料金体系
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
                  初回提示金額のままご契約いただける安心設計。
                  あとからの価格交渉はありません。透明性のある料金体系です。
                </p>
              </div>
            </div>

            {/* 特徴3 */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <HomeIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
                </div>
                <h3 className="mb-3 md:mb-4 text-purple-600 text-lg sm:text-xl md:text-2xl font-semibold">
                  不動産連携
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
                  地域の不動産会社を通じて紹介されることで、
                  質の高い見込み顧客とのマッチングが実現します。
                </p>
              </div>
            </div>

            {/* 特徴4 */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                </div>
                <h3 className="mb-3 md:mb-4 text-blue-600 text-lg sm:text-xl md:text-2xl font-semibold">
                  信頼性の高いサービス
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
                  紹介されるのは、条件提示に納得し成約意志の高い顧客のみ。
                  効率よく成約につながります。
                </p>
              </div>
            </div>

            {/* 特徴5 */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-600" />
                </div>
                <h3 className="mb-3 md:mb-4 text-yellow-600 text-lg sm:text-xl md:text-2xl font-semibold">
                  実績と信頼
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
                  多くの不動産会社様との連携実績があり、
                  安心してご利用いただけるサービスです。
                </p>
              </div>
            </div>

            {/* 特徴6 */}
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <div className="text-center p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-600" />
                </div>
                <h3 className="mb-3 md:mb-4 text-indigo-600 text-lg sm:text-xl md:text-2xl font-semibold">
                  専門サポート
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
                  専門スタッフによる丁寧なサポートで、
                  スムーズな引越しをお手伝いします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 事業者向けセクション */}
      <section className="bg-white dark:bg-slate-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-8 lg:p-12">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Settings className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="mb-6 text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl font-bold">
                事業者の皆様へ
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                引越し事業者として、私たちのサービスに参加し、<br className="hidden md:block" />
                より多くのお客様との出会いを創出しませんか？
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="w-full sm:w-auto text-sm sm:text-base md:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                  onClick={() => window.location.href = '/admin/register'}
                >
                  事業者登録
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  className="w-full sm:w-auto text-sm sm:text-base md:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium transition-colors duration-200 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => window.location.href = '/admin/login'}
                >
                  既存事業者ログイン
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* お知らせセクション */}
      <section className="bg-gray-50 dark:bg-slate-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-6 text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl font-bold">
              お知らせ
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">
                    2025年5月15日
                  </p>
                  <h3 className="mb-3 text-gray-900 dark:text-white text-lg sm:text-xl md:text-2xl font-semibold">
                    SyncWorks公式サイトを公開しました
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                    引越しマッチングサービス「SyncMoving」の公式サイトをオープンしました。
                    お客様により良いサービスを提供してまいります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="bg-gradient-to-r from-[#2d3f50] to-[#3498db] dark:from-slate-900 dark:to-blue-900 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-white mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
            今すぐ無料見積もりを始めませんか？
          </h2>
          <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
            簡単3ステップで、あなたに最適な引越し業者が見つかります。<br className="hidden md:block" />
            まずは無料見積もりからお気軽にお試しください。
          </p>
          <button 
            className="bg-white text-blue-600 hover:bg-gray-50 w-full sm:w-auto text-sm sm:text-base md:text-lg py-3 sm:py-4 px-6 sm:px-8 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
            onClick={() => window.location.href = '/form/step1'}
          >
            無料見積もりを始める
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>
    </Layout>
  );
}
