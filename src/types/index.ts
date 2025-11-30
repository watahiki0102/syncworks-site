/**
 * 型定義のメインエクスポート
 * アプリケーション全体で使用される型定義を統一管理
 */

export * from './case';
export * as DispatchTypes from './dispatch';
export * from './internal';

// 共通型定義（名前衝突を回避して選択的エクスポート）
export type { CustomerInfo, MoveInfo, ItemInfo, ItemsInfo, QuoteRequest, QuoteResponse, UnifiedCase, FormInputData } from './common';
export type { Employee, EmployeeShift, Schedule, ContractStatus, WorkerAssignment } from './shared';
export type { ItemPoint, PricingRule, OptionItem, ItemDetail, PricingData } from './pricing';
export type { User, UserFromDB, CreateUserInput, UpdateUserInput } from './user';
export type { Truck, TruckFromDB, CreateTruckInput, UpdateTruckInput } from './truck';

// 残りは名前空間でエクスポート
export * as AnalyticsTypes from './analytics';
export * as ReferralTypes from './referral';
export * as RealEstateTypes from './realEstate';
export * as UnifiedTypes from './unified';

// 統一型定義（重複解消後の型）
export * from './items-unified';
export * from './address-unified';

/**
 * 型定義重複解消状況:
 * 
 * ✅ 解消済み:
 * - ContractStatus: case.ts → shared.ts に統一
 * - CargoItem: unified.ts → utils/pricing.ts に統一
 * 
 * 🔄 互換性レイヤー追加済み:
 * - ItemInfo系: items-unified.ts で統一型定義
 * - Employee: shared.ts で基本型、ExtendedEmployee で拡張
 * - TruckStatus: shared.ts でマッピング関数追加
 * - Address: address-unified.ts で変換関数追加
 * 
 * 📝 画面動作維持:
 * - 既存の型定義は保持
 * - 変換ユーティリティで互換性確保
 * - 段階的移行をサポート
 */ 