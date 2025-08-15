'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { InvoiceRow } from '@/types/internal';

// モックデータ
const mockData: InvoiceRow[] = [
  {
    id: '1',
    partnerId: '1',
    partnerName: '株式会社引越しプロ',
    billMonth: '2024-01',
    totalInclTax: 150000,
    issued: true,
    paid: false,
  },
  {
    id: '2',
    partnerId: '2',
    partnerName: '不動産サービスA',
    billMonth: '2024-01',
    totalInclTax: 85000,
    issued: true,
    paid: true,
  },
  {
    id: '3',
    partnerId: '1',
    partnerName: '株式会社引越しプロ',
    billMonth: '2024-02',
    totalInclTax: 180000,
    issued: false,
    paid: false,
  },
];

export default function InvoicesPage() {
  const [data, setData] = useState<InvoiceRow[]>(mockData);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterPartner, setFilterPartner] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const handleIssueInvoice = async (id: string) => {
    console.log('Invoice issued:', id);
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, issued: true } : row
    ));
  };

  const handleMarkPaid = async (id: string) => {
    console.log('Invoice marked as paid:', id);
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, paid: true } : row
    ));
  };

  const filteredData = data.filter(row => {
    if (filterMonth && row.billMonth !== filterMonth) return false;
    if (filterPartner && !row.partnerName.includes(filterPartner)) return false;
    return true;
  });

  const uniqueMonths = [...new Set(data.map(row => row.billMonth))].sort().reverse();
  const uniquePartners = [...new Set(data.map(row => row.partnerName))].sort();

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
              請求書発行・入金状況を管理します
            </p>
          </div>

          {/* フィルター */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  請求月
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
                      請求月
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額（税込）
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求書発行
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      入金状況
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
                        {row.billMonth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(row.totalInclTax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.issued
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.issued ? '発行済' : '未発行'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.paid
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {row.paid ? '入金済' : '未入金'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {!row.issued && (
                          <button
                            onClick={() => handleIssueInvoice(row.id)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                          >
                            請求書発行
                          </button>
                        )}
                        {row.issued && !row.paid && (
                          <button
                            onClick={() => handleMarkPaid(row.id)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                          >
                            入金済み
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">総請求件数</div>
              <div className="text-2xl font-bold text-gray-900">{filteredData.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">未発行</div>
              <div className="text-2xl font-bold text-yellow-600">
                {filteredData.filter(row => !row.issued).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm font-medium text-gray-500">未入金</div>
              <div className="text-2xl font-bold text-red-600">
                {filteredData.filter(row => row.issued && !row.paid).length}
              </div>
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
                   請求書発行・入金状況を管理します
                 </p>
               </div>

               {/* フィルター */}
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       請求月
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
                           請求月
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           金額（税込）
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           請求書発行
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           入金状況
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
                             {row.billMonth}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                             {formatCurrency(row.totalInclTax)}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               row.issued
                                 ? 'bg-green-100 text-green-800'
                                 : 'bg-gray-100 text-gray-800'
                             }`}>
                               {row.issued ? '発行済' : '未発行'}
                             </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                               row.paid
                                 ? 'bg-blue-100 text-blue-800'
                                 : 'bg-yellow-100 text-yellow-800'
                             }`}>
                               {row.paid ? '入金済' : '未入金'}
                             </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                             {!row.issued && (
                               <button
                                 onClick={() => handleIssueInvoice(row.id)}
                                 className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs"
                               >
                                 請求書発行
                               </button>
                             )}
                             {row.issued && !row.paid && (
                               <button
                                 onClick={() => handleMarkPaid(row.id)}
                                 className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs"
                               >
                                 入金済み
                               </button>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* 統計情報 */}
               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                   <div className="text-sm font-medium text-gray-500">総請求件数</div>
                   <div className="text-2xl font-bold text-gray-900">{filteredData.length}</div>
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                   <div className="text-sm font-medium text-gray-500">未発行</div>
                   <div className="text-2xl font-bold text-yellow-600">
                     {filteredData.filter(row => !row.issued).length}
                   </div>
                 </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                   <div className="text-sm font-medium text-gray-500">未入金</div>
                   <div className="text-2xl font-bold text-red-600">
                     {filteredData.filter(row => row.issued && !row.paid).length}
                   </div>
                 </div>
               </div>
             </InternalLayout>
           </InternalGate>
         </AdminAuthGuard>
       )}
     </>
   );
 }
