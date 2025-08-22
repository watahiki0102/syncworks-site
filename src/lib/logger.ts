/**
 * 統一されたログシステム
 * - 構造化ログ
 * - レベル別ログ出力
 * - 本番環境での適切なログ管理
 * - パフォーマンス測定
 */
import { config } from './config';

// ログレベルの定義
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ログエントリの型定義
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
}

// ログ設定
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemoteLogging: boolean;
  maxEntries: number;
}

/**
 * ログレベルの優先度
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * ロガークラス
 */
class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private sessionId: string;

  constructor(options: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: config.env.isProduction ? 'info' : 'debug',
      enableConsole: !config.env.isProduction,
      enableRemoteLogging: config.env.isProduction,
      maxEntries: 1000,
      ...options,
    };

    // セッションIDの生成
    this.sessionId = this.generateId();

    // 本番環境では定期的にログをフラッシュ
    if (this.config.enableRemoteLogging) {
      setInterval(() => this.flushLogs(), 30000); // 30秒ごと
    }
  }

  /**
   * ユニークIDの生成
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  /**
   * ログレベルのチェック
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  /**
   * ログエントリの作成
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error,
    context?: {
      userId?: string;
      requestId?: string;
      component?: string;
      action?: string;
    }
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
      sessionId: this.sessionId,
      ...context,
    };
  }

  /**
   * ログの出力
   */
  private writeLog(entry: LogEntry): void {
    // ログレベルチェック
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // バッファに追加
    this.logBuffer.push(entry);

    // バッファサイズの制限
    if (this.logBuffer.length > this.config.maxEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxEntries);
    }

    // コンソール出力
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // エラーレベルの場合は即座にリモートログに送信
    if (entry.level === 'error' && this.config.enableRemoteLogging) {
      this.sendToRemote([entry]);
    }
  }

  /**
   * コンソールへの出力
   */
  private outputToConsole(entry: LogEntry): void {
    const { timestamp, level, message, data, error, component, action } = entry;
    
    // カラー付きログ出力
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    
    const prefix = `${colors[level]}[${level.toUpperCase()}]${reset}`;
    const time = new Date(timestamp).toLocaleTimeString();
    const context = component ? `[${component}${action ? `:${action}` : ''}]` : '';
    
    console.log(`${prefix} ${time} ${context} ${message}`);
    
    if (data) {
      console.log('Data:', data);
    }
    
    if (error) {
      console.error('Error:', error);
    }
  }

  /**
   * リモートログサーバーへの送信
   */
  private async sendToRemote(entries: LogEntry[]): Promise<void> {
    if (!this.config.enableRemoteLogging) return;

    try {
      // 実際の実装では適切なログサーバーのエンドポイントに送信
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });
    } catch (error) {
      // リモートログ送信の失敗は無視（無限ループを防ぐ）
      console.error('Failed to send logs to remote:', error);
    }
  }

  /**
   * バッファ内のログをフラッシュ
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    await this.sendToRemote(logsToSend);
  }

  /**
   * デバッグログ
   */
  debug(message: string, data?: Record<string, unknown>, context?: { component?: string; action?: string }): void {
    this.writeLog(this.createLogEntry('debug', message, data, undefined, context));
  }

  /**
   * 情報ログ
   */
  info(message: string, data?: Record<string, unknown>, context?: { component?: string; action?: string }): void {
    this.writeLog(this.createLogEntry('info', message, data, undefined, context));
  }

  /**
   * 警告ログ
   */
  warn(message: string, data?: Record<string, unknown>, context?: { component?: string; action?: string }): void {
    this.writeLog(this.createLogEntry('warn', message, data, undefined, context));
  }

  /**
   * エラーログ
   */
  error(message: string, error?: Error, data?: Record<string, unknown>, context?: { component?: string; action?: string }): void {
    this.writeLog(this.createLogEntry('error', message, data, error, context));
  }

  /**
   * パフォーマンス測定の開始
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();
    const startEntry = this.createLogEntry('debug', `Timer started: ${label}`, { startTime });
    
    if (this.config.enableConsole) {
      console.time(label);
    }

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.writeLog(this.createLogEntry('debug', `Timer ended: ${label}`, { 
        startTime, 
        endTime, 
        duration: `${duration.toFixed(2)}ms` 
      }));

      if (this.config.enableConsole) {
        console.timeEnd(label);
      }
    };
  }

  /**
   * ユーザーアクションのログ
   */
  logUserAction(action: string, data?: Record<string, unknown>, userId?: string): void {
    this.info(`User action: ${action}`, { 
      ...data,
      userId 
    }, { 
      component: 'UserAction',
      action 
    });
  }

  /**
   * APIリクエストのログ
   */
  logApiRequest(method: string, endpoint: string, status?: number, duration?: number, data?: Record<string, unknown>): void {
    const level = status && status >= 400 ? 'error' : 'info';
    const message = `API ${method} ${endpoint} ${status ? `- ${status}` : ''}`;
    
    this.writeLog(this.createLogEntry(level, message, {
      ...data,
      method,
      endpoint,
      status,
      duration: duration ? `${duration}ms` : undefined,
    }, undefined, { component: 'API' }));
  }

  /**
   * コンポーネントログ
   */
  logComponent(component: string, action: string, data?: Record<string, unknown>): void {
    this.debug(`${component}: ${action}`, data, { component, action });
  }

  /**
   * 設定の更新
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * ログ履歴の取得（デバッグ用）
   */
  getLogHistory(level?: LogLevel, limit?: number): LogEntry[] {
    let logs = [...this.logBuffer];
    
    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }
    
    if (limit) {
      logs = logs.slice(-limit);
    }
    
    return logs;
  }

  /**
   * ログの手動フラッシュ
   */
  async flush(): Promise<void> {
    await this.flushLogs();
  }
}

// デフォルトロガーインスタンス
export const logger = new Logger();

// 便利な関数をエクスポート
export const log = {
  debug: (message: string, data?: Record<string, unknown>, context?: { component?: string; action?: string }) =>
    logger.debug(message, data, context),
    
  info: (message: string, data?: Record<string, unknown>, context?: { component?: string; action?: string }) =>
    logger.info(message, data, context),
    
  warn: (message: string, data?: Record<string, unknown>, context?: { component?: string; action?: string }) =>
    logger.warn(message, data, context),
    
  error: (message: string, error?: Error, data?: Record<string, unknown>, context?: { component?: string; action?: string }) =>
    logger.error(message, error, data, context),
    
  timer: (label: string) => logger.startTimer(label),
  
  userAction: (action: string, data?: Record<string, unknown>, userId?: string) =>
    logger.logUserAction(action, data, userId),
    
  apiRequest: (method: string, endpoint: string, status?: number, duration?: number, data?: Record<string, unknown>) =>
    logger.logApiRequest(method, endpoint, status, duration, data),
    
  component: (component: string, action: string, data?: Record<string, unknown>) =>
    logger.logComponent(component, action, data),
};

export default logger;