/**
 * 不動産登録完了サンクスページ
 * - 登録完了の確認
 * - 次のステップの案内
 * - トップページへの戻り導線
 */
import React from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, Clock, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout';

export default function RealEstateRegisterThanksPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* 成功アイコン */}
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ご登録ありがとうございます
              </h1>
              <p className="text-lg text-gray-600">
                不動産事業者としての登録を受け付けました
              </p>
            </div>

            {/* 申込要旨 */}
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                申込内容
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>登録内容の確認メールをお送りしました</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>審査完了まで通常3-5営業日程度かかります</span>
                </div>
              </div>
            </div>

            {/* 次のステップ */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                次のステップ
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>1. 登録内容の審査（3-5営業日）</p>
                <p>2. 審査結果のメール通知</p>
                <p>3. 承認後、引越し業者とのマッチング開始</p>
                <p>4. お客様からの引越し依頼の受付</p>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                ご注意
              </h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p>• 審査の結果は登録いただいたメールアドレスにご連絡いたします</p>
                <p>• 審査中はお客様とのマッチングは開始されません</p>
                <p>• ご不明な点がございましたら、お気軽にお問い合わせください</p>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                トップページに戻る
              </Link>
              
              <div className="text-sm text-gray-600">
                <p>
                  お問い合わせは{' '}
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    こちら
                  </Link>
                  から
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
