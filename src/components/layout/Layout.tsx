/**
 * 統一されたレイアウトコンポーネント
 * - ヘッダー、フッター、メインコンテンツの統合
 * - レスポンシブレイアウト
 * - アクセシビリティ対応
 */
import React from 'react';
import { Header, type NavigationItem } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  navigation?: NavigationItem[];
  showHeader?: boolean;
  showFooter?: boolean;
  showBusinessLogin?: boolean;
  showVendorReviews?: boolean;
  currentPath?: string;
  className?: string;
}

const defaultNavigation: NavigationItem[] = [
  {
    label: 'サービス',
    href: '/services',
    children: [
      { label: '見積もり依頼', href: '/form/step1' },
      { label: '料金について', href: '/pricing' },
      { label: 'サービスエリア', href: '/areas' },
    ]
  },
  {
    label: 'お客様の声',
    href: '/reviews'
  },
  {
    label: 'よくある質問',
    href: '/faq'
  },
  {
    label: 'お問い合わせ',
    href: '/contact'
  }
];

const Layout: React.FC<LayoutProps> = ({
  children,
  navigation = defaultNavigation,
  showHeader = true,
  showFooter = true,
  showBusinessLogin = true,
  showVendorReviews = true,
  currentPath,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 ${className}`}>
      {showHeader && (
        <Header
          navigation={navigation}
          showBusinessLogin={showBusinessLogin}
          showVendorReviews={showVendorReviews}
          currentPath={currentPath}
        />
      )}
      
      <main className="flex-1" role="main">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export { Layout };
export type { LayoutProps };
export default Layout; 