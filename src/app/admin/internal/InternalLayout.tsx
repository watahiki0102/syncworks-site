'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface InternalLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'ダッシュボード', href: '/admin/internal' },
  { name: '請求状況', href: '/admin/internal/billing-status' },
  { name: 'アカウント管理', href: '/admin/internal/accounts' },
  { name: '利用業者管理', href: '/admin/internal/partners' },
  { name: '請求管理', href: '/admin/internal/invoices' },
  { name: 'お問い合わせ', href: '/admin/internal/contacts' },
  { name: 'ニュース編集', href: '/admin/internal/news' },
];

export default function InternalLayout({ children }: InternalLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                内部管理画面
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              直リンク専用
            </div>
          </div>
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={`${item.href}?internal=1`}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
}
