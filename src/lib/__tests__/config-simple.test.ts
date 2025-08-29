/**
 * 簡素化されたconfig.tsのテスト
 * カバレッジ目標: 100%
 */

import { 
  AppConfig, 
  DatabaseConfig, 
  ApiEndpoints, 
  FeatureFlags,
  createApiEndpoints,
  createDatabaseConfig,
  createAppConfig,
  validateConfig
} from '../config';

describe('Config Module', () => {
  describe('createApiEndpoints', () => {
    it('デフォルトのAPIエンドポイントが作成される', () => {
      const endpoints = createApiEndpoints();
      
      expect(endpoints.cases).toBe('/api/cases');
      expect(endpoints.estimates).toBe('/api/estimates');
      expect(endpoints.trucks).toBe('/api/trucks');
      expect(endpoints.shifts).toBe('/api/shifts');
      expect(endpoints.dispatch).toBe('/api/dispatch');
      expect(endpoints.auth).toBe('/api/auth');
      expect(endpoints.users).toBe('/api/users');
    });

    it('カスタムベースURLでAPIエンドポイントが作成される', () => {
      const baseUrl = 'https://api.example.com';
      const endpoints = createApiEndpoints(baseUrl);
      
      expect(endpoints.cases).toBe('https://api.example.com/api/cases');
      expect(endpoints.estimates).toBe('https://api.example.com/api/estimates');
      expect(endpoints.trucks).toBe('https://api.example.com/api/trucks');
      expect(endpoints.shifts).toBe('https://api.example.com/api/shifts');
      expect(endpoints.dispatch).toBe('https://api.example.com/api/dispatch');
      expect(endpoints.auth).toBe('https://api.example.com/api/auth');
      expect(endpoints.users).toBe('https://api.example.com/api/users');
    });

    it('空文字列のベースURLでもAPIエンドポイントが作成される', () => {
      const endpoints = createApiEndpoints('');
      
      expect(endpoints.cases).toBe('/api/cases');
      expect(endpoints.estimates).toBe('/api/estimates');
    });
  });

  describe('createDatabaseConfig', () => {
    it('開発環境のデータベース設定が作成される', () => {
      const config = createDatabaseConfig('development');
      
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('syncworks_dev');
      expect(config.username).toBe('postgres');
      expect(config.password).toBe('password');
      expect(config.ssl).toBe(false);
      expect(config.logging).toBe(true);
      expect(config.maxConnections).toBe(10);
    });

    it('本番環境のデータベース設定が作成される', () => {
      const config = createDatabaseConfig('production');
      
      expect(config.host).toBe(process.env.DB_HOST || 'localhost');
      expect(config.port).toBe(parseInt(process.env.DB_PORT || '5432'));
      expect(config.database).toBe(process.env.DB_NAME || 'syncworks');
      expect(config.username).toBe(process.env.DB_USER || 'postgres');
      expect(config.password).toBe(process.env.DB_PASSWORD || '');
      expect(config.ssl).toBe(true);
      expect(config.logging).toBe(false);
      expect(config.maxConnections).toBe(20);
    });

    it('テスト環境のデータベース設定が作成される', () => {
      const config = createDatabaseConfig('test');
      
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('syncworks_test');
      expect(config.username).toBe('postgres');
      expect(config.password).toBe('password');
      expect(config.ssl).toBe(false);
      expect(config.logging).toBe(false);
      expect(config.maxConnections).toBe(5);
    });

    it('未知の環境では開発環境の設定が使用される', () => {
      const config = createDatabaseConfig('unknown' as any);
      
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.database).toBe('syncworks_dev');
      expect(config.ssl).toBe(false);
      expect(config.logging).toBe(true);
      expect(config.maxConnections).toBe(10);
    });
  });

  describe('createAppConfig', () => {
    it('アプリケーション設定が作成される', () => {
      const config = createAppConfig();
      
      expect(config.app).toEqual({
        name: 'SyncWorks',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      });
      
      expect(config.server.port).toBe(parseInt(process.env.PORT || '3000'));
      expect(config.server.host).toBe(process.env.HOST || 'localhost');
      
      expect(config.api).toEqual(createApiEndpoints(process.env.API_BASE_URL));
      
      expect(config.database).toEqual(createDatabaseConfig(process.env.NODE_ENV as any));
      
      expect(config.features).toEqual({
        enableAnalytics: process.env.NODE_ENV === 'production',
        enableDebugMode: process.env.NODE_ENV === 'development',
        enableMaintenanceMode: false,
        enableNewDashboard: true,
        enableExperimentalFeatures: process.env.NODE_ENV === 'development'
      });
    });
  });

  describe('validateConfig', () => {
    it('有効な設定では例外が発生しない', () => {
      const validConfig: AppConfig = {
        app: {
          name: 'Test App',
          version: '1.0.0',
          environment: 'development'
        },
        server: {
          port: 3000,
          host: 'localhost'
        },
        api: {
          cases: '/api/cases',
          estimates: '/api/estimates',
          trucks: '/api/trucks',
          shifts: '/api/shifts',
          dispatch: '/api/dispatch',
          auth: '/api/auth',
          users: '/api/users'
        },
        database: {
          host: 'localhost',
          port: 5432,
          database: 'test',
          username: 'test',
          password: 'test',
          ssl: false,
          logging: false,
          maxConnections: 10
        },
        features: {
          enableAnalytics: false,
          enableDebugMode: true,
          enableMaintenanceMode: false,
          enableNewDashboard: true,
          enableExperimentalFeatures: false
        }
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
    });
  });

  describe('型定義', () => {
    it('DatabaseConfigの型が正しく定義される', () => {
      const config: DatabaseConfig = {
        host: 'localhost',
        port: 5432,
        database: 'test',
        username: 'user',
        password: 'pass',
        ssl: true,
        logging: false,
        maxConnections: 10
      };

      expect(typeof config.host).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(typeof config.ssl).toBe('boolean');
      expect(typeof config.logging).toBe('boolean');
      expect(typeof config.maxConnections).toBe('number');
    });

    it('ApiEndpointsの型が正しく定義される', () => {
      const endpoints: ApiEndpoints = {
        cases: '/api/cases',
        estimates: '/api/estimates',
        trucks: '/api/trucks',
        shifts: '/api/shifts',
        dispatch: '/api/dispatch',
        auth: '/api/auth',
        users: '/api/users'
      };

      Object.values(endpoints).forEach(endpoint => {
        expect(typeof endpoint).toBe('string');
      });
    });

    it('FeatureFlagsの型が正しく定義される', () => {
      const features: FeatureFlags = {
        enableAnalytics: true,
        enableDebugMode: false,
        enableMaintenanceMode: false,
        enableNewDashboard: true,
        enableExperimentalFeatures: false
      };

      Object.values(features).forEach(flag => {
        expect(typeof flag).toBe('boolean');
      });
    });
  });
});