'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { ContactRow } from '@/types/internal';
import { TEST_CUSTOMERS } from '@/constants/testData';

// 共通データからお問い合わせデータを生成するヘルパー関数
const generateTestContacts = (): ContactRow[] => {
  return [
    {
      id: '1',
      createdAt: '2024-01-15T10:00:00Z',
      name: TEST_CUSTOMERS[0].name, // 田中太郎
      email: TEST_CUSTOMERS[0].email,
      tel: TEST_CUSTOMERS[0].phone,
      message: '引越しの見積もりについて詳しく知りたいです。',
      source: 'お問い合わせフォーム',
      status: '未完了',
    },
    {
      id: '2',
      createdAt: '2024-01-16T14:30:00Z',
      name: TEST_CUSTOMERS[1].name, // 佐藤花子
      email: TEST_CUSTOMERS[1].email,
      tel: TEST_CUSTOMERS[1].phone,
      message: '不動産の売却について相談したいです。',
      source: 'お問い合わせフォーム',
      status: '対応中',
    },
    {
      id: '3',
      createdAt: '2024-01-17T09:15:00Z',
      name: TEST_CUSTOMERS[2].name, // 鈴木一郎（修正）
      email: TEST_CUSTOMERS[2].email,
      tel: TEST_CUSTOMERS[2].phone,
      message: 'サービスについて質問があります。',
      source: 'メール',
      status: '完了',
    },
    {
      id: '4',
      createdAt: '2024-01-18T16:45:00Z',
      name: TEST_CUSTOMERS[3].name, // 高橋美咲
      email: TEST_CUSTOMERS[3].email,
      tel: TEST_CUSTOMERS[3].phone,
      message: '引越しの料金体系について教えてください。',
      source: 'お問い合わせフォーム',
      status: '未完了',
    },
  ];
};

export default function ContactsPage() {
  const [data, setData] = useState<ContactRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全て' | '未完了' | '対応中' | '完了'>('全て');

  // 初期データの読み込み
  useEffect(() => {
    // 共通テストデータからお問い合わせデータを生成
    setData(generateTestContacts());
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (id: string, newStatus: ContactRow['status']) => {
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, status: newStatus } : row
    ));
  };

  const filteredData = data.filter(row => {
    // ステータスフィルター（完了は非表示、未完了・対応中のみ表示）
    if (statusFilter === '未完了' && row.status !== '未完了') {return false;}
    if (statusFilter === '対応中' && row.status !== '対応中') {return false;}
    if (statusFilter === '完了' && row.status !== '完了') {return false;}
    if (statusFilter === '全て' && row.status === '完了') {return false;} // デフォルトでは完了は非表示
    
    // 検索フィルター
    if (!searchQuery) {return true;}
    
    const query = searchQuery.toLowerCase();
    return (
      row.name.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      (row.tel && row.tel.includes(query)) ||
      row.message.toLowerCase().includes(query) ||
      (row.source && row.source.toLowerCase().includes(query))
    );
  });

  return (
    <>
      {process.env.NODE_ENV === 'development' ? (
        <DevelopmentAuthGuard>
          <InternalGate>
            <InternalLayout>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              お問い合わせ一覧
            </h2>
            <p className="text-gray-600">
              お客様からのお問い合わせを管理します
            </p>
          </div>

          {/* 検索・フィルタ */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  検索
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="名前、メール、電話番号、メッセージで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="全て">未完了・対応中</option>
                  <option value="未完了">未完了のみ</option>
                  <option value="対応中">対応中のみ</option>
                  <option value="完了">完了済み</option>
                </select>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">総件数</div>
              <div className="text-2xl font-bold text-gray-900">{data.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-red-500">未完了</div>
              <div className="text-2xl font-bold text-red-600">
                {data.filter(row => row.status === '未完了').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-yellow-500">対応中</div>
              <div className="text-2xl font-bold text-yellow-600">
                {data.filter(row => row.status === '対応中').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-green-500">完了</div>
              <div className="text-2xl font-bold text-green-600">
                {data.filter(row => row.status === '完了').length}
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      受信日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      電話番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メッセージ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      送信元
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a 
                          href={`mailto:${row.email}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {row.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.tel ? (
                          <a 
                            href={`tel:${row.tel}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {row.tel}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={row.message}>
                          {row.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.source === 'お問い合わせフォーム'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.source || '不明'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={row.status}
                          onChange={(e) => handleStatusChange(row.id, e.target.value as ContactRow['status'])}
                          className={`text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            row.status === '未完了' ? 'border-red-300 bg-red-50' :
                            row.status === '対応中' ? 'border-yellow-300 bg-yellow-50' :
                            'border-green-300 bg-green-50'
                          }`}
                        >
                          <option value="未完了">未完了</option>
                          <option value="対応中">対応中</option>
                          <option value="完了">完了</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 検索結果が0件の場合 */}
          {filteredData.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                「{searchQuery}」に一致するお問い合わせが見つかりませんでした
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 hover:text-blue-900"
              >
                検索条件をクリア
              </button>
            </div>
          )}
        </InternalLayout>
      </InternalGate>
        </DevelopmentAuthGuard>
      ) : (
        <AdminAuthGuard>
          <InternalGate>
            <InternalLayout>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  お問い合わせ一覧
                </h2>
                <p className="text-gray-600">
                  お客様からのお問い合わせを管理します
                </p>
              </div>

              {/* 検索・フィルタ */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      検索
                    </label>
                    <input
                      type="text"
                      id="search"
                      placeholder="名前、メール、電話番号、メッセージで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                      ステータス
                    </label>
                    <select
                      id="statusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="全て">未完了・対応中</option>
                      <option value="未完了">未完了のみ</option>
                      <option value="対応中">対応中のみ</option>
                      <option value="完了">完了済み</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-gray-500">総件数</div>
                  <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-red-500">未完了</div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.filter(row => row.status === '未完了').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-yellow-500">対応中</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.filter(row => row.status === '対応中').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-green-500">完了</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.filter(row => row.status === '完了').length}
                  </div>
                </div>
              </div>

              {/* テーブル */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          受信日時
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          名前
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          メールアドレス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          電話番号
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          メッセージ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          送信元
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(row.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a 
                              href={`mailto:${row.email}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {row.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.tel ? (
                              <a 
                                href={`tel:${row.tel}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {row.tel}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={row.message}>
                              {row.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.source === 'お問い合わせフォーム'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {row.source || '不明'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={row.status}
                              onChange={(e) => handleStatusChange(row.id, e.target.value as ContactRow['status'])}
                              className={`text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                row.status === '未完了' ? 'border-red-300 bg-red-50' :
                                row.status === '対応中' ? 'border-yellow-300 bg-yellow-50' :
                                'border-green-300 bg-green-50'
                              }`}
                            >
                              <option value="未完了">未完了</option>
                              <option value="対応中">対応中</option>
                              <option value="完了">完了</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 検索結果が0件の場合 */}
              {filteredData.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">
                    「{searchQuery}」に一致するお問い合わせが見つかりませんでした
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-blue-600 hover:text-blue-900"
                  >
                    検索条件をクリア
                  </button>
                </div>
              )}
            </InternalLayout>
          </InternalGate>
        </AdminAuthGuard>
      )}
    </>
  );
}
