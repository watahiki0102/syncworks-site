/**
 * 管理画面統一ページヘッダーコンポーネント
 * - 冗長なナビゲーション要素を統一
 * - パンくずナビゲーション
 * - 統一されたページタイトル表示
 */
import React from 'react';
import Link from 'next/link';
import AdminButton from './AdminButton';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
}

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  showBackButton = true
}: AdminPageHeaderProps) {
  // デフォルトのパンくず（事業者管理画面）
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: '事業者管理画面', href: '/admin/dashboard' }
  ];

  const allBreadcrumbs = [...defaultBreadcrumbs, ...breadcrumbs];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* パンくずナビゲーション */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
          {allBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.href ? (
                <Link 
                  href={crumb.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
              {index < allBreadcrumbs.length - 1 && (
                <span className="text-gray-400">›</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* メインヘッダー */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>

          {/* 右側：アクションボタンと戻るボタン */}
          <div className="flex items-center gap-2">
            {/* アクションボタン */}
            {actions}
            
            {/* 戻るボタン */}
            {showBackButton && (
              <Link href="/admin/dashboard">
                <AdminButton variant="secondary">
                  戻る
                </AdminButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}