'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { Contract } from '../types';
import { generateTestContract } from '@/constants/testData';

export default function PerformancePage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'internal' | 'external'>('all');

  useEffect(() => {
    // 共通テストデータから契約データを生成
    const demoContracts: Contract[] = [
      generateTestContract(0, 0, 0) as Contract,
      generateTestContract(1, 1, 1) as Contract,
      generateTestContract(2, 2, 2) as Contract,
      generateTestContract(3, 3, 3) as Contract,
      generateTestContract(4, 4, 4) as Contract
    ];

    setContracts(demoContracts);
  }, []);

  useEffect(() => {
    const filtered = contracts.filter(contract => {
      // 検索条件
      if (searchTerm && !contract.customerName.includes(searchTerm)) {
        return false;
      }
      
      // 期間フィルター
      if (startDate && contract.contractDate < startDate) {
        return false;
      }
      
      if (endDate && contract.contractDate > endDate) {
        return false;
      }
      
      // 業者フィルター
      if (serviceFilter !== 'all' && contract.serviceType !== serviceFilter) {
        return false;
      }
      
      return true;
    });

    setFilteredContracts(filtered);
  }, [contracts, searchTerm, startDate, endDate, serviceFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const calculateTotalRevenue = () => {
    return contracts.reduce((total, contract) => total + contract.revenue, 0);
  };

  const calculateTotalContracts = () => {
    return contracts.length;
  };

  const calculateTotalAmount = () => {
    return contracts.reduce((total, contract) => total + contract.contractAmount, 0);
  };

  return (
    <AdminAuthGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">成約管理実績</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                顧客名検索
              </label>
              <input
                id="search"
                type="text"
                placeholder="顧客名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                終了日
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="serviceFilter" className="block text-sm font-medium text-gray-700 mb-1">
                業者種別
              </label>
              <select
                id="serviceFilter"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value as 'all' | 'internal' | 'external')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全て</option>
                <option value="internal">自社サービス</option>
                <option value="external">他社サービス</option>
              </select>
            </div>
          </div>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">総成約数</h3>
            <p className="text-3xl font-bold text-blue-600">{calculateTotalContracts()}件</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">総成約金額</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(calculateTotalAmount())}</p>
            <p className="text-sm text-gray-500">(税込)</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">総手数料差引額</h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(calculateTotalRevenue())}</p>
            <p className="text-sm text-gray-500">(税込)</p>
          </div>
        </div>

        {/* 運用案内 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            ※ 詳細な月次集計や期間別分析については、集計管理画面でご確認いただけます。
          </p>
        </div>

        {/* 成約一覧 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">成約一覧</h2>
          </div>
          
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
                    手数料差引額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    業者種別
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contract.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(contract.contractDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(contract.moveDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(contract.contractAmount)}
                      </div>
                      <div className="text-xs text-gray-500">(税込)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(contract.commission)}
                      </div>
                      <div className="text-xs text-gray-500">(税込)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-purple-600">
                        {formatCurrency(contract.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">(税込)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contract.serviceType === 'internal' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {contract.serviceType === 'internal' ? '自社サービス' : '他社サービス'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 空の状態 */}
        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">成約データがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                成約が成立すると、ここに表示されます。
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
