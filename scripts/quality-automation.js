#!/usr/bin/env node

/**
 * TDD品質自動化スクリプト
 * - 品質メトリクスの自動収集
 * - パフォーマンス回帰検出
 * - 品質レポート生成
 * - CI/CD統合支援
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 品質メトリクス収集器
 */
class QualityMetricsCollector {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.outputDir = path.join(projectRoot, 'quality-reports');
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * テストカバレッジの取得
   */
  async collectCoverage() {
    console.log('📊 テストカバレッジを収集中...');
    
    try {
      // Jestでカバレッジを実行
      execSync('npm run test:coverage', { 
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

      // カバレッジデータを読み込み
      const coveragePath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        
        return {
          lines: coverageData.total.lines.pct,
          branches: coverageData.total.branches.pct,
          functions: coverageData.total.functions.pct,
          statements: coverageData.total.statements.pct,
        };
      }
    } catch (error) {
      console.warn('⚠️  カバレッジ取得に失敗:', error.message);
    }

    return {
      lines: 0,
      branches: 0,
      functions: 0,
      statements: 0,
    };
  }

  /**
   * パフォーマンスメトリクスの取得
   */
  async collectPerformance() {
    console.log('⚡ パフォーマンスメトリクスを収集中...');
    
    try {
      // ベンチマークテストを実行
      const output = execSync('npm test -- --testNamePattern="benchmark" --silent', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      // パフォーマンス結果を解析（実際の実装では正規表現などで解析）
      const avgTimeMatch = output.match(/平均時間: ([\d.]+)ms/);
      const throughputMatch = output.match(/スループット: ([\d.]+) ops\/sec/);

      return {
        averageExecutionTime: avgTimeMatch ? parseFloat(avgTimeMatch[1]) : 0,
        throughput: throughputMatch ? parseFloat(throughputMatch[1]) : 0,
        memoryUsage: process.memoryUsage().heapUsed,
      };
    } catch (error) {
      console.warn('⚠️  パフォーマンス測定に失敗:', error.message);
    }

    return {
      averageExecutionTime: 0,
      throughput: 0,
      memoryUsage: 0,
    };
  }

  /**
   * コード複雑度の取得
   */
  async collectComplexity() {
    console.log('🔧 コード複雑度を分析中...');
    
    try {
      // TypeScriptファイルの行数を計算
      const linesOutput = execSync('find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      const totalLines = parseInt(linesOutput.trim().split(/\s+/)[0]);

      // 簡易的な複雑度計算（実際の実装では専用ツールを使用）
      const srcFiles = this.findTypeScriptFiles();
      let totalComplexity = 0;
      let functionCount = 0;

      srcFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // if, while, for, switchの出現回数で簡易計算
        const complexityMatches = content.match(/\b(if|while|for|switch|catch)\b/g);
        const functionMatches = content.match(/\b(function|=>|\bclass\b|\bmethod\b)\b/g);
        
        if (complexityMatches) totalComplexity += complexityMatches.length;
        if (functionMatches) functionCount += functionMatches.length;
      });

      const avgComplexity = functionCount > 0 ? totalComplexity / functionCount : 0;

      return {
        cyclomaticComplexity: Math.round(avgComplexity * 100) / 100,
        linesOfCode: totalLines,
        technicalDebt: Math.round(avgComplexity * 2), // 簡易計算
      };
    } catch (error) {
      console.warn('⚠️  複雑度分析に失敗:', error.message);
    }

    return {
      cyclomaticComplexity: 0,
      linesOfCode: 0,
      technicalDebt: 0,
    };
  }

  /**
   * 保守性メトリクスの取得
   */
  async collectMaintainability() {
    console.log('🔍 保守性を分析中...');
    
    try {
      const srcFiles = this.findTypeScriptFiles();
      let totalLines = 0;
      let duplicatedLines = 0;

      // 簡易的な重複検出
      const lineMap = new Map();

      srcFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 10 && !line.startsWith('//') && !line.startsWith('*'));
        
        totalLines += lines.length;

        lines.forEach(line => {
          const count = lineMap.get(line) || 0;
          lineMap.set(line, count + 1);
          if (count === 1) duplicatedLines++; // 初回重複時にカウント
        });
      });

      const duplicationRate = totalLines > 0 ? (duplicatedLines / totalLines) * 100 : 0;

      return {
        duplicationRate: Math.round(duplicationRate * 100) / 100,
        couplingIndex: 0.3, // 簡易値
        cohesionIndex: 0.8, // 簡易値
      };
    } catch (error) {
      console.warn('⚠️  保守性分析に失敗:', error.message);
    }

    return {
      duplicationRate: 0,
      couplingIndex: 0,
      cohesionIndex: 1,
    };
  }

  /**
   * テストメトリクスの取得
   */
  async collectTestMetrics() {
    console.log('🧪 テストメトリクスを収集中...');
    
    try {
      // テストファイルの数を計算
      const testFiles = execSync('find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      const testCount = parseInt(testFiles.trim());

      // 実際の実装では、テスト実行結果から取得
      return {
        testCount,
        passRate: 95, // 簡易値
        failureRate: 3, // 簡易値
        skippedRate: 2, // 簡易値
      };
    } catch (error) {
      console.warn('⚠️  テストメトリクス取得に失敗:', error.message);
    }

    return {
      testCount: 0,
      passRate: 0,
      failureRate: 0,
      skippedRate: 0,
    };
  }

  /**
   * すべてのメトリクスを収集
   */
  async collectAllMetrics() {
    console.log('🚀 品質メトリクス収集を開始...');

    const metrics = {
      timestamp: Date.now(),
      testCoverage: await this.collectCoverage(),
      performance: await this.collectPerformance(),
      codeComplexity: await this.collectComplexity(),
      maintainability: await this.collectMaintainability(),
      testMetrics: await this.collectTestMetrics(),
    };

    // メトリクスファイルを保存
    const metricsFile = path.join(this.outputDir, 'metrics.json');
    fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

    console.log('✅ メトリクス収集完了');
    return metrics;
  }

  /**
   * TypeScriptファイルを検索
   */
  findTypeScriptFiles() {
    const findFiles = (dir, extension) => {
      let files = [];
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files = files.concat(findFiles(fullPath, extension));
        } else if (stat.isFile() && item.endsWith(extension)) {
          files.push(fullPath);
        }
      });

      return files;
    };

    const srcDir = path.join(this.projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return [];

    return [
      ...findFiles(srcDir, '.ts'),
      ...findFiles(srcDir, '.tsx')
    ].filter(file => !file.includes('.test.') && !file.includes('.spec.'));
  }
}

/**
 * 品質レポート生成器
 */
class QualityReportGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  /**
   * HTMLダッシュボードを生成
   */
  generateDashboard(metrics, trends = null) {
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TDD品質ダッシュボード</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
        }
        .metric-value {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        .metric-value.good { color: #10B981; }
        .metric-value.warning { color: #F59E0B; }
        .metric-value.danger { color: #EF4444; }
        .metric-unit {
            font-size: 14px;
            color: #666;
        }
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            height: 400px;
        }
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 TDD品質ダッシュボード</h1>
            <p>継続的なコード品質向上を支援</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">📊 テストカバレッジ</div>
                <div class="metric-value ${this.getColorClass(metrics.testCoverage.lines, 80, 60)}">
                    ${metrics.testCoverage.lines}
                </div>
                <div class="metric-unit">%</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">⚡ 平均実行時間</div>
                <div class="metric-value ${this.getColorClass(metrics.performance.averageExecutionTime, 100, 200, true)}">
                    ${metrics.performance.averageExecutionTime.toFixed(1)}
                </div>
                <div class="metric-unit">ms</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">🔧 循環的複雑度</div>
                <div class="metric-value ${this.getColorClass(metrics.codeComplexity.cyclomaticComplexity, 10, 15, true)}">
                    ${metrics.codeComplexity.cyclomaticComplexity.toFixed(1)}
                </div>
                <div class="metric-unit">平均</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">🔍 重複率</div>
                <div class="metric-value ${this.getColorClass(metrics.maintainability.duplicationRate, 5, 10, true)}">
                    ${metrics.maintainability.duplicationRate.toFixed(1)}
                </div>
                <div class="metric-unit">%</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">🧪 テスト数</div>
                <div class="metric-value good">
                    ${metrics.testMetrics.testCount}
                </div>
                <div class="metric-unit">件</div>
            </div>

            <div class="metric-card">
                <div class="metric-title">📈 スループット</div>
                <div class="metric-value ${this.getColorClass(metrics.performance.throughput, 1000, 500)}">
                    ${Math.round(metrics.performance.throughput)}
                </div>
                <div class="metric-unit">ops/sec</div>
            </div>
        </div>

        <div class="chart-container">
            <canvas id="coverageChart"></canvas>
        </div>

        <div class="timestamp">
            最終更新: ${new Date(metrics.timestamp).toLocaleString('ja-JP')}
        </div>
    </div>

    <script>
        // カバレッジチャート
        const ctx = document.getElementById('coverageChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['行カバレッジ', '分岐カバレッジ', '関数カバレッジ', '文カバレッジ'],
                datasets: [{
                    label: 'カバレッジ',
                    data: [
                        ${metrics.testCoverage.lines},
                        ${metrics.testCoverage.branches},
                        ${metrics.testCoverage.functions},
                        ${metrics.testCoverage.statements}
                    ],
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    pointBackgroundColor: 'rgb(16, 185, 129)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    const dashboardFile = path.join(this.outputDir, 'dashboard.html');
    fs.writeFileSync(dashboardFile, html);
    console.log('📊 ダッシュボードを生成:', dashboardFile);
  }

  /**
   * メトリクス値に応じた色クラスを取得
   */
  getColorClass(value, goodThreshold, warningThreshold, lowerIsBetter = false) {
    if (lowerIsBetter) {
      if (value <= goodThreshold) return 'good';
      if (value <= warningThreshold) return 'warning';
      return 'danger';
    } else {
      if (value >= goodThreshold) return 'good';
      if (value >= warningThreshold) return 'warning';
      return 'danger';
    }
  }

  /**
   * JSON品質レポートを生成
   */
  generateQualitySummary(metrics) {
    const summary = {
      timestamp: metrics.timestamp,
      overallScore: this.calculateOverallScore(metrics),
      coverage: metrics.testCoverage.lines,
      complexity: metrics.codeComplexity.cyclomaticComplexity,
      duplication: metrics.maintainability.duplicationRate,
      performance: metrics.performance.averageExecutionTime,
      recommendations: this.generateRecommendations(metrics),
    };

    const summaryFile = path.join(this.outputDir, 'quality-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log('📋 品質サマリーを生成:', summaryFile);
    
    return summary;
  }

  /**
   * 総合品質スコアを計算
   */
  calculateOverallScore(metrics) {
    const coverageScore = Math.min(100, metrics.testCoverage.lines);
    const performanceScore = Math.max(0, 100 - metrics.performance.averageExecutionTime);
    const complexityScore = Math.max(0, 100 - metrics.codeComplexity.cyclomaticComplexity * 10);
    const maintainabilityScore = Math.max(0, 100 - metrics.maintainability.duplicationRate * 10);

    return Math.round((coverageScore + performanceScore + complexityScore + maintainabilityScore) / 4);
  }

  /**
   * 推奨事項を生成
   */
  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.testCoverage.lines < 80) {
      recommendations.push('テストカバレッジを80%以上に向上させてください');
    }

    if (metrics.performance.averageExecutionTime > 100) {
      recommendations.push('パフォーマンスの最適化を検討してください');
    }

    if (metrics.codeComplexity.cyclomaticComplexity > 10) {
      recommendations.push('コード複雑度を下げるリファクタリングを行ってください');
    }

    if (metrics.maintainability.duplicationRate > 5) {
      recommendations.push('コードの重複を削減してください');
    }

    if (recommendations.length === 0) {
      recommendations.push('素晴らしい品質です！この水準を維持してください');
    }

    return recommendations;
  }
}

/**
 * メイン実行処理
 */
async function main() {
  try {
    console.log('🎯 TDD品質自動化を開始...\n');

    // メトリクス収集
    const collector = new QualityMetricsCollector();
    const metrics = await collector.collectAllMetrics();

    // レポート生成
    const reportGenerator = new QualityReportGenerator(collector.outputDir);
    const summary = reportGenerator.generateQualitySummary(metrics);
    reportGenerator.generateDashboard(metrics);

    console.log('\n📋 品質サマリー:');
    console.log(`総合スコア: ${summary.overallScore}/100`);
    console.log(`カバレッジ: ${summary.coverage}%`);
    console.log(`複雑度: ${summary.complexity}`);
    console.log(`重複率: ${summary.duplication}%`);
    console.log(`性能: ${summary.performance}ms`);

    console.log('\n💡 推奨事項:');
    summary.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });

    // 品質ゲートのチェック
    const qualityGate = checkQualityGate(summary);
    if (!qualityGate.passed) {
      console.log('\n🚨 品質ゲートが失敗しました:');
      qualityGate.failures.forEach(failure => {
        console.log(`  ❌ ${failure}`);
      });
      process.exit(1);
    }

    console.log('\n✅ 品質チェック完了！');

  } catch (error) {
    console.error('❌ 品質自動化でエラーが発生:', error);
    process.exit(1);
  }
}

/**
 * 品質ゲートのチェック
 */
function checkQualityGate(summary) {
  const failures = [];

  if (summary.coverage < 80) {
    failures.push(`テストカバレッジが不足 (${summary.coverage}% < 80%)`);
  }

  if (summary.complexity > 10) {
    failures.push(`コード複雑度が高すぎ (${summary.complexity} > 10)`);
  }

  if (summary.duplication > 5) {
    failures.push(`コード重複率が高すぎ (${summary.duplication}% > 5%)`);
  }

  if (summary.performance > 100) {
    failures.push(`パフォーマンスが劣化 (${summary.performance}ms > 100ms)`);
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

// スクリプトが直接実行された場合
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  QualityMetricsCollector,
  QualityReportGenerator,
  main,
  checkQualityGate,
};