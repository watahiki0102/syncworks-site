/**
 * フォームセクションコンポーネント
 * フォーム内のセクション表示を統一化するための共通コンポーネント
 */
import React from 'react';

interface FormSectionProps {
  /** セクションタイトル */
  title: string;
  /** セクションの説明文（オプション） */
  description?: string;
  /** セクション内のコンテンツ */
  children: React.ReactNode;
  /** 追加のCSSクラス */
  className?: string;
  /** ヘッダーに表示するアイコン（オプション） */
  icon?: React.ReactNode;
  /** セクションを折りたたみ可能にするかどうか */
  collapsible?: boolean;
  /** 初期状態で折りたたむかどうか（collapsibleがtrueの場合のみ有効） */
  defaultCollapsed?: boolean;
}

/**
 * フォームセクションコンポーネント
 * 白背景のカードレイアウトでセクションを表示し、統一された見た目を提供
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
  icon,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {/* セクションヘッダー */}
      <div 
        className={`px-6 py-4 border-b border-gray-200 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-xl">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          {collapsible && (
            <div className="text-gray-400">
              {isCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* セクションコンテンツ */}
      {(!collapsible || !isCollapsed) && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * フォームフィールドグループコンポーネント
 * フォーム内でフィールドをグループ化するための小さなセクション
 */
export const FormFieldGroup: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

/**
 * フォームグリッドコンポーネント
 * レスポンシブなグリッドレイアウトを提供
 */
export const FormGrid: React.FC<{
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 2, className = '' }) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default FormSection;