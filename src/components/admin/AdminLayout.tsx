/**
 * 管理画面統一レイアウトコンポーネント
 * - 全管理画面で共通のヘッダー構造
 * - 統一されたナビゲーション
 * - ブレッドクラム対応
 * - レスポンシブ対応
 */
'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  tabs?: Array<{ id: string; label: string; icon?: string; badge?: number }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

/**
 * 管理画面のページ情報を定義
 */
const PAGE_CONFIG = {
  '/admin/dashboard': { title: '事業者管理画面', icon: '🏠' },
  '/admin/cases': { title: '案件管理', icon: '📋' },
  '/admin/shifts': { title: 'シフト管理', icon: '👥' },
  '/admin/dispatch': { title: '配車管理', icon: '🚚' },
  '/admin/analytics': { title: '集計管理', icon: '📊' },
  '/admin/profile': { title: '基本情報設定', icon: '📝' },
  '/admin/quotes': { title: '見積もり管理', icon: '💰' },
  '/admin/notifications': { title: '通知管理', icon: '🔔' },
} as const;

export default function AdminLayout({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
  tabs,
  activeTab,
  onTabChange
}: AdminLayoutProps) {
  const [adminEmail, setAdminEmail] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const settingsRef = useRef<HTMLDivElement>(null);

  // 設定メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    if (email) {
      setAdminEmail(email);
    }
  }, []);

  const handleLogout = () => {
    if (!window.confirm('本当にログアウトしますか？')) return;
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminAutoLoginExpiry');
    localStorage.removeItem('adminRememberMe');
    router.push('/admin/login');
  };

  /**
   * 現在のページ情報を取得
   */
  const getCurrentPageInfo = () => {
    return PAGE_CONFIG[pathname as keyof typeof PAGE_CONFIG] || { title: '管理画面', icon: '⚙️' };
  };

  /**
   * ブレッドクラムを自動生成
   */
  const generateBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs;

    const pathSegments = pathname.split('/').filter(Boolean);
    const crumbs = [{ label: '事業者管理画面', href: '/admin/dashboard' }];

    if (pathSegments.length > 2) {
      // /admin/dashboard以外の場合
      const currentPage = getCurrentPageInfo();
      crumbs.push({ label: currentPage.title, href: pathname });
    }

    return crumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* 左側：タイトルとログイン情報 */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCurrentPageInfo().icon}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                      <p className="text-sm text-gray-600">{subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 右側：ログイン情報・アクション・メニュー */}
            <div className="flex items-center space-x-4">
              {/* ログイン情報 */}
              <div className="hidden sm:block text-right">
                <div className="text-xs text-gray-500">ログイン中</div>
                <div className="text-sm font-medium text-gray-900">{adminEmail}</div>
              </div>

              {/* カスタムアクション */}
              {actions}
              
              {/* 設定メニュー */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-base">⚙️</span>
                  <span>設定</span>
                </button>
                
                {/* 設定ドロップダウン */}
                {showSettings && (
                  <div className="absolute right-0 top-12 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-2">
                      <Link
                        href="/pricing/step1"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowSettings(false)}
                      >
                        <span className="text-base">💰</span>
                        <div>
                          <div className="font-medium">料金設定</div>
                          <div className="text-xs text-gray-500">ポイント・料金体系</div>
                        </div>
                      </Link>
                      <Link
                        href="/admin/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowSettings(false)}
                      >
                        <span className="text-base">📝</span>
                        <div>
                          <div className="font-medium">基本情報設定</div>
                          <div className="text-xs text-gray-500">事業者情報の編集</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* 事業者管理画面トップに戻るボタン */}
              {pathname !== '/admin/dashboard' && (
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  戻る
                </button>
              )}
              
              {/* ログアウトボタン */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ブレッドクラム */}
      {generateBreadcrumbs().length > 1 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex py-3" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {generateBreadcrumbs().map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && (
                      <span className="text-gray-400 mx-2">/</span>
                    )}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>
      )}

      {/* タブナビゲーション */}
      {tabs && tabs.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}