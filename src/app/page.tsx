/**
 * SyncWorksトップページ
 * - 改善されたレイアウトとデザイン
 * - 新しいUIコンポーネントを使用
 * - レスポンシブデザイン最適化
 */
'use client';

import React from 'react';
import { Handshake, Calculator, HomeIcon, Settings, ArrowRight, Star, CheckCircle, Users } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button, Card, CardBody, Heading, Text } from '@/components/ui';

export default function Home() {
  return (
    <Layout>
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Heading level={1} size="5xl" className="text-white mb-6 animate-fade-in-up">
              引越しを、もっとシンプルに
            </Heading>
            <Text 
              variant="lead" 
              size="xl" 
              className="text-blue-100 mb-8 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              SyncWorksは、引越しのマッチングを通じて、<br />
              スムーズな住まいの移転をサポートします。
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-50 shadow-lg"
                onClick={() => window.location.href = '/form/step1'}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                無料見積もりを始める
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => document.getElementById('service')?.scrollIntoView({ behavior: 'smooth' })}
              >
                サービス詳細を見る
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* サービス概要セクション */}
      <section id="service" className="section bg-white">
        <div className="container mx-auto text-center">
          <Heading level={2} size="3xl" className="mb-6">
            引越しマッチングサービス「SyncMoving」
          </Heading>
          <Text variant="lead" className="text-gray-600 max-w-3xl mx-auto mb-12">
            SyncMovingは、不動産契約後のお客様と地域の引越し業者をつなぐ、相見積もり支援サービスです。
            条件入力は一度だけ、上位3社から自動で見積もりが届き、価格交渉不要で安心して選べます。
          </Text>
        </div>
      </section>

      {/* サービスの特徴セクション */}
      <section className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Heading level={2} size="3xl" className="mb-6">
              選ばれる理由
            </Heading>
            <Text variant="lead" className="text-gray-600 max-w-2xl mx-auto">
              SyncWorksが多くのお客様に選ばれる理由をご紹介します
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 特徴1 */}
            <Card hoverable className="transition-all duration-300">
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Handshake className="w-8 h-8 text-blue-600" />
                </div>
                <Heading level={3} size="lg" className="mb-4 text-blue-600">
                  引越しマッチング
                </Heading>
                <Text variant="body" className="text-gray-600 leading-relaxed">
                  地域の信頼できる引越し業者から、条件に合った業者を自動でご案内します。
                  厳選された優良業者のみと提携しています。
                </Text>
              </CardBody>
            </Card>

            {/* 特徴2 */}
            <Card hoverable className="transition-all duration-300">
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <Heading level={3} size="lg" className="mb-4 text-green-600">
                  安心の料金体系
                </Heading>
                <Text variant="body" className="text-gray-600 leading-relaxed">
                  初回提示金額のままご契約いただける安心設計。
                  あとからの価格交渉はありません。透明性のある料金体系です。
                </Text>
              </CardBody>
            </Card>

            {/* 特徴3 */}
            <Card hoverable className="transition-all duration-300">
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <HomeIcon className="w-8 h-8 text-purple-600" />
                </div>
                <Heading level={3} size="lg" className="mb-4 text-purple-600">
                  不動産連携
                </Heading>
                <Text variant="body" className="text-gray-600 leading-relaxed">
                  地域の不動産会社を通じて紹介されることで、
                  質の高い見込み顧客とのマッチングが実現します。
                </Text>
              </CardBody>
            </Card>

            {/* 特徴4 */}
            <Card hoverable className="transition-all duration-300">
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <Heading level={3} size="lg" className="mb-4 text-blue-600">
                  信頼性の高いサービス
                </Heading>
                <Text variant="body" className="text-gray-600 leading-relaxed">
                  紹介されるのは、条件提示に納得し成約意志の高い顧客のみ。
                  効率よく成約につながります。
                </Text>
              </CardBody>
            </Card>

            {/* 特徴5 */}
            <Card hoverable className="transition-all duration-300">
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
                <Heading level={3} size="lg" className="mb-4 text-yellow-600">
                  迅速な対応
                </Heading>
                <Text variant="body" className="text-gray-600 leading-relaxed">
                  引越し条件の入力後、自動で複数業者に見積もり依頼が届き、
                  手間なく比較が完了します。
                </Text>
              </CardBody>
            </Card>

            {/* 特徴6 */}
            <Card hoverable className="transition-all duration-300">
              <CardBody className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
                <Heading level={3} size="lg" className="mb-4 text-indigo-600">
                  専門サポート
                </Heading>
                <Text variant="body" className="text-gray-600 leading-relaxed">
                  専門スタッフがお客様の引越しをトータルサポート。
                  安心してお任せいただけます。
                </Text>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* 事業者向けセクション */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Card variant="elevated" className="p-8">
              <CardBody>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <Heading level={2} size="2xl" className="mb-4">
                  事業者の皆様へ
                </Heading>
                <Text variant="lead" className="text-gray-600 mb-8">
                  引越し事業者として、私たちのサービスに参加し、
                  より多くのお客様との出会いを創出しませんか？
                </Text>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => window.location.href = '/admin/register'}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    事業者登録
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = '/admin/login'}
                  >
                    既存事業者ログイン
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* お知らせセクション */}
      <section className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Heading level={2} size="3xl" className="mb-6">
              お知らせ
            </Heading>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <Text variant="small" className="text-gray-500 mb-1">
                      2025年5月15日
                    </Text>
                    <Heading level={3} size="lg" className="mb-2">
                      SyncWorks公式サイトを公開しました
                    </Heading>
                    <Text variant="body" className="text-gray-600">
                      引越しマッチングサービス「SyncMoving」の公式サイトをオープンしました。
                      お客様により良いサービスを提供してまいります。
                    </Text>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="section bg-gradient-to-r from-[#2d3f50] to-[#3498db] text-white">
        <div className="container mx-auto text-center">
          <Heading level={2} size="3xl" className="text-white mb-6">
            今すぐ無料見積もりを始めませんか？
          </Heading>
          <Text variant="lead" className="text-blue-100 mb-8 max-w-2xl mx-auto">
            簡単3ステップで、あなたに最適な引越し業者が見つかります。
            まずは無料見積もりからお気軽にお試しください。
          </Text>
          <Button 
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-50"
            onClick={() => window.location.href = '/form/step1'}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            無料見積もりを始める
          </Button>
        </div>
      </section>
    </Layout>
  );
}
