/**
 * 検索・フィルタリング用の統一コンポーネント
 * - 検索入力
 * - ステータスフィルタ
 * - ソート機能
 * - リセット機能
 */
import React, { memo, useCallback, useMemo } from 'react';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

interface SearchFilterProps {
  /** 検索クエリ */
  searchQuery?: string;
  /** 検索クエリ変更時のコールバック */
  onSearchChange?: (query: string) => void;
  /** 検索プレースホルダー */
  searchPlaceholder?: string;
  /** 検索アイコンを表示するかどうか */
  showSearchIcon?: boolean;
  
  /** 選択されたフィルタ */
  selectedFilters?: string[];
  /** フィルタ変更時のコールバック */
  onFilterChange?: (filters: string[]) => void;
  /** フィルタオプション */
  filterOptions?: FilterOption[];
  /** フィルタのラベル */
  filterLabel?: string;
  
  /** 選択されたソート */
  selectedSort?: string;
  /** ソート変更時のコールバック */
  onSortChange?: (sort: string) => void;
  /** ソートオプション */
  sortOptions?: SortOption[];
  
  /** リセットボタンの表示 */
  showReset?: boolean;
  /** リセット時のコールバック */
  onReset?: () => void;
  
  /** 結果件数 */
  resultCount?: number;
  /** 総件数 */
  totalCount?: number;
  
  /** コンパクト表示モード */
  compact?: boolean;
  
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 検索・フィルタコンポーネント
 */
export const SearchFilter = memo<SearchFilterProps>(({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = '検索...',
  showSearchIcon = true,
  
  selectedFilters = [],
  onFilterChange,
  filterOptions = [],
  filterLabel = 'フィルタ',
  
  selectedSort = '',
  onSortChange,
  sortOptions = [],
  
  showReset = true,
  onReset,
  
  resultCount,
  totalCount,
  
  compact = false,
  className = ''
}) => {
  // フィルタの選択状態を切り替え
  const handleFilterToggle = useCallback((filterValue: string) => {
    if (!onFilterChange) return;
    
    const newFilters = selectedFilters.includes(filterValue)
      ? selectedFilters.filter(f => f !== filterValue)
      : [...selectedFilters, filterValue];
    
    onFilterChange(newFilters);
  }, [selectedFilters, onFilterChange]);

  // アクティブなフィルタがあるかどうか
  const hasActiveFilters = useMemo(() => {
    return searchQuery.length > 0 || selectedFilters.length > 0 || selectedSort.length > 0;
  }, [searchQuery, selectedFilters, selectedSort]);

  // 結果表示テキスト
  const resultText = useMemo(() => {
    if (resultCount !== undefined && totalCount !== undefined) {
      if (hasActiveFilters) {
        return `${resultCount}件 / 全${totalCount}件`;
      } else {
        return `${totalCount}件`;
      }
    }
    return null;
  }, [resultCount, totalCount, hasActiveFilters]);

  return (
    <div className={`search-filter ${compact ? 'search-filter--compact' : ''} ${className}`}>
      {/* 検索入力 */}
      {onSearchChange && (
        <div className="search-filter__search">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            leftIcon={showSearchIcon ? <Search className="w-4 h-4" /> : undefined}
            rightIcon={
              searchQuery.length > 0 ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="検索をクリア"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      {/* フィルタとソートのコントロール */}
      <div className="search-filter__controls">
        {/* フィルタオプション */}
        {filterOptions.length > 0 && (
          <div className="search-filter__filters">
            <label className="search-filter__label">
              <Filter className="w-4 h-4" />
              {filterLabel}
            </label>
            <div className="search-filter__filter-list">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleFilterToggle(option.value)}
                  className={`search-filter__filter-button ${
                    selectedFilters.includes(option.value) ? 'active' : ''
                  }`}
                  aria-pressed={selectedFilters.includes(option.value)}
                >
                  {option.label}
                  {option.count !== undefined && (
                    <span className="search-filter__count">({option.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ソートオプション */}
        {sortOptions.length > 0 && onSortChange && (
          <div className="search-filter__sort">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="search-filter__sort-select"
              aria-label="並び順"
            >
              <option value="">並び順</option>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.direction && (
                    <>
                      {option.direction === 'asc' ? ' ↑' : ' ↓'}
                    </>
                  )}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* リセットボタン */}
        {showReset && hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="search-filter__reset"
          >
            <X className="w-4 h-4" />
            リセット
          </Button>
        )}
      </div>

      {/* 結果件数表示 */}
      {resultText && (
        <div className="search-filter__results">
          <span className="search-filter__result-text">{resultText}</span>
        </div>
      )}
    </div>
  );
});

SearchFilter.displayName = 'SearchFilter';

export default SearchFilter;