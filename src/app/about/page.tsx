import React from 'react';
import { Layout } from '@/components/layout';
import { Heading, Text } from '@/components/ui';

export default function AboutPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="text-center mb-12">
            <Heading level={1} size="3xl" color="default" className="mb-4">
              会社概要
            </Heading>
            <Text variant="body" color="muted" className="text-lg">
              SyncWorksについて
            </Text>
          </div>

          {/* 会社情報 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              基本情報
            </Heading>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Text variant="small" color="muted" className="font-medium mb-1">
                    会社名
                  </Text>
                  <Text variant="body" color="default">
                    SyncWorks株式会社
                  </Text>
                </div>
                
                <div>
                  <Text variant="small" color="muted" className="font-medium mb-1">
                    設立
                  </Text>
                  <Text variant="body" color="default">
                    2024年4月
                  </Text>
                </div>
                
                <div>
                  <Text variant="small" color="muted" className="font-medium mb-1">
                    資本金
                  </Text>
                  <Text variant="body" color="default">
                    1,000万円
                  </Text>
                </div>
                
                <div>
                  <Text variant="small" color="muted" className="font-medium mb-1">
                    代表者
                  </Text>
                  <Text variant="body" color="default">
                    代表取締役 山田太郎
                  </Text>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Text variant="small" color="muted" className="font-medium mb-1">
                    事業内容
                  </Text>
                  <Text variant="body" color="default">
                    引越しマッチングサービス<br />
                    物流・配送サービス<br />
                    不動産関連サービス
                  </Text>
                </div>
                
                <div>
                  <Text variant="small" color="muted" className="font-medium mb-1">
                    従業員数
                  </Text>
                  <Text variant="body" color="default">
                    15名（2024年12月現在）
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* 連絡先情報 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              連絡先
            </Heading>
            
            <div className="space-y-4">
              <div>
                <Text variant="small" color="muted" className="font-medium mb-1">
                  住所
                </Text>
                <Text variant="body" color="default">
                  〒150-0002<br />
                  東京都渋谷区渋谷1-2-3 渋谷ビル5階
                </Text>
              </div>
              
              <div>
                <Text variant="small" color="muted" className="font-medium mb-1">
                  電話番号
                </Text>
                <Text variant="body" color="default">
                  03-1234-5678
                </Text>
              </div>
              
              <div>
                <Text variant="small" color="muted" className="font-medium mb-1">
                  メールアドレス
                </Text>
                <Text variant="body" color="default">
                  syncworks.official@gmail.com
                </Text>
              </div>
              
              <div>
                <Text variant="small" color="muted" className="font-medium mb-1">
                  営業時間
                </Text>
                <Text variant="body" color="default">
                  平日 9:00〜18:00（土日祝日除く）
                </Text>
              </div>
            </div>
          </div>

          {/* 企業理念 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              企業理念
            </Heading>
            
            <div className="space-y-6">
              <div>
                <Heading level={3} size="lg" color="default" className="mb-3">
                  ミッション
                </Heading>
                <Text variant="body" color="default">
                  引越しのマッチングを通じて、スムーズな住まいの移転をサポートし、お客様の新しい生活のスタートを応援します。
                </Text>
              </div>
              
              <div>
                <Heading level={3} size="lg" color="default" className="mb-3">
                  ビジョン
                </Heading>
                <Text variant="body" color="default">
                  引越し業界のデジタル化を推進し、お客様と事業者をつなぐ信頼できるプラットフォームを目指します。
                </Text>
              </div>
              
              <div>
                <Heading level={3} size="lg" color="default" className="mb-3">
                  バリュー
                </Heading>
                <Text variant="body" color="default">
                  透明性、信頼性、利便性を重視し、お客様と事業者の両方にとって価値のあるサービスを提供します。
                </Text>
              </div>
            </div>
          </div>

          {/* 沿革 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Heading level={2} size="xl" color="default" className="mb-6">
              沿革
            </Heading>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  2024年4月
                </div>
                <Text variant="body" color="default">
                  SyncWorks株式会社設立
                </Text>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  2024年6月
                </div>
                <Text variant="body" color="default">
                  引越しマッチングサービス「SyncWorks」リリース
                </Text>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  2024年9月
                </div>
                <Text variant="body" color="default">
                  事業者向け管理システム提供開始
                </Text>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                  2024年12月
                </div>
                <Text variant="body" color="default">
                  サービスエリア拡大（関東圏全域対応）
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
