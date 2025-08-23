'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import TrendsChart from './components/TrendsChart';
import PieRatio from './components/PieRatio';
import { formatCurrencyJPY } from '@/utils/format';


// プロット間隔の型定義
type PlotInterval = 'month' | 'year';

// 統一されたKPIカードコンポーネント
function KPICard({ title, value, unit, icon }: {
  title: string;
  value: number | string;
  unit: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-sm text-gray-600 font-medium">{title}</div>
          <div className="text-2xl font-bold text-gray-900">
            {value}{unit && <span className="text-sm font-medium text-gray-600 ml-1">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// 簡潔な案件概要コンポーネント
function ContractSummary({ totalContracts, totalSales }: { 
  totalContracts: number; 
  totalSales: number; 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 成約実績概要</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalContracts}</div>
          <div className="text-sm text-gray-600">総成約件数</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">¥{totalSales.toLocaleString()}</div>
          <div className="text-sm text-gray-600">総売上金額</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const router = useRouter();
  const [plotInterval, setPlotInterval] = useState<PlotInterval>('month');

  // 生データ（実際のアプリケーションではAPIから取得）
  const rawContractsData = useMemo(() => [
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
  ], []);

  // シンプルなKPI計算
  const calculatedKPIs = useMemo(() => {
    const totalContracts = rawContractsData.length;
    const totalSales = rawContractsData.reduce((sum, contract) => sum + contract.amount, 0);
    const averageValue = totalContracts > 0 ? Math.round(totalSales / totalContracts) : 0;
    const contractRate = 42.5; // 固定値として表示
    
    return {
      contracts: totalContracts,
      contractRate,
      totalSales,
      averageValue
    };
  }, [rawContractsData]);

  // シンプルなデータ集計関数
  const aggregateDataByInterval = useMemo(() => {
    return (contracts: any[], interval: PlotInterval) => {
      const aggregated = new Map();
      
      contracts.forEach(contract => {
        const date = new Date(contract.contractDate);
        let key: string;
        
        if (interval === 'month') {
          key = `${date.getFullYear()}/${date.getMonth() + 1}月`;
        } else {
          key = `${date.getFullYear()}年`;
        }
        
        if (!aggregated.has(key)) {
          aggregated.set(key, { contracts: 0, sales: 0 });
        }
        
        const current = aggregated.get(key);
        current.contracts += 1;
        current.sales += contract.amount;
      });
      
      const result = Array.from(aggregated.entries()).map(([label, data]) => ({
        label,
        contracts: data.contracts,
        sales: data.sales
      }));
      
      // 時系列順にソート
      result.sort((a, b) => {
        if (interval === 'month') {
          const getMonthDate = (monthLabel: string) => {
            const parts = monthLabel.replace('月', '').split('/');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            return new Date(year, month - 1, 1);
          };
          return getMonthDate(a.label).getTime() - getMonthDate(b.label).getTime();
        } else {
          const yearA = parseInt(a.label.replace('年', ''), 10);
          const yearB = parseInt(b.label.replace('年', ''), 10);
          return yearA - yearB;
        }
      });
      
      return result;
    };
  }, []);

  // 集計されたデータ
  const aggregatedData = useMemo(() => {
    return aggregateDataByInterval(rawContractsData, plotInterval);
  }, [rawContractsData, plotInterval, aggregateDataByInterval]);

  // 統一されたチャートデータ
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

  // トラック種別データ（簡素化）
  const truckTypeData = useMemo(() => {
    const truckCounts = new Map();
    rawContractsData.forEach(contract => {
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
  }, [rawContractsData]);

  // 間隔ラベル
  const getIntervalLabel = (interval: PlotInterval) => {
    return interval === 'month' ? '月別' : '年別';
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📊 成約実績管理</h1>
                <p className="text-sm text-gray-600 mt-1">
                  引越し成約件数と売上実績の確認
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ダッシュボードに戻る
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* 表示間隔選択 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">データ表示設定</h3>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">表示間隔:</label>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(['month', 'year'] as PlotInterval[]).map((interval) => (
                      <button
                        key={interval}
                        onClick={() => setPlotInterval(interval)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          plotInterval === interval
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                        }`}
                      >
                        {interval === 'month' && '月別'}
                        {interval === 'year' && '年別'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="総成約件数"
                value={calculatedKPIs.contracts}
                unit="件"
                icon="✅"
              />
              <KPICard
                title="成約率"
                value={calculatedKPIs.contractRate}
                unit="%"
                icon="📈"
              />
              <KPICard
                title="売上合計"
                value={formatCurrencyJPY(calculatedKPIs.totalSales)}
                unit=""
                icon="💰"
              />
              <KPICard
                title="平均単価"
                value={formatCurrencyJPY(calculatedKPIs.averageValue)}
                unit=""
                icon="📊"
              />
            </div>

            {/* 統一されたグラフ表示 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 成約件数推移 */}
              <TrendsChart
                title={`📊 成約件数推移（${getIntervalLabel(plotInterval)}）`}
                data={chartData}
                type="line"
                valueFormatter={(value) => `${value}件`}
              />
              
              {/* 売上推移 */}
              <TrendsChart
                title={`💰 売上推移（${getIntervalLabel(plotInterval)}）`}
                data={salesData}
                type="line"
                valueFormatter={(value) => formatCurrencyJPY(value)}
              />
            </div>

            {/* トラック種別割合 */}
            <PieRatio
              title="🚚 利用トラック種別の内訳"
              data={truckTypeData}
            />

            {/* 成約実績概要 */}
            <ContractSummary 
              totalContracts={calculatedKPIs.contracts}
              totalSales={calculatedKPIs.totalSales}
            />
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 