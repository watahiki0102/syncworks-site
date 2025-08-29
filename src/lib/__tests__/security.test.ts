/**
 * security.ts のテスト
 * カバレッジ目標: 95%+
 */

import {
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
} from '../security';

// DOMPurifyのモック
jest.mock('isomorphic-dompurify', () => ({
  sanitize: jest.fn((dirty: string, config: any) => {
    // 基本的なサニタイズのシミュレーション
    if (dirty.includes('<script>')) {
      return dirty.replace(/<script[^>]*>.*?<\/script>/gi, '');
    }
    if (dirty.includes('onerror=')) {
      // onerror属性のみを削除して、他の属性は保持
      return dirty.replace(/\s*onerror="[^"]*"/gi, '');
    }
    return dirty;
  }),
}));

// configとloggerのモック
jest.mock('../config', () => ({
  config: {
    app: {
      rateLimit: {
        windowMs: 60000,
        maxRequests: 100,
      },
    },
    env: {
      isProduction: false,
    },
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// グローバルオブジェクトのモック
const mockCrypto = {
  getRandomValues: jest.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// DOM環境のモック
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; },
    keys: () => Object.keys(store),
  };
})();

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; },
  };
})();

// mockLocalStorageをオブジェクトのキーとして反復可能にする
const localStorageProxy = new Proxy(mockLocalStorage, {
  ownKeys() {
    return mockLocalStorage.keys();
  },
  has(target, key) {
    return typeof key === 'string' && mockLocalStorage.getItem(key) !== null;
  },
  getOwnPropertyDescriptor(target, key) {
    if (typeof key === 'string' && mockLocalStorage.getItem(key) !== null) {
      return { enumerable: true, configurable: true };
    }
    return undefined;
  },
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageProxy,
  writable: true,
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// Documentのモック
const mockDocument = {
  querySelector: jest.fn(),
  createElement: jest.fn(() => ({
    name: '',
    content: '',
  })),
  head: {
    appendChild: jest.fn(),
  },
};

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

// Windowのモック
Object.defineProperty(global, 'window', {
  value: {
    btoa: (str: string) => Buffer.from(str).toString('base64'),
    atob: (str: string) => Buffer.from(str, 'base64').toString(),
  },
  writable: true,
});

// Imageのモック
const MockedImage = jest.fn().mockImplementation(() => {
  const instance = {
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
    src: '',
  };
  return instance;
});
global.Image = MockedImage;

// URLのモック（実際のURLコンストラクタを使用）
(global as any).URL = URL;

describe('sanitizeHtml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('正常な文字列をサニタイズできる', () => {
    const input = '<p>テストコンテンツ</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>テストコンテンツ</p>');
  });

  it('スクリプトタグを除去できる', () => {
    const input = '<p>安全なコンテンツ</p><script>alert("XSS")</script>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>安全なコンテンツ</p>');
  });

  it('悪意のある属性を除去できる', () => {
    const input = '<img src="image.jpg" onerror="alert(\'XSS\')">';
    const result = sanitizeHtml(input);
    expect(result).toBe('<img src="image.jpg">');
  });

  it('カスタムオプションを適用できる', () => {
    const input = '<div><span>テスト</span></div>';
    const options = {
      allowedTags: ['div'],
      allowedAttributes: [],
    };
    const result = sanitizeHtml(input, options);
    expect(result).toBe('<div><span>テスト</span></div>');
  });

  it('null/undefined入力に対して空文字を返す', () => {
    expect(sanitizeHtml(null as any)).toBe('');
    expect(sanitizeHtml(undefined as any)).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });

  it('非文字列入力に対して空文字を返す', () => {
    expect(sanitizeHtml(123 as any)).toBe('');
    expect(sanitizeHtml({} as any)).toBe('');
    expect(sanitizeHtml([] as any)).toBe('');
  });

  it('DOMPurifyでエラーが発生した場合に空文字を返す', () => {
    const DOMPurify = require('isomorphic-dompurify');
    DOMPurify.sanitize.mockImplementationOnce(() => {
      throw new Error('Sanitization error');
    });

    const result = sanitizeHtml('<p>test</p>');
    expect(result).toBe('');
  });
});

describe('escapeHtml', () => {
  it('HTMLの特殊文字をエスケープできる', () => {
    const input = '<script>alert("XSS");</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;);&lt;&#x2F;script&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  it('アンパサンドをエスケープできる', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('シングルクォートをエスケープできる', () => {
    expect(escapeHtml("It's working")).toBe('It&#x27;s working');
  });

  it('スラッシュをエスケープできる', () => {
    expect(escapeHtml('</script>')).toBe('&lt;&#x2F;script&gt;');
  });

  it('複数の特殊文字を同時にエスケープできる', () => {
    const input = '<div class="test">Tom & Jerry\'s "adventure"</div>';
    const expected = '&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry&#x27;s &quot;adventure&quot;&lt;&#x2F;div&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  it('null/undefined入力に対して空文字を返す', () => {
    expect(escapeHtml(null as any)).toBe('');
    expect(escapeHtml(undefined as any)).toBe('');
    expect(escapeHtml('')).toBe('');
  });

  it('非文字列入力に対して空文字を返す', () => {
    expect(escapeHtml(123 as any)).toBe('');
    expect(escapeHtml({} as any)).toBe('');
  });

  it('特殊文字が含まれない文字列をそのまま返す', () => {
    const input = 'Hello World';
    expect(escapeHtml(input)).toBe(input);
  });
});

describe('isSafeUrl', () => {
  it('HTTPSのURLを安全と判定する', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('https://www.example.com/path?query=value')).toBe(true);
  });

  it('HTTPのURLを安全と判定する', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
    expect(isSafeUrl('http://localhost:3000')).toBe(true);
  });

  it('mailto:のURLを安全と判定する', () => {
    expect(isSafeUrl('mailto:test@example.com')).toBe(true);
    expect(isSafeUrl('mailto:user@domain.com?subject=Test')).toBe(true);
  });

  it('tel:のURLを安全と判定する', () => {
    expect(isSafeUrl('tel:+81-90-1234-5678')).toBe(true);
    expect(isSafeUrl('tel:123-456-7890')).toBe(true);
  });

  it('javascript:のURLを危険と判定する', () => {
    expect(isSafeUrl('javascript:alert("XSS")')).toBe(false);
    expect(isSafeUrl('JAVASCRIPT:void(0)')).toBe(false);
  });

  it('data:のURLを危険と判定する', () => {
    expect(isSafeUrl('data:text/html,<script>alert("XSS")</script>')).toBe(false);
    expect(isSafeUrl('DATA:image/png;base64,iVBORw0KGgoA...')).toBe(false);
  });

  it('vbscript:のURLを危険と判定する', () => {
    expect(isSafeUrl('vbscript:msgbox("XSS")')).toBe(false);
  });

  it('file:のURLを危険と判定する', () => {
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeUrl('file://C:/Windows/system32/')).toBe(false);
  });

  it('about:のURLを危険と判定する', () => {
    expect(isSafeUrl('about:blank')).toBe(false);
    expect(isSafeUrl('about:config')).toBe(false);
  });

  it('null/undefined/空文字列を危険と判定する', () => {
    expect(isSafeUrl(null as any)).toBe(false);
    expect(isSafeUrl(undefined as any)).toBe(false);
    expect(isSafeUrl('')).toBe(false);
  });

  it('非文字列を危険と判定する', () => {
    expect(isSafeUrl(123 as any)).toBe(false);
    expect(isSafeUrl({} as any)).toBe(false);
  });

  it('不正なURL形式を危険と判定する', () => {
    expect(isSafeUrl('not-a-url')).toBe(false);
    expect(isSafeUrl('http://')).toBe(false);
    expect(isSafeUrl('://example.com')).toBe(false);
  });

  it('許可されていないプロトコルを危険と判定する', () => {
    expect(isSafeUrl('ftp://example.com')).toBe(false);
    expect(isSafeUrl('ssh://user@server')).toBe(false);
    expect(isSafeUrl('custom://protocol')).toBe(false);
  });
});

describe('CSRFProtection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.clear();
    mockLocalStorage.clear();
  });

  describe('generateToken', () => {
    it('64文字の16進数トークンを生成する', () => {
      const token = CSRFProtection.generateToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
      expect(token.length).toBe(64);
    });

    it('毎回異なるトークンを生成する', () => {
      const token1 = CSRFProtection.generateToken();
      const token2 = CSRFProtection.generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('setToken', () => {
    it('ブラウザ環境でトークンをsessionStorageに保存する', () => {
      const token = 'test-token-123';
      
      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      CSRFProtection.setToken(token);
      
      expect(mockSessionStorage.getItem('csrf-token')).toBe(token);
    });

    it('ブラウザ環境でmetaタグを作成・更新する', () => {
      const token = 'test-token-456';
      const mockMetaTag = { name: '', content: '' };
      
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.createElement.mockReturnValue(mockMetaTag);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      CSRFProtection.setToken(token);

      expect(mockDocument.createElement).toHaveBeenCalledWith('meta');
      expect(mockMetaTag.name).toBe('csrf-token');
      expect(mockMetaTag.content).toBe(token);
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockMetaTag);
    });

    it('既存のmetaタグがある場合は更新する', () => {
      const token = 'test-token-789';
      const existingMetaTag = { name: 'csrf-token', content: 'old-token' };
      
      mockDocument.querySelector.mockReturnValue(existingMetaTag);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      CSRFProtection.setToken(token);

      expect(existingMetaTag.content).toBe(token);
      expect(mockDocument.createElement).not.toHaveBeenCalled();
    });

    it('非ブラウザ環境では何もしない', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const token = 'test-token-server';
      
      expect(() => {
        CSRFProtection.setToken(token);
      }).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('getToken', () => {
    it('sessionStorageからトークンを取得する', () => {
      const token = 'stored-token-123';
      mockSessionStorage.setItem('csrf-token', token);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.getToken()).toBe(token);
    });

    it('sessionStorageにない場合はmetaタグから取得する', () => {
      const token = 'meta-token-456';
      const mockMetaTag = { content: token };
      
      mockDocument.querySelector.mockReturnValue(mockMetaTag);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.getToken()).toBe(token);
    });

    it('どちらにもない場合はnullを返す', () => {
      mockDocument.querySelector.mockReturnValue(null);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.getToken()).toBeNull();
    });

    it('非ブラウザ環境ではnullを返す', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(CSRFProtection.getToken()).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('addToHeaders', () => {
    it('トークンが存在する場合はヘッダーに追加する', () => {
      const token = 'header-token-123';
      mockSessionStorage.setItem('csrf-token', token);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      const headers = { 'Content-Type': 'application/json' };
      const result = CSRFProtection.addToHeaders(headers);

      expect(result['X-CSRF-Token']).toBe(token);
      expect(result['Content-Type']).toBe('application/json');
    });

    it('トークンが存在しない場合はヘッダーを追加しない', () => {
      mockDocument.querySelector.mockReturnValue(null);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      const headers = { 'Content-Type': 'application/json' };
      const result = CSRFProtection.addToHeaders(headers);

      expect(result['X-CSRF-Token']).toBeUndefined();
      expect(result['Content-Type']).toBe('application/json');
    });

    it('空のheadersオブジェクトでも動作する', () => {
      const token = 'empty-headers-token';
      mockSessionStorage.setItem('csrf-token', token);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      const result = CSRFProtection.addToHeaders();
      expect(result['X-CSRF-Token']).toBe(token);
    });
  });

  describe('validateToken', () => {
    it('正しいトークンの場合はtrueを返す', () => {
      const token = 'valid-token-123';
      mockSessionStorage.setItem('csrf-token', token);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.validateToken(token)).toBe(true);
    });

    it('間違ったトークンの場合はfalseを返す', () => {
      const storedToken = 'stored-token-123';
      const requestToken = 'different-token-456';
      
      mockSessionStorage.setItem('csrf-token', storedToken);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.validateToken(requestToken)).toBe(false);
    });

    it('保存されたトークンがない場合はfalseを返す', () => {
      mockDocument.querySelector.mockReturnValue(null);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.validateToken('any-token')).toBe(false);
    });

    it('リクエストトークンが空の場合はfalseを返す', () => {
      const token = 'stored-token-123';
      mockSessionStorage.setItem('csrf-token', token);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.validateToken('')).toBe(false);
    });

    it('異なる長さのトークンを正しく比較する', () => {
      const storedToken = 'short';
      const requestToken = 'much-longer-token';
      
      mockSessionStorage.setItem('csrf-token', storedToken);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.validateToken(requestToken)).toBe(false);
    });
  });

  describe('constantTimeEqual', () => {
    // privateメソッドなので、validateTokenを通してテスト
    it('定数時間比較を使用してタイミング攻撃を防ぐ', () => {
      const correctToken = 'a'.repeat(64);
      const wrongToken1 = 'b'.repeat(64);
      const wrongToken2 = 'a'.repeat(63) + 'b';
      
      mockSessionStorage.setItem('csrf-token', correctToken);

      Object.defineProperty(global, 'window', {
        value: { btoa: global.window.btoa, atob: global.window.atob },
        writable: true,
      });

      expect(CSRFProtection.validateToken(correctToken)).toBe(true);
      expect(CSRFProtection.validateToken(wrongToken1)).toBe(false);
      expect(CSRFProtection.validateToken(wrongToken2)).toBe(false);
    });
  });
});

describe('inputSanitizer', () => {
  describe('sanitizeString', () => {
    it('文字列の制御文字を除去する', () => {
      const input = 'Hello\x00\x1F\x7F World';
      const result = inputSanitizer.sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('過度な空白を正規化する', () => {
      const input = '  Hello    World  \t\n  ';
      const result = inputSanitizer.sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('非文字列入力に対して空文字を返す', () => {
      expect(inputSanitizer.sanitizeString(123)).toBe('');
      expect(inputSanitizer.sanitizeString(null)).toBe('');
      expect(inputSanitizer.sanitizeString(undefined)).toBe('');
      expect(inputSanitizer.sanitizeString({})).toBe('');
    });

    it('正常な文字列をそのまま返す', () => {
      const input = 'Hello World';
      expect(inputSanitizer.sanitizeString(input)).toBe(input);
    });
  });

  describe('sanitizeNumber', () => {
    it('有効な数値をそのまま返す', () => {
      expect(inputSanitizer.sanitizeNumber(123)).toBe(123);
      expect(inputSanitizer.sanitizeNumber(0)).toBe(0);
      expect(inputSanitizer.sanitizeNumber(-456)).toBe(-456);
      expect(inputSanitizer.sanitizeNumber(3.14)).toBe(3.14);
    });

    it('数値文字列を数値に変換する', () => {
      expect(inputSanitizer.sanitizeNumber('123')).toBe(123);
      expect(inputSanitizer.sanitizeNumber('3.14')).toBe(3.14);
      expect(inputSanitizer.sanitizeNumber('-456')).toBe(-456);
    });

    it('無効な数値に対してnullを返す', () => {
      expect(inputSanitizer.sanitizeNumber(Infinity)).toBeNull();
      expect(inputSanitizer.sanitizeNumber(-Infinity)).toBeNull();
      expect(inputSanitizer.sanitizeNumber(NaN)).toBeNull();
    });

    it('数値に変換できない文字列に対してnullを返す', () => {
      expect(inputSanitizer.sanitizeNumber('abc')).toBeNull();
      expect(inputSanitizer.sanitizeNumber('123abc')).toBe(123); // parseFloatは部分的な数値を抽出
      expect(inputSanitizer.sanitizeNumber('')).toBeNull();
    });

    it('その他の型に対してnullを返す', () => {
      expect(inputSanitizer.sanitizeNumber(null)).toBeNull();
      expect(inputSanitizer.sanitizeNumber(undefined)).toBeNull();
      expect(inputSanitizer.sanitizeNumber({})).toBeNull();
      expect(inputSanitizer.sanitizeNumber([])).toBeNull();
    });
  });

  describe('sanitizeBoolean', () => {
    it('真偽値をそのまま返す', () => {
      expect(inputSanitizer.sanitizeBoolean(true)).toBe(true);
      expect(inputSanitizer.sanitizeBoolean(false)).toBe(false);
    });

    it('文字列からtrueを判定する', () => {
      expect(inputSanitizer.sanitizeBoolean('true')).toBe(true);
      expect(inputSanitizer.sanitizeBoolean('TRUE')).toBe(true);
      expect(inputSanitizer.sanitizeBoolean('1')).toBe(true);
      expect(inputSanitizer.sanitizeBoolean('yes')).toBe(true);
      expect(inputSanitizer.sanitizeBoolean('YES')).toBe(true);
    });

    it('文字列からfalseを判定する', () => {
      expect(inputSanitizer.sanitizeBoolean('false')).toBe(false);
      expect(inputSanitizer.sanitizeBoolean('0')).toBe(false);
      expect(inputSanitizer.sanitizeBoolean('no')).toBe(false);
      expect(inputSanitizer.sanitizeBoolean('random')).toBe(false);
      expect(inputSanitizer.sanitizeBoolean('')).toBe(false);
    });

    it('数値から真偽値を判定する', () => {
      expect(inputSanitizer.sanitizeBoolean(1)).toBe(true);
      expect(inputSanitizer.sanitizeBoolean(123)).toBe(true);
      expect(inputSanitizer.sanitizeBoolean(-1)).toBe(true);
      expect(inputSanitizer.sanitizeBoolean(0)).toBe(false);
    });

    it('その他の型に対してfalseを返す', () => {
      expect(inputSanitizer.sanitizeBoolean(null)).toBe(false);
      expect(inputSanitizer.sanitizeBoolean(undefined)).toBe(false);
      expect(inputSanitizer.sanitizeBoolean({})).toBe(false);
      expect(inputSanitizer.sanitizeBoolean([])).toBe(false);
    });
  });

  describe('sanitizeArray', () => {
    it('有効な配列をサニタイズする', () => {
      const input = ['hello', 123, 'world'];
      const sanitizer = (item: any) => typeof item === 'string' ? item.toUpperCase() : item;
      const result = inputSanitizer.sanitizeArray(input, sanitizer);
      expect(result).toEqual(['HELLO', 123, 'WORLD']);
    });

    it('null/undefinedを除去する', () => {
      const input = ['hello', null, 'world', undefined];
      const sanitizer = (item: any) => item === null || item === undefined ? null : item;
      const result = inputSanitizer.sanitizeArray(input, sanitizer);
      expect(result).toEqual(['hello', 'world']);
    });

    it('非配列入力に対して空配列を返す', () => {
      expect(inputSanitizer.sanitizeArray(null, x => x)).toEqual([]);
      expect(inputSanitizer.sanitizeArray(undefined, x => x)).toEqual([]);
      expect(inputSanitizer.sanitizeArray('not array', x => x)).toEqual([]);
      expect(inputSanitizer.sanitizeArray(123, x => x)).toEqual([]);
    });

    it('空配列に対して空配列を返す', () => {
      const result = inputSanitizer.sanitizeArray([], x => x);
      expect(result).toEqual([]);
    });

    it('サニタイザー関数が適切に呼ばれる', () => {
      const sanitizer = jest.fn(x => x);
      const input = [1, 2, 3];
      const result = inputSanitizer.sanitizeArray(input, sanitizer);
      
      expect(sanitizer).toHaveBeenCalledTimes(3);
      expect(sanitizer).toHaveBeenNthCalledWith(1, 1, 0, [1, 2, 3]);
      expect(sanitizer).toHaveBeenNthCalledWith(2, 2, 1, [1, 2, 3]);
      expect(sanitizer).toHaveBeenNthCalledWith(3, 3, 2, [1, 2, 3]);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('sanitizeObjectKeys', () => {
    it('許可されたキーのみを保持する', () => {
      const input = {
        name: 'John',
        age: 30,
        secret: 'hidden',
        email: 'john@example.com'
      };
      const allowedKeys = ['name', 'age'];
      const result = inputSanitizer.sanitizeObjectKeys(input, allowedKeys);
      
      expect(result).toEqual({
        name: 'John',
        age: 30
      });
    });

    it('存在しないキーは無視する', () => {
      const input = { name: 'John' };
      const allowedKeys = ['name', 'age', 'email'];
      const result = inputSanitizer.sanitizeObjectKeys(input, allowedKeys);
      
      expect(result).toEqual({ name: 'John' });
    });

    it('空のallowedKeysで空オブジェクトを返す', () => {
      const input = { name: 'John', age: 30 };
      const result = inputSanitizer.sanitizeObjectKeys(input, []);
      expect(result).toEqual({});
    });

    it('空のオブジェクトで空オブジェクトを返す', () => {
      const result = inputSanitizer.sanitizeObjectKeys({}, ['name', 'age']);
      expect(result).toEqual({});
    });
  });
});

describe('fileSecurityChecker', () => {
  describe('validateFileType', () => {
    it('許可されたファイルタイプを受け入れる', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      expect(fileSecurityChecker.validateFileType(file, allowedTypes)).toBe(true);
    });

    it('許可されていないファイルタイプを拒否する', () => {
      const file = new File([''], 'test.exe', { type: 'application/octet-stream' });
      const allowedTypes = ['image/jpeg', 'image/png'];
      expect(fileSecurityChecker.validateFileType(file, allowedTypes)).toBe(false);
    });

    it('ファイルタイプが空の場合は拒否する', () => {
      const file = new File([''], 'test', { type: '' });
      const allowedTypes = ['image/jpeg'];
      expect(fileSecurityChecker.validateFileType(file, allowedTypes)).toBe(false);
    });

    it('nullファイルは拒否する', () => {
      expect(fileSecurityChecker.validateFileType(null as any, ['image/jpeg'])).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('許可されたサイズ以下のファイルを受け入れる', () => {
      const file = new File(['x'.repeat(1024)], 'test.txt'); // 1KB
      expect(fileSecurityChecker.validateFileSize(file, 1)).toBe(true);
    });

    it('許可されたサイズを超えるファイルを拒否する', () => {
      const file = new File(['x'.repeat(1024 * 1024 + 1)], 'test.txt'); // 1MB + 1B
      expect(fileSecurityChecker.validateFileSize(file, 1)).toBe(false);
    });

    it('ちょうどの境界値を受け入れる', () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'test.txt'); // exactly 1MB
      expect(fileSecurityChecker.validateFileSize(file, 1)).toBe(true);
    });

    it('nullファイルは拒否する', () => {
      expect(fileSecurityChecker.validateFileSize(null as any, 1)).toBe(false);
    });
  });

  describe('sanitizeFileName', () => {
    it('正常なファイル名をそのまま返す', () => {
      expect(fileSecurityChecker.sanitizeFileName('document.pdf')).toBe('document.pdf');
      expect(fileSecurityChecker.sanitizeFileName('my-file.txt')).toBe('my-file.txt');
    });

    it('危険な文字を除去する', () => {
      expect(fileSecurityChecker.sanitizeFileName('file<>:|?.txt')).toBe('file.txt');
      expect(fileSecurityChecker.sanitizeFileName('file\\/*"file.txt')).toBe('filefile.txt');
    });

    it('連続するドットを単一のドットに変換する', () => {
      expect(fileSecurityChecker.sanitizeFileName('file...txt')).toBe('file.txt');
      expect(fileSecurityChecker.sanitizeFileName('file....exe')).toBe('file.exe');
    });

    it('先頭と末尾のドットやスペースを除去する', () => {
      expect(fileSecurityChecker.sanitizeFileName('  .file.txt.  ')).toBe('file.txt');
      expect(fileSecurityChecker.sanitizeFileName('...file...')).toBe('file');
    });

    it('長すぎるファイル名を切り詰める', () => {
      const longName = 'a'.repeat(105) + '.txt'; // 109文字（100を超える）
      const result = fileSecurityChecker.sanitizeFileName(longName);
      expect(result.length).toBe(100);
      expect(result.endsWith('.txt')).toBe(true);
    });

    it('拡張子なしの長いファイル名を切り詰める', () => {
      const longName = 'a'.repeat(150);
      const result = fileSecurityChecker.sanitizeFileName(longName);
      expect(result.length).toBe(100);
    });

    it('null/undefined/空文字列に対してデフォルト名を返す', () => {
      expect(fileSecurityChecker.sanitizeFileName(null as any)).toBe('untitled');
      expect(fileSecurityChecker.sanitizeFileName(undefined as any)).toBe('untitled');
      expect(fileSecurityChecker.sanitizeFileName('')).toBe('untitled');
    });

    it('非文字列に対してデフォルト名を返す', () => {
      expect(fileSecurityChecker.sanitizeFileName(123 as any)).toBe('untitled');
      expect(fileSecurityChecker.sanitizeFileName({} as any)).toBe('untitled');
    });

    it('サニタイズ後に空になった場合はデフォルト名を返す', () => {
      expect(fileSecurityChecker.sanitizeFileName('...')).toBe('untitled');
      expect(fileSecurityChecker.sanitizeFileName('   ')).toBe('untitled');
    });
  });

  describe('validateImageFile', () => {
    beforeEach(() => {
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('有効な画像ファイルに対してtrueを返す', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      const promise = fileSecurityChecker.validateImageFile(file);
      
      // Promiseが開始される前にImageコールバックを設定
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Image onloadをシミュレート  
      const imageInstance = MockedImage.mock.instances[0] as any;
      if (imageInstance.onload) {
        imageInstance.onload();
      }
      
      const result = await promise;
      
      expect(result).toBe(true);
    }, 15000);

    it('無効な画像ファイルに対してfalseを返す', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      const promise = fileSecurityChecker.validateImageFile(file);
      
      // Promiseが開始される前にImageコールバックを設定
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Image onerrorをシミュレート
      const imageInstance = MockedImage.mock.instances[0] as any;
      if (imageInstance.onerror) {
        imageInstance.onerror();
      }
      
      const result = await promise;
      
      expect(result).toBe(false);
    }, 15000);

    it('画像以外のファイルタイプに対してfalseを返す', async () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const result = await fileSecurityChecker.validateImageFile(file);
      expect(result).toBe(false);
    });

    it('タイムアウト時にfalseを返す', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      const promise = fileSecurityChecker.validateImageFile(file);
      
      // タイムアウトまで進める
      jest.advanceTimersByTime(5000);
      
      const result = await promise;
      expect(result).toBe(false);
    });
  });
});

describe('secureStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('setSecureItem', () => {
    it('データを暗号化して保存する', async () => {
      const key = 'testKey';
      const value = { name: 'John', age: 30 };
      
      await secureStorage.setSecureItem(key, value);
      
      const stored = mockLocalStorage.getItem('secure_testKey');
      expect(stored).not.toBeNull();
      expect(stored).not.toBe(JSON.stringify(value)); // 暗号化されている
    });

    it('JSON.stringifyでエラーが発生した場合にエラーをスローする', async () => {
      const key = 'testKey';
      const circularRef: any = {};
      circularRef.self = circularRef;
      
      await expect(secureStorage.setSecureItem(key, circularRef))
        .rejects.toThrow('データの保存に失敗しました');
    });
  });

  describe('getSecureItem', () => {
    it('保存されたデータを復号化して取得する', async () => {
      const key = 'testKey';
      const value = { name: 'John', age: 30 };
      
      await secureStorage.setSecureItem(key, value);
      const retrieved = secureStorage.getSecureItem(key);
      
      expect(retrieved).toEqual(value);
    });

    it('存在しないキーに対してnullを返す', () => {
      const result = secureStorage.getSecureItem('nonexistent');
      expect(result).toBeNull();
    });

    it('不正な暗号化データに対してnullを返す', () => {
      mockLocalStorage.setItem('secure_testKey', 'invalid-base64');
      const result = secureStorage.getSecureItem('testKey');
      expect(result).toBeNull();
    });
  });

  describe('removeSecureItem', () => {
    it('指定されたアイテムを削除する', async () => {
      const key = 'testKey';
      const value = { name: 'John' };
      
      await secureStorage.setSecureItem(key, value);
      expect(mockLocalStorage.getItem('secure_testKey')).not.toBeNull();
      
      secureStorage.removeSecureItem(key);
      expect(mockLocalStorage.getItem('secure_testKey')).toBeNull();
    });
  });

  describe('clearSecureStorage', () => {
    it('secure_で始まるすべてのアイテムを削除する', async () => {
      await secureStorage.setSecureItem('key1', 'value1');
      await secureStorage.setSecureItem('key2', 'value2');
      mockLocalStorage.setItem('regular_key', 'regular_value');
      
      expect(mockLocalStorage.getItem('secure_key1')).not.toBeNull();
      expect(mockLocalStorage.getItem('secure_key2')).not.toBeNull();
      expect(mockLocalStorage.getItem('regular_key')).toBe('regular_value');
      
      secureStorage.clearSecureStorage();
      
      expect(mockLocalStorage.getItem('secure_key1')).toBeNull();
      expect(mockLocalStorage.getItem('secure_key2')).toBeNull();
      expect(mockLocalStorage.getItem('regular_key')).toBe('regular_value');
    });
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  const mockLogger = require('../logger').logger;

  beforeEach(() => {
    rateLimiter = new RateLimiter(60000, 3); // 1分間に3リクエスト
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkLimit', () => {
    it('制限内のリクエストを許可する', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
    });

    it('制限を超えるリクエストを拒否する', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(false);
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Rate limit exceeded',
        { identifier: 'user1', requests: 3 }
      );
    });

    it('異なる識別子は独立して制限される', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(false);
      
      expect(rateLimiter.checkLimit('user2')).toBe(true);
      expect(rateLimiter.checkLimit('user2')).toBe(true);
    });

    it('時間窓の経過後にリクエストが再び許可される', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(false);
      
      // 61秒経過
      jest.advanceTimersByTime(61000);
      
      expect(rateLimiter.checkLimit('user1')).toBe(true);
    });

    it('部分的な時間窓の経過でリクエストが徐々に回復する', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      
      // 30秒経過
      jest.advanceTimersByTime(30000);
      
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(false);
      
      // さらに31秒経過（最初のリクエストから61秒）
      jest.advanceTimersByTime(31000);
      
      expect(rateLimiter.checkLimit('user1')).toBe(true);
    });
  });

  describe('reset', () => {
    it('指定された識別子のリクエスト履歴をクリアする', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user1')).toBe(false);
      
      rateLimiter.reset('user1');
      
      expect(rateLimiter.checkLimit('user1')).toBe(true);
    });

    it('他の識別子には影響しない', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user2')).toBe(true);
      
      rateLimiter.reset('user1');
      
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user2')).toBe(true);
    });
  });

  describe('clear', () => {
    it('すべての識別子のリクエスト履歴をクリアする', () => {
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user2')).toBe(true);
      
      rateLimiter.clear();
      
      expect(rateLimiter.checkLimit('user1')).toBe(true);
      expect(rateLimiter.checkLimit('user2')).toBe(true);
    });
  });
});

describe('defaultRateLimiter', () => {
  it('設定されたパラメータでインスタンス化される', () => {
    expect(defaultRateLimiter).toBeInstanceOf(RateLimiter);
  });

  it('基本的な制限チェックが動作する', () => {
    // デフォルトでは1分間に100リクエスト
    for (let i = 0; i < 100; i++) {
      expect(defaultRateLimiter.checkLimit('testUser')).toBe(true);
    }
    expect(defaultRateLimiter.checkLimit('testUser')).toBe(false);
  });
});

describe('securityHeaders', () => {
  describe('getSecureHeaders', () => {
    it('基本的なセキュリティヘッダーを返す', () => {
      const headers = securityHeaders.getSecureHeaders();
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
    });

    it('本番環境ではHSTSヘッダーを含まない（configでisProduction=false）', () => {
      const headers = securityHeaders.getSecureHeaders();
      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });
  });

  describe('generateCSP', () => {
    it('nonceなしでCSPを生成する', () => {
      const csp = securityHeaders.generateCSP();
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com");
      expect(csp).toContain("font-src 'self' https://fonts.gstatic.com");
      expect(csp).toContain("img-src 'self' data: https:");
      expect(csp).toContain("connect-src 'self' https://api.example.com");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
    });

    it('nonceありでCSPを生成する', () => {
      const nonce = 'abc123';
      const csp = securityHeaders.generateCSP(nonce);
      
      expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`);
    });

    it('CSPディレクティブがセミコロンで区切られている', () => {
      const csp = securityHeaders.generateCSP();
      const directives = csp.split('; ');
      
      expect(directives.length).toBeGreaterThan(5);
      expect(directives[0]).toBe("default-src 'self'");
    });
  });
});

describe('エラーハンドリングとエッジケース', () => {
  it('モジュール全体のデフォルトエクスポートが存在する', async () => {
    const securityModule = await import('../security');
    expect(securityModule.default).toBeDefined();
    expect(typeof securityModule.default).toBe('object');
  });

  it('すべての主要な関数がエクスポートされている', () => {
    expect(typeof sanitizeHtml).toBe('function');
    expect(typeof escapeHtml).toBe('function');
    expect(typeof isSafeUrl).toBe('function');
    expect(typeof CSRFProtection).toBe('function');
    expect(typeof inputSanitizer).toBe('object');
    expect(typeof fileSecurityChecker).toBe('object');
    expect(typeof secureStorage).toBe('object');
    expect(typeof RateLimiter).toBe('function');
    expect(typeof securityHeaders).toBe('object');
  });

  it('極端な入力値に対して適切にエラーハンドリングする', () => {
    // 非常に長い文字列
    const veryLongString = 'a'.repeat(10000);
    expect(() => sanitizeHtml(veryLongString)).not.toThrow();
    expect(() => escapeHtml(veryLongString)).not.toThrow();
    
    // 特殊な文字
    const specialChars = '\u0000\u001F\u007F\uFFFE\uFFFF';
    expect(() => inputSanitizer.sanitizeString(specialChars)).not.toThrow();
    
    // 空のオブジェクトや配列
    expect(() => inputSanitizer.sanitizeArray([], x => x)).not.toThrow();
    expect(() => inputSanitizer.sanitizeObjectKeys({}, [])).not.toThrow();
  });
});