/**
 * フォーム送信完了ページコンポーネント
 * - 送信完了の確認
 * - 見積もり結果の表示
 * - 次のステップの案内
 */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * 完了データの型定義
 */
interface CompleteData {
  submissionId: string;
  customerName: string;
  estimatedPrice: number;
  recommendedTruckType: string;
  totalPoints: number;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
}

export default function FormCompletePage() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');
  const [completeData, setCompleteData] = useState<CompleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (submissionId) {
      // ローカルストレージから送信データを取得
      const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      const submission = submissions.find((s: any) => s.id === submissionId);
      
      if (submission) {
        setCompleteData({
          submissionId: submission.id,
          customerName: submission.customerName,
          estimatedPrice: submission.estimatedPrice,
          recommendedTruckType: submission.recommendedTruckType,
          totalPoints: submission.totalPoints,
          moveDate: submission.moveDate,
          fromAddress: submission.originAddress,
          toAddress: submission.destinationAddress,
        });
      }
    }
    setIsLoading(false);
  }, [submissionId]);

  if (isLoading) {
    return (
      <main className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">データを読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!completeData) {
    return (
      <main className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-600 mb-6">送信データが見つかりませんでした。</p>
          <Link href="/form/step1" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            フォームに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 完了メッセージ */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">送信完了</h1>
          <p className="text-lg text-gray-700 mb-2">
            {completeData.customerName} 様
          </p>
          <p className="text-gray-600">
            引越し見積もりフォームの送信が完了しました。
          </p>
        </div>

        {/* 見積もり結果 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6">📋 見積もり結果</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📅 引越し情報</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">引越し日：</span>
                  <span>{completeData.moveDate}</span>
                </div>
                <div>
                  <span className="font-medium">引越し元：</span>
                  <span>{completeData.fromAddress}</span>
                </div>
                <div>
                  <span className="font-medium">引越し先：</span>
                  <span>{completeData.toAddress}</span>
                </div>
              </div>
            </div>

            {/* 見積もり詳細 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">💰 見積もり詳細</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">推奨トラック：</span>
                  <span className="text-blue-600 font-semibold">{completeData.recommendedTruckType}</span>
                </div>
                <div>
                  <span className="font-medium">総ポイント：</span>
                  <span>{completeData.totalPoints}pt</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  <span className="font-medium">見積もり金額：</span>
                  <span>¥{completeData.estimatedPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 次のステップ */}
        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">📞 次のステップ</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h3 className="font-semibold">事業者からの連絡</h3>
                <p className="text-gray-600">
                  送信いただいた内容を基に、複数の引越し事業者から見積もりが届きます。
                  通常2-3営業日以内にご連絡いたします。
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h3 className="font-semibold">見積もり比較</h3>
                <p className="text-gray-600">
                  複数の見積もりを比較して、最適な事業者をお選びいただけます。
                  価格だけでなく、サービス内容や対応もご確認ください。
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h3 className="font-semibold">契約・引越し実行</h3>
                <p className="text-gray-600">
                  お気に入りの事業者と契約を締結し、引越し作業を実行します。
                  安心・安全な引越しをお約束いたします。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">❓ ご不明な点がございましたら</h2>
          <p className="text-gray-600 mb-4">
            見積もりについてご質問やご相談がございましたら、お気軽にお問い合わせください。
          </p>
          <div className="text-center">
            <a 
              href="mailto:syncworks.official@gmail.com" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              📧 お問い合わせ
            </a>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="text-center space-y-4">
          <Link 
            href="/" 
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            🏠 ホームに戻る
          </Link>
          
          <div className="text-sm text-gray-500">
            送信ID: {completeData.submissionId}
          </div>
        </div>
      </div>
    </main>
  );
} 