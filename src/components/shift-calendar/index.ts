/**
 * ShiftCalendar モジュール
 *
 * このモジュールはシフトカレンダー機能を提供します。
 * 元々4,000行以上あったコンポーネントを分割して管理しやすくしています。
 *
 * 構造:
 * - types.ts: 型定義
 * - utils.ts: ユーティリティ関数
 * - hooks/: カスタムフック
 * - components/: サブコンポーネント（将来的に分割）
 *
 * 使用方法:
 * ```tsx
 * import ShiftCalendar from '@/components/ShiftCalendar';
 * // または
 * import { ShiftCalendarTypes, shiftCalendarUtils } from '@/components/shift-calendar';
 * ```
 */

// 型定義のエクスポート
export * from './types';

// ユーティリティ関数のエクスポート
export * as shiftCalendarUtils from './utils';

// フックのエクスポート
export { useShiftCalendarState, useExpandCollapseActions } from './hooks/useShiftCalendarState';

// メインコンポーネントは既存のShiftCalendar.tsxを使用
// 将来的には完全にこのモジュール構造に移行予定
