import AdminAuthGuard from '@/components/AdminAuthGuard';
import DevelopmentAuthGuard from '@/components/admin/DevelopmentAuthGuard';
import InternalGate from '@/components/admin/InternalGate';
import InternalLayout from './InternalLayout';
import Link from 'next/link';

const dashboardItems = [
  {
    title: '請求状況',
    description: 'パートナー別の請求状況を管理',
    href: '/admin/internal/billing-status',
    color: 'bg-blue-500',
  },
  {
    title: 'アカウント管理',
    description: '管理者アカウントの権限・状態管理',
    href: '/admin/internal/accounts',
    color: 'bg-green-500',
  },
  {
    title: '利用業者管理',
    description: 'パートナー企業の登録・編集',
    href: '/admin/internal/partners',
    color: 'bg-purple-500',
  },
  {
    title: '請求管理',
    description: '請求書発行・入金状況の管理',
    href: '/admin/internal/invoices',
    color: 'bg-yellow-500',
  },
  {
    title: 'お問い合わせ',
    description: 'お客様からの問い合わせ一覧',
    href: '/admin/internal/contacts',
    color: 'bg-red-500',
  },
  {
    title: 'ニュース編集',
    description: 'サイト内ニュースの編集・公開管理',
    href: '/admin/internal/news',
    color: 'bg-indigo-500',
  },
];

export default function InternalDashboardPage() {
  return (
    <>
      {process.env.NODE_ENV === 'development' ? (
        <DevelopmentAuthGuard>
          <InternalGate>
            <InternalLayout>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              内部管理ダッシュボード
            </h2>
            <p className="text-gray-600">
              各機能への管理画面です。直リンクでのみアクセス可能です。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-white text-xl font-bold">
                    {item.title.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {item.description}
                </p>
                <Link
                  href={`${item.href}?internal=1`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  開く
                </Link>
              </div>
            ))}
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
                   内部管理ダッシュボード
                 </h2>
                 <p className="text-gray-600">
                   各機能への管理画面です。直リンクでのみアクセス可能です。
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {dashboardItems.map((item) => (
                   <div
                     key={item.title}
                     className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                   >
                     <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                       <span className="text-white text-xl font-bold">
                         {item.title.charAt(0)}
                       </span>
                     </div>
                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
                       {item.title}
                     </h3>
                     <p className="text-gray-600 text-sm mb-4">
                       {item.description}
                     </p>
                     <Link
                       href={`${item.href}?internal=1`}
                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                     >
                       開く
                     </Link>
                   </div>
                 ))}
               </div>
             </InternalLayout>
           </InternalGate>
         </AdminAuthGuard>
       )}
     </>
   );
 }
