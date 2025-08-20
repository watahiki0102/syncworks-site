'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { BillingStatusRow, InvoiceRow } from '@/types/internal';
import { TEST_VENDORS } from '@/constants/testData';

// 統合された請求データの型
interface BillingData {
  id: string;
  partnerName: string;
  month: string;
  amountInclTax: number;
  status: '未請求' | '請求済' | '入金待ち' | '入金済' | '保留';
  issued: boolean;
  invoiceId?: string;
  issuedAt?: string;
  updatedAt: string;
}

// 共通データから請求データを生成するヘルパー関数
const generateTestBillingData = (): BillingData[] => {
  return [
    {
      id: '1',
      partnerName: TEST_VENDORS[0].name, // ABC引越し
      month: '2024-12',
      amountInclTax: 150000,
      status: '未請求',
      issued: false,
      updatedAt: '2024-12-20T10:00:00Z',
    },
    {
      id: '2',
      partnerName: TEST_VENDORS[1].name, // XYZ運送
      month: '2024-12',
      amountInclTax: 89000,
      status: '請求済',
      issued: true,
      invoiceId: 'INV-2024-001',
      issuedAt: '2024-12-25T14:30:00Z',
      updatedAt: '2024-12-25T14:30:00Z',
    },
    {
      id: '3',
      partnerName: TEST_VENDORS[2].name, // QuickMove
      month: '2024-11',
      amountInclTax: 203000,
      status: '入金済',
      issued: true,
      invoiceId: 'INV-2024-002',
      issuedAt: '2024-11-30T16:45:00Z',
      updatedAt: '2024-12-15T09:20:00Z',
    },
    {
      id: '4',
      partnerName: TEST_VENDORS[3].name, // 不動産サービスA
      month: '2024-12',
      amountInclTax: 67000,
      status: '入金待ち',
      issued: true,
      invoiceId: 'INV-2024-003',
      issuedAt: '2024-12-20T11:15:00Z',
      updatedAt: '2024-12-20T11:15:00Z',
    },
  ];
};

export default function BillingPage() {
  const [data, setData] = useState<BillingData[]>([]);
  const [statusFilter, setStatusFilter] = useState<'全て' | '未請求' | '請求済' | '入金待ち' | '入金済' | '保留'>('全て');
  const [searchQuery, setSearchQuery] = useState('');

  // 初期データの読み込み
  useEffect(() => {
    // 共通テストデータから請求データを生成
    setData(generateTestBillingData());
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

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const handleStatusChange = (id: string, newStatus: BillingData['status']) => {
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, status: newStatus, updatedAt: new Date().toISOString() } : row
    ));
  };

  const handleIssueInvoice = (id: string) => {
    if (!window.confirm('請求書を発行しますか？')) return;

    const invoiceId = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const now = new Date().toISOString();

    setData(prev => prev.map(row => 
      row.id === id ? { 
        ...row, 
        status: '請求済',
        issued: true,
        invoiceId,
        issuedAt: now,
        updatedAt: now
      } : row
    ));

    alert(`請求書 ${invoiceId} を発行しました。`);
  };

  const filteredData = data.filter(row => {
    // ステータスフィルター
    if (statusFilter !== '全て' && row.status !== statusFilter) return false;
    
    // 検索フィルター
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      row.partnerName.toLowerCase().includes(query) ||
      row.month.includes(query) ||
      (row.invoiceId && row.invoiceId.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: BillingData['status']) => {
    const statusConfig = {
      '未請求': 'bg-red-100 text-red-800',
      '請求済': 'bg-blue-100 text-blue-800',
      '入金待ち': 'bg-yellow-100 text-yellow-800',
      '入金済': 'bg-green-100 text-green-800',
      '保留': 'bg-gray-100 text-gray-800',
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {process.env.NODE_ENV === 'development' ? (
        <DevelopmentAuthGuard>
          <InternalGate>
            <InternalLayout>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  請求管理
                </h2>
                <p className="text-gray-600">
                  パートナー別の請求状況管理・請求書発行
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
                      placeholder="パートナー名、対象月、請求書IDで検索..."
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
                      <option value="全て">全て</option>
                      <option value="未請求">未請求</option>
                      <option value="請求済">請求済</option>
                      <option value="入金待ち">入金待ち</option>
                      <option value="入金済">入金済</option>
                      <option value="保留">保留</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-gray-500">総件数</div>
                  <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-red-500">未請求</div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.filter(row => row.status === '未請求').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-yellow-500">入金待ち</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.filter(row => row.status === '入金待ち').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-green-500">入金済</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.filter(row => row.status === '入金済').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-blue-500">総請求額</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(data.reduce((sum, row) => sum + row.amountInclTax, 0))}
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
                          パートナー名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          対象月
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金額（税込）
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          請求書ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          発行日時
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          更新日時
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.partnerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(row.amountInclTax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={row.status}
                              onChange={(e) => handleStatusChange(row.id, e.target.value as BillingData['status'])}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="未請求">未請求</option>
                              <option value="請求済">請求済</option>
                              <option value="入金待ち">入金待ち</option>
                              <option value="入金済">入金済</option>
                              <option value="保留">保留</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.invoiceId || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.issuedAt ? formatDate(row.issuedAt) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(row.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {!row.issued && (
                              <button
                                onClick={() => handleIssueInvoice(row.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                請求書発行
                              </button>
                            )}
                            {row.issued && row.invoiceId && (
                              <button
                                onClick={() => alert(`請求書 ${row.invoiceId} をダウンロードします。`)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                PDF取得
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </InternalLayout>
          </InternalGate>
        </DevelopmentAuthGuard>
      ) : (
        <AdminAuthGuard>
          <InternalGate>
            <InternalLayout>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  請求管理
                </h2>
                <p className="text-gray-600">
                  パートナー別の請求状況管理・請求書発行
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
                      placeholder="パートナー名、対象月、請求書IDで検索..."
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
                      <option value="全て">全て</option>
                      <option value="未請求">未請求</option>
                      <option value="請求済">請求済</option>
                      <option value="入金待ち">入金待ち</option>
                      <option value="入金済">入金済</option>
                      <option value="保留">保留</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-gray-500">総件数</div>
                  <div className="text-2xl font-bold text-gray-900">{data.length}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-red-500">未請求</div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.filter(row => row.status === '未請求').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-yellow-500">入金待ち</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.filter(row => row.status === '入金待ち').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-green-500">入金済</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.filter(row => row.status === '入金済').length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-sm font-medium text-blue-500">総請求額</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(data.reduce((sum, row) => sum + row.amountInclTax, 0))}
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
                          パートナー名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          対象月
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          金額（税込）
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ステータス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          請求書ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          発行日時
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          更新日時
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {row.partnerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(row.amountInclTax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={row.status}
                              onChange={(e) => handleStatusChange(row.id, e.target.value as BillingData['status'])}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="未請求">未請求</option>
                              <option value="請求済">請求済</option>
                              <option value="入金待ち">入金待ち</option>
                              <option value="入金済">入金済</option>
                              <option value="保留">保留</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.invoiceId || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.issuedAt ? formatDate(row.issuedAt) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(row.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {!row.issued && (
                              <button
                                onClick={() => handleIssueInvoice(row.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                請求書発行
                              </button>
                            )}
                            {row.issued && row.invoiceId && (
                              <button
                                onClick={() => alert(`請求書 ${row.invoiceId} をダウンロードします。`)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                              >
                                PDF取得
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </InternalLayout>
          </InternalGate>
        </AdminAuthGuard>
      )}
    </>
  );
}