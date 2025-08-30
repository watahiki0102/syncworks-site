/**
 * 管理者成約実績管理ページコンポーネント
 * - 成約実績の一覧表示
 * - 月次サマリーの表示
 * - フィルタリング・ソート機能
 * - CSVエクスポート機能
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminCard from '@/components/admin/AdminCard';
import { generateTestContract } from '@/constants/testData';

/**
 * 成約データの型定義
 */
interface Contract {
  id: string;              // 成約ID
  customerName: string;    // 顧客名
  contractDate: string;    // 成約日
  moveDate: string;        // 引越し日
  contractAmount: number;  // 成約金額
  commission: number;      // 手数料
  revenue: number;         // 売上
  items: string[];         // 荷物リスト
  fromAddress: string;     // 引越し元住所
  toAddress: string;       // 引越し先住所
}

/**
 * 月次サマリーの型定義
 */
interface MonthlySummary {
  month: string;           // 年月（YYYY-MM形式）
  totalRevenue: number;    // 月間売上合計
  totalContracts: number;  // 月間成約件数
  totalAmount: number;     // 月間成約金額合計
}

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [periodOption, setPeriodOption] = useState<string>('all');
  const [yearValue, setYearValue] = useState('');
  const [monthValue, setMonthValue] = useState('');
  const [yearMonthValue, setYearMonthValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<string>('contractDate-asc');
  const router = useRouter();

  /**
   * デモデータの初期化
   * 実際のアプリケーションではAPIから取得
   */
  useEffect(() => {
    // 共通テストデータから契約データを生成
    const demoContracts: Contract[] = [
      generateTestContract(0, 0, 0), // 田中太郎
      generateTestContract(3, 1, 1), // 高橋美咲
    ];
    setContracts(demoContracts);
    setFilteredContracts(demoContracts);

    const summaries: MonthlySummary[] = [
      {
        month: '2025-01',
        totalRevenue: 73950,
        totalContracts: 2,
        totalAmount: 87000
      }
    ];
    setMonthlySummaries(summaries);
  }, []);

  /**
   * フィルタリングとソートの処理
   * - 期間による絞り込み
   * - 検索語による絞り込み
   * - 指定項目でのソート
   */
  useEffect(() => {
    let filtered = contracts;

    if (periodOption === 'year' && yearValue) {
      filtered = filtered.filter(contract =>
        contract.contractDate.startsWith(yearValue)
      );
    } else if (periodOption === 'month' && monthValue) {
      filtered = filtered.filter(contract =>
        contract.contractDate.slice(5, 7) === monthValue.padStart(2, '0')
      );
    } else if (periodOption === 'yearMonth' && yearMonthValue) {
      filtered = filtered.filter(contract =>
        contract.contractDate.startsWith(yearMonthValue)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      const [field, order] = sortOption.split('-');

      switch (field) {
        case 'customerName':
          aValue = a.customerName;
          bValue = b.customerName;
          break;
        case 'contractDate':
          aValue = new Date(a.contractDate);
          bValue = new Date(b.contractDate);
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        default:
          aValue = new Date(a.contractDate);
          bValue = new Date(b.contractDate);
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredContracts(filtered);
  }, [contracts, periodOption, yearValue, monthValue, yearMonthValue, searchTerm, sortOption]);

  /**
   * CSVエクスポート機能
   * フィルタリングされた成約データをCSVファイルとしてダウンロード
   */
  const handleExportCSV = () => {
    const csvContent = [
      ['顧客名', '成約日', '引越し日', '成約金額', '手数料', '売上'],
      ...filteredContracts.map(contract => [
        contract.customerName,
        contract.contractDate,
        contract.moveDate,
        contract.contractAmount.toString(),
        contract.commission.toString(),
        contract.revenue.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const periodLabel =
      periodOption === 'year'
        ? yearValue
        : periodOption === 'month'
          ? monthValue
          : periodOption === 'yearMonth'
            ? yearMonthValue
            : 'all';
    link.setAttribute('download', `contracts_${periodLabel || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * 現在の月次サマリーを取得
   * @returns 月次サマリー情報
   */
  const getCurrentMonthSummary = () => {
    const totalRevenue = filteredContracts.reduce(
      (acc, c) => acc + c.revenue,
      0
    );
    const totalAmount = filteredContracts.reduce(
      (acc, c) => acc + c.contractAmount,
      0
    );
    const totalContracts = filteredContracts.length;
    return { totalRevenue, totalContracts, totalAmount };
  };

  /**
   * 月次サマリーの再計算
   * 成約データから月次サマリーを動的に計算
   */


  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminPageHeader 
          title="成約実績管理"
          subtitle="成約実績と売上の管理・分析"
          breadcrumbs={[
            { label: '成約管理' }
          ]}
        />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div>
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">📊</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            月別売上
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {'¥' + getCurrentMonthSummary().totalRevenue.toLocaleString()}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">📋</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            成約件数
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {getCurrentMonthSummary().totalContracts}件
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">💰</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            総成約金額
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {'¥' + getCurrentMonthSummary().totalAmount.toLocaleString()}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">📈</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            平均成約金額
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {
                              '¥' +
                              (getCurrentMonthSummary().totalContracts > 0
                                ? Math.round(
                                    getCurrentMonthSummary().totalAmount /
                                      getCurrentMonthSummary().totalContracts
                                  ).toLocaleString()
                                : '0')
                            }
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b flex flex-wrap gap-2 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700">集計期間</label>
                  <select
                    className="mt-1 px-2 py-1 border border-gray-300 rounded-md"
                    value={periodOption}
                    onChange={(e) => setPeriodOption(e.target.value)}
                  >
                    <option value="all">すべて</option>
                    <option value="year">年</option>
                    <option value="month">月</option>
                    <option value="yearMonth">月＋年</option>
                  </select>
                </div>
                {periodOption === 'year' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">年</label>
                    <input
                      type="number"
                      className="mt-1 px-2 py-1 border border-gray-300 rounded-md"
                      value={yearValue}
                      onChange={(e) => setYearValue(e.target.value)}
                    />
                  </div>
                )}
                {periodOption === 'month' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">月</label>
                    <select
                      className="mt-1 px-2 py-1 border border-gray-300 rounded-md"
                      value={monthValue}
                      onChange={(e) => setMonthValue(e.target.value)}
                    >
                      <option value="">--</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={(i + 1).toString().padStart(2, '0')}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {periodOption === 'yearMonth' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">年月</label>
                    <input
                      type="month"
                      className="mt-1 px-2 py-1 border border-gray-300 rounded-md"
                      value={yearMonthValue}
                      onChange={(e) => setYearMonthValue(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">検索</label>
                  <input
                    type="text"
                    className="mt-1 px-2 py-1 border border-gray-300 rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">並び替え</label>
                  <select
                    className="mt-1 px-2 py-1 border border-gray-300 rounded-md"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="contractDate-asc">成約日（昇順）</option>
                    <option value="contractDate-desc">成約日（降順）</option>
                    <option value="customerName-asc">顧客名（昇順）</option>
                    <option value="customerName-desc">顧客名（降順）</option>
                    <option value="revenue-asc">売上（昇順）</option>
                    <option value="revenue-desc">売上（降順）</option>
                  </select>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handleExportCSV}
                    className="mt-6 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-sm font-medium"
                  >
                    CSV出力
                  </button>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客名
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          成約日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          引越し日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          成約金額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          手数料
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          売上
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {contract.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contract.contractDate).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contract.moveDate).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {'¥' + contract.contractAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {'¥' + contract.commission.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {'¥' + contract.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredContracts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">成約実績がありません</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
