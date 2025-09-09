/**
 * 案件一覧用のデータ統合ロジック
 * 見積依頼と見積履歴のデータを統合して提供
 */

import { QuoteRequest } from '@/types/common';
import { QuoteHistory } from '../types';
import { UnifiedCaseStatus, UnifiedCaseFilter, STATUS_FILTERS } from '../types/unified';
import { UnifiedCase } from '@/types/common';
import { normalizeSourceType, getManagementNumber } from './normalize';

/**
 * 見積依頼データを統合案件データに変換
 */
export function convertRequestToUnified(request: QuoteRequest): UnifiedCase {
  return {
    id: request.id,
    customer: request.customer,
    move: request.move,
    items: request.items,
    type: 'request',
    status: request.status as UnifiedCaseStatus,
    requestDate: request.requestDate,
    deadline: request.deadline,
    priority: request.priority,
    sourceType: request.sourceType,
    referralId: request.referralId ?? null
  };
}


/**
 * 見積履歴データを統合案件データに変換
 */
export function convertHistoryToUnified(history: QuoteHistory): UnifiedCase {
  // QuoteHistoryは既にUnifiedCaseを拡張しているため、直接返却
  return history;
}

/**
 * 統合テストデータの生成（105件）
 */
export function generateUnifiedTestData(): UnifiedCase[] {
  const data: UnifiedCase[] = [];
  
  // 確実に動作する固定テストデータを最初に追加
  const fixedTestCases: UnifiedCase[] = [
    {
      id: 'req_1',
      customer: {
        lastName: '田中',
        firstName: '太郎',
        lastNameKana: 'タナカ',
        firstNameKana: 'タロウ',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        customerName: '田中太郎'
      },
      move: {
        moveType: '単身',
        moveDate: '2024-02-15',
        moveTime: '午前中',
        fromAddress: '東京都新宿区西新宿1-1-1',
        toAddress: '東京都渋谷区渋谷1-1-1'
      },
      items: {
        items: [
          { id: '1', category: '家電', name: '冷蔵庫（小型）', quantity: 1, points: 15 },
          { id: '2', category: '家電', name: '洗濯機', quantity: 1, points: 15 },
          { id: '3', category: '家電', name: 'テレビ（32型）', quantity: 1, points: 10 },
          { id: '4', category: '家具', name: 'ベッド（シングル）', quantity: 1, points: 10 },
          { id: '5', category: '生活用品', name: '衣装ケース', quantity: 1, points: 5 },
          { id: '6', category: '生活用品', name: 'ダンボール箱（10個）', quantity: 1, points: 10 }
        ],
        totalPoints: 85
      },
      type: 'request',
      status: '見積依頼',
      requestDate: '2024-02-10',
      deadline: '2024-02-13',
      priority: 'high',
      sourceType: 'syncmoving'
    },
    {
      id: 'req_2',
      customer: {
        lastName: '佐藤',
        firstName: '花子',
        lastNameKana: 'サトウ',
        firstNameKana: 'ハナコ',
        phone: '090-2345-6789',
        email: 'sato@example.com',
        customerName: '佐藤花子'
      },
      move: {
        moveType: '家族',
        moveDate: '2024-02-20',
        moveTime: '午後',
        fromAddress: '東京都中野区中野1-1-1',
        toAddress: '東京都杉並区阿佐ヶ谷1-1-1'
      },
      items: {
        items: [
          { id: '1', category: '家電', name: '冷蔵庫（中型）', quantity: 1, points: 20 },
          { id: '2', category: '家電', name: '洗濯機', quantity: 1, points: 15 },
          { id: '3', category: '家電', name: 'テレビ（40型）', quantity: 1, points: 15 },
          { id: '4', category: '家具', name: 'ソファ（2人掛け）', quantity: 1, points: 20 },
          { id: '5', category: '家具', name: 'ダイニングテーブル', quantity: 1, points: 15 },
          { id: '6', category: '家具', name: 'ベッド（ダブル）', quantity: 1, points: 15 },
          { id: '7', category: '生活用品', name: 'ダンボール箱（15個）', quantity: 1, points: 15 }
        ],
        totalPoints: 145
      },
      type: 'request',
      status: '見積依頼',
      requestDate: '2024-02-15',
      deadline: '2024-02-18',
      priority: 'medium',
      sourceType: 'suumo'
    },
    {
      id: 'req_3',
      customer: {
        lastName: '高橋',
        firstName: '次郎',
        lastNameKana: 'タカハシ',
        firstNameKana: 'ジロウ',
        phone: '090-3456-7890',
        email: 'takahashi@example.com',
        customerName: '高橋次郎'
      },
      move: {
        moveType: '家族',
        moveDate: '2024-02-25',
        moveTime: '14:00-16:00',
        fromAddress: '東京都品川区品川1-1-1',
        toAddress: '東京都目黒区目黒1-1-1'
      },
      items: {
        items: [
          { id: '1', category: '家電', name: '冷蔵庫（大型）', quantity: 1, points: 25 },
          { id: '2', category: '家電', name: '洗濯機', quantity: 1, points: 15 },
          { id: '3', category: '家電', name: '乾燥機', quantity: 1, points: 20 },
          { id: '4', category: '家電', name: 'テレビ（50型）', quantity: 1, points: 20 },
          { id: '5', category: '家具', name: 'ソファ（3人掛け）', quantity: 1, points: 25 },
          { id: '6', category: '家具', name: 'ダイニングテーブル（4人用）', quantity: 1, points: 20 },
          { id: '7', category: '家具', name: 'ベッド', quantity: 2, points: 30 },
          { id: '8', category: '家具', name: 'タンス', quantity: 2, points: 20 },
          { id: '9', category: '生活用品', name: 'ダンボール箱（25個）', quantity: 1, points: 25 }
        ],
        totalPoints: 285
      },
      type: 'request',
      status: '見積依頼',
      requestDate: '2024-02-20',
      deadline: '2024-02-23',
      priority: 'low',
      sourceType: '外部'
    }
  ];
  
  // 固定テストデータを追加
  data.push(...fixedTestCases);
  
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

  // 引越しタイプ別のアイテムパターン（より現実的）
  const itemSets = [
    // 単身者向け
    {
      type: '単身',
      items: ['冷蔵庫（小型）', '洗濯機', 'テレビ（32型）', 'ベッド（シングル）', '衣装ケース', 'ダンボール箱（10個）'],
      totalPoints: 85
    },
    {
      type: '単身',
      items: ['電子レンジ', '炊飯器', 'パソコンデスク', 'デスクチェア', '本棚', 'ダンボール箱（8個）'],
      totalPoints: 65
    },
    // 2人家族向け
    {
      type: '2人',
      items: ['冷蔵庫（中型）', '洗濯機', 'テレビ（40型）', 'ソファ（2人掛け）', 'ダイニングテーブル', 'ベッド（ダブル）', 'ダンボール箱（15個）'],
      totalPoints: 145
    },
    {
      type: '2人',
      items: ['冷蔵庫（中型）', '洗濯機', 'エアコン（2台）', 'タンス', 'テレビ台', 'ダンボール箱（12個）'],
      totalPoints: 125
    },
    // 3-4人家族向け
    {
      type: '家族',
      items: ['冷蔵庫（大型）', '洗濯機', '乾燥機', 'テレビ（50型）', 'ソファ（3人掛け）', 'ダイニングテーブル（4人用）', 'ベッド（2台）', 'タンス（2台）', 'ダンボール箱（25個）'],
      totalPoints: 285
    },
    {
      type: '家族',
      items: ['冷蔵庫（大型）', '洗濯機', 'エアコン（3台）', 'テレビ（2台）', '本棚（2台）', '学習机', 'ダンボール箱（30個）'],
      totalPoints: 320
    },
    // オフィス向け
    {
      type: 'オフィス',
      items: ['複合機', 'オフィスデスク（5台）', 'オフィスチェア（5脚）', '書庫（3台）', 'パソコン（5台）', 'ダンボール箱（40個）'],
      totalPoints: 450
    },
    // 高級家具・大型家具
    {
      type: '高級',
      items: ['冷蔵庫（大型）', '洗濯機', 'ピアノ', 'ソファ（革製L字）', 'ダイニングテーブル（高級）', 'ベッド（キング）', '金庫', 'ダンボール箱（20個）'],
      totalPoints: 520
    },
    // 追加パターン
    {
      type: '単身',
      items: ['冷蔵庫（小型）', '洗濯機', 'テレビ（32型）', 'ベッド（シングル）', '衣装ケース', 'ダンボール箱（10個）'],
      totalPoints: 85
    },
    {
      type: '家族',
      items: ['冷蔵庫（大型）', '洗濯機', 'エアコン（3台）', 'テレビ（2台）', '本棚（2台）', '学習机', 'ダンボール箱（30個）'],
      totalPoints: 320
    }
  ];

  // 仲介元パターン
  const sourceTypes = ['syncmoving', 'suumo', '外部'];
  
  // ステータスパターン - 最初の10件は確実に見積依頼にする
  const requestStatuses = ['見積依頼', '見積済'];
  const historyStatuses = ['見積済', '再見積', '受注', '失注', 'キャンセル'];
  
  // 時間パターン
  const times = ['午前中', '午後', '夜間', '14:00-16:00', '10:00-12:00', '18:00-20:00'];

  // ページネーション確認用の動的データ生成（100件以上）
  for (let i = 3; i < 105; i++) {
    const isRequest = i < 25; // 最初の25件を依頼データ、残り80件を履歴データ
    const nameIndex = i % Math.max(customerNames.length, 1);
    const customerName = customerNames[nameIndex] + (Math.floor(i / customerNames.length) > 0 ? `${Math.floor(i / customerNames.length) + 1}` : '');
    const address = addresses[i % Math.max(addresses.length, 1)];
    const itemSet = itemSets[i % Math.max(itemSets.length, 1)];
    const sourceType = sourceTypes[i % Math.max(sourceTypes.length, 1)];
    
    // 日付を生成（過去30日から未来30日）
    const baseDate = new Date();
    const dayOffset = (i % 60) - 30;
    const targetDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const moveDate = targetDate.toISOString().split('T')[0];
    
    if (isRequest) {
      // 依頼データ
      const requestDate = new Date(targetDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const deadline = new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      data.push({
        id: `req_dyn_${i}`,
        customer: {
          lastName: customerName.slice(0, -1),
          firstName: customerName.slice(-1),
          lastNameKana: 'カナ',
          firstNameKana: 'タロウ',
          phone: `090-${String(1000 + i).slice(-4)}-${String(5678 + i).slice(-4)}`,
          email: `customer${i}@example.com`,
          customerName: customerName
        },
        move: {
          moveType: i % 2 === 0 ? '単身' : '家族',
          moveDate,
          moveTime: times[i % Math.max(times.length, 1)],
          fromAddress: address.from,
          toAddress: address.to
        },
        items: {
          items: (itemSet.items || []).map((itemName, idx) => ({
            id: `${i}_${idx}`,
            category: itemName.includes('家電') ? '家電' : itemName.includes('家具') ? '家具' : '生活用品',
            name: itemName,
            quantity: 1,
            points: Math.floor(Math.random() * 20) + 5
          })),
          totalPoints: (itemSet.totalPoints || 0) + (i % 10)
        },
        type: 'request',
        status: i < 10 ? '見積依頼' : requestStatuses[i % Math.max(requestStatuses.length, 1)] as any,
        requestDate,
        deadline,
        priority: ['high', 'medium', 'low'][i % 3] as any,
        sourceType: sourceType as any
      });
    } else {
      // 履歴データ
      const responseDate = new Date(targetDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const amount = 30000 + (i % 10) * 5000 + Math.floor(i / 10) * 2000;
      
      data.push({
        id: `hist_dyn_${i}`,
        customer: {
          lastName: customerName.slice(0, -1),
          firstName: customerName.slice(-1),
          lastNameKana: 'カナ',
          firstNameKana: 'タロウ',
          phone: `090-${String(1000 + i).slice(-4)}-${String(5678 + i).slice(-4)}`,
          email: `customer${i}@example.com`,
          customerName: customerName
        },
        move: {
          moveType: i % 2 === 0 ? '単身' : '家族',
          moveDate,
          fromAddress: address.from,
          toAddress: address.to
        },
        items: {
          items: (itemSet.items || []).map((itemName, idx) => ({
            id: `${i}_${idx}`,
            category: itemName.includes('家電') ? '家電' : itemName.includes('家具') ? '家具' : '生活用品',
            name: itemName,
            quantity: 1,
            points: Math.floor(Math.random() * 20) + 5
          })),
          totalPoints: (itemSet.totalPoints || 0) + (i % 10)
        },
        type: 'history',
        status: historyStatuses[i % Math.max(historyStatuses.length, 1)] as any,
        responseDate,
        amountWithTax: amount,
        isReQuote: i % 7 === 0,
        sourceType: sourceType as any
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
      const managementNumber = getManagementNumber(caseItem.sourceType as any, caseItem.id);
      
      const matchesCustomerName = caseItem.customer?.customerName?.toLowerCase().includes(searchTerm);
      const matchesManagementNumber = managementNumber.toLowerCase().includes(searchTerm);
      const matchesAddress = caseItem.move?.fromAddress?.toLowerCase().includes(searchTerm) ||
                           caseItem.move?.toAddress?.toLowerCase().includes(searchTerm);
      
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
    if (a.status === '見積依頼' && b.status !== '見積依頼') return -1;
    if (a.status !== '見積依頼' && b.status === '見積依頼') return 1;

    // 2. 優先度順 (依頼データのみ)
    if (a.type === 'request' && b.type === 'request') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority || 'low'];
      const bPriority = priorityOrder[b.priority || 'low'];
      if (aPriority !== bPriority) return bPriority - aPriority;
    }

    // 3. 期限・日付順
    const aDate = a.deadline || a.requestDate || a.responseDate || a.move?.moveDate;
    const bDate = b.deadline || b.requestDate || b.responseDate || b.move?.moveDate;
    
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
  return cases.filter(caseItem => caseItem.status === '見積依頼').length;
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
