/**
 * ライブラリ統一エクスポート
 * アプリケーション全体で使用される共通ライブラリの統一エクスポート
 */

// 設定管理
export { default as config, type AppConfig, validateConfig } from './config';

// APIクライアント
export { 
  default as apiClient, 
  api, 
  ApiError,
  type ApiResponse,
  type PaginatedResponse,
  type PaginationInfo
} from './api';

// ログシステム
export { 
  default as logger, 
  log,
  type LogLevel 
} from './logger';

// バリデーションシステム
export { 
  default as validationHelpers,
  commonValidations,
  movingFormSchemas,
  businessRegistrationSchemas,
  caseManagementSchemas,
  customSchemas,
  z
} from './validation';

// 開発者ツール
export { default as devTools } from './dev-tools';

// セキュリティユーティリティ
export {
  default as security,
  sanitizeHtml,
  escapeHtml,
  isSafeUrl,
  CSRFProtection,
  inputSanitizer,
  fileSecurityChecker,
  secureStorage,
  RateLimiter,
  defaultRateLimiter,
  securityHeaders,
} from './security';

// エラーハンドリング
export {
  default as errorHandler,
  handleError,
  createError,
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorClassifier,
  ErrorMessageGenerator,
  RecoveryActionGenerator,
  type StructuredError,
  type RecoveryAction,
} from './error-handling';