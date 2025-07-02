'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

interface Contract {
  id: string;
  customerName: string;
  contractDate: string;
  moveDate: string;
  contractAmount: number;
  commission: number;
  revenue: number;
  items: string[];
  fromAddress: string;
  toAddress: string;
}

interface MonthlySummary {
  month: string;
  totalRevenue: number;
  totalContracts: number;
  totalAmount: number;
}

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('contractDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  // デモデータ
  useEffect(() => {
    const demoContracts: Contract[] = [
      {
        id: '1',
        customerName: '田中太郎',
        contractDate: '2025-01-15',
        moveDate: '2025-02-01',
        contractAmount: 45000,
        commission: 6750,
        revenue: 38250,
        items: ['シングルベッド', '冷蔵庫', 'テレビ'],
        fromAddress: '東京都渋谷区',
        toAddress: '東京都新宿区'
      },
      {
        id: '2',
        customerName: '高橋美咲',
        contractDate: '2025-01-13',
        moveDate: '2025-01-28',
        contractAmount: 42000,
        commission: 6300,
        revenue: 35700,
        items: ['セミダブルベッド', '電子レンジ', '本棚'],
        fromAddress: '東京都中野区',
        toAddress: '東京都杉並区'
      }
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

  // フィルタリングとソート
  useEffect(() => {
    let filtered = contracts;

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(contract =>
        contract.contractDate.startsWith(selectedMonth)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
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

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredContracts(filtered);
  }, [contracts, selectedMonth, searchTerm, sortBy, sortOrder]);

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
    link.setAttribute('download', `contracts_${selectedMonth || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentMonthSummary = () => {
    return monthlySummaries.find(summary => summary.month === selectedMonth) ||
      { totalRevenue: 0, totalContracts: 0, totalAmount: 0 };
  };

  const handleRecalculate = () => {
    const newSummaries = contracts.reduce((acc, contract) => {
      const month = contract.contractDate.slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, totalRevenue: 0, totalContracts: 0, totalAmount: 0 };
      }
      acc[month].totalRevenue += contract.revenue;
      acc[month].totalContracts += 1;
      acc[month].totalAmount += contract.contractAmount;
      return acc;
    }, {} as Record<string, MonthlySummary>);

    setMonthlySummaries(Object.values(newSummaries));
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  成約実績管理
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  成約実績と売上の管理・分析
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
                            ¥{getCurrentMonthSummary().totalRevenue.toLocaleString()}
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
                            ¥{getCurrentMonthSummary().totalAmount.toLocaleString()}
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
                            ¥{getCurrentMonthSummary().totalContracts > 0
                              ? Math.round(getCurrentMonthSummary().totalAmount / getCurrentMonthSummary().totalContracts).toLocaleString()
                              : '0'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-white shadow rounded-lg flex-1 min-w-[300px]">
                  <div className="px-4 py-3">
                    <h2 className="text-md font-medium text-gray-900 mb-2">絞り込み</h2>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          期間選択（引っ越し日）
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">～</span>
                          <input
                            type="date"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          成約金額
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="最小"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setSortBy(`min:${e.target.value}`)}
                          />
                          <span className="text-sm font-medium text-gray-700">～</span>
                          <input
                            type="number"
                            placeholder="最大"
                            className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => setSortBy(`max:${e.target.value}`)}
                          />
                        </div>
                      </div>
                      <div className="flex items-end min-w-[150px]">
                        <button
                          onClick={handleRecalculate}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                        >
                          再集計
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg flex-1 min-w-[300px]">
              <div className="px-4 py-3">
                <h2 className="text-md font-medium text-gray-900 mb-2">並び順</h2>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-[100px]">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-1 py-0.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="desc">新しい順</option>
                      <option value="asc">古い順</option>
                      <option value="contractDate">成約日</option>
                      <option value="customerName">顧客名</option>
                      <option value="revenue">売上</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={handleExportCSV}
                      className="w-auto bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-sm font-medium"
                    >
                      CSV出力
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
                            ¥{contract.contractAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ¥{contract.commission.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ¥{contract.revenue.toLocaleString()}
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
        </main>
      </div>
    </AdminAuthGuard>
  );
}
