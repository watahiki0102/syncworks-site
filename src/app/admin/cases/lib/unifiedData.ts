/**
 * 案件一覧用のデータ統合ロジック
 * 見積依頼と見積履歴のデータを統合して提供
 */

import { QuoteRequest, QuoteHistory } from '../types';
import { UnifiedCase, UnifiedCaseStatus, UnifiedCaseFilter, STATUS_FILTERS } from '../types/unified';
import { normalizeSourceType, getManagementNumber } from './normalize';
import { TEST_CUSTOMERS, TEST_ADDRESSES, TEST_ITEMS } from '@/constants/testData';

/**
 * 見積依頼データを統合案件データに変換
 */
export function convertRequestToUnified(request: QuoteRequest): UnifiedCase {
  return {
    id: request.id,
    customerName: request.customerName,
    sourceType: request.sourceType,
    moveDate: request.summary.moveDate,
    moveTime: request.summary.moveTime,
    status: request.status as UnifiedCaseStatus,
    type: 'request',
    requestDate: request.requestDate,
    deadline: request.deadline,
    priority: request.priority,
    summary: request.summary
  };
}

/**
 * 見積履歴データを統合案件データに変換
 */
export function convertHistoryToUnified(history: QuoteHistory): UnifiedCase {
  return {
    id: history.id,
    customerName: history.customerName,
    sourceType: history.sourceType,
    moveDate: history.moveDate,
    status: history.status as UnifiedCaseStatus,
    type: 'history',
    responseDate: history.responseDate,
    amountWithTax: history.amountWithTax,
    isReQuote: history.isReQuote,
    summary: {
      fromAddress: history.summary.from,
      toAddress: history.summary.to,
      items: history.summary.items,
      totalPoints: history.summary.totalPoints || 0
    }
  };
}

/**
 * 統合テストデータの生成（105件）
 */
export function generateUnifiedTestData(): UnifiedCase[] {
  const data: UnifiedCase[] = [];
  
  // 基本的な顧客名パターン
  const customerNames = [
    '田中太郎', '佐藤花子', '高橋次郎', '伊藤美香', '山田一郎', '中村由美',
    '小林健太', '加藤真理', '渡辺修一', '斉藤和子', '松本大輔', '井上恵子',
    '木村翔太', '林美咲', '清水優介', '山本彩', '森田健二', '池田あゆみ',
    '橋本誠', '石川麻衣', '前田裕太', '藤田智子', '岡田龍一', '長谷川美穂',
    '村上陽介', '近藤理恵', '後藤拓海', '青木香織', '福田悟', '西村千尋'
  ];

  // 住所パターン
  const addresses = [
    { from: '東京都新宿区', to: '東京都渋谷区' },
    { from: '東京都中野区', to: '東京都杉並区' },
    { from: '東京都品川区', to: '東京都目黒区' },
    { from: '東京都世田谷区', to: '東京都練馬区' },
    { from: '東京都台東区', to: '東京都墨田区' },
    { from: '神奈川県横浜市', to: '神奈川県川崎市' },
    { from: '埼玉県さいたま市', to: '埼玉県川口市' },
    { from: '千葉県千葉市', to: '千葉県市川市' },
    { from: '東京都江戸川区', to: '東京都葛飾区' },
    { from: '東京都足立区', to: '東京都北区' }
  ];

  // アイテムパターン
  const itemSets = [
    ['冷蔵庫', 'テレビ', 'ソファ'],
    ['洗濯機', 'ベッド', 'テーブル'],
    ['机', '椅子', '本棚'],
    ['電子レンジ', '炊飯器', 'エアコン'],
    ['タンス', 'ドレッサー', 'カーテン'],
    ['パソコン', 'プリンター', 'デスクチェア'],
    ['冷蔵庫', '洗濯機', 'エアコン', 'テレビ'],
    ['ベッド', 'タンス', '鏡台', 'カーペット'],
    ['ソファ', 'テーブル', 'テレビ台', '照明器具'],
    ['本棚', '机', '椅子', 'パソコン', 'プリンター']
  ];

  // 仲介元パターン
  const sourceTypes = ['syncmoving', 'suumo', '外部'];
  
  // ステータスパターン
  const requestStatuses = ['pending', 'answered'];
  const historyStatuses = ['answered', '再見積', '成約', '不成約', 'キャンセル'];
  
  // 時間パターン
  const times = ['午前中', '午後', '夜間', '14:00-16:00', '10:00-12:00', '18:00-20:00'];

  // 105件のデータを生成
  for (let i = 0; i < 105; i++) {
    const isRequest = i < 35; // 最初の35件を依頼データ、残り70件を履歴データ
    const customerName = customerNames[i % customerNames.length] + (Math.floor(i / customerNames.length) > 0 ? `${Math.floor(i / customerNames.length) + 1}` : '');
    const address = addresses[i % addresses.length];
    const items = itemSets[i % itemSets.length];
    const sourceType = sourceTypes[i % sourceTypes.length];
    
    // 日付を生成（過去30日から未来30日）
    const baseDate = new Date();
    const dayOffset = (i % 60) - 30; // -30 to 29
    const targetDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const moveDate = targetDate.toISOString().split('T')[0];
    
    if (isRequest) {
      // 依頼データ
      const requestDate = new Date(targetDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const deadline = new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      data.push({
        id: `req_${i + 1}`,
        customerName,
        sourceType: sourceType as any,
        moveDate,
        moveTime: times[i % times.length],
        status: requestStatuses[i % requestStatuses.length] as any,
        type: 'request',
        requestDate,
        deadline,
        priority: ['high', 'medium', 'low'][i % 3] as any,
        summary: {
          fromAddress: address.from,
          toAddress: address.to,
          items,
          totalPoints: items.length * 3 + (i % 5)
        }
      });
    } else {
      // 履歴データ
      const responseDate = new Date(targetDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const amount = 30000 + (i % 10) * 5000 + Math.floor(i / 10) * 2000;
      
      data.push({
        id: `hist_${i + 1}`,
        customerName,
        sourceType: sourceType as any,
        moveDate,
        status: historyStatuses[i % historyStatuses.length] as any,
        type: 'history',
        responseDate,
        amountWithTax: amount,
        isReQuote: i % 7 === 0, // 約14%の確率で再見積
        summary: {
          fromAddress: address.from,
          toAddress: address.to,
          items,
          totalPoints: items.length * 3 + (i % 5)
        }
      });
    }
  }

  // データを正規化
  const normalizedData = data.map(item => ({
    ...item,
    sourceType: normalizeSourceType(item.sourceType)
  }));

  return normalizedData;
}

/**
 * 統合案件データのフィルタリング
 */
export function filterUnifiedCases(
  cases: UnifiedCase[], 
  filter: UnifiedCaseFilter
): UnifiedCase[] {
  return cases.filter(caseItem => {
    // ステータスフィルター
    if (filter.status !== 'all') {
      const statusFilter = STATUS_FILTERS.find(sf => sf.id === filter.status);
      if (statusFilter && !statusFilter.statuses.includes(caseItem.status)) {
        return false;
      }
    }

    // タイプフィルター
    if (filter.type !== 'all' && caseItem.type !== filter.type) {
      return false;
    }

    // 詳細ステータスフィルター
    if (filter.detailStatus && caseItem.status !== filter.detailStatus) {
      return false;
    }

    // 仲介元フィルター
    if (filter.sourceType !== 'all' && caseItem.sourceType !== filter.sourceType) {
      return false;
    }

    // 検索キーワードフィルター
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      const managementNumber = getManagementNumber(caseItem.sourceType, caseItem.id);
      
      const matchesCustomerName = caseItem.customerName.toLowerCase().includes(searchTerm);
      const matchesManagementNumber = managementNumber.toLowerCase().includes(searchTerm);
      const matchesAddress = caseItem.summary?.fromAddress?.toLowerCase().includes(searchTerm) ||
                           caseItem.summary?.toAddress?.toLowerCase().includes(searchTerm);
      
      if (!matchesCustomerName && !matchesManagementNumber && !matchesAddress) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 統合案件データのソート
 */
export function sortUnifiedCases(cases: UnifiedCase[]): UnifiedCase[] {
  return cases.sort((a, b) => {
    // 1. 未回答を最優先
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;

    // 2. 優先度順 (依頼データのみ)
    if (a.type === 'request' && b.type === 'request') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'low'];
      const bPriority = priorityOrder[b.priority || 'low'];
      if (aPriority !== bPriority) return bPriority - aPriority;
    }

    // 3. 期限・日付順
    const aDate = a.deadline || a.requestDate || a.responseDate || a.moveDate;
    const bDate = b.deadline || b.requestDate || b.responseDate || b.moveDate;
    
    if (aDate && bDate) {
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    }

    return 0;
  });
}

/**
 * 未回答件数の計算
 */
export function getPendingCount(cases: UnifiedCase[]): number {
  return cases.filter(caseItem => caseItem.status === 'pending').length;
}

/**
 * ステータス別の件数計算
 */
export function getStatusCounts(cases: UnifiedCase[]): Record<string, number> {
  const counts: Record<string, number> = {};
  
  STATUS_FILTERS.forEach(filter => {
    counts[filter.id] = cases.filter(caseItem => 
      filter.statuses.includes(caseItem.status)
    ).length;
  });

  return counts;
}
