/**
 * セキュリティユーティリティ
 * - XSS対策
 * - CSRF保護
 * - 入力サニタイゼーション
 * - セキュアなデータハンドリング
 */
import DOMPurify from 'isomorphic-dompurify';
import { config } from './config';
import { logger } from './logger';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * XSS対策 - HTMLコンテンツのサニタイズ
 */
export const sanitizeHtml = (dirty: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripIgnoreTag?: boolean;
}): string => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultConfig = {
    ALLOWED_TAGS: options?.allowedTags || [
      'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'span'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || ['href', 'class'],
    STRIP_IGNORE_TAG: options?.stripIgnoreTag ?? true,
    STRIP_IGNORE_TAGBODY: true,
  };

  try {
    return DOMPurify.sanitize(dirty, defaultConfig);
  } catch (error) {
    logger.error('HTML sanitization failed', error as Error, { dirty });
    return '';
  }
};

/**
 * テキストコンテンツのエスケープ
 */
export const escapeHtml = (unsafe: string): string => {
  if (!unsafe || typeof unsafe !== 'string') {
    return '';
  }

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return unsafe.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
};

/**
 * URLの安全性チェック
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // 危険なプロトコルを拒否
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
    if (dangerousProtocols.some(protocol => urlObj.protocol.toLowerCase().startsWith(protocol))) {
      return false;
    }

    // 許可されたプロトコルのみ
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    return allowedProtocols.includes(urlObj.protocol.toLowerCase());
  } catch {
    return false;
  }
};

/**
 * CSRFトークンの管理
 */
export class CSRFProtection {
  private static tokenKey = 'csrf-token';
  private static headerName = 'X-CSRF-Token';

  /**
   * CSRFトークンの生成
   */
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * CSRFトークンを設定
   */
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.tokenKey, token);

      // metaタグにも設定（従来のフォーム送信用）
      let metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'csrf-token';
        document.head.appendChild(metaTag);
      }
      metaTag.content = token;
    }
  }

  /**
   * CSRFトークンを取得
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      // sessionStorageから取得を試行
      let token = sessionStorage.getItem(this.tokenKey);

      // なければmetaタグから取得
      if (!token) {
        const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
        token = metaTag?.content || null;
      }

      return token;
    }
    return null;
  }

  /**
   * リクエストヘッダーにCSRFトークンを追加
   */
  static addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[this.headerName] = token;
    }
    return headers;
  }

  /**
   * CSRFトークンの検証
   */
  static validateToken(requestToken: string): boolean {
    const storedToken = this.getToken();
    if (!storedToken || !requestToken) {
      return false;
    }

    // 定数時間比較でタイミング攻撃を防ぐ
    return this.constantTimeEqual(storedToken, requestToken);
  }

  /**
   * 定数時間での文字列比較
   */
  private static constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

/**
 * 入力データのサニタイゼーション
 */
export const inputSanitizer = {
  /**
   * 文字列の基本的なサニタイゼーション
   */
  sanitizeString: (input: unknown): string => {
    if (typeof input !== 'string') {
      return '';
    }

    // 制御文字を除去
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');

    // 過度な空白を正規化
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  },

  /**
   * 数値の安全な変換
   */
  sanitizeNumber: (input: unknown): number | null => {
    if (typeof input === 'number') {
      return isFinite(input) ? input : null;
    }

    if (typeof input === 'string') {
      const num = parseFloat(input);
      return isFinite(num) ? num : null;
    }

    return null;
  },

  /**
   * 真偽値の安全な変換
   */
  sanitizeBoolean: (input: unknown): boolean => {
    if (typeof input === 'boolean') {
      return input;
    }

    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      return lower === 'true' || lower === '1' || lower === 'yes';
    }

    if (typeof input === 'number') {
      return input !== 0;
    }

    return false;
  },

  /**
   * 配列の安全な変換
   */
  sanitizeArray: <T>(input: unknown, itemSanitizer: (item: unknown) => T): T[] => {
    if (!Array.isArray(input)) {
      return [];
    }

    return input.map(itemSanitizer).filter(item => item !== null && item !== undefined);
  },

  /**
   * オブジェクトキーの安全性チェック
   */
  sanitizeObjectKeys: (obj: Record<string, unknown>, allowedKeys: string[]): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};

    allowedKeys.forEach(key => {
      if (key in obj) {
        sanitized[key] = obj[key];
      }
    });

    return sanitized;
  },
};

/**
 * ファイルアップロードのセキュリティチェック
 */
export const fileSecurityChecker = {
  /**
   * ファイル形式の検証
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    if (!file || !file.type) {
      return false;
    }

    return allowedTypes.includes(file.type);
  },

  /**
   * ファイルサイズの検証
   */
  validateFileSize: (file: File, maxSizeInMB: number): boolean => {
    if (!file) {
      return false;
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  /**
   * ファイル名の安全性チェック
   */
  sanitizeFileName: (fileName: string): string => {
    if (!fileName || typeof fileName !== 'string') {
      return 'untitled';
    }

    // 危険な文字を除去
    let sanitized = fileName.replace(/[^\w\s.-]/gi, '');

    // 連続するドットを防ぐ
    sanitized = sanitized.replace(/\.{2,}/g, '.');

    // 先頭・末尾のドットやスペースを除去
    sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');

    // 長すぎるファイル名を切り詰め
    if (sanitized.length > 100) {
      const ext = sanitized.match(/\.[^.]*$/)?.[0] || '';
      const name = sanitized.substring(0, 100 - ext.length);
      sanitized = name + ext;
    }

    return sanitized || 'untitled';
  },

  /**
   * 画像ファイルの基本的な検証
   */
  validateImageFile: async (file: File): Promise<boolean> => {
    if (!file.type.startsWith('image/')) {
      return false;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        // 基本的な画像として読み込めた場合は有効
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;

      // タイムアウト設定
      setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(false);
      }, 5000);
    });
  },
};

/**
 * セキュアな localStorage/sessionStorage の操作
 */
export const secureStorage = {
  /**
   * 暗号化されたデータの保存
   */
  setSecureItem: async (key: string, value: unknown): Promise<void> => {
    try {
      const jsonString = JSON.stringify(value);

      // 簡単な難読化（本格的な暗号化ではない）
      const encoded = btoa(encodeURIComponent(jsonString));

      localStorage.setItem(`secure_${key}`, encoded);
    } catch (error) {
      logger.error('Secure storage set failed', error as Error, { key });
      throw new Error('データの保存に失敗しました');
    }
  },

  /**
   * 暗号化されたデータの取得
   */
  getSecureItem: <T>(key: string): T | null => {
    try {
      const encoded = localStorage.getItem(`secure_${key}`);
      if (!encoded) {
        return null;
      }

      const jsonString = decodeURIComponent(atob(encoded));
      return JSON.parse(jsonString) as T;
    } catch (error) {
      logger.error('Secure storage get failed', error as Error, { key });
      return null;
    }
  },

  /**
   * セキュアなアイテムの削除
   */
  removeSecureItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  },

  /**
   * セキュアなストレージのクリア
   */
  clearSecureStorage: (): void => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  },
};

/**
 * レート制限の実装
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * レート制限チェック
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 既存のリクエストを取得
    let requests = this.requests.get(identifier) || [];

    // 時間窓外のリクエストを除去
    requests = requests.filter(timestamp => timestamp > windowStart);

    // 制限チェック
    if (requests.length >= this.maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, requests: requests.length });
      return false;
    }

    // 新しいリクエストを追加
    requests.push(now);
    this.requests.set(identifier, requests);

    return true;
  }

  /**
   * 特定の識別子のリセット
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * すべてのデータをクリア
   */
  clear(): void {
    this.requests.clear();
  }
}

// デフォルトのレートリミッターインスタンス
export const defaultRateLimiter = new RateLimiter(
  config.app.rateLimit.windowMs,
  config.app.rateLimit.maxRequests
);

/**
 * パスワード管理クラス
 * Node.jsの標準cryptoモジュールを使用してパスワードハッシュ化と検証を実装
 */
export class PasswordManager {
  /**
   * パスワードをハッシュ化
   * 注意: 本番環境ではbcryptなどの専用ライブラリの使用を推奨
   */
  static async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required');
    }

    // Node.jsの標準cryptoを使用
    const crypto = await import('crypto');
    
    // ソルトを生成
    const salt = crypto.randomBytes(16).toString('hex');
    
    // パスワードとソルトを結合してハッシュ化
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    // ソルトとハッシュを結合して返す（形式: salt:hash）
    return `${salt}:${hash}`;
  }

  /**
   * パスワードを検証
   * @param password - 検証するパスワード（平文）
   * @param hashedPassword - ハッシュ化されたパスワード（salt:hash形式、またはbcrypt形式）
   */
  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    if (!password || !hashedPassword) {
      return false;
    }

    try {
      // bcrypt形式（$2b$、$2a$、$2y$で始まる）の場合はbcryptjsを使用
      if (hashedPassword.startsWith('$2b$') || hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2y$')) {
        return await bcrypt.compare(password, hashedPassword);
      }
      
      // salt:hash形式（pbkdf2）の場合
      const crypto = await import('crypto');
      const [salt, hash] = hashedPassword.split(':');
      
      if (!salt || !hash) {
        return false;
      }
      
      // 入力パスワードを同じソルトでハッシュ化
      const inputHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      // 定数時間比較でタイミング攻撃を防ぐ
      return this.constantTimeEqual(hash, inputHash);
    } catch (error) {
      logger.error('Password verification failed', error as Error);
      return false;
    }
  }

  /**
   * 定数時間での文字列比較（タイミング攻撃対策）
   */
  private static constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}

/**
 * セキュリティヘッダーのユーティリティ
 */
export const securityHeaders = {
  /**
   * セキュアなレスポンスヘッダーを生成
   */
  getSecureHeaders: (): Record<string, string> => ({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    ...(config.env.isProduction && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    }),
  }),

  /**
   * CSP（Content Security Policy）を生成
   */
  generateCSP: (nonce?: string): string => {
    const directives = [
      "default-src 'self'",
      `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"} 'unsafe-eval'`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    return directives.join('; ');
  },
};

const securityModule = {
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
  PasswordManager,
};

export default securityModule;