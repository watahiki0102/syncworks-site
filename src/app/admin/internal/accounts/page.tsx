'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { AccountRow } from '@/types/internal';
import { fetchUsers, updateUser } from '@/lib/api/users';
import { User } from '@/types/user';

/**
 * User型をAccountRow型に変換
 * 注意: permissionsフィールドはusersテーブルに存在しないため、デフォルト値を設定
 */
function mapUserToAccountRow(user: User): AccountRow {
  return {
    id: user.id,
    email: user.email,
    name: user.displayName || user.email,
    role: user.role as AccountRow['role'],
    permissions: {
      // デフォルトの権限設定（将来的には別テーブルで管理）
      billingManagement: user.role === 'admin' || user.role === 'superadmin',
      accountManagement: user.role === 'superadmin',
      partnerManagement: user.role === 'admin' || user.role === 'superadmin',
      contactManagement: true,
      newsManagement: user.role === 'admin' || user.role === 'superadmin',
    },
    active: user.isActive,
    createdAt: user.createdAt,
  };
}

export default function AccountsPage() {
  const [data, setData] = useState<AccountRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  // 現在のユーザー情報を取得
  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setCurrentUserEmail(email);
    }
  }, []);

  // ユーザー一覧を取得
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await fetchUsers({ is_active: true });
        const accountRows = users.map(mapUserToAccountRow);
        setData(accountRows);
      } catch (err) {
        console.error('ユーザー一覧の取得に失敗しました:', err);
        setError('ユーザー一覧の取得に失敗しました。再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const handleRoleChange = async (id: string, newRole: AccountRow['role']) => {
    const account = data.find(row => row.id === id);
    if (!account) {return;}

    // superadminの自己降格を防ぐ
    if (account.email === currentUserEmail && account.role === 'superadmin' && newRole !== 'superadmin') {
      alert('superadminの自身の権限を下げることはできません');
      return;
    }

    try {
      // APIでユーザー情報を更新
      await updateUser(id, { role: newRole });
      
      // ローカル状態を更新
      setData(prev => prev.map(row =>
        row.id === id ? { ...row, role: newRole } : row
      ));
    } catch (err) {
      console.error('権限の更新に失敗しました:', err);
      alert('権限の更新に失敗しました。再度お試しください。');
    }
  };

  const handlePermissionChange = async (id: string, permission: keyof AccountRow['permissions'], value: boolean) => {
    const account = data.find(row => row.id === id);
    if (!account) {return;}

    // superadminの自己権限変更を防ぐ
    if (account.email === currentUserEmail && account.role === 'superadmin') {
      alert('superadminの自身の権限を変更することはできません');
      return;
    }

    setData(prev => prev.map(row =>
      row.id === id ? {
        ...row,
        permissions: { ...row.permissions, [permission]: value }
      } : row
    ));
  };

  const handleActiveChange = async (id: string, newActive: boolean) => {
    const account = data.find(row => row.id === id);
    if (!account) {return;}

    // superadminの自己無効化を防ぐ
    if (account.email === currentUserEmail && account.role === 'superadmin' && !newActive) {
      alert('superadminの自身のアカウントを無効化することはできません');
      return;
    }
    
    try {
      // APIでユーザー情報を更新
      await updateUser(id, { is_active: newActive });
      
      // ローカル状態を更新
      setData(prev => prev.map(row => 
        row.id === id ? { ...row, active: newActive } : row
      ));
    } catch (err) {
      console.error('アカウント状態の更新に失敗しました:', err);
      alert('アカウント状態の更新に失敗しました。再度お試しください。');
    }
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

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* ローディング状態 */}
          {isLoading ? (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">ユーザー一覧を読み込み中...</p>
            </div>
          ) : (
          /* テーブル */
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
                      個別権限
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
                          <div className="space-y-1">
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={row.permissions.billingManagement}
                                onChange={(e) => handlePermissionChange(row.id, 'billingManagement', e.target.checked)}
                                disabled={isCurrentUser && isSuperAdmin}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                              />
                              請求管理
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={row.permissions.accountManagement}
                                onChange={(e) => handlePermissionChange(row.id, 'accountManagement', e.target.checked)}
                                disabled={isCurrentUser && isSuperAdmin}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                              />
                              アカウント管理
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={row.permissions.partnerManagement}
                                onChange={(e) => handlePermissionChange(row.id, 'partnerManagement', e.target.checked)}
                                disabled={isCurrentUser && isSuperAdmin}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                              />
                              利用業者管理
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={row.permissions.contactManagement}
                                onChange={(e) => handlePermissionChange(row.id, 'contactManagement', e.target.checked)}
                                disabled={isCurrentUser && isSuperAdmin}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                              />
                              お問い合わせ管理
                            </label>
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={row.permissions.newsManagement}
                                onChange={(e) => handlePermissionChange(row.id, 'newsManagement', e.target.checked)}
                                disabled={isCurrentUser && isSuperAdmin}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                              />
                              ニュース管理
                            </label>
                          </div>
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
          )}

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

               {/* エラーメッセージ */}
               {error && (
                 <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                   <p className="text-sm text-red-800">{error}</p>
                 </div>
               )}

               {/* ローディング状態 */}
               {isLoading ? (
                 <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8 text-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                   <p className="mt-4 text-gray-600">ユーザー一覧を読み込み中...</p>
                 </div>
               ) : (
               /* テーブル */
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
                           個別権限
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
                               <div className="space-y-1">
                                 <label className="flex items-center text-xs">
                                   <input
                                     type="checkbox"
                                     checked={row.permissions.billingManagement}
                                     onChange={(e) => handlePermissionChange(row.id, 'billingManagement', e.target.checked)}
                                     disabled={isCurrentUser && isSuperAdmin}
                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                                   />
                                   請求管理
                                 </label>
                                 <label className="flex items-center text-xs">
                                   <input
                                     type="checkbox"
                                     checked={row.permissions.accountManagement}
                                     onChange={(e) => handlePermissionChange(row.id, 'accountManagement', e.target.checked)}
                                     disabled={isCurrentUser && isSuperAdmin}
                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                                   />
                                   アカウント管理
                                 </label>
                                 <label className="flex items-center text-xs">
                                   <input
                                     type="checkbox"
                                     checked={row.permissions.partnerManagement}
                                     onChange={(e) => handlePermissionChange(row.id, 'partnerManagement', e.target.checked)}
                                     disabled={isCurrentUser && isSuperAdmin}
                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                                   />
                                   利用業者管理
                                 </label>
                                 <label className="flex items-center text-xs">
                                   <input
                                     type="checkbox"
                                     checked={row.permissions.contactManagement}
                                     onChange={(e) => handlePermissionChange(row.id, 'contactManagement', e.target.checked)}
                                     disabled={isCurrentUser && isSuperAdmin}
                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                                   />
                                   お問い合わせ管理
                                 </label>
                                 <label className="flex items-center text-xs">
                                   <input
                                     type="checkbox"
                                     checked={row.permissions.newsManagement}
                                     onChange={(e) => handlePermissionChange(row.id, 'newsManagement', e.target.checked)}
                                     disabled={isCurrentUser && isSuperAdmin}
                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                                   />
                                   ニュース管理
                                 </label>
                               </div>
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
               )}

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
