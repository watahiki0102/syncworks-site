'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { UnifiedCase } from '@/types/common';
import { generateUnifiedTestData } from '../lib/unifiedData';
import { SourceType, getSourceTypeLabel, getManagementNumber } from '../lib/normalize';
import { formatCurrency } from '@/utils/format';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PerformancePage() {
  const [cases, setCases] = useState<UnifiedCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<UnifiedCase[]>([]);
  // 前月の月初と月末を計算
  const getPreviousMonthRange = () => {
    const now = new Date();
    console.log('現在の日付:', now);
    
    // 前月の月初（1日）を直接計算
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // 前月の月末（末日）を直接計算
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    
    console.log('前月の月初:', firstDay);
    console.log('前月の月末:', lastDay);
    
    const formatDate = (date: Date) => {
      // タイムゾーンの影響を避けるために手動でフォーマット
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const result = {
      start: formatDate(firstDay),
      end: formatDate(lastDay)
    };
    
    console.log('結果:', result);
    return result;
  };

  const previousMonthRange = getPreviousMonthRange();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(previousMonthRange.start);
  const [endDate, setEndDate] = useState(previousMonthRange.end);

  useEffect(() => {
    // 案件一覧と全く同じデータを使用
    const unifiedData = generateUnifiedTestData();
    // 支払対象一覧：ステータスが「受注」または「キャンセル」で仲介元がSyncMovingの場合のみ
    const paymentTargetCases = unifiedData.filter(c => 
      (c.status === '受注' || c.status === 'キャンセル') && 
      c.sourceType === 'syncmoving'
    );
    setCases(paymentTargetCases);
  }, []);

  useEffect(() => {
    const filtered = (cases || []).filter(caseItem => {
      // 検索条件（顧客名、依頼ID、管理ナンバー）
      if (searchTerm && 
          !caseItem.customer.customerName.includes(searchTerm) && 
          !caseItem.id.includes(searchTerm) &&
          !getManagementNumber(caseItem.sourceType, caseItem.id).includes(searchTerm)) {
        return false;
      }
      
      // 期間フィルター（引越し日でフィルタリング）
      if (startDate && caseItem.move.moveDate < startDate) {
        return false;
      }
      
      if (endDate && caseItem.move.moveDate > endDate) {
        return false;
      }
      
      return true;
    });

    setFilteredCases(filtered);
  }, [cases, searchTerm, startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 手数料を計算（受注金額の10%と仮定）
  const calculateCommission = (amount: number) => {
    return Math.round(amount * 0.1);
  };

  const calculateTotalRevenue = () => {
    return (filteredCases || []).reduce((total, caseItem) => {
      const amount = caseItem.amountWithTax || 0;
      return total + calculateCommission(amount);
    }, 0);
  };

  const calculateTotalContracts = () => {
    return (filteredCases || []).length;
  };

  const calculateTotalAmount = () => {
    return (filteredCases || []).reduce((total, caseItem) => total + (caseItem.amountWithTax || 0), 0);
  };


  // 仲介元別集計データを計算
  const calculateSourceTypeData = () => {
    const sourceStats: { [key: string]: { contracts: number; amount: number; revenue: number } } = {};
    
    (filteredCases || []).forEach(caseItem => {
      const sourceType = caseItem.sourceType;
      if (!sourceStats[sourceType]) {
        sourceStats[sourceType] = { contracts: 0, amount: 0, revenue: 0 };
      }
      sourceStats[sourceType].contracts += 1;
      const amount = caseItem.amountWithTax || 0;
      sourceStats[sourceType].amount += amount;
      sourceStats[sourceType].revenue += calculateCommission(amount);
    });
    
    return Object.entries(sourceStats);
  };

  return (
    <AdminAuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                絞込検索
              </label>
              <input
                id="search"
                type="text"
                placeholder="顧客名・依頼Noで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                期間指定
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 text-sm">〜</span>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
          </div>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)' }}>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">支払対象件数</h3>
            <p className="text-2xl font-bold text-blue-600">{calculateTotalContracts()}件</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">仲介手数料</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(calculateTotalRevenue())}</p>
          </div>
        </div>

        {/* 支払対象一覧テーブル */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    管理NO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    仲介元
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    引越日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    金額（税込）
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    仲介手数料
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 divide-y divide-gray-200">
                {(filteredCases || []).map((caseItem) => (
                  <tr key={caseItem.id} className="bg-white hover:bg-gray-100">
                    <td className="px-3 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                      {getManagementNumber(caseItem.sourceType, caseItem.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-block w-24 px-2 py-1 text-center text-gray-900"
                        style={{
                          fontSize: caseItem.sourceType === '外部' 
                            ? `clamp(0.5rem, ${24 / Math.max(getSourceTypeLabel(caseItem.sourceType).length, 1)}rem, 0.75rem)`
                            : '0.75rem'
                        }}
                      >
                        {getSourceTypeLabel(caseItem.sourceType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <span
                        style={{
                          fontSize: `clamp(0.625rem, ${32 / Math.max(caseItem.customer.customerName.length, 1)}rem, 0.875rem)`
                        }}
                      >
                        {caseItem.customer.customerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(caseItem.move.moveDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {caseItem.amountWithTax ? formatCurrency(caseItem.amountWithTax) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600">
                        {caseItem.amountWithTax ? formatCurrency(calculateCommission(caseItem.amountWithTax)) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge caseItem={caseItem} showDropdown={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
