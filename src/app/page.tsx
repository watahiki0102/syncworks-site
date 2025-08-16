/**
 * SyncWorksトップページ
 * - モダンでイケてるアニメーション付きデザイン
 * - Framer Motionを使用したスムーズなアニメーション
 * - パーティクル背景とインタラクティブな要素
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Handshake, 
  Calculator, 
  HomeIcon, 
  Settings, 
  ArrowRight, 
  Star, 
  CheckCircle, 
  Users,
  Truck,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import { Layout } from '@/components/layout';
import { AnimatedText, AnimatedCard, ParticleBackground } from '@/components/animations';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Handshake,
      title: "引越しマッチング",
      description: "地域の信頼できる引越し業者から、条件に合った業者を自動でご案内します。",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Calculator,
      title: "安心の料金体系",
      description: "初回提示金額のままご契約いただける安心設計。あとからの価格交渉はありません。※入力内容に誤りがない場合に限る",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },

    {
      icon: Shield,
      title: "信頼性の高いサービス",
      description: "厳選された引越し業者から、条件に合ったサービスをご提供いたします。",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Star,
      title: "実績と信頼",
      description: "多くのお客様にご利用いただき、高い満足度をいただいているサービスです。",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600"
    }
  ];

  const stats = [
    { number: "1000+", label: "成功事例", icon: CheckCircle },
    { number: "50+", label: "提携業者", icon: Truck },
    { number: "99%", label: "顧客満足度", icon: Star },
    { number: "24/7", label: "サポート", icon: Clock }
  ];

  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-white text-gray-900 min-h-screen flex items-center">
        <ParticleBackground />
        
        {/* 横から流れるアニメーション要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              x: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="flex space-x-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 blur-sm"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full opacity-30 blur-sm"></div>
                  <div className="w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 blur-sm"></div>
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-25 blur-sm"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/30"
          style={{ y, opacity }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">引越しの未来を創造中</span>
              </div>
            </motion.div>

                         <AnimatedText
               text="引越しを、シンプルに"
               className="text-gray-900 mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
               delay={0.3}
               type="word"
             />

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-gray-700 mb-12 leading-relaxed text-lg sm:text-xl md:text-2xl lg:text-3xl px-2 sm:px-4 md:px-0 max-w-3xl mx-auto"
            >
              SyncWorksは、引越しのマッチングを通じて、<br className="hidden md:block" />
              スムーズな住まいの移転をサポートします。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center px-2 sm:px-4 md:px-0"
            >
              <motion.button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-2xl w-full sm:w-auto text-sm sm:text-base md:text-lg py-4 sm:py-5 px-8 sm:px-10 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 group"
                onClick={() => window.location.href = '/form/step1'}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                無料見積もりを始める
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 w-full sm:w-auto text-sm sm:text-base md:text-lg py-4 sm:py-5 px-8 sm:px-10 rounded-2xl font-semibold transition-all duration-300"
                onClick={() => document.getElementById('service')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                サービス詳細を見る
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* サービス概要セクション */}
      <section id="service" className="bg-white py-16 lg:py-24 relative overflow-hidden">
        {/* 横から流れるアニメーション要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              x: [0, -80, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="flex space-x-16">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-16">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full opacity-15 blur-sm"></div>
                  <div className="w-40 h-40 bg-gradient-to-br from-gray-50 to-blue-50 rounded-full opacity-20 blur-sm"></div>
                  <div className="w-80 h-80 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full opacity-10 blur-sm"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-blue-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              引越しマッチングサービス「SyncMoving」
            </h2>
            <p className="text-blue-700 max-w-4xl mx-auto mb-12 text-lg sm:text-xl md:text-2xl leading-relaxed">
              SyncMovingは、不動産契約後のお客様と地域の引越し業者をつなぐ、<br className="hidden md:block" />
              相見積もり支援サービスです。<br className="hidden md:block" />
              条件入力は一度だけ、上位3社から自動で見積もりが届き、<br className="hidden md:block" />
              価格交渉不要で安心して選べます。
            </p>
          </motion.div>
        </div>
      </section>

      {/* サービスの特徴セクション */}
      <section className="bg-gray-50 py-16 lg:py-24 relative overflow-hidden">
        {/* 横から流れるアニメーション要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              x: [0, 120, 0],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="flex space-x-20">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-20">
                  <div className="w-72 h-72 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full opacity-20 blur-sm"></div>
                  <div className="w-56 h-56 bg-gradient-to-br from-blue-50 to-green-50 rounded-full opacity-25 blur-sm"></div>
                  <div className="w-96 h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-full opacity-15 blur-sm"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-20"
          >
            <h2 className="mb-6 text-blue-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              選ばれる理由
            </h2>
            <p className="text-blue-700 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl">
              SyncMovigが多くのお客様に選ばれる理由をご紹介します
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <AnimatedCard
                key={feature.title}
                delay={index * 0.1}
                className="group"
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 p-8 border border-gray-200">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="mb-4 text-blue-900 text-xl md:text-2xl font-bold text-center">
                    {feature.title}
                  </h3>
                  <p className="text-blue-700 leading-relaxed text-center">
                    {feature.description}
                  </p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* 事業者向けセクション */}
      <section className="bg-gray-100 py-16 lg:py-24 relative overflow-hidden">
        {/* 横から流れるアニメーション要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              x: [0, -100, 0],
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="flex space-x-24">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-24">
                  <div className="w-80 h-80 bg-gradient-to-br from-gray-200/30 to-gray-300/30 rounded-full opacity-30 blur-sm"></div>
                  <div className="w-64 h-64 bg-gradient-to-br from-gray-200/25 to-gray-300/25 rounded-full opacity-25 blur-sm"></div>
                  <div className="w-96 h-96 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-full opacity-20 blur-sm"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedCard className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-12 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <h2 className="mb-6 text-gray-900 text-3xl sm:text-4xl md:text-5xl font-bold">
                事業者の皆様へ
              </h2>
              <p className="text-gray-700 mb-8 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto">
                引越し事業者として、私たちのサービスに参加し、<br className="hidden md:block" />
                より多くのお客様との出会いを創出しませんか？
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  className="w-full sm:w-auto text-sm sm:text-base md:text-lg py-4 px-8 rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center gap-3 group shadow-lg"
                  onClick={() => window.location.href = '/admin/register'}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  引越し業者登録
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  className="w-full sm:w-auto text-sm sm:text-base md:text-lg py-4 px-8 rounded-2xl font-semibold transition-all duration-300 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 shadow-lg"
                  onClick={() => window.location.href = '/admin/login'}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  事業者ログイン
                </motion.button>
              </div>
              
              {/* 不動産事業者向けCTA */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4 text-base">
                  不動産事業者の方はこちら
                </p>
                <motion.button 
                  className="w-full sm:w-auto text-sm sm:text-base py-3 px-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex items-center justify-center gap-2 mx-auto shadow-lg"
                  onClick={() => window.location.href = '/real-estates/register'}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  不動産事業者登録（無料）
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-16 lg:py-24 relative overflow-hidden">
        {/* 横から流れるアニメーション要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              x: [0, 150, 0],
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="flex space-x-32">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-32">
                  <div className="w-96 h-96 bg-gradient-to-br from-white/10 to-blue-500/10 rounded-full opacity-25 blur-sm"></div>
                  <div className="w-72 h-72 bg-gradient-to-br from-white/8 to-purple-500/8 rounded-full opacity-20 blur-sm"></div>
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full opacity-15 blur-sm"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="absolute inset-0 bg-blue-600/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              今すぐ無料見積もりを始めませんか？
            </h2>
            <p className="text-blue-100 mb-8 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl leading-relaxed">
              簡単3ステップで、あなたに最適な引越し業者が見つかります。<br className="hidden md:block" />
              まずは無料見積もりからお気軽にお試しください。
            </p>
            <motion.button 
              className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto text-lg md:text-xl py-5 px-10 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-2xl"
              onClick={() => window.location.href = '/form/step1'}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              無料見積もりを始める
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
