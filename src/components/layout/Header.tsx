/**
 * 統一されたヘッダーコンポーネント
 * - レスポンシブナビゲーション
 * - モバイル対応メニュー
 * - アクセシビリティ対応
 */
'use client';

import React, { useCallback, memo } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useModal, useSelection, useOutsideClick } from '@/hooks';

interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

interface HeaderProps {
  navigation: NavigationItem[];
  showBusinessLogin?: boolean;
  showVendorReviews?: boolean;
  currentPath?: string;
}

const Header = memo<HeaderProps>(({
  navigation,
  showBusinessLogin = true,
  showVendorReviews: _showVendorReviews = true,
  currentPath = ''
}) => {
  // モバイルメニューの状態管理
  const mobileMenu = useModal();
  
  // ドロップダウンメニューの状態管理
  const { selectedItem: openDropdown, selectItem: setOpenDropdown, clearSelection: clearDropdown } = useSelection<string>();
  
  // ヘッダー外クリックでドロップダウンを閉じる
  const headerRef = useOutsideClick<HTMLDivElement>(
    () => clearDropdown(), 
    !!openDropdown // ドロップダウンが開いている時のみ有効
  );

  // メニュー操作のコールバック関数（メモ化）
  const toggleMobileMenu = useCallback(() => {
    mobileMenu.toggleModal();
    clearDropdown(); // ドロップダウンを閉じる
  }, [mobileMenu, clearDropdown]);

  const toggleDropdown = useCallback((label: string) => {
    if (openDropdown === label) {
      clearDropdown();
    } else {
      setOpenDropdown(label);
    }
  }, [openDropdown, setOpenDropdown, clearDropdown]);

  const closeAllMenus = useCallback(() => {
    mobileMenu.closeModal();
    clearDropdown();
  }, [mobileMenu, clearDropdown]);

  // アクティブリンクの判定（メモ化）
  const isActiveLink = useCallback((href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/');
  }, [currentPath]);

  return (
    <header ref={headerRef} className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* ロゴ */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              href="/" 
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
              onClick={closeAllMenus}
            >
              SyncWorks
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {navigation.map((item) => (
              <div key={item.label} className="relative group">
                {item.children ? (
                  <>
                    <button
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveLink(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleDropdown(item.label)}
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openDropdown === item.label && (
                      <div 
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 py-2 z-50"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              isActiveLink(child.href)
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                            }`}
                            onClick={closeAllMenus}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActiveLink(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={closeAllMenus}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* アクションボタン（デスクトップ） */}
          <div className="hidden md:flex items-center flex-shrink-0">
            {showBusinessLogin && (
              <Link
                href="/admin/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                事業者ログイン
              </Link>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={toggleMobileMenu}
              aria-label={mobileMenu.isOpen ? 'メニューを閉じる' : 'メニューを開く'}
              aria-expanded={mobileMenu.isOpen}
            >
              {mobileMenu.isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenu.isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        className={`flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium rounded-md transition-colors ${
                          isActiveLink(item.href)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleDropdown(item.label)}
                        aria-expanded={openDropdown === item.label}
                      >
                        {item.label}
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${
                            openDropdown === item.label ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      {openDropdown === item.label && (
                        <div className="pl-4 py-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                isActiveLink(child.href)
                                  ? 'text-blue-600 bg-blue-50'
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                              }`}
                              onClick={closeAllMenus}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActiveLink(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={closeAllMenus}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* モバイル用アクションボタン */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {showBusinessLogin && (
                  <div className="px-3">
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      onClick={closeAllMenus}
                    >
                      事業者ログイン
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export { Header };
export type { HeaderProps, NavigationItem };
export default Header; 