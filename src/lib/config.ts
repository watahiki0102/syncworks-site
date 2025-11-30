/**
 * アプリケーション設定の統一管理
 * 環境変数の型安全なアクセスと設定値の一元管理
 */

// 環境変数の型定義
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_BASE_URL: string;
  NEXT_PUBLIC_API_BASE_URL: string;
  DATABASE_URL?: string;
  SECRET_KEY?: string;
}

// デフォルト設定値
const defaultConfig = {
  NODE_ENV: 'development' as const,
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api',
};

/**
 * 環境変数を安全に取得する関数
 */
function getEnvVar<T extends keyof EnvironmentConfig>(
  key: T,
  defaultValue?: EnvironmentConfig[T]
): EnvironmentConfig[T] {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (key in defaultConfig) {
      return defaultConfig[key as keyof typeof defaultConfig] as EnvironmentConfig[T];
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value as EnvironmentConfig[T];
}

/**
 * アプリケーション設定
 */
export const config = {
  // 環境情報
  env: {
    NODE_ENV: getEnvVar('NODE_ENV'),
    isDevelopment: getEnvVar('NODE_ENV') === 'development',
    isProduction: getEnvVar('NODE_ENV') === 'production',
    isTest: getEnvVar('NODE_ENV') === 'test',
  },
  
  // URL設定
  urls: {
    base: getEnvVar('NEXT_PUBLIC_BASE_URL'),
    api: getEnvVar('NEXT_PUBLIC_API_BASE_URL'),
  },
  
  // データベース設定
  database: {
    url: getEnvVar('DATABASE_URL', undefined),
  },
  
  // セキュリティ設定
  security: {
    secretKey: getEnvVar('SECRET_KEY', undefined),
  },
  
  // アプリケーション設定
  app: {
    name: 'SyncWorks',
    version: '1.0.0',
    description: '引越し業者マッチングサービス',
    
    // ページネーション設定
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
    
    // アップロード設定
    upload: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    
    // キャッシュ設定
    cache: {
      defaultTTL: 60 * 60, // 1時間
      shortTTL: 5 * 60,    // 5分
      longTTL: 24 * 60 * 60, // 24時間
    },
    
    // レート制限設定
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分
      maxRequests: 100,
    },
  },
  
  // UI設定
  ui: {
    // ブレークポイント
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    
    // アニメーション設定
    animation: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    
    // カラーパレット
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        900: '#1e3a8a',
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  
  // フィーチャーフラグ
  features: {
    enableAnalytics: getEnvVar('NODE_ENV') === 'production',
    enableDebugMode: getEnvVar('NODE_ENV') === 'development',
    enableExperimentalFeatures: false,
  },
} as const;

/**
 * 型安全な設定アクセス用のユーティリティ
 */
export type AppConfig = typeof config;

/**
 * 設定値の検証
 */
export function validateConfig(): void {
  const requiredEnvVars: (keyof EnvironmentConfig)[] = [
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_API_BASE_URL',
  ];
  
  const missingVars = requiredEnvVars.filter(key => {
    try {
      getEnvVar(key);
      return false;
    } catch {
      return true;
    }
  });
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// 開発環境でのみ設定を検証
if (config.env.isDevelopment) {
  try {
    validateConfig();
  } catch {
    // Configuration validation warning
  }
}

export default config;