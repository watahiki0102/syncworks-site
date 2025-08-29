/**
 * config.ts のテスト
 * カバレッジ目標: 100%
 */

import { config, getEnvVar, validateConfig } from '../config';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をリセット
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('デフォルト設定が正しく適用される', () => {
    // 環境変数をクリア
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;

    const { config } = require('../config');

    expect(config.NODE_ENV).toBe('development');
    expect(config.NEXT_PUBLIC_BASE_URL).toBe('http://localhost:3000');
    expect(config.NEXT_PUBLIC_API_BASE_URL).toBe('http://localhost:3000/api');
  });

  it('環境変数が正しく読み込まれる', () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.SECRET_KEY = 'super-secret-key';

    const { config } = require('../config');

    expect(config.NODE_ENV).toBe('production');
    expect(config.NEXT_PUBLIC_BASE_URL).toBe('https://example.com');
    expect(config.NEXT_PUBLIC_API_BASE_URL).toBe('https://api.example.com');
    expect(config.DATABASE_URL).toBe('postgres://user:pass@localhost:5432/db');
    expect(config.SECRET_KEY).toBe('super-secret-key');
  });

  it('test環境の設定が正しく適用される', () => {
    process.env.NODE_ENV = 'test';
    
    const { config } = require('../config');
    
    expect(config.NODE_ENV).toBe('test');
  });
});

describe('getEnvVar', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('存在する環境変数を正しく取得する', () => {
    process.env.NODE_ENV = 'production';
    
    expect(getEnvVar('NODE_ENV')).toBe('production');
  });

  it('存在しない環境変数の場合にデフォルト値を返す', () => {
    delete process.env.DATABASE_URL;
    
    expect(getEnvVar('DATABASE_URL', 'default-url')).toBe('default-url');
  });

  it('存在しない環境変数でデフォルト値がない場合にundefinedを返す', () => {
    delete process.env.DATABASE_URL;
    
    expect(getEnvVar('DATABASE_URL')).toBeUndefined();
  });

  it('空文字列の環境変数を正しく処理する', () => {
    process.env.DATABASE_URL = '';
    
    expect(getEnvVar('DATABASE_URL')).toBe('');
  });
});

describe('validateConfig', () => {
  it('有効な設定でtrueを返す', () => {
    const validConfig = {
      NODE_ENV: 'production' as const,
      NEXT_PUBLIC_BASE_URL: 'https://example.com',
      NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com'
    };

    expect(validateConfig(validConfig)).toBe(true);
  });

  it('無効なNODE_ENVでfalseを返す', () => {
    const invalidConfig = {
      NODE_ENV: 'invalid' as any,
      NEXT_PUBLIC_BASE_URL: 'https://example.com',
      NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com'
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('無効なURLでfalseを返す', () => {
    const invalidConfig = {
      NODE_ENV: 'production' as const,
      NEXT_PUBLIC_BASE_URL: 'invalid-url',
      NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com'
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('必須項目が不足している場合にfalseを返す', () => {
    const incompleteConfig = {
      NODE_ENV: 'production' as const,
      // NEXT_PUBLIC_BASE_URLが不足
      NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com'
    };

    expect(validateConfig(incompleteConfig as any)).toBe(false);
  });

  describe('URL検証', () => {
    it('HTTPSのURLを有効として認識する', () => {
      const config = {
        NODE_ENV: 'production' as const,
        NEXT_PUBLIC_BASE_URL: 'https://secure.example.com',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.secure.example.com'
      };

      expect(validateConfig(config)).toBe(true);
    });

    it('HTTPのURLを有効として認識する', () => {
      const config = {
        NODE_ENV: 'development' as const,
        NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api'
      };

      expect(validateConfig(config)).toBe(true);
    });

    it('ポート番号付きのURLを有効として認識する', () => {
      const config = {
        NODE_ENV: 'development' as const,
        NEXT_PUBLIC_BASE_URL: 'http://localhost:8080',
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:8080/api'
      };

      expect(validateConfig(config)).toBe(true);
    });
  });

  describe('オプショナル項目の検証', () => {
    it('DATABASE_URLがある場合に検証する', () => {
      const configWithDB = {
        NODE_ENV: 'production' as const,
        NEXT_PUBLIC_BASE_URL: 'https://example.com',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db'
      };

      expect(validateConfig(configWithDB)).toBe(true);
    });

    it('無効なDATABASE_URLでfalseを返す', () => {
      const configWithInvalidDB = {
        NODE_ENV: 'production' as const,
        NEXT_PUBLIC_BASE_URL: 'https://example.com',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
        DATABASE_URL: 'invalid-db-url'
      };

      expect(validateConfig(configWithInvalidDB)).toBe(false);
    });

    it('SECRET_KEYがある場合に検証する', () => {
      const configWithSecret = {
        NODE_ENV: 'production' as const,
        NEXT_PUBLIC_BASE_URL: 'https://example.com',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
        SECRET_KEY: 'valid-secret-key-with-enough-length'
      };

      expect(validateConfig(configWithSecret)).toBe(true);
    });

    it('短すぎるSECRET_KEYでfalseを返す', () => {
      const configWithShortSecret = {
        NODE_ENV: 'production' as const,
        NEXT_PUBLIC_BASE_URL: 'https://example.com',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com',
        SECRET_KEY: 'short'
      };

      expect(validateConfig(configWithShortSecret)).toBe(false);
    });
  });
});

describe('設定のエクスポート', () => {
  it('configオブジェクトが正しくエクスポートされる', () => {
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
    expect(config.NODE_ENV).toBeDefined();
    expect(config.NEXT_PUBLIC_BASE_URL).toBeDefined();
    expect(config.NEXT_PUBLIC_API_BASE_URL).toBeDefined();
  });

  it('URLヘルパー関数が含まれている', () => {
    expect(config.urls).toBeDefined();
    expect(typeof config.urls.base).toBe('string');
    expect(typeof config.urls.api).toBe('string');
  });

  it('環境判定ヘルパー関数が含まれている', () => {
    expect(typeof config.isDevelopment).toBe('boolean');
    expect(typeof config.isProduction).toBe('boolean');
    expect(typeof config.isTest).toBe('boolean');
  });
});

describe('環境別設定', () => {
  it('開発環境で適切な設定が適用される', () => {
    process.env.NODE_ENV = 'development';
    
    const { config } = require('../config');
    
    expect(config.isDevelopment).toBe(true);
    expect(config.isProduction).toBe(false);
    expect(config.isTest).toBe(false);
  });

  it('本番環境で適切な設定が適用される', () => {
    process.env.NODE_ENV = 'production';
    
    const { config } = require('../config');
    
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(true);
    expect(config.isTest).toBe(false);
  });

  it('テスト環境で適切な設定が適用される', () => {
    process.env.NODE_ENV = 'test';
    
    const { config } = require('../config');
    
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(false);
    expect(config.isTest).toBe(true);
  });
});