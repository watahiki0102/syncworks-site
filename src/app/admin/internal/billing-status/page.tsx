'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { BillingStatusRow } from '@/types/internal';

// モックデータ
const mockData: BillingStatusRow[] = [
  {
    id: '1',
    partnerName: '株式会社引越しプロ',
    month: '2024-01',
    amountInclTax: 150000,
    status: '未請求',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    partnerName: '不動産サービスA',
    month: '2024-01',
    amountInclTax: 85000,
    status: '請求済',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
    partnerName: '株式会社引越しプロ',
    month: '2024-02',
    amountInclTax: 180000,
    status: '入金待ち',
    updatedAt: '2024-02-01T09:15:00Z',
  },
];

export default function BillingStatusPage() {
  const [data, setData] = useState<BillingStatusRow[]>(mockData);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterPartner, setFilterPartner] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const handleStatusChange = async (id: string, newStatus: BillingStatusRow['status']) => {
    // 実際のAPI呼び出し
    console.log('Status updated:', id, newStatus);
    
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, status: newStatus, updatedAt: new Date().toISOString() } : row
    ));
  };

  const filteredData = data.filter(row => {
    if (filterMonth && row.month !== filterMonth) return false;
    if (filterPartner && !row.partnerName.includes(filterPartner)) return false;
    return true;
  });

  const uniqueMonths = [...new Set(data.map(row => row.month))].sort().reverse();
  const uniquePartners = [...new Set(data.map(row => row.partnerName))].sort();

  return (
    <>
      {process.env.NODE_ENV === 'development' ? (
        <DevelopmentAuthGuard>
          <InternalGate>
            <InternalLayout>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              請求状況管理
            </h2>
            <p className="text-gray-600">
              パートナー別の請求状況を管理します
            </p>
          </div>

          {/* フィルター */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {uniqueMonths.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パートナー
                </label>
                <select
                  value={filterPartner}
                  onChange={(e) => setFilterPartner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべて</option>
                  {uniquePartners.map(partner => (
                    <option key={partner} value={partner}>{partner}</option>
                  ))}
                </select>
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
                      月
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額（税込）
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新日時
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
                          onChange={(e) => handleStatusChange(row.id, e.target.value as BillingStatusRow['status'])}
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
                        {formatDate(row.updatedAt)}
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
                   請求状況管理
                 </h2>
                 <p className="text-gray-600">
                   パートナー別の請求状況を管理します
                 </p>
               </div>

               {/* フィルター */}
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       月
                     </label>
                     <select
                       value={filterMonth}
                       onChange={(e) => setFilterMonth(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="">すべて</option>
                       {uniqueMonths.map(month => (
                         <option key={month} value={month}>{month}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       パートナー
                     </label>
                     <select
                       value={filterPartner}
                       onChange={(e) => setFilterPartner(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="">すべて</option>
                       {uniquePartners.map(partner => (
                         <option key={partner} value={partner}>{partner}</option>
                       ))}
                     </select>
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
                           月
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           金額（税込）
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           ステータス
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           更新日時
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
                               onChange={(e) => handleStatusChange(row.id, e.target.value as BillingStatusRow['status'])}
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
                             {formatDate(row.updatedAt)}
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
