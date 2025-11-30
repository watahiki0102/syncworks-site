/**
 * 再見積もりページコンポーネント
 * - 既存の見積もりデータを基に新しい見積もりを作成
 * - 料金調整と条件変更の機能
 * - 新しい見積もりの送信
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

/**
 * 再見積もりデータの型定義
 */
interface ReQuoteData {
  originalQuoteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  items: string[];
  additionalServices: string[];
  remarks: string;
  originalAmount: number;
  newAmount: number;
  reason: string;
  validUntil: string;
}

export default function ReQuotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [reQuoteData, setReQuoteData] = useState<ReQuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      // 既存の見積もりデータを取得（デモデータ）
      const originalQuote = {
        id: params.id,
        customerName: '田中太郎',
        customerEmail: 'tanaka@example.com',
        customerPhone: '090-1234-5678',
        moveDate: '2025-02-01',
        fromAddress: '東京都渋谷区',
        toAddress: '東京都新宿区',
        items: ['シングルベッド', '冷蔵庫', 'テレビ'],
        additionalServices: ['建物養生', '荷造り代行'],
        remarks: '搬入経路が狭いため注意が必要です。',
        amount: 45000
      };

      // 再見積もりデータを初期化
      const newReQuoteData: ReQuoteData = {
        originalQuoteId: originalQuote.id,
        customerName: originalQuote.customerName,
        customerEmail: originalQuote.customerEmail,
        customerPhone: originalQuote.customerPhone,
        moveDate: originalQuote.moveDate,
        fromAddress: originalQuote.fromAddress,
        toAddress: originalQuote.toAddress,
        items: originalQuote.items,
        additionalServices: originalQuote.additionalServices,
        remarks: originalQuote.remarks,
        originalAmount: originalQuote.amount,
        newAmount: originalQuote.amount,
        reason: '',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7日後
      };

      setReQuoteData(newReQuoteData);
    }
    setIsLoading(false);
  }, [params.id]);

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reQuoteData) {return;}

    setIsSubmitting(true);

    try {
      // 再見積もりデータを保存（実際の実装ではAPIに送信）
      const requoteId = `requote-${Date.now()}`;
      const newReQuote = {
        id: requoteId,
        originalQuoteId: reQuoteData.originalQuoteId,
        customerName: reQuoteData.customerName,
        customerEmail: reQuoteData.customerEmail,
        customerPhone: reQuoteData.customerPhone,
        moveDate: reQuoteData.moveDate,
        fromAddress: reQuoteData.fromAddress,
        toAddress: reQuoteData.toAddress,
        items: reQuoteData.items,
        additionalServices: reQuoteData.additionalServices,
        remarks: reQuoteData.remarks,
        originalAmount: reQuoteData.originalAmount,
        newAmount: reQuoteData.newAmount,
        reason: reQuoteData.reason,
        validUntil: reQuoteData.validUntil,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // ローカルストレージに保存（デモ用）
      const existingReQuotes = JSON.parse(localStorage.getItem('reQuotes') || '[]');
      const updatedReQuotes = [...existingReQuotes, newReQuote];
      localStorage.setItem('reQuotes', JSON.stringify(updatedReQuotes));

      // 成功メッセージを表示
      alert('再見積もりが正常に作成されました。');
      
      // 見積もり詳細画面に戻る
      router.push(`/admin/quotes/${params.id}`);

    } catch (error) {
      console.error('再見積もり作成エラー:', error);
      alert('再見積もりの作成に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 入力フィールドの変更処理
   */
  const handleInputChange = (field: keyof ReQuoteData, value: any) => {
    if (reQuoteData) {
      setReQuoteData({
        ...reQuoteData,
        [field]: value
      });
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

  if (!reQuoteData) {
    return (
      <AdminAuthGuard>
        <main className="bg-gray-50 min-h-screen py-10 px-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">データが見つかりません</h1>
            <p className="text-gray-600 mb-6">元の見積もりデータが見つかりませんでした。</p>
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
        <div className="w-full max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">再見積もり作成</h1>
              <p className="text-gray-600">元の見積もりID: {reQuoteData.originalQuoteId}</p>
            </div>
            <button 
              onClick={() => router.back()} 
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              戻る
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 顧客情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👤 顧客情報</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">顧客名</label>
                  <input
                    type="text"
                    value={reQuoteData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={reQuoteData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={reQuoteData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">引越し日</label>
                  <input
                    type="date"
                    value={reQuoteData.moveDate}
                    onChange={(e) => handleInputChange('moveDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 引越し情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏠 引越し情報</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">引越し元</label>
                  <input
                    type="text"
                    value={reQuoteData.fromAddress}
                    onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">引越し先</label>
                  <input
                    type="text"
                    value={reQuoteData.toAddress}
                    onChange={(e) => handleInputChange('toAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 料金情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💰 料金情報</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">元の見積もり金額</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                    ¥{reQuoteData.originalAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">新しい見積もり金額</label>
                  <input
                    type="number"
                    value={reQuoteData.newAmount}
                    onChange={(e) => handleInputChange('newAmount', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
                  <input
                    type="date"
                    value={reQuoteData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 再見積もり理由 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📝 再見積もり理由</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">理由（必須）</label>
                <textarea
                  value={reQuoteData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="再見積もりを行う理由を記入してください（例：料金調整、条件変更など）"
                  required
                />
              </div>
            </div>

            {/* 荷物・サービス情報（読み取り専用） */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📦 荷物・サービス情報</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">荷物リスト</h3>
                  <ul className="space-y-1">
                    {reQuoteData.items.map((item, index) => (
                      <li key={index} className="text-gray-600">• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">追加サービス</h3>
                  <ul className="space-y-1">
                    {reQuoteData.additionalServices.map((service, index) => (
                      <li key={index} className="text-gray-600">• {service}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {reQuoteData.remarks && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">備考</h3>
                  <p className="text-gray-600">{reQuoteData.remarks}</p>
                </div>
              )}
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : '再見積もりを作成'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AdminAuthGuard>
  );
} 