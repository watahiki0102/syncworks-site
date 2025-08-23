/**
 * リアルタイムコード品質モニタリング
 * - TDD開発時のコード品質をリアルタイム監視
 * - メトリクス収集と分析
 * - 品質低下の早期警告
 */

interface QualityMetrics {
  timestamp: number;
  testCoverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  performance: {
    averageExecutionTime: number;
    throughput: number;
    memoryUsage: number;
  };
  codeComplexity: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    technicalDebt: number;
  };
  testMetrics: {
    testCount: number;
    passRate: number;
    failureRate: number;
    skippedRate: number;
  };
  maintainability: {
    duplicationRate: number;
    couplingIndex: number;
    cohesionIndex: number;
  };
}

interface QualityThresholds {
  testCoverage: {
    lines: number;
    branches: number;
    functions: number;
    statements: number;
  };
  performance: {
    maxExecutionTime: number;
    minThroughput: number;
    maxMemoryUsage: number;
  };
  codeComplexity: {
    maxCyclomaticComplexity: number;
    maxLinesOfCode: number;
    maxTechnicalDebt: number;
  };
  maintainability: {
    maxDuplicationRate: number;
    maxCouplingIndex: number;
    minCohesionIndex: number;
  };
}

interface QualityAlert {
  level: 'info' | 'warning' | 'error' | 'critical';
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  suggestions: string[];
}

/**
 * コード品質モニター
 */
export class CodeQualityMonitor {
  private metrics: QualityMetrics[] = [];
  private thresholds: QualityThresholds;
  private alerts: QualityAlert[] = [];
  private subscribers: ((alert: QualityAlert) => void)[] = [];

  constructor(thresholds?: Partial<QualityThresholds>) {
    this.thresholds = {
      testCoverage: {
        lines: 80,
        branches: 75,
        functions: 85,
        statements: 80,
      },
      performance: {
        maxExecutionTime: 100, // ms
        minThroughput: 1000,   // ops/sec
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      },
      codeComplexity: {
        maxCyclomaticComplexity: 10,
        maxLinesOfCode: 500,
        maxTechnicalDebt: 30, // minutes
      },
      maintainability: {
        maxDuplicationRate: 5, // %
        maxCouplingIndex: 0.5,
        minCohesionIndex: 0.7,
      },
      ...thresholds,
    };
  }

  /**
   * メトリクスを記録
   */
  recordMetrics(metrics: Partial<QualityMetrics>): void {
    const fullMetrics: QualityMetrics = {
      timestamp: Date.now(),
      testCoverage: {
        lines: 0,
        branches: 0,
        functions: 0,
        statements: 0,
      },
      performance: {
        averageExecutionTime: 0,
        throughput: 0,
        memoryUsage: 0,
      },
      codeComplexity: {
        cyclomaticComplexity: 0,
        linesOfCode: 0,
        technicalDebt: 0,
      },
      testMetrics: {
        testCount: 0,
        passRate: 100,
        failureRate: 0,
        skippedRate: 0,
      },
      maintainability: {
        duplicationRate: 0,
        couplingIndex: 0,
        cohesionIndex: 1,
      },
      ...metrics,
    };

    this.metrics.push(fullMetrics);
    this.checkThresholds(fullMetrics);

    // 古いメトリクスを削除（最新100件のみ保持）
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * 閾値チェックとアラート生成
   */
  private checkThresholds(metrics: QualityMetrics): void {
    const alerts: QualityAlert[] = [];

    // テストカバレッジのチェック
    if (metrics.testCoverage.lines < this.thresholds.testCoverage.lines) {
      alerts.push({
        level: 'warning',
        metric: 'testCoverage.lines',
        message: `行カバレッジが低下しています (${metrics.testCoverage.lines}%)`,
        value: metrics.testCoverage.lines,
        threshold: this.thresholds.testCoverage.lines,
        timestamp: metrics.timestamp,
        suggestions: [
          '新しいテストケースを追加してください',
          '未テストのコードパスを特定してください',
          'エッジケースのテストを強化してください',
        ],
      });
    }

    if (metrics.testCoverage.branches < this.thresholds.testCoverage.branches) {
      alerts.push({
        level: 'warning',
        metric: 'testCoverage.branches',
        message: `分岐カバレッジが低下しています (${metrics.testCoverage.branches}%)`,
        value: metrics.testCoverage.branches,
        threshold: this.thresholds.testCoverage.branches,
        timestamp: metrics.timestamp,
        suggestions: [
          '条件分岐のテストを追加してください',
          'if-else文の両方のパスをテストしてください',
          'switch文のすべてのケースをテストしてください',
        ],
      });
    }

    // パフォーマンスのチェック
    if (metrics.performance.averageExecutionTime > this.thresholds.performance.maxExecutionTime) {
      alerts.push({
        level: 'error',
        metric: 'performance.averageExecutionTime',
        message: `実行時間が閾値を超えています (${metrics.performance.averageExecutionTime}ms)`,
        value: metrics.performance.averageExecutionTime,
        threshold: this.thresholds.performance.maxExecutionTime,
        timestamp: metrics.timestamp,
        suggestions: [
          'アルゴリズムの最適化を検討してください',
          'キャッシュの活用を検討してください',
          '重い処理の非同期化を検討してください',
        ],
      });
    }

    if (metrics.performance.throughput < this.thresholds.performance.minThroughput) {
      alerts.push({
        level: 'warning',
        metric: 'performance.throughput',
        message: `スループットが低下しています (${metrics.performance.throughput} ops/sec)`,
        value: metrics.performance.throughput,
        threshold: this.thresholds.performance.minThroughput,
        timestamp: metrics.timestamp,
        suggestions: [
          'バッチ処理の導入を検討してください',
          '並列処理の活用を検討してください',
          'ボトルネックの特定と改善を行ってください',
        ],
      });
    }

    // コード複雑度のチェック
    if (metrics.codeComplexity.cyclomaticComplexity > this.thresholds.codeComplexity.maxCyclomaticComplexity) {
      alerts.push({
        level: 'error',
        metric: 'codeComplexity.cyclomaticComplexity',
        message: `循環的複雑度が高すぎます (${metrics.codeComplexity.cyclomaticComplexity})`,
        value: metrics.codeComplexity.cyclomaticComplexity,
        threshold: this.thresholds.codeComplexity.maxCyclomaticComplexity,
        timestamp: metrics.timestamp,
        suggestions: [
          '関数を小さく分割してください',
          '条件分岐を減らしてください',
          'ポリモーフィズムの活用を検討してください',
        ],
      });
    }

    // 保守性のチェック
    if (metrics.maintainability.duplicationRate > this.thresholds.maintainability.maxDuplicationRate) {
      alerts.push({
        level: 'warning',
        metric: 'maintainability.duplicationRate',
        message: `コードの重複率が高いです (${metrics.maintainability.duplicationRate}%)`,
        value: metrics.maintainability.duplicationRate,
        threshold: this.thresholds.maintainability.maxDuplicationRate,
        timestamp: metrics.timestamp,
        suggestions: [
          '共通コードを関数に抽出してください',
          'ユーティリティ関数の作成を検討してください',
          'デザインパターンの適用を検討してください',
        ],
      });
    }

    // アラートを保存
    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.notifySubscribers(alert);
    });

    // 古いアラートを削除（最新50件のみ保持）
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  /**
   * アラート通知の購読
   */
  subscribe(callback: (alert: QualityAlert) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * 購読者への通知
   */
  private notifySubscribers(alert: QualityAlert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Alert notification failed:', error);
      }
    });
  }

  /**
   * 品質トレンドの分析
   */
  analyzeTrends(periodMinutes: number = 60): {
    coverage: { trend: 'improving' | 'stable' | 'declining'; change: number };
    performance: { trend: 'improving' | 'stable' | 'declining'; change: number };
    complexity: { trend: 'improving' | 'stable' | 'declining'; change: number };
  } {
    const cutoffTime = Date.now() - (periodMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length < 2) {
      return {
        coverage: { trend: 'stable', change: 0 },
        performance: { trend: 'stable', change: 0 },
        complexity: { trend: 'stable', change: 0 },
      };
    }

    const first = recentMetrics[0];
    const last = recentMetrics[recentMetrics.length - 1];

    const coverageChange = last.testCoverage.lines - first.testCoverage.lines;
    const performanceChange = first.performance.averageExecutionTime - last.performance.averageExecutionTime; // 実行時間は小さい方が良い
    const complexityChange = first.codeComplexity.cyclomaticComplexity - last.codeComplexity.cyclomaticComplexity; // 複雑度は小さい方が良い

    return {
      coverage: {
        trend: coverageChange > 2 ? 'improving' : coverageChange < -2 ? 'declining' : 'stable',
        change: coverageChange,
      },
      performance: {
        trend: performanceChange > 5 ? 'improving' : performanceChange < -5 ? 'declining' : 'stable',
        change: performanceChange,
      },
      complexity: {
        trend: complexityChange > 0.5 ? 'improving' : complexityChange < -0.5 ? 'declining' : 'stable',
        change: complexityChange,
      },
    };
  }

  /**
   * 品質スコアの計算
   */
  calculateQualityScore(): {
    overall: number;
    breakdown: {
      coverage: number;
      performance: number;
      complexity: number;
      maintainability: number;
    };
  } {
    if (this.metrics.length === 0) {
      return {
        overall: 0,
        breakdown: {
          coverage: 0,
          performance: 0,
          complexity: 0,
          maintainability: 0,
        },
      };
    }

    const latest = this.metrics[this.metrics.length - 1];

    // 各カテゴリのスコア計算（0-100）
    const coverageScore = Math.min(100, (
      latest.testCoverage.lines +
      latest.testCoverage.branches +
      latest.testCoverage.functions +
      latest.testCoverage.statements
    ) / 4);

    const performanceScore = Math.min(100, Math.max(0,
      100 - (latest.performance.averageExecutionTime / this.thresholds.performance.maxExecutionTime) * 50 +
      (latest.performance.throughput / this.thresholds.performance.minThroughput) * 50
    ));

    const complexityScore = Math.min(100, Math.max(0,
      100 - (latest.codeComplexity.cyclomaticComplexity / this.thresholds.codeComplexity.maxCyclomaticComplexity) * 100
    ));

    const maintainabilityScore = Math.min(100, Math.max(0,
      100 - (latest.maintainability.duplicationRate / this.thresholds.maintainability.maxDuplicationRate) * 50 +
      latest.maintainability.cohesionIndex * 50
    ));

    const overall = (coverageScore + performanceScore + complexityScore + maintainabilityScore) / 4;

    return {
      overall: Math.round(overall),
      breakdown: {
        coverage: Math.round(coverageScore),
        performance: Math.round(performanceScore),
        complexity: Math.round(complexityScore),
        maintainability: Math.round(maintainabilityScore),
      },
    };
  }

  /**
   * 品質レポートの生成
   */
  generateReport(): {
    summary: string;
    metrics: QualityMetrics | null;
    trends: ReturnType<CodeQualityMonitor['analyzeTrends']>;
    qualityScore: ReturnType<CodeQualityMonitor['calculateQualityScore']>;
    recentAlerts: QualityAlert[];
    recommendations: string[];
  } {
    const latest = this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    const trends = this.analyzeTrends();
    const qualityScore = this.calculateQualityScore();
    const recentAlerts = this.alerts.slice(-10);

    const recommendations: string[] = [];

    // 品質スコアに基づく推奨事項
    if (qualityScore.breakdown.coverage < 80) {
      recommendations.push('テストカバレッジを80%以上に向上させてください');
    }

    if (qualityScore.breakdown.performance < 70) {
      recommendations.push('パフォーマンスの最適化を検討してください');
    }

    if (qualityScore.breakdown.complexity < 70) {
      recommendations.push('コード複雑度を下げるリファクタリングを行ってください');
    }

    if (qualityScore.breakdown.maintainability < 70) {
      recommendations.push('保守性を向上させるためコードの重複を削減してください');
    }

    // トレンドに基づく推奨事項
    if (trends.coverage.trend === 'declining') {
      recommendations.push('テストカバレッジの低下が見られます。新機能にテストを追加してください');
    }

    if (trends.performance.trend === 'declining') {
      recommendations.push('パフォーマンス低下が検出されました。最近の変更を確認してください');
    }

    let summary = `総合品質スコア: ${qualityScore.overall}/100`;
    if (qualityScore.overall >= 80) {
      summary += ' (優秀)';
    } else if (qualityScore.overall >= 60) {
      summary += ' (良好)';
    } else if (qualityScore.overall >= 40) {
      summary += ' (改善が必要)';
    } else {
      summary += ' (要注意)';
    }

    return {
      summary,
      metrics: latest,
      trends,
      qualityScore,
      recentAlerts,
      recommendations,
    };
  }

  /**
   * メトリクス履歴の取得
   */
  getMetricsHistory(count: number = 10): QualityMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * アラート履歴の取得
   */
  getAlertHistory(count: number = 10): QualityAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * 閾値の更新
   */
  updateThresholds(newThresholds: Partial<QualityThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * データのクリア
   */
  clear(): void {
    this.metrics = [];
    this.alerts = [];
  }
}

/**
 * 品質モニタリングダッシュボード
 */
export class QualityDashboard {
  private monitor: CodeQualityMonitor;
  private updateInterval: number = 5000; // 5秒
  private intervalId?: NodeJS.Timeout;

  constructor(monitor: CodeQualityMonitor) {
    this.monitor = monitor;
  }

  /**
   * ダッシュボードの開始
   */
  start(): void {
    console.log('🎯 品質モニタリングダッシュボードを開始します');
    
    this.intervalId = setInterval(() => {
      this.displayStatus();
    }, this.updateInterval);

    // アラート通知の購読
    this.monitor.subscribe((alert) => {
      this.displayAlert(alert);
    });
  }

  /**
   * ダッシュボードの停止
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('🛑 品質モニタリングダッシュボードを停止しました');
  }

  /**
   * 現在の状態を表示
   */
  private displayStatus(): void {
    const report = this.monitor.generateReport();
    
    console.clear();
    console.log('🔍 リアルタイム品質モニタリング');
    console.log('================================');
    console.log(report.summary);
    console.log('');
    
    if (report.metrics) {
      console.log('📊 現在のメトリクス:');
      console.log(`  テストカバレッジ: ${report.metrics.testCoverage.lines}%`);
      console.log(`  平均実行時間: ${report.metrics.performance.averageExecutionTime}ms`);
      console.log(`  循環的複雑度: ${report.metrics.codeComplexity.cyclomaticComplexity}`);
      console.log('');
    }

    console.log('📈 トレンド:');
    console.log(`  カバレッジ: ${this.getTrendIcon(report.trends.coverage.trend)} ${report.trends.coverage.trend}`);
    console.log(`  パフォーマンス: ${this.getTrendIcon(report.trends.performance.trend)} ${report.trends.performance.trend}`);
    console.log(`  複雑度: ${this.getTrendIcon(report.trends.complexity.trend)} ${report.trends.complexity.trend}`);
    console.log('');

    if (report.recentAlerts.length > 0) {
      console.log('⚠️  最近のアラート:');
      report.recentAlerts.slice(-3).forEach(alert => {
        console.log(`  ${this.getAlertIcon(alert.level)} ${alert.message}`);
      });
      console.log('');
    }

    if (report.recommendations.length > 0) {
      console.log('💡 推奨事項:');
      report.recommendations.slice(0, 3).forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
  }

  /**
   * アラートを表示
   */
  private displayAlert(alert: QualityAlert): void {
    console.log(`\n${this.getAlertIcon(alert.level)} [${alert.level.toUpperCase()}] ${alert.message}`);
    console.log(`   現在値: ${alert.value}, 閾値: ${alert.threshold}`);
    if (alert.suggestions.length > 0) {
      console.log(`   提案: ${alert.suggestions[0]}`);
    }
    console.log('');
  }

  /**
   * トレンドアイコンを取得
   */
  private getTrendIcon(trend: 'improving' | 'stable' | 'declining'): string {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
    }
  }

  /**
   * アラートアイコンを取得
   */
  private getAlertIcon(level: 'info' | 'warning' | 'error' | 'critical'): string {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
    }
  }

  /**
   * 更新間隔の設定
   */
  setUpdateInterval(milliseconds: number): void {
    this.updateInterval = milliseconds;
    
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }
}

const QualityMonitorComponents = {
  CodeQualityMonitor,
  QualityDashboard,
};

export default QualityMonitorComponents;