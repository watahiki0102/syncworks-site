/**
 * 管理者見積もり回答履歴ページコンポーネント
 * - お客様への見積もり回答履歴の管理
 * - 検索・フィルタリング・ソート機能
 * - 成約状況の追跡
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { TEST_CUSTOMERS, TEST_ADDRESSES, TEST_ITEMS } from '@/constants/testData';

/**
 * 見積もり履歴の型定義
 */
interface QuoteHistory {
  id: string;              // 見積もりID
  customerName: string;    // 顧客名
  requestDate: string;     // 依頼日
  responseDate: string;    // 回答日
  amount: number;          // 見積もり金額
  status: 'pending' | 'contracted' | 'expired'; // ステータス
  items: string[];         // 荷物リスト
  fromAddress: string;     // 引越し元住所
  toAddress: string;       // 引越し先住所
  moveDate: string;        // 引越し予定日
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<QuoteHistory[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('requestDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  /**
   * デモデータの初期化
   * 実際のアプリケーションではAPIから取得
   */
  useEffect(() => {
    // 共通テストデータから見積もりデータを生成
    const demoQuotes: QuoteHistory[] = [
      {
        id: '1',
        customerName: TEST_CUSTOMERS[0].name,
        requestDate: '2025-01-15',
        responseDate: '2025-01-16',
        amount: 45000,
        status: 'contracted',
        items: TEST_ITEMS[0],
        fromAddress: TEST_ADDRESSES[0].from,
        toAddress: TEST_ADDRESSES[0].to,
        moveDate: '2025-02-01'
      },
      {
        id: '2',
        customerName: TEST_CUSTOMERS[1].name,
        requestDate: '2025-01-14',
        responseDate: '2025-01-15',
        amount: 38000,
        status: 'pending',
        items: TEST_ITEMS[1],
        fromAddress: TEST_ADDRESSES[1].from,
        toAddress: TEST_ADDRESSES[1].to,
        moveDate: '2025-01-30'
      },
      {
        id: '3',
        customerName: TEST_CUSTOMERS[2].name,
        requestDate: '2025-01-10',
        responseDate: '2025-01-12',
        amount: 52000,
        status: 'expired',
        items: TEST_ITEMS[2],
        fromAddress: TEST_ADDRESSES[2].from,
        toAddress: TEST_ADDRESSES[2].to,
        moveDate: '2025-01-25'
      },
      {
        id: '4',
        customerName: TEST_CUSTOMERS[3].name,
        requestDate: '2025-01-13',
        responseDate: '2025-01-14',
        amount: 42000,
        status: 'contracted',
        items: TEST_ITEMS[3],
        fromAddress: TEST_ADDRESSES[3].from,
        toAddress: TEST_ADDRESSES[3].to,
        moveDate: '2025-01-28'
      }
    ];
    setQuotes(demoQuotes);
    setFilteredQuotes(demoQuotes);
  }, []);

  /**
   * フィルタリングとソートの処理
   * - 検索語による絞り込み
   * - ステータスによる絞り込み
   * - 指定項目でのソート
   */
  useEffect(() => {
    let filtered = quotes;

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.requestDate.includes(searchTerm)
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // ソート
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'requestDate':
          aValue = new Date(a.requestDate);
          bValue = new Date(b.requestDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        default:
          aValue = new Date(a.requestDate);
          bValue = new Date(b.requestDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredQuotes(filtered);
  }, [quotes, searchTerm, statusFilter, sortBy, sortOrder]);

  /**
   * ステータスに応じたバッジコンポーネントを生成
   * @param status - ステータス
   * @returns ステータスバッジのJSX
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'contracted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">成約済</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">検討中</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">期限切れ</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">不明</span>;
    }
  };

  /**
   * 見積もり詳細の表示
   * @param quoteId - 見積もりID
   */
  const handleViewDetails = (quoteId: string) => {
    // 詳細画面への遷移
    router.push(`/admin/quotes/${quoteId}`);
  };

  /**
   * 再見積もりの実行
   * @param quoteId - 見積もりID
   */
  const handleReQuote = (quoteId: string) => {
    // 再見積もり画面への遷移
    router.push(`/admin/quotes/${quoteId}/requote`);
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  見積もり回答履歴
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  お客様への見積もり回答履歴の管理
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                トップに戻る
              </button>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* フィルター・検索 */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* 検索 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      検索
                    </label>
                    <input
                      type="text"
                      placeholder="顧客名または日付"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* ステータスフィルター */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="pending">検討中</option>
                      <option value="contracted">成約済</option>
                      <option value="expired">期限切れ</option>
                    </select>
                  </div>

                  {/* ソート項目 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      並び順
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="requestDate">依頼日</option>
                      <option value="customerName">顧客名</option>
                      <option value="amount">金額</option>
                    </select>
                  </div>

                  {/* ソート順 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      順序
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="desc">新しい順</option>
                      <option value="asc">古い順</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 見積もり履歴テーブル */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          依頼日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          回答日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQuotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {quote.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(quote.requestDate).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {quote.responseDate ? new Date(quote.responseDate).toLocaleDateString('ja-JP') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {'¥' + quote.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(quote.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewDetails(quote.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              詳細
                            </button>
                            {quote.status === 'pending' && (
                              <button
                                onClick={() => handleReQuote(quote.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                再回答
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredQuotes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">見積もり履歴がありません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 