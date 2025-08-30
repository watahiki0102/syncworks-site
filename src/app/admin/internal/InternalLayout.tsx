'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface InternalLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: '請求管理', href: '/admin/internal/billing' },
  { name: 'アカウント管理', href: '/admin/internal/accounts' },
  { name: '利用業者管理', href: '/admin/internal/partners' },
  { name: 'お問い合わせ', href: '/admin/internal/contacts' },
  { name: 'ニュース編集', href: '/admin/internal/news' },
];

export default function InternalLayout({ children }: InternalLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50" style={{ width: '100vw', maxWidth: '100vw' }}>
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b w-full" style={{ width: '100vw', maxWidth: '100vw' }}>
        <div className="w-full" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="flex justify-between items-center h-16 px-4">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
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
      <div className="bg-white border-b w-full" style={{ width: '100vw', maxWidth: '100vw' }}>
        <div className="w-full" style={{ width: '100%', maxWidth: '100%' }}>
          <nav className="flex flex-wrap gap-2 sm:space-x-8 sm:gap-0 px-4">
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
      <main className="w-full py-6" style={{ width: '100vw', maxWidth: '100vw' }}>
        <div className="w-full" style={{ width: '100%', maxWidth: '100%' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
