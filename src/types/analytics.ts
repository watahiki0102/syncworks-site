export type SourceTypeCode = 'syncmoving' | '他社サービス' | '手動';

export interface DailyMetric {
  date: string;                 // 'YYYY-MM-DD'
  conversions: number;          // 成約件数
  handled: number;              // 対応件数
  revenueTotalInclTax: number;  // 売上（手数料差引前/既存運用に合わせる。ここは既存キーを踏襲）
  laborHoursTotal: number;      // 総労働時間（時間）
}

export interface DailyMetricBySource extends DailyMetric {
  source: SourceTypeCode;
}

export interface TruckTypeRatio {
  type: string;   // 軽/2t/4t 等
  count: number;
}

export interface TruckUtilization {
  truckId: string;
  truckName: string;
  busyRatio: number;   // 稼働%
  idleRatio: number;   // 非稼働%
}

export interface ExternalExpense {
  id: string;
  date: string;
  amountInclTax: number;   // 税込
  memo?: string;
  source?: SourceTypeCode; // 任意
}
