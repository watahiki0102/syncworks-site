/**
 * 型定義のメインエクスポート
 * アプリケーション全体で使用される型定義を統一管理
 */

// 共通UI型
export * from './common/ui';

// フォーム関連型
export * from './forms';

// ビジネスロジック型
export * from './business';

// 型定義のグループ化 (名前空間的な使用のため)
export * as UITypes from './common/ui';
export * as FormTypes from './forms';
export * as BusinessTypes from './business'; 