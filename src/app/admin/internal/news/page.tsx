'use client';

import { useState } from 'react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from '../InternalLayout';
import { NewsItem } from '@/types/internal';
import { TEST_NEWS } from '@/constants/testData';

// 共通データからニュースデータを生成するヘルパー関数
const generateTestNews = (): NewsItem[] => {
  return [
    {
      id: '1',
      title: TEST_NEWS[0].title, // 案件管理システムUI刷新
      body: TEST_NEWS[0].content,
      published: true,
      publishedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      title: TEST_NEWS[1].title, // 配車効率20%向上を達成
      body: TEST_NEWS[1].content,
      published: true,
      publishedAt: '2024-01-10T14:30:00Z',
    },
    {
      id: '3',
      title: TEST_NEWS[2].title, // シフト自動調整機能を追加
      body: TEST_NEWS[2].content,
      published: false,
    },
  ];
};

interface NewsFormData {
  title: string;
  body: string;
  published: boolean;
}

export default function NewsPage() {
  const [data, setData] = useState<NewsItem[]>(generateTestNews());
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    body: '',
    published: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      published: false,
    });
    setSelectedNews(null);
    setIsCreating(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEditForm = (news: NewsItem) => {
    setFormData({
      title: news.title,
      body: news.body,
      published: news.published,
    });
    setSelectedNews(news);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) {
      // 新規作成
      const newNews: NewsItem = {
        id: Date.now().toString(),
        ...formData,
        publishedAt: formData.published ? new Date().toISOString() : undefined,
      };
      setData(prev => [...prev, newNews]);
    } else if (selectedNews) {
      // 編集
      const updatedNews: NewsItem = {
        ...selectedNews,
        ...formData,
        publishedAt: formData.published && !selectedNews.publishedAt
          ? new Date().toISOString()
          : selectedNews.publishedAt,
      };
      setData(prev => prev.map(row =>
        row.id === selectedNews.id ? updatedNews : row
      ));
    }

    resetForm();
  };

  const handlePublishedChange = async (id: string, newPublished: boolean) => {
    setData(prev => prev.map(row =>
      row.id === id
        ? {
            ...row,
            published: newPublished,
            publishedAt: newPublished && !row.publishedAt ? new Date().toISOString() : row.publishedAt
          }
        : row
    ));
  };

  const handleDelete = async (id: string) => {
    if (confirm('このニュースを削除しますか？')) {
      setData(prev => prev.filter(row => row.id !== id));
      if (selectedNews?.id === id) {
        resetForm();
      }
    }
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
                  ニュース編集
                </h2>
                <p className="text-gray-600">
                  サイト内ニュースの編集・公開管理を行います
                </p>
              </div>
              <button
                onClick={openCreateForm}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                新規作成
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：ニュース一覧 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">ニュース一覧</h3>
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タイトル
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          公開状態
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          公開日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((row) => (
                        <tr 
                          key={row.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedNews?.id === row.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => openEditForm(row)}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                            <div className="truncate" title={row.title}>
                              {row.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {row.published ? '公開' : '下書き'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(row.publishedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePublishedChange(row.id, !row.published);
                              }}
                              className={`px-2 py-1 rounded text-xs ${
                                row.published
                                  ? 'text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100'
                                  : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                              }`}
                            >
                              {row.published ? '非公開' : '公開'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(row.id);
                              }}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 右側：編集フォーム */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isCreating ? '新規作成' : selectedNews ? '編集' : 'ニュースを選択してください'}
              </h3>
              
              {(isCreating || selectedNews) && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        タイトル *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        本文 *
                      </label>
                      <textarea
                        required
                        rows={8}
                        value={formData.body}
                        onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.published}
                          onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900">公開する</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isCreating ? '作成' : '更新'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {!isCreating && !selectedNews && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <div className="text-gray-500">
                    左側のニュースをクリックして編集するか、新規作成ボタンで新しいニュースを作成してください
                  </div>
                </div>
              )}
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
                 <div className="flex justify-between items-center">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">
                       ニュース編集
                     </h2>
                     <p className="text-gray-600">
                       サイト内ニュースの編集・公開管理を行います
                     </p>
                   </div>
                   <button
                     onClick={openCreateForm}
                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                   >
                     新規作成
                   </button>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* 左側：ニュース一覧 */}
                 <div>
                   <h3 className="text-lg font-medium text-gray-900 mb-4">ニュース一覧</h3>
                   <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                     <div className="overflow-x-auto">
                       <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                           <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               タイトル
                             </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               公開状態
                             </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               公開日
                             </th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                               操作
                             </th>
                           </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                           {data.map((row) => (
                             <tr 
                               key={row.id} 
                               className={`hover:bg-gray-50 cursor-pointer ${
                                 selectedNews?.id === row.id ? 'bg-blue-50' : ''
                               }`}
                               onClick={() => openEditForm(row)}
                             >
                               <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                                 <div className="truncate" title={row.title}>
                                   {row.title}
                                 </div>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                   row.published
                                     ? 'bg-green-100 text-green-800'
                                     : 'bg-gray-100 text-gray-800'
                                 }`}>
                                   {row.published ? '公開' : '下書き'}
                                 </span>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                 {formatDate(row.publishedAt)}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handlePublishedChange(row.id, !row.published);
                                   }}
                                   className={`px-2 py-1 rounded text-xs ${
                                     row.published
                                       ? 'text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100'
                                       : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                                   }`}
                                 >
                                   {row.published ? '非公開' : '公開'}
                                 </button>
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDelete(row.id);
                                   }}
                                   className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded text-xs"
                                 >
                                   削除
                                 </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 </div>

                 {/* 右側：編集フォーム */}
                 <div>
                   <h3 className="text-lg font-medium text-gray-900 mb-4">
                     {isCreating ? '新規作成' : selectedNews ? '編集' : 'ニュースを選択してください'}
                   </h3>
                   
                   {(isCreating || selectedNews) && (
                     <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                       <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             タイトル *
                           </label>
                           <input
                             type="text"
                             required
                             value={formData.title}
                             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             本文 *
                           </label>
                           <textarea
                             required
                             rows={8}
                             value={formData.body}
                             onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                         <div>
                           <label className="flex items-center">
                             <input
                               type="checkbox"
                               checked={formData.published}
                               onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                             />
                             <span className="ml-2 text-sm text-gray-900">公開する</span>
                           </label>
                         </div>
                         <div className="flex justify-end space-x-3 pt-4">
                           <button
                             type="button"
                             onClick={resetForm}
                             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                           >
                             キャンセル
                           </button>
                           <button
                             type="submit"
                             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                           >
                             {isCreating ? '作成' : '更新'}
                           </button>
                         </div>
                       </form>
                     </div>
                   )}

                   {!isCreating && !selectedNews && (
                     <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                       <div className="text-gray-500">
                         左側のニュースをクリックして編集するか、新規作成ボタンで新しいニュースを作成してください
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </InternalLayout>
           </InternalGate>
         </AdminAuthGuard>
       )}
     </>
   );
 }
