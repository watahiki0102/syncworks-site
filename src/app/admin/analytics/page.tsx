'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';

// プロット間隔の型定義
type PlotInterval = 'day' | 'week' | 'month' | 'year';

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
  // データが空またはundefinedの場合の処理
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value)) || 1;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const safePercentage = isNaN(percentage) ? 0 : percentage;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-sm text-gray-600">{item.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="bg-blue-500 h-6 rounded-full transition-all duration-500"
                  style={{ width: `${safePercentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
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
  // データが空またはundefinedの場合の処理
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    // データが1つの場合は中央に配置
    const x = data.length === 1 
      ? 160 // 中央の位置
      : (index / (data.length - 1)) * 280 + 20;
    const y = 180 - ((item.value - minValue) / range) * 140 + 20;
    
    // NaN チェック
    const safeX = isNaN(x) ? 160 : x;
    const safeY = isNaN(y) ? 100 : y;
    
    return `${safeX},${safeY}`;
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
            // データが1つの場合は中央に配置
            const x = data.length === 1 
              ? 160 // 中央の位置
              : (index / (data.length - 1)) * 280 + 20;
            const y = 180 - ((item.value - minValue) / range) * 140 + 20;
            
            // NaN チェック
            const safeX = isNaN(x) ? 160 : x;
            const safeY = isNaN(y) ? 100 : y;
            
            return (
              <g key={index}>
                <circle
                  cx={safeX}
                  cy={safeY}
                  r="4"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={safeX}
                  y={210}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
                <text
                  x={safeX}
                  y={safeY - 10}
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
  // データが空の場合の処理
  if (!barData || barData.length === 0 || !lineData || lineData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  const maxBarValue = Math.max(...barData.map(d => d.value)) || 1;
  const maxLineValue = Math.max(...lineData.map(d => d.value)) || 1;

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
            
            // NaN チェック
            const safeX = isNaN(x) ? 40 : x;
            const safeY = isNaN(y) ? 160 : y;
            const safeHeight = isNaN(height) ? 0 : height;
            
            return (
              <rect
                key={index}
                x={safeX}
                y={safeY}
                width="20"
                height={safeHeight}
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
              
              // NaN チェック
              const safeX = isNaN(x) ? 50 : x;
              const safeY = isNaN(y) ? 160 : y;
              
              return `${safeX},${safeY}`;
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
            
            // NaN チェック
            const safeX = isNaN(x) ? 50 : x;
            const safeY = isNaN(y) ? 160 : y;
            
            return (
              <circle
                key={index}
                cx={safeX}
                cy={safeY}
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
  // データが空またはundefinedの場合の処理
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    // データが1つの場合は中央に配置
    const x = data.length === 1 
      ? 160 // 中央の位置
      : (index / (data.length - 1)) * 280 + 20;
    const y = 180 - ((item.value - minValue) / range) * 140 + 20;
    
    // NaN チェック
    const safeX = isNaN(x) ? 160 : x;
    const safeY = isNaN(y) ? 100 : y;
    
    return `${safeX},${safeY}`;
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
            // データが1つの場合は中央に配置
            const x = data.length === 1 
              ? 160 // 中央の位置
              : (index / (data.length - 1)) * 280 + 20;
            const y = 180 - ((item.value - minValue) / range) * 140 + 20;
            
            // NaN チェック
            const safeX = isNaN(x) ? 160 : x;
            const safeY = isNaN(y) ? 100 : y;
            
            return (
              <g key={index}>
                <circle
                  cx={safeX}
                  cy={safeY}
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={safeX}
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
  const [plotInterval, setPlotInterval] = useState<PlotInterval>('day');

  // 現在の月の開始日と終了日を設定
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // 今月の開始日と終了日を設定
    const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endOfMonth = new Date(year, month, 0).getDate();
    const endOfMonthStr = `${year}-${month.toString().padStart(2, '0')}-${endOfMonth.toString().padStart(2, '0')}`;
    
    setStartDate(startOfMonth);
    setEndDate(endOfMonthStr);
  }, []);

  // 生データ（実際のアプリケーションではAPIから取得）
  const rawContractsData = [
    // 2024年8月のデータ
    { id: 'SY-2024-0001', customerName: '田中様', contractDate: '2024-08-05', amount: 95000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2024-0002', customerName: '佐藤様', contractDate: '2024-08-12', amount: 110000, truckType: '3t', status: '成約' },
    { id: 'SY-2024-0003', customerName: '高橋様', contractDate: '2024-08-19', amount: 80000, truckType: '2t', status: '成約' },
    { id: 'SY-2024-0004', customerName: '山田様', contractDate: '2024-08-26', amount: 125000, truckType: '4t', status: '成約' },
    
    // 2024年9月のデータ  
    { id: 'SY-2024-0005', customerName: '鈴木様', contractDate: '2024-09-03', amount: 90000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2024-0006', customerName: '中村様', contractDate: '2024-09-10', amount: 105000, truckType: '3t', status: '成約' },
    { id: 'SY-2024-0007', customerName: '小林様', contractDate: '2024-09-17', amount: 85000, truckType: '2t', status: '成約' },
    { id: 'SY-2024-0008', customerName: '加藤様', contractDate: '2024-09-24', amount: 115000, truckType: '3t', status: '成約' },
    
    // 2024年10月のデータ
    { id: 'SY-2024-0009', customerName: '伊藤様', contractDate: '2024-10-05', amount: 75000, truckType: '2t', status: '成約' },
    { id: 'SY-2024-0010', customerName: '渡辺様', contractDate: '2024-10-12', amount: 120000, truckType: '3t', status: '成約' },
    { id: 'SY-2024-0011', customerName: '斉藤様', contractDate: '2024-10-25', amount: 95000, truckType: '2tショート', status: '成約' },
    
    // 2024年11月のデータ
    { id: 'SY-2024-0012', customerName: '松本様', contractDate: '2024-11-02', amount: 85000, truckType: '2t', status: '成約' },
    { id: 'SY-2024-0013', customerName: '木村様', contractDate: '2024-11-08', amount: 110000, truckType: '3t', status: '成約' },
    { id: 'SY-2024-0014', customerName: '林様', contractDate: '2024-11-15', amount: 90000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2024-0015', customerName: '清水様', contractDate: '2024-11-22', amount: 105000, truckType: '3t', status: '成約' },
    
    // 2024年12月のデータ
    { id: 'SY-2024-0016', customerName: '山口様', contractDate: '2024-12-03', amount: 80000, truckType: '2t', status: '成約' },
    { id: 'SY-2024-0017', customerName: '阿部様', contractDate: '2024-12-10', amount: 125000, truckType: '4t', status: '成約' },
    { id: 'SY-2024-0018', customerName: '池田様', contractDate: '2024-12-18', amount: 95000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2024-0019', customerName: '橋本様', contractDate: '2024-12-25', amount: 115000, truckType: '3t', status: '成約' },
    
    // 2025年1月のデータ
    { id: 'SY-2025-0001', customerName: '山本様', contractDate: '2025-01-08', amount: 85000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2025-0002', customerName: '石川様', contractDate: '2025-01-15', amount: 120000, truckType: '3t', status: '成約' },
    { id: 'SY-2025-0003', customerName: '前田様', contractDate: '2025-01-22', amount: 75000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0004', customerName: '藤田様', contractDate: '2025-01-29', amount: 95000, truckType: '2tショート', status: '成約' },
    
    // 2025年2月のデータ
    { id: 'SY-2025-0005', customerName: '後藤様', contractDate: '2025-02-05', amount: 110000, truckType: '3t', status: '成約' },
    { id: 'SY-2025-0006', customerName: '岡田様', contractDate: '2025-02-12', amount: 90000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0007', customerName: '長谷川様', contractDate: '2025-02-19', amount: 105000, truckType: '3t', status: '成約' },
    { id: 'SY-2025-0008', customerName: '村上様', contractDate: '2025-02-26', amount: 80000, truckType: '2tショート', status: '成約' },
    
    // 2025年3月のデータ
    { id: 'SY-2025-0009', customerName: '近藤様', contractDate: '2025-03-05', amount: 135000, truckType: '4t', status: '成約' },
    { id: 'SY-2025-0010', customerName: '坂本様', contractDate: '2025-03-12', amount: 85000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0011', customerName: '遠藤様', contractDate: '2025-03-19', amount: 100000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2025-0012', customerName: '青木様', contractDate: '2025-03-26', amount: 115000, truckType: '3t', status: '成約' },
    
    // 2025年4月のデータ
    { id: 'SY-2025-0013', customerName: '森様', contractDate: '2025-04-02', amount: 90000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0014', customerName: '吉田様', contractDate: '2025-04-09', amount: 125000, truckType: '4t', status: '成約' },
    { id: 'SY-2025-0015', customerName: '福田様', contractDate: '2025-04-16', amount: 95000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2025-0016', customerName: '井上様', contractDate: '2025-04-23', amount: 110000, truckType: '3t', status: '成約' },
    
    // 2025年5月のデータ
    { id: 'SY-2025-0017', customerName: '西川様', contractDate: '2025-05-07', amount: 85000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0018', customerName: '竹内様', contractDate: '2025-05-14', amount: 105000, truckType: '3t', status: '成約' },
    { id: 'SY-2025-0019', customerName: '原田様', contractDate: '2025-05-21', amount: 120000, truckType: '4t', status: '成約' },
    { id: 'SY-2025-0020', customerName: '平野様', contractDate: '2025-05-28', amount: 80000, truckType: '2tショート', status: '成約' },
    
    // 2025年8月のデータ
    { id: 'SY-2025-0021', customerName: '内田様', contractDate: '2025-08-02', amount: 95000, truckType: '2tショート', status: '成約' },
    { id: 'SY-2025-0022', customerName: '小川様', contractDate: '2025-08-09', amount: 130000, truckType: '4t', status: '成約' },
    { id: 'SY-2025-0023', customerName: '永田様', contractDate: '2025-08-16', amount: 88000, truckType: '2t', status: '成約' },
    { id: 'SY-2025-0024', customerName: '宮本様', contractDate: '2025-08-23', amount: 112000, truckType: '3t', status: '成約' },
    { id: 'SY-2025-0025', customerName: '武田様', contractDate: '2025-08-30', amount: 98000, truckType: '2tショート', status: '成約' },
  ];

  // 期間フィルタリング関数
  const filterDataByPeriod = useMemo(() => {
    return (contracts: any[], startDate: string, endDate: string) => {
      if (!startDate || !endDate) {
        return contracts;
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return contracts.filter(contract => {
        const contractDate = new Date(contract.contractDate);
        return contractDate >= start && contractDate <= end;
      });
    };
  }, []);

  // 期間フィルタリングされたデータ
  const filteredContractsData = useMemo(() => {
    return filterDataByPeriod(rawContractsData, startDate, endDate);
  }, [rawContractsData, startDate, endDate, filterDataByPeriod]);

  // 動的KPI計算
  const calculatedKPIs = useMemo(() => {
    const totalContracts = filteredContractsData.length;
    const totalSales = filteredContractsData.reduce((sum, contract) => sum + contract.amount, 0);
    const averageValue = totalContracts > 0 ? Math.round(totalSales / totalContracts) : 0;
    
    // 成約率の計算（仮に問い合わせ数をベースに計算、実際はAPIから取得）
    const estimatedInquiries = Math.round(totalContracts * 2.5); // 仮の計算
    const contractRate = estimatedInquiries > 0 ? Number(((totalContracts / estimatedInquiries) * 100).toFixed(1)) : 0;
    
    return {
      contracts: totalContracts,
      contractRate,
      totalSales,
      averageValue
    };
  }, [filteredContractsData]);

  // データ集計関数
  const aggregateDataByInterval = useMemo(() => {
    return (contracts: any[], interval: PlotInterval) => {
      const aggregated = new Map();
      
      contracts.forEach(contract => {
        const date = new Date(contract.contractDate);
        let key: string;
        
        switch (interval) {
          case 'day':
            key = `${date.getMonth() + 1}/${date.getDate()}`;
            break;
          case 'week':
            // 週の開始日（月曜日）を計算
            const startOfWeek = new Date(date);
            const dayOfWeek = date.getDay(); // 0:日曜, 1:月曜, ..., 6:土曜
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 月曜日を起点とする
            startOfWeek.setDate(date.getDate() - mondayOffset);
            
            // 週の終了日（日曜日）を計算
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            // 週の日付範囲を表示用にフォーマット
            const startMonth = startOfWeek.getMonth() + 1;
            const startDay = startOfWeek.getDate();
            const endMonth = endOfWeek.getMonth() + 1;
            const endDay = endOfWeek.getDate();
            
            // 同月内の週か、月をまたぐ週かで表示を分ける
            if (startMonth === endMonth) {
              key = `${startMonth}/${startDay}-${endDay}`;
            } else {
              key = `${startMonth}/${startDay}-${endMonth}/${endDay}`;
            }
            break;
          case 'month':
            key = `${date.getFullYear()}/${date.getMonth() + 1}月`;
            break;
          case 'year':
            key = `${date.getFullYear()}年`;
            break;
          default:
            key = `${date.getMonth() + 1}/${date.getDate()}`;
        }
        
        if (!aggregated.has(key)) {
          aggregated.set(key, { contracts: 0, sales: 0 });
        }
        
        const current = aggregated.get(key);
        current.contracts += 1;
        current.sales += contract.amount;
      });
      
      // 週間隔の場合は時系列順にソート
      const result = Array.from(aggregated.entries()).map(([label, data]) => ({
        label,
        contracts: data.contracts,
        sales: data.sales
      }));
      
      if (interval === 'week') {
        // 週間隔の場合は、週の開始日でソート
        result.sort((a, b) => {
          const getWeekStartDate = (weekLabel: string) => {
            const parts = weekLabel.split('-')[0].split('/');
            const month = parseInt(parts[0], 10);
            const day = parseInt(parts[1], 10);
            return new Date(2025, month - 1, day); // 仮に2025年として計算
          };
          
          return getWeekStartDate(a.label).getTime() - getWeekStartDate(b.label).getTime();
        });
      } else if (interval === 'month') {
        // 月間隔の場合は年月でソート
        result.sort((a, b) => {
          const getMonthDate = (monthLabel: string) => {
            const parts = monthLabel.replace('月', '').split('/');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            return new Date(year, month - 1, 1);
          };
          
          return getMonthDate(a.label).getTime() - getMonthDate(b.label).getTime();
        });
      } else if (interval === 'year') {
        // 年間隔の場合は年でソート
        result.sort((a, b) => {
          const yearA = parseInt(a.label.replace('年', ''), 10);
          const yearB = parseInt(b.label.replace('年', ''), 10);
          return yearA - yearB;
        });
      }
      
      return result;
    };
  }, []);

  // 集計されたデータ（フィルタリング済み）
  const aggregatedData = useMemo(() => {
    return aggregateDataByInterval(filteredContractsData, plotInterval);
  }, [filteredContractsData, plotInterval, aggregateDataByInterval]);

  // グラフデータ
  const chartData = useMemo(() => {
    return aggregatedData.map(item => ({
      label: item.label,
      value: item.contracts
    }));
  }, [aggregatedData]);

  const salesData = useMemo(() => {
    return aggregatedData.map(item => ({
      label: item.label,
      value: item.sales
    }));
  }, [aggregatedData]);

  // 累計売上データ
  const cumulativeData = useMemo(() => {
    let cumulative = 0;
    return aggregatedData.map(item => {
      cumulative += item.sales;
      return {
        label: item.label,
        value: cumulative
      };
    });
  }, [aggregatedData]);

  // 間隔ラベル
  const getIntervalLabel = (interval: PlotInterval) => {
    switch (interval) {
      case 'day': return '日別';
      case 'week': return '週別';
      case 'month': return '月別';
      case 'year': return '年別';
      default: return '日別';
    }
  };

  // 表示用の契約データ（日付フォーマット調整）
  const contractsData = filteredContractsData.map(contract => ({
    ...contract,
    contractDate: contract.contractDate.replace(/-/g, '/')
  }));

  // 追加のグラフデータ（動的計算）
  const truckTypeData = useMemo(() => {
    const truckCounts = new Map();
    filteredContractsData.forEach(contract => {
      const type = contract.truckType;
      truckCounts.set(type, (truckCounts.get(type) || 0) + 1);
    });
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let colorIndex = 0;
    
    return Array.from(truckCounts.entries()).map(([type, count]) => ({
      label: type,
      value: count,
      color: colors[colorIndex++ % colors.length]
    }));
  }, [filteredContractsData]);

  const monthlyTrendData = useMemo(() => {
    // 全期間の月別トレンドデータ（年も考慮して動的生成）
    const months = [
      '2024/8月', '2024/9月', '2024/10月', '2024/11月', '2024/12月', 
      '2025/1月', '2025/2月', '2025/3月', '2025/4月', '2025/5月', '2025/8月'
    ];
    const monthCounts = new Map();
    
    filteredContractsData.forEach(contract => {
      const date = new Date(contract.contractDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}/${month}月`;
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    });
    
    return months.map(month => ({
      label: month,
      value: monthCounts.get(month) || 0
    })).filter(item => item.value > 0); // データがある月のみ表示
  }, [filteredContractsData]);

  const comboBarData = chartData;
  const comboLineData = salesData.map(item => ({
    label: item.label,
    value: item.value / 10000 // 万円単位に変換
  }));

  const handleFilterUpdate = () => {
    // フィルター更新処理（実際のアプリケーションでは API 呼び出し）
    console.log('フィルター更新:', startDate, endDate, plotInterval);
    console.log('フィルタリングされたデータ件数:', filteredContractsData.length);
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
            {/* 期間指定フィルター＆プロット間隔選択 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-6 flex-wrap">
                  {/* 期間指定 */}
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
                  
                  {/* プロット間隔選択 */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">📊 表示間隔：</label>
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                      {(['day', 'week', 'month', 'year'] as PlotInterval[]).map((interval) => (
                        <button
                          key={interval}
                          onClick={() => setPlotInterval(interval)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            plotInterval === interval
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                          }`}
                        >
                          {interval === 'day' && '日'}
                          {interval === 'week' && '週'}
                          {interval === 'month' && '月'}
                          {interval === 'year' && '年'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* アクションボタン */}
                  <div className="flex gap-2">
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
                
                {/* フィルタリング状況表示 */}
                <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📈 表示中のデータ:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                      {calculatedKPIs.contracts}件の成約
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">💰 期間売上:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-medium">
                      ¥{calculatedKPIs.totalSales.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📊 表示間隔:</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium">
                      {getIntervalLabel(plotInterval)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="成約件数"
                value={calculatedKPIs.contracts}
                unit="件"
                icon="✅"
                color="from-green-100 to-green-50 border-green-400"
              />
              <KPICard
                title="成約率"
                value={calculatedKPIs.contractRate}
                unit="%"
                icon="📈"
                color="from-blue-100 to-blue-50 border-blue-400"
              />
              <KPICard
                title="売上合計"
                value={`¥${calculatedKPIs.totalSales.toLocaleString()}`}
                unit=""
                icon="💰"
                color="from-yellow-100 to-yellow-50 border-yellow-400"
              />
              <KPICard
                title="平均単価"
                value={`¥${calculatedKPIs.averageValue.toLocaleString()}`}
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
                  title={`📊 成約件数の推移（${getIntervalLabel(plotInterval)}・棒グラフ）`}
                  data={chartData}
                  type="bar"
                />
                <LineChart
                  title={`💰 売上金額の推移（${getIntervalLabel(plotInterval)}・折れ線グラフ）`}
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
                  title={`📈 成約件数 vs 売上推移（${getIntervalLabel(plotInterval)}）`}
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
                  title={`💹 累計売上推移（${getIntervalLabel(plotInterval)}・エリアチャート）`}
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