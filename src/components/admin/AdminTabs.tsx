/**
 * 管理画面統一タブコンポーネント
 * - 冗長なタブ実装を統一
 * - 一貫した操作パターン
 * - アクセシビリティ対応
 */
import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface AdminTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
  className?: string;
}

export default function AdminTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className = ''
}: AdminTabsProps) {
  const baseClasses = variant === 'pills' 
    ? 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors'
    : 'inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors';

  const getTabClasses = (tabId: string) => {
    const isActive = activeTab === tabId;
    
    if (variant === 'pills') {
      return `${baseClasses} ${
        isActive
          ? 'bg-blue-100 text-blue-700 border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`;
    }
    
    return `${baseClasses} ${
      isActive
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
    }`;
  };

  return (
    <div className={`flex ${variant === 'pills' ? 'gap-2' : 'border-b border-gray-200'} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={getTabClasses(tab.id)}
          aria-selected={activeTab === tab.id}
        >
          {tab.icon && (
            <span className="mr-2 text-base">{tab.icon}</span>
          )}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}