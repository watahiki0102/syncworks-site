/**
 * 見積もり詳細ページコンポーネント
 * - 見積もりの詳細情報表示
 * - 顧客情報、引越し情報、見積もり内容の表示
 * - アクションボタン（編集、削除、再見積もり）
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

/**
 * 見積もり詳細データの型定義
 */
interface QuoteDetail {
  id: string;
  customerName: string;
  requestDate: string;
  responseDate: string;
  amount: number;
  status: 'contracted' | 'pending' | 'expired';
  items: string[];
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  customerEmail?: string;
  customerPhone?: string;
  estimatedPrice?: number;
  recommendedTruckType?: string;
  totalPoints?: number;
  additionalServices?: string[];
  remarks?: string;
}

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [quoteDetail, setQuoteDetail] = useState<QuoteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      // デモデータから見積もり詳細を取得
      const demoQuotes: QuoteDetail[] = [
        {
          id: '1',
          customerName: '田中太郎',
          requestDate: '2025-01-15',
          responseDate: '2025-01-16',
          amount: 45000,
          status: 'contracted',
          items: ['シングルベッド', '冷蔵庫', 'テレビ'],
          fromAddress: '東京都渋谷区',
          toAddress: '東京都新宿区',
          moveDate: '2025-02-01',
          customerEmail: 'tanaka@example.com',
          customerPhone: '090-1234-5678',
          estimatedPrice: 45000,
          recommendedTruckType: '2tショート',
          totalPoints: 25,
          additionalServices: ['建物養生', '荷造り代行'],
          remarks: '搬入経路が狭いため注意が必要です。'
        },
        {
          id: '2',
          customerName: '佐藤花子',
          requestDate: '2025-01-14',
          responseDate: '2025-01-15',
          amount: 38000,
          status: 'pending',
          items: ['ダブルベッド', '洗濯機', 'ソファ'],
          fromAddress: '東京都世田谷区',
          toAddress: '神奈川県横浜市',
          moveDate: '2025-01-30',
          customerEmail: 'sato@example.com',
          customerPhone: '080-9876-5432',
          estimatedPrice: 38000,
          recommendedTruckType: '2tロング',
          totalPoints: 35,
          additionalServices: ['家具分解・組み立て'],
          remarks: 'エレベーターが利用できないため、階段での搬入になります。'
        },
        {
          id: '3',
          customerName: '鈴木一郎',
          requestDate: '2025-01-10',
          responseDate: '2025-01-12',
          amount: 52000,
          status: 'expired',
          items: ['キングベッド', 'ピアノ', '大型冷蔵庫'],
          fromAddress: '東京都港区',
          toAddress: '東京都品川区',
          moveDate: '2025-01-25',
          customerEmail: 'suzuki@example.com',
          customerPhone: '070-5555-6666',
          estimatedPrice: 52000,
          recommendedTruckType: '4t',
          totalPoints: 65,
          additionalServices: ['ピアノ運搬', '建物養生'],
          remarks: 'ピアノの運搬には特別な注意が必要です。'
        }
      ];

      const quote = demoQuotes.find(q => q.id === params.id);
      setQuoteDetail(quote || null);
    }
    setIsLoading(false);
  }, [params.id]);

  /**
   * ステータスに応じたバッジコンポーネントを生成
   * @param status - ステータス
   * @returns ステータスバッジのJSX
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'contracted':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">成約済</span>;
      case 'pending':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">検討中</span>;
      case 'expired':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">期限切れ</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">不明</span>;
    }
  };

  /**
   * 再見積もりの実行
   */
  const handleReQuote = () => {
    if (confirm('この見積もりを再見積もりしますか？')) {
      // 再見積もり処理（実装予定）
      alert('再見積もり機能は実装予定です');
    }
  };

  /**
   * 見積もりの削除
   */
  const handleDelete = () => {
    if (confirm('この見積もりを削除しますか？この操作は取り消せません。')) {
      // 削除処理（実装予定）
      alert('削除機能は実装予定です');
    }
  };

  if (isLoading) {
    return (
      <AdminAuthGuard>
        <main className="bg-gray-50 min-h-screen py-10 px-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">データを読み込み中...</p>
          </div>
        </main>
      </AdminAuthGuard>
    );
  }

  if (!quoteDetail) {
    return (
      <AdminAuthGuard>
        <main className="bg-gray-50 min-h-screen py-10 px-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">見積もりが見つかりません</h1>
            <p className="text-gray-600 mb-6">指定された見積もりIDのデータが見つかりませんでした。</p>
            <button 
              onClick={() => router.back()} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              戻る
            </button>
          </div>
        </main>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <main className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">見積もり詳細</h1>
              <p className="text-gray-600">ID: {quoteDetail.id}</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => router.back()} 
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                戻る
              </button>
              <button 
                onClick={handleReQuote}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                再見積もり
              </button>
              <button 
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* メイン情報 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本情報 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📋 基本情報</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">顧客名：</span>
                    <span className="text-gray-900">{quoteDetail.customerName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ステータス：</span>
                    {getStatusBadge(quoteDetail.status)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">見積もり金額：</span>
                    <span className="text-green-600 font-bold">¥{quoteDetail.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">引越し日：</span>
                    <span className="text-gray-900">{quoteDetail.moveDate}</span>
                  </div>
                </div>
              </div>

              {/* 引越し情報 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 引越し情報</h2>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">引越し元：</span>
                    <span className="text-gray-900">{quoteDetail.fromAddress}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">引越し先：</span>
                    <span className="text-gray-900">{quoteDetail.toAddress}</span>
                  </div>
                  {quoteDetail.recommendedTruckType && (
                    <div>
                      <span className="font-medium text-gray-700">推奨トラック：</span>
                      <span className="text-blue-600 font-semibold">{quoteDetail.recommendedTruckType}</span>
                    </div>
                  )}
                  {quoteDetail.totalPoints && (
                    <div>
                      <span className="font-medium text-gray-700">総ポイント：</span>
                      <span className="text-gray-900">{quoteDetail.totalPoints}pt</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 荷物リスト */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📦 荷物リスト</h2>
                <div className="grid md:grid-cols-2 gap-2">
                  {quoteDetail.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-900">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 追加サービス */}
              {quoteDetail.additionalServices && quoteDetail.additionalServices.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 追加サービス</h2>
                  <div className="grid md:grid-cols-2 gap-2">
                    {quoteDetail.additionalServices.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-blue-500">•</span>
                        <span className="text-gray-900">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 備考 */}
              {quoteDetail.remarks && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📝 備考</h2>
                  <p className="text-gray-900 whitespace-pre-wrap">{quoteDetail.remarks}</p>
                </div>
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 顧客連絡先 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📞 顧客連絡先</h3>
                <div className="space-y-3">
                  {quoteDetail.customerEmail && (
                    <div>
                      <span className="font-medium text-gray-700">メール：</span>
                      <a href={`mailto:${quoteDetail.customerEmail}`} className="text-blue-600 hover:underline">
                        {quoteDetail.customerEmail}
                      </a>
                    </div>
                  )}
                  {quoteDetail.customerPhone && (
                    <div>
                      <span className="font-medium text-gray-700">電話：</span>
                      <a href={`tel:${quoteDetail.customerPhone}`} className="text-blue-600 hover:underline">
                        {quoteDetail.customerPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 日時情報 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📅 日時情報</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">依頼日：</span>
                    <span className="text-gray-900">{quoteDetail.requestDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">回答日：</span>
                    <span className="text-gray-900">{quoteDetail.responseDate}</span>
                  </div>
                </div>
              </div>

              {/* 見積もり情報 */}
              {quoteDetail.estimatedPrice && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">💰 見積もり情報</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">見積もり金額：</span>
                      <span className="text-green-600 font-bold">¥{quoteDetail.estimatedPrice.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">契約金額：</span>
                      <span className="text-blue-600 font-bold">¥{quoteDetail.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </AdminAuthGuard>
  );
} 