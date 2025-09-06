/**
 * Jest テストセットアップファイル
 * - グローバルなテスト設定
 * - モック設定
 * - テストユーティリティの設定
 */

// Testing Library のカスタムマッチャーをインポート
require('@testing-library/jest-dom')

// テスト環境変数を読み込み
require('dotenv').config({ path: '.env.test' })

// テストに必要なグローバル設定
global.console = {
  ...console,
  // テスト中の不要なログを抑制
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// 日付のモック
const mockDate = new Date('2024-01-01T00:00:00.000Z')
Date.now = jest.fn(() => mockDate.getTime())

// Windowオブジェクトのモック（必要に応じて）
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  });
}

// IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// ResizeObserver のモック  
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// PerformanceObserver のモック
const mockPerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};
global.PerformanceObserver = jest.fn().mockImplementation((callback) => mockPerformanceObserver);

// matchMedia のモック
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// localStorage のモック
if (typeof window !== 'undefined') {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })

  // sessionStorage のモック
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock
  })
}

// テスト後のクリーンアップ
afterEach(() => {
  // DOMクリーンアップ（documentとbodyが存在する場合のみ）
  if (typeof document !== 'undefined' && document.body) {
    document.body.innerHTML = '';
  }
  
  // モックのリセット
  jest.clearAllMocks();
  
  // タイマーのクリア
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// 全テスト後のクリーンアップ
afterAll(() => {
  // すべてのモックをクリア
  jest.clearAllMocks();
  jest.restoreAllMocks();
});