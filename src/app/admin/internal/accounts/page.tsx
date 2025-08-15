'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { AccountRow } from '@/types/internal';

// モックデータ
const mockData: AccountRow[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: '管理者太郎',
    role: 'superadmin',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'マネージャー花子',
    role: 'manager',
    active: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'viewer@example.com',
    name: '閲覧者次郎',
    role: 'viewer',
    active: false,
    createdAt: '2024-02-01T00:00:00Z',
  },
];

export default function AccountsPage() {
  const [data, setData] = useState<AccountRow[]>(mockData);
  const [currentUserEmail, setCurrentUserEmail] = useState('admin@example.com'); // 実際は認証情報から取得

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const handleRoleChange = async (id: string, newRole: AccountRow['role']) => {
    const account = data.find(row => row.id === id);
    if (!account) return;

    // superadminの自己降格を防ぐ
    if (account.email === currentUserEmail && account.role === 'superadmin' && newRole !== 'superadmin') {
      alert('superadminの自身の権限を下げることはできません');
      return;
    }

    console.log('Role updated:', id, newRole);
    
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, role: newRole } : row
    ));
  };

  const handleActiveChange = async (id: string, newActive: boolean) => {
    const account = data.find(row => row.id === id);
    if (!account) return;

    // superadminの自己無効化を防ぐ
    if (account.email === currentUserEmail && account.role === 'superadmin' && !newActive) {
      alert('superadminの自身のアカウントを無効化することはできません');
      return;
    }

    console.log('Active status updated:', id, newActive);
    
    setData(prev => prev.map(row => 
      row.id === id ? { ...row, active: newActive } : row
    ));
  };

  return (
    <>
      {process.env.NODE_ENV === 'development' ? (
        <DevelopmentAuthGuard>
          <InternalGate>
            <InternalLayout>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              アカウント管理
            </h2>
            <p className="text-gray-600">
              管理者アカウントの権限・状態を管理します
            </p>
          </div>

          {/* テーブル */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      権限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row) => {
                    const isCurrentUser = row.email === currentUserEmail;
                    const isSuperAdmin = row.role === 'superadmin';
                    
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={row.role}
                            onChange={(e) => handleRoleChange(row.id, e.target.value as AccountRow['role'])}
                            disabled={isCurrentUser && isSuperAdmin}
                            className={`text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isCurrentUser && isSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="viewer">viewer</option>
                            <option value="manager">manager</option>
                            <option value="admin">admin</option>
                            <option value="superadmin">superadmin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={row.active}
                              onChange={(e) => handleActiveChange(row.id, e.target.checked)}
                              disabled={isCurrentUser && isSuperAdmin}
                              className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                                isCurrentUser && isSuperAdmin ? 'cursor-not-allowed' : ''
                              }`}
                            />
                            <span className="ml-2 text-sm text-gray-900">
                              {row.active ? '有効' : '無効'}
                            </span>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(row.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  注意事項
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>superadminの自身の権限を下げることはできません</li>
                    <li>superadminの自身のアカウントを無効化することはできません</li>
                  </ul>
                </div>
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
                   アカウント管理
                 </h2>
                 <p className="text-gray-600">
                   管理者アカウントの権限・状態を管理します
                 </p>
               </div>

               {/* テーブル */}
               <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           名前
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           メールアドレス
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           権限
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           状態
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           作成日
                         </th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {data.map((row) => {
                         const isCurrentUser = row.email === currentUserEmail;
                         const isSuperAdmin = row.role === 'superadmin';
                         
                         return (
                           <tr key={row.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                               {row.name}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {row.email}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <select
                                 value={row.role}
                                 onChange={(e) => handleRoleChange(row.id, e.target.value as AccountRow['role'])}
                                 disabled={isCurrentUser && isSuperAdmin}
                                 className={`text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                   isCurrentUser && isSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
                                 }`}
                               >
                                 <option value="viewer">viewer</option>
                                 <option value="manager">manager</option>
                                 <option value="admin">admin</option>
                                 <option value="superadmin">superadmin</option>
                               </select>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <label className="flex items-center">
                                 <input
                                   type="checkbox"
                                   checked={row.active}
                                   onChange={(e) => handleActiveChange(row.id, e.target.checked)}
                                   disabled={isCurrentUser && isSuperAdmin}
                                   className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                                     isCurrentUser && isSuperAdmin ? 'cursor-not-allowed' : ''
                                   }`}
                                 />
                                 <span className="ml-2 text-sm text-gray-900">
                                   {row.active ? '有効' : '無効'}
                                 </span>
                               </label>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {formatDate(row.createdAt)}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* 注意事項 */}
               <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                 <div className="flex">
                   <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <h3 className="text-sm font-medium text-yellow-800">
                       注意事項
                     </h3>
                     <div className="mt-2 text-sm text-yellow-700">
                       <ul className="list-disc pl-5 space-y-1">
                         <li>superadminの自身の権限を下げることはできません</li>
                         <li>superadminの自身のアカウントを無効化することはできません</li>
                       </ul>
                     </div>
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
