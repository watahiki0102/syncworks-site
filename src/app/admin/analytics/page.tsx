'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import ExpensesForm from './components/ExpensesForm';
import TrendsChart from './components/TrendsChart';
import PieRatio from './components/PieRatio';
import TruckUtilizationPie from './components/TruckUtilizationPie';
import SectionHeader from './components/SectionHeader';
import { DailyMetric, DailyMetricBySource, TruckTypeRatio, SourceTypeCode } from '@/types/analytics';
import { formatCurrencyJPY, formatLaborHours } from '@/utils/format';

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

export default function AdminAnalytics() {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [plotInterval, setPlotInterval] = useState<PlotInterval>('day');
  const [selectedSource, setSelectedSource] = useState<SourceTypeCode>('syncmoving');

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
    return (contracts: any[], interval: PlotInterval, startDate?: string, endDate?: string) => {
      const aggregated = new Map();
      
      // 期間の開始日と終了日
      const periodStart = startDate ? new Date(startDate) : null;
      const periodEnd = endDate ? new Date(endDate) : null;
      
      contracts.forEach(contract => {
        const date = new Date(contract.contractDate);
        let key: string;
        
        switch (interval) {
          case 'day':
            key = `${date.getMonth() + 1}/${date.getDate()}`;
            break;
          case 'week':
            // 期間開始日を基準にした週間隔を計算
            if (periodStart) {
              // 契約日と期間開始日の差を計算
              const diffTime = date.getTime() - periodStart.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              
              // 7日刻みでどの週に属するかを計算
              const weekNumber = Math.floor(diffDays / 7);
              
              // その週の開始日と終了日を計算
              const weekStart = new Date(periodStart);
              weekStart.setDate(periodStart.getDate() + (weekNumber * 7));
              
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
              
              // 期間終了日を超えないように調整
              if (periodEnd && weekEnd > periodEnd) {
                weekEnd.setTime(periodEnd.getTime());
              }
              
              // 週の日付範囲を表示用にフォーマット
              const startMonth = weekStart.getMonth() + 1;
              const startDay = weekStart.getDate();
              const endMonth = weekEnd.getMonth() + 1;
              const endDay = weekEnd.getDate();
              
              // 同月内の週か、月をまたぐ週かで表示を分ける
              if (startMonth === endMonth) {
                key = `${startMonth}/${startDay}-${endDay}`;
              } else {
                key = `${startMonth}/${startDay}-${endMonth}/${endDay}`;
              }
            } else {
              // 期間指定がない場合は従来の月曜日ベース
              const startOfWeek = new Date(date);
              const dayOfWeek = date.getDay();
              const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              startOfWeek.setDate(date.getDate() - mondayOffset);
              
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              
              const startMonth = startOfWeek.getMonth() + 1;
              const startDay = startOfWeek.getDate();
              const endMonth = endOfWeek.getMonth() + 1;
              const endDay = endOfWeek.getDate();
              
              if (startMonth === endMonth) {
                key = `${startMonth}/${startDay}-${endDay}`;
              } else {
                key = `${startMonth}/${startDay}-${endMonth}/${endDay}`;
              }
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
            // 現在の年度を基準にする（より正確にするため）
            const currentYear = periodStart ? periodStart.getFullYear() : new Date().getFullYear();
            return new Date(currentYear, month - 1, day);
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
    return aggregateDataByInterval(filteredContractsData, plotInterval, startDate, endDate);
  }, [filteredContractsData, plotInterval, startDate, endDate, aggregateDataByInterval]);

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

  // 経費作成後の処理
  const handleExpenseCreated = () => {
    // 経費が作成された後の処理（必要に応じてデータを再取得）
    console.log('経費が作成されました');
  };

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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📊 集計管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  成約率・売上などのKPI分析
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  トップに戻る
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* 経費入力フォーム */}
            <ExpensesForm onExpenseCreated={handleExpenseCreated} />

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
              {/* 1行目: 成約件数推移（全体） */}
              <div className="grid grid-cols-1 gap-6">
                <TrendsChart
                  title={`📊 成約件数の推移（全体・${getIntervalLabel(plotInterval)}）`}
                  data={chartData}
                  type="line"
                  valueFormatter={(value) => `${value}件`}
                />
              </div>

              {/* 2行目: 対応/売上/コスト推移 */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <SectionHeader title="📈 対応/売上/コスト 推移">
                    <div className="text-sm text-gray-600">
                      対応件数（棒）・売上（折れ線）・コスト（折れ線）
                    </div>
                  </SectionHeader>
                  <div className="h-80">
                    <TrendsChart
                      title=""
                      data={chartData}
                      type="combo"
                      height={320}
                    />
                  </div>
                </div>
              </div>

              {/* 3行目: トラック種別割合とトラック稼働状況 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieRatio
                  title="🚚 トラック種別の割合"
                  data={truckTypeData}
                />
                <TruckUtilizationPie />
              </div>

              {/* 4行目: 成約件数推移（媒体別） */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <SectionHeader title="📊 成約件数 推移（媒体別）">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">媒体:</label>
                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value as SourceTypeCode)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="syncmoving">syncmoving</option>
                        <option value="他社サービス">他社サービス</option>
                        <option value="手動">手動</option>
                      </select>
                    </div>
                  </SectionHeader>
                  <div className="h-80">
                    <TrendsChart
                      title=""
                      data={chartData} // 実際は fetchDailyMetricsBySource(selectedSource) の結果を使用
                      type="line"
                      height={320}
                      valueFormatter={(value) => `${value}件`}
                    />
                  </div>
                </div>
              </div>

              {/* 5行目: その他の分析グラフ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TrendsChart
                  title="📈 月別成約件数トレンド"
                  data={monthlyTrendData}
                  type="line"
                  valueFormatter={(value) => `${value}件`}
                />
                <TrendsChart
                  title={`💹 累計売上推移（${getIntervalLabel(plotInterval)}）`}
                  data={cumulativeData}
                  type="line"
                  valueFormatter={(value) => formatCurrencyJPY(value)}
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