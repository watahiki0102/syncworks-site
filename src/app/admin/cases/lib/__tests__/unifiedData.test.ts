/**
 * unifiedData.ts のテスト
 * QuoteStatus から UnifiedCaseStatus への変換ロジックのテスト
 */

import {
  convertRequestToUnified,
  convertHistoryToUnified,
  generateUnifiedTestData,
  filterUnifiedCases,
  sortUnifiedCases,
  getPendingCount,
  getStatusCounts,
} from '../unifiedData';
import { QuoteRequest, QuoteHistory, QuoteStatus } from '../../types';
import { UnifiedCase, UnifiedCaseStatus } from '../../types/unified';

// テスト用のモックデータ
const mockQuoteRequest: QuoteRequest = {
  id: 'req_test_1',
  customerName: 'テスト太郎',
  requestDate: '2024-01-01',
  deadline: '2024-01-03',
  summary: {
    moveDate: '2024-01-15',
    moveTime: '午前中',
    fromAddress: '東京都新宿区',
    toAddress: '東京都渋谷区',
    items: ['冷蔵庫', 'テレビ'],
    totalPoints: 10
  },
  status: '見積依頼',
  priority: 'high',
  sourceType: 'syncmoving'
};

const mockQuoteHistory: QuoteHistory = {
  id: 'hist_test_1',
  customerName: 'テスト花子',
  requestDate: '2024-01-01',
  responseDate: '2024-01-02',
  amount: 50000,
  amountWithTax: 55000,
  status: '見積中' as QuoteStatus,
  items: ['洗濯機', 'ベッド'],
  fromAddress: '東京都品川区',
  toAddress: '東京都目黒区',
  moveDate: '2024-01-20',
  sourceType: 'suumo',
  isContracted: false,
  isReQuote: false,
  timeBandSurcharges: [],
  summary: {
    from: '東京都品川区',
    to: '東京都目黒区',
    items: ['洗濯機', 'ベッド'],
    totalPoints: 8
  }
};

describe('convertRequestToUnified', () => {
  it('見積依頼データを正しく統合データに変換する', () => {
    const result = convertRequestToUnified(mockQuoteRequest);

    expect(result).toEqual({
      id: 'req_test_1',
      customerName: 'テスト太郎',
      sourceType: 'syncmoving',
      moveDate: '2024-01-15',
      moveTime: '午前中',
      status: '見積依頼',
      type: 'request',
      requestDate: '2024-01-01',
      deadline: '2024-01-03',
      priority: 'high',
      summary: {
        moveDate: '2024-01-15',
        moveTime: '午前中',
        fromAddress: '東京都新宿区',
        toAddress: '東京都渋谷区',
        items: ['冷蔵庫', 'テレビ'],
        totalPoints: 10
      }
    });
  });

  it('typeがrequestに設定される', () => {
    const result = convertRequestToUnified(mockQuoteRequest);
    expect(result.type).toBe('request');
  });
});

describe('convertHistoryToUnified', () => {
  it('見積履歴データを正しく統合データに変換する', () => {
    const result = convertHistoryToUnified(mockQuoteHistory);

    expect(result).toEqual({
      id: 'hist_test_1',
      customerName: 'テスト花子',
      sourceType: 'suumo',
      moveDate: '2024-01-20',
      status: '見積済', // '見積中' → '見積済' に変換
      type: 'history',
      responseDate: '2024-01-02',
      amountWithTax: 55000,
      isReQuote: false,
      summary: {
        fromAddress: '東京都品川区',
        toAddress: '東京都目黒区',
        items: ['洗濯機', 'ベッド'],
        totalPoints: 8
      }
    });
  });

  it('typeがhistoryに設定される', () => {
    const result = convertHistoryToUnified(mockQuoteHistory);
    expect(result.type).toBe('history');
  });

  describe('QuoteStatus から UnifiedCaseStatus への変換', () => {
    const testCases: Array<{ input: QuoteStatus; expected: UnifiedCaseStatus; description: string }> = [
      { input: '見積中', expected: '見積済', description: '見積中は見積済として扱う' },
      { input: '完了', expected: '成約', description: '完了は成約として扱う' },
      { input: '回答済', expected: '見積済', description: '回答済は見積済として扱う' },
      { input: '再見積', expected: '再見積', description: '再見積はそのまま' },
      { input: '成約', expected: '成約', description: '成約はそのまま' },
      { input: '不成約', expected: '不成約', description: '不成約はそのまま' },
      { input: 'キャンセル', expected: 'キャンセル', description: 'キャンセルはそのまま' },
    ];

    testCases.forEach(({ input, expected, description }) => {
      it(description, () => {
        const testHistory = { ...mockQuoteHistory, status: input };
        const result = convertHistoryToUnified(testHistory);
        expect(result.status).toBe(expected);
      });
    });
  });
});

describe('generateUnifiedTestData', () => {
  it('105件のテストデータを生成する', () => {
    const result = generateUnifiedTestData();
    expect(result).toHaveLength(105);
  });

  it('最初の35件は依頼データ、残り70件は履歴データ', () => {
    const result = generateUnifiedTestData();
    
    const requestData = result.filter(item => item.type === 'request');
    const historyData = result.filter(item => item.type === 'history');
    
    expect(requestData).toHaveLength(35);
    expect(historyData).toHaveLength(70);
  });

  it('すべてのデータが必須フィールドを持つ', () => {
    const result = generateUnifiedTestData();
    
    result.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('customerName');
      expect(item).toHaveProperty('sourceType');
      expect(item).toHaveProperty('moveDate');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('type');
      expect(typeof item.id).toBe('string');
      expect(typeof item.customerName).toBe('string');
      expect(typeof item.moveDate).toBe('string');
    });
  });
});

describe('filterUnifiedCases', () => {
  const mockCases: UnifiedCase[] = [
    {
      id: '1',
      customerName: 'テスト1',
      sourceType: 'syncmoving',
      moveDate: '2024-01-15',
      status: '見積依頼',
      type: 'request'
    },
    {
      id: '2',
      customerName: 'テスト2',
      sourceType: 'suumo',
      moveDate: '2024-01-16',
      status: '成約',
      type: 'history'
    },
    {
      id: '3',
      customerName: 'テスト3',
      sourceType: '外部',
      moveDate: '2024-01-17',
      status: '不成約',
      type: 'history'
    }
  ];

  it('ステータスフィルターが正しく動作する', () => {
    const filter = {
      status: 'pending',
      type: 'all' as const,
      sourceType: 'all' as const,
      searchTerm: ''
    };
    
    const result = filterUnifiedCases(mockCases, filter);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('見積依頼');
  });

  it('タイプフィルターが正しく動作する', () => {
    const filter = {
      status: 'all',
      type: 'history' as const,
      sourceType: 'all' as const,
      searchTerm: ''
    };
    
    const result = filterUnifiedCases(mockCases, filter);
    expect(result).toHaveLength(2);
    expect(result.every(item => item.type === 'history')).toBe(true);
  });

  it('仲介元フィルターが正しく動作する', () => {
    const filter = {
      status: 'all',
      type: 'all' as const,
      sourceType: 'syncmoving' as const,
      searchTerm: ''
    };
    
    const result = filterUnifiedCases(mockCases, filter);
    expect(result).toHaveLength(1);
    expect(result[0].sourceType).toBe('syncmoving');
  });

  it('検索キーワードフィルターが正しく動作する', () => {
    const filter = {
      status: 'all',
      type: 'all' as const,
      sourceType: 'all' as const,
      searchTerm: 'テスト2'
    };
    
    const result = filterUnifiedCases(mockCases, filter);
    expect(result).toHaveLength(1);
    expect(result[0].customerName).toBe('テスト2');
  });
});

describe('sortUnifiedCases', () => {
  it('未回答を最優先でソートする', () => {
    const cases: UnifiedCase[] = [
      {
        id: '1',
        customerName: 'テスト1',
        sourceType: 'syncmoving',
        moveDate: '2024-01-15',
        status: '成約',
        type: 'history'
      },
      {
        id: '2',
        customerName: 'テスト2',
        sourceType: 'suumo',
        moveDate: '2024-01-16',
        status: '見積依頼',
        type: 'request'
      }
    ];
    
    const result = sortUnifiedCases(cases);
    expect(result[0].status).toBe('見積依頼');
    expect(result[1].status).toBe('成約');
  });
});

describe('getPendingCount', () => {
  it('未回答件数を正しく計算する', () => {
    const cases: UnifiedCase[] = [
      {
        id: '1',
        customerName: 'テスト1',
        sourceType: 'syncmoving',
        moveDate: '2024-01-15',
        status: '見積依頼',
        type: 'request'
      },
      {
        id: '2',
        customerName: 'テスト2',
        sourceType: 'suumo',
        moveDate: '2024-01-16',
        status: '見積依頼',
        type: 'request'
      },
      {
        id: '3',
        customerName: 'テスト3',
        sourceType: '外部',
        moveDate: '2024-01-17',
        status: '成約',
        type: 'history'
      }
    ];
    
    const result = getPendingCount(cases);
    expect(result).toBe(2);
  });
});

describe('getStatusCounts', () => {
  it('ステータス別件数を正しく計算する', () => {
    const cases: UnifiedCase[] = [
      {
        id: '1',
        customerName: 'テスト1',
        sourceType: 'syncmoving',
        moveDate: '2024-01-15',
        status: '見積依頼',
        type: 'request'
      },
      {
        id: '2',
        customerName: 'テスト2',
        sourceType: 'suumo',
        moveDate: '2024-01-16',
        status: '成約',
        type: 'history'
      }
    ];
    
    const result = getStatusCounts(cases);
    expect(result.pending).toBe(1);
    expect(result.completed).toBe(1);
  });
});
