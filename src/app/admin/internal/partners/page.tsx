'use client';

import { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { PartnerRow } from '@/types/internal';
import { TEST_VENDORS } from '@/constants/testData';

// 共通データからパートナーデータを生成するヘルパー関数
const generateTestPartners = (): PartnerRow[] => {
  return [
    {
      id: '1',
      name: TEST_VENDORS[0].name, // ABC引越し
      type: '引越し業者',
      contact: 'contact@abc-hikkoshi.co.jp',
      active: true,
    },
    {
      id: '2',
      name: TEST_VENDORS[3].name, // 不動産サービスA
      type: '不動産会社',
      contact: 'info@fudosan-a.co.jp',
      active: true,
    },
    {
      id: '3',
      name: TEST_VENDORS[2].name, // QuickMove
      type: '引越し業者',
      contact: 'support@quickmove.co.jp',
      active: false,
    },
  ];
};

interface PartnerFormData {
  name: string;
  type: '引越し業者' | '不動産会社';
  contact: string;
  active: boolean;
}

export default function PartnersPage() {
  const [data, setData] = useState<PartnerRow[]>(generateTestPartners());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerRow | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    type: '引越し業者',
    contact: '',
    active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '引越し業者',
      contact: '',
      active: true,
    });
    setEditingPartner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (partner: PartnerRow) => {
    setFormData({
      name: partner.name,
      type: partner.type,
      contact: partner.contact,
      active: partner.active,
    });
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPartner) {
      // 編集
      console.log('Partner updated:', editingPartner.id, formData);
      setData(prev => prev.map(row => 
        row.id === editingPartner.id 
          ? { ...row, ...formData }
          : row
      ));
    } else {
      // 新規作成
      const newPartner: PartnerRow = {
        id: Date.now().toString(),
        ...formData,
      };
      console.log('Partner created:', newPartner);
      setData(prev => [...prev, newPartner]);
    }
    
    closeModal();
  };

  const handleActiveChange = async (id: string, newActive: boolean) => {
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  利用業者管理
                </h2>
                <p className="text-gray-600">
                  パートナー企業の登録・編集を行います
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                新規登録
              </button>
            </div>
          </div>

          {/* テーブル */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      業者名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      連絡先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={row.active}
                            onChange={(e) => handleActiveChange(row.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            {row.active ? '有効' : '無効'}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(row)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* モーダル */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingPartner ? '業者編集' : '新規業者登録'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        業者名 *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        種別 *
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as '引越し業者' | '不動産会社' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="引越し業者">引越し業者</option>
                        <option value="不動産会社">不動産会社</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        連絡先 *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contact}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">有効</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingPartner ? '更新' : '登録'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
                     )}
         </InternalLayout>
       </InternalGate>
         </DevelopmentAuthGuard>
       ) : (
         <AdminAuthGuard>
           <InternalGate>
             <InternalLayout>
               <div className="mb-8">
                 <div className="flex justify-between items-center">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">
                       利用業者管理
                     </h2>
                     <p className="text-gray-600">
                       パートナー企業の登録・編集を行います
                     </p>
                   </div>
                   <button
                     onClick={openCreateModal}
                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                   >
                     新規登録
                   </button>
                 </div>
               </div>

               {/* テーブル */}
               <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           業者名
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           種別
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           連絡先
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           状態
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           操作
                         </th>
                       </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                       {data.map((row) => (
                         <tr key={row.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                             {row.name}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {row.type}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {row.contact}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                             <label className="flex items-center">
                               <input
                                 type="checkbox"
                                 checked={row.active}
                                 onChange={(e) => handleActiveChange(row.id, e.target.checked)}
                                 className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                               />
                               <span className="ml-2 text-sm text-gray-900">
                                 {row.active ? '有効' : '無効'}
                               </span>
                             </label>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                             <button
                               onClick={() => openEditModal(row)}
                               className="text-blue-600 hover:text-blue-900"
                             >
                               編集
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* モーダル */}
               {isModalOpen && (
                 <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                   <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                     <div className="mt-3">
                       <h3 className="text-lg font-medium text-gray-900 mb-4">
                         {editingPartner ? '業者編集' : '新規業者登録'}
                       </h3>
                       <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             業者名 *
                           </label>
                           <input
                             type="text"
                             required
                             value={formData.name}
                             onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             種別 *
                           </label>
                           <select
                             required
                             value={formData.type}
                             onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as '引越し業者' | '不動産会社' }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             <option value="引越し業者">引越し業者</option>
                             <option value="不動産会社">不動産会社</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             連絡先 *
                           </label>
                           <input
                             type="email"
                             required
                             value={formData.contact}
                             onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                         <div>
                           <label className="flex items-center">
                             <input
                               type="checkbox"
                               checked={formData.active}
                               onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                             />
                             <span className="ml-2 text-sm text-gray-900">有効</span>
                           </label>
                         </div>
                         <div className="flex justify-end space-x-3 pt-4">
                           <button
                             type="button"
                             onClick={closeModal}
                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                           >
                             キャンセル
                           </button>
                           <button
                             type="submit"
                             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                           >
                             {editingPartner ? '更新' : '登録'}
                           </button>
                         </div>
                       </form>
                     </div>
                   </div>
                 </div>
               )}
             </InternalLayout>
           </InternalGate>
         </AdminAuthGuard>
       )}
     </>
   );
 }
