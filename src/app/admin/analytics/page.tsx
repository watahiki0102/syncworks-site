'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

// KPIカードコンポーネント
function KPICard({ title, value, unit, icon, color }: {
  title: string;
  value: number | string;
  unit: string;
  icon: string;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-r ${color} p-4 rounded-xl shadow-md border-l-4`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-sm text-gray-600">{title}</div>
          <div className="text-2xl font-bold text-gray-900">
            {value}<span className="text-sm font-medium text-gray-600 ml-1">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 成約案件テーブルコンポーネント
function ContractTable({ contracts }: { contracts: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📋 成約案件一覧</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                案件ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                成約日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                トラック種別
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contract.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.contractDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ¥{contract.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {contract.truckType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    contract.status === '成約' 
                      ? 'bg-green-100 text-green-800'
                      : contract.status === 'キャンセル'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 簡易グラフコンポーネント
function SimpleChart({ title, data, type = 'bar' }: {
  title: string;
  data: { label: string; value: number }[];
  type?: 'bar' | 'line';
}) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-16 text-sm text-gray-600">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="bg-blue-500 h-6 rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 円グラフコンポーネント
function PieChart({ title, data }: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');

              currentAngle += angle;

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="0.5"
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">総計</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 折れ線グラフコンポーネント
function LineChart({ title, data }: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 280 + 20;
    const y = 180 - ((item.value - minValue) / range) * 140 + 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox="0 0 320 220" className="w-full h-64">
          {/* グリッド線 */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="20"
              y1={20 + i * 35}
              x2="300"
              y2={20 + i * 35}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* 折れ線 */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* データポイント */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 280 + 20;
            const y = 180 - ((item.value - minValue) / range) * 140 + 20;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={210}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-900 font-medium"
                >
                  {item.value.toLocaleString()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// 複合グラフコンポーネント（棒グラフ+折れ線）
function ComboChart({ title, barData, lineData }: {
  title: string;
  barData: { label: string; value: number }[];
  lineData: { label: string; value: number }[];
}) {
  const maxBarValue = Math.max(...barData.map(d => d.value));
  const maxLineValue = Math.max(...lineData.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox="0 0 320 240" className="w-full h-64">
          {/* グリッド線 */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="20"
              y1={20 + i * 35}
              x2="300"
              y2={20 + i * 35}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* 棒グラフ */}
          {barData.map((item, index) => {
            const x = 40 + index * 50;
            const height = (item.value / maxBarValue) * 140;
            const y = 160 - height;
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width="20"
                height={height}
                fill="#60a5fa"
                rx="2"
              />
            );
          })}
          
          {/* 折れ線 */}
          <polyline
            points={lineData.map((item, index) => {
              const x = 50 + index * 50;
              const y = 160 - (item.value / maxLineValue) * 140;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 折れ線のポイント */}
          {lineData.map((item, index) => {
            const x = 50 + index * 50;
            const y = 160 - (item.value / maxLineValue) * 140;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* X軸ラベル */}
          {barData.map((item, index) => (
            <text
              key={index}
              x={50 + index * 50}
              y={185}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {item.label}
            </text>
          ))}
        </svg>
        
        {/* 凡例 */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-sm text-gray-600">成約件数</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-sm text-gray-600">売上（万円）</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// エリアチャートコンポーネント
function AreaChart({ title, data }: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 280 + 20;
    const y = 180 - ((item.value - minValue) / range) * 140 + 20;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `20,180 ${points} 300,180`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox="0 0 320 220" className="w-full h-64">
          {/* グリッド線 */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="20"
              y1={20 + i * 35}
              x2="300"
              y2={20 + i * 35}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* エリア */}
          <polygon
            points={areaPoints}
            fill="url(#areaGradient)"
            stroke="none"
          />
          
          {/* 折れ線 */}
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* データポイント */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 280 + 20;
            const y = 180 - ((item.value - minValue) / range) * 140 + 20;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={210}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
          
          {/* グラデーション定義 */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState({
    contracts: 12,
    contractRate: 34.5,
    totalSales: 980000,
    averageValue: 81667
  });

  // 現在の月の開始日と終了日を設定
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endOfMonth = new Date(year, month, 0).getDate();
    const endOfMonthStr = `${year}-${month.toString().padStart(2, '0')}-${endOfMonth.toString().padStart(2, '0')}`;
    
    setStartDate(startOfMonth);
    setEndDate(endOfMonthStr);
  }, []);

  // デモデータ
  const contractsData = [
    { id: 'SY-2025-0001', customerName: '田中様', contractDate: '2025/01/15', amount: 85000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2025-0002', customerName: '佐藤様', contractDate: '2025/01/18', amount: 120000, truckType: '3t', status: '成約' },
    { id: 'SY-2025-0003', customerName: '高橋様', contractDate: '2025/01/20', amount: 75000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0004', customerName: '山田様', contractDate: '2025/01/22', amount: 95000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2025-0005', customerName: '鈴木様', contractDate: '2025/01/25', amount: 110000, truckType: '3t', status: '成約' },
  ];

  const chartData = [
    { label: '1/15', value: 1 },
    { label: '1/18', value: 1 },
    { label: '1/20', value: 1 },
    { label: '1/22', value: 1 },
    { label: '1/25', value: 1 },
  ];

  const salesData = [
    { label: '1/15', value: 85000 },
    { label: '1/18', value: 120000 },
    { label: '1/20', value: 75000 },
    { label: '1/22', value: 95000 },
    { label: '1/25', value: 110000 },
  ];

  // 追加のグラフデータ
  const truckTypeData = [
    { label: '2tショート', value: 5, color: '#3b82f6' },
    { label: '3t', value: 3, color: '#10b981' },
    { label: '2t', value: 2, color: '#f59e0b' },
    { label: '4t', value: 2, color: '#ef4444' },
  ];

  const monthlyTrendData = [
    { label: '10月', value: 8 },
    { label: '11月', value: 10 },
    { label: '12月', value: 12 },
    { label: '1月', value: 15 },
  ];

  const comboBarData = [
    { label: '1/15', value: 1 },
    { label: '1/18', value: 1 },
    { label: '1/20', value: 1 },
    { label: '1/22', value: 1 },
    { label: '1/25', value: 1 },
  ];

  const comboLineData = [
    { label: '1/15', value: 8.5 },
    { label: '1/18', value: 12 },
    { label: '1/20', value: 7.5 },
    { label: '1/22', value: 9.5 },
    { label: '1/25', value: 11 },
  ];

  const cumulativeData = [
    { label: '1/15', value: 85000 },
    { label: '1/18', value: 205000 },
    { label: '1/20', value: 280000 },
    { label: '1/22', value: 375000 },
    { label: '1/25', value: 485000 },
  ];

  const handleFilterUpdate = () => {
    // フィルター更新処理（実際のアプリケーションでは API 呼び出し）
    console.log('フィルター更新:', startDate, endDate);
  };

  const handleCSVExport = () => {
    // CSV エクスポート処理
    const csvContent = "data:text/csv;charset=utf-8," 
      + "案件ID,顧客名,成約日,金額,トラック種別,ステータス\n"
      + contractsData.map(row => `${row.id},${row.customerName},${row.contractDate},${row.amount},${row.truckType},${row.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "成約案件一覧.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  トップに戻る
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">📊 集計管理</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    成約率・売上などのKPI分析
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* 期間指定フィルター */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">📅 期間指定：</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-gray-500">〜</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleFilterUpdate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  更新
                </button>
                <button
                  onClick={handleCSVExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  CSV出力
                </button>
              </div>
            </div>

            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="成約件数"
                value={filteredData.contracts}
                unit="件"
                icon="✅"
                color="from-green-100 to-green-50 border-green-400"
              />
              <KPICard
                title="成約率"
                value={filteredData.contractRate}
                unit="%"
                icon="📈"
                color="from-blue-100 to-blue-50 border-blue-400"
              />
              <KPICard
                title="売上合計"
                value={`¥${filteredData.totalSales.toLocaleString()}`}
                unit=""
                icon="💰"
                color="from-yellow-100 to-yellow-50 border-yellow-400"
              />
              <KPICard
                title="平均単価"
                value={`¥${filteredData.averageValue.toLocaleString()}`}
                unit=""
                icon="📊"
                color="from-purple-100 to-purple-50 border-purple-400"
              />
            </div>

            {/* グラフ表示 */}
            <div className="space-y-6">
              {/* 1行目: 基本グラフ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleChart
                  title="📊 成約件数の推移（棒グラフ）"
                  data={chartData}
                  type="bar"
                />
                <LineChart
                  title="💰 売上金額の推移（折れ線グラフ）"
                  data={salesData}
                />
              </div>

              {/* 2行目: 分析グラフ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChart
                  title="🚚 トラック種別別成約比率"
                  data={truckTypeData}
                />
                <ComboChart
                  title="📈 成約件数 vs 売上推移"
                  barData={comboBarData}
                  lineData={comboLineData}
                />
              </div>

              {/* 3行目: トレンド分析 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChart
                  title="📈 月別成約件数トレンド"
                  data={monthlyTrendData}
                />
                <AreaChart
                  title="💹 累計売上推移（エリアチャート）"
                  data={cumulativeData}
                />
              </div>
            </div>

            {/* 成約案件一覧テーブル */}
            <ContractTable contracts={contractsData} />
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 