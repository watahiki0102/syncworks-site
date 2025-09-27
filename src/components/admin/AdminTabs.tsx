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
  variant?: 'default' | 'pills' | 'calendar';
  className?: string;
  containerClassName?: string;
}

export default function AdminTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className = '',
  containerClassName = ''
}: AdminTabsProps) {
  const getBaseClasses = () => {
    switch (variant) {
      case 'pills':
        return 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors';
      case 'calendar':
        return 'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors';
      default:
        return 'inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors';
    }
  };

  const getTabClasses = (tabId: string) => {
    const isActive = activeTab === tabId;
    const baseClasses = getBaseClasses();
    
    switch (variant) {
      case 'pills':
        return `${baseClasses} ${
          isActive
            ? 'bg-blue-100 text-blue-700 border-blue-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`;
      case 'calendar':
        return `${baseClasses} ${
          isActive
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;
      default:
        return `${baseClasses} ${
          isActive
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
        }`;
    }
  };

  const getContainerClasses = () => {
    switch (variant) {
      case 'pills':
        return `flex gap-2 ${className}`;
      case 'calendar':
        return `flex space-x-8 ${className}`;
      default:
        return `flex ${className}`;
    }
  };

  const renderTabContent = (tab: TabItem) => (
    <>
      {tab.icon && (
        <span className="mr-2 text-base">{tab.icon}</span>
      )}
      <span>{tab.label}</span>
      {tab.count !== undefined && (
        <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
          {tab.count}
        </span>
      )}
    </>
  );

  if (variant === 'calendar') {
    return (
      <div className={`bg-white border-b border-gray-200 ${containerClassName}`}>
        <div className="w-full">
          <nav className={getContainerClasses()} aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={getTabClasses(tab.id)}
                aria-selected={activeTab === tab.id}
              >
                {renderTabContent(tab)}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variant === 'pills' ? '' : 'border-b border-gray-200'} ${getContainerClasses()} ${containerClassName}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={getTabClasses(tab.id)}
          aria-selected={activeTab === tab.id}
        >
          {renderTabContent(tab)}
        </button>
      ))}
    </div>
  );
}