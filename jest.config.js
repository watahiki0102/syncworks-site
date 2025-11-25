/**
 * Jest設定ファイル
 * - TypeScriptサポート
 * - Next.jsとの統合
 * - テストカバレッジ設定
 */
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js アプリのパス
  dir: './',
})

// Jestのカスタム設定
const customJestConfig = {
  // テスト環境
  testEnvironment: 'jsdom',

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // モジュール名のマッピング
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)'
  ],

  // 除外するファイル・ディレクトリ
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/.git/',
    '<rootDir>/out/'
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(ts|tsx)',
    '!src/**/index.(ts|tsx)',
    '!src/app/**', // App Routerは除外
    '!src/types/**', // 型定義は除外
  ],

  // カバレッジレポートの出力先
  coverageDirectory: 'coverage',

  // カバレッジレポートの形式
  coverageReporters: ['text', 'lcov', 'html'],

  // カバレッジの閾値（段階的に引き上げ予定）
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },

  // モック設定
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // TypeScript変換設定
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },

  // モジュール解決の設定
  moduleDirectories: ['node_modules', '<rootDir>/'],

  // テストタイムアウト
  testTimeout: 15000,
  
  // 非同期ハンドルの検出
  detectOpenHandles: true,
  
  // テスト完了後の強制終了
  forceExit: true,
  
  // 最大ワーカー数を制限（CI環境での安定性向上）
  maxWorkers: process.env.CI ? 1 : '50%',
}

// Next.jsの設定とマージして出力
module.exports = createJestConfig(customJestConfig)