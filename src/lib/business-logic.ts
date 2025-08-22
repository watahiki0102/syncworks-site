/**
 * TDD対応: ビジネスロジックの実装
 * - 純粋関数を組み合わせた高レベルのビジネスルール
 * - 副作用を外部から注入できる設計
 * - テスタブルなドメインロジック
 */

import { pricingCalculations, mathUtils, dateUtils, stringUtils, validationUtils } from './pure-functions';

/**
 * 引越し見積もりのビジネスロジック
 */
export const movingEstimateLogic = {
  /**
   * 引越し見積もりの計算
   * @param params 見積もりパラメータ
   * @returns 見積もり結果
   */
  calculateMovingEstimate: (params: {
    distance: number;
    items: Array<{ name: string; count: number; points: number }>;
    timeSlot: string;
    selectedOptions: string[];
    moveDate: Date;
    taxRate: number;
  }) => {
    const { distance, items, timeSlot, selectedOptions, moveDate, taxRate } = params;

    // バリデーション
    if (distance <= 0) throw new Error('移動距離は0より大きい必要があります');
    if (!dateUtils.isDateInRange(moveDate, new Date(), dateUtils.addBusinessDays(new Date(), 60))) {
      throw new Error('引越し日は今日から60営業日以内で選択してください');
    }

    // 基本料金の計算
    const totalPoints = items.reduce((sum, item) => sum + (item.count * item.points), 0);
    const baseRate = calculateBaseRateFromPoints(totalPoints);
    const baseFare = pricingCalculations.calculateBaseFare(distance, baseRate);

    // 時間帯割増料金
    const fareWithTimeSurcharge = pricingCalculations.calculateTimeSurcharge(baseFare, timeSlot);

    // オプション料金
    const optionPrices: Record<string, number> = {
      'packing': 10000,
      'cleaning': 15000,
      'storage': 20000,
      'disposal': 8000,
    };
    const optionsTotal = pricingCalculations.calculateOptionsTotal(selectedOptions, optionPrices);

    // 小計と税込み価格
    const subtotal = fareWithTimeSurcharge + optionsTotal;
    const totalWithTax = mathUtils.calculateTaxIncluded(subtotal, taxRate);

    return {
      baseFare,
      timeSurcharge: fareWithTimeSurcharge - baseFare,
      optionsTotal,
      subtotal,
      taxAmount: totalWithTax - subtotal,
      total: totalWithTax,
      breakdown: {
        distance,
        totalPoints,
        baseRate,
        timeSlot,
        selectedOptions,
      },
    };
  },

  /**
   * 引越し可能日の判定
   * @param requestedDate 希望日
   * @param unavailableDates 利用不可日のリスト
   * @returns 可能かどうかとメッセージ
   */
  validateMovingDate: (requestedDate: Date, unavailableDates: Date[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const requested = new Date(requestedDate);
    requested.setHours(0, 0, 0, 0);

    // 過去の日付チェック
    if (requested < today) {
      return {
        isValid: false,
        message: '引越し日は今日以降を選択してください',
      };
    }

    // 60営業日以内チェック
    const maxDate = dateUtils.addBusinessDays(today, 60);
    if (requested > maxDate) {
      return {
        isValid: false,
        message: '引越し日は60営業日以内で選択してください',
      };
    }

    // 利用不可日チェック
    const isUnavailable = unavailableDates.some(unavailableDate => {
      const unavailable = new Date(unavailableDate);
      unavailable.setHours(0, 0, 0, 0);
      return requested.getTime() === unavailable.getTime();
    });

    if (isUnavailable) {
      return {
        isValid: false,
        message: '選択された日は予約が埋まっています',
      };
    }

    return {
      isValid: true,
      message: '選択された日は利用可能です',
    };
  },
};

/**
 * 顧客管理のビジネスロジック
 */
export const customerManagementLogic = {
  /**
   * 顧客情報の検証
   * @param customerData 顧客データ
   * @returns 検証結果
   */
  validateCustomerData: (customerData: {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    postalCode: string;
    address: string;
  }) => {
    const errors: string[] = [];

    // 必須フィールドチェック
    const requiredError = validationUtils.validateRequired(customerData.lastName, '姓');
    if (requiredError) errors.push(requiredError);

    const firstNameError = validationUtils.validateRequired(customerData.firstName, '名');
    if (firstNameError) errors.push(firstNameError);

    // メールアドレス検証
    if (customerData.email && !validationUtils.isValidEmail(customerData.email)) {
      errors.push('正しいメールアドレスを入力してください');
    }

    // 電話番号検証
    try {
      stringUtils.normalizePhoneNumber(customerData.phone);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '電話番号が不正です');
    }

    // 郵便番号検証
    try {
      const normalizedPostal = stringUtils.normalizePostalCode(customerData.postalCode);
      if (!validationUtils.isValidPostalCode(normalizedPostal)) {
        errors.push('郵便番号の形式が正しくありません');
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : '郵便番号が不正です');
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedData: errors.length === 0 ? {
        ...customerData,
        phone: stringUtils.normalizePhoneNumber(customerData.phone),
        postalCode: stringUtils.normalizePostalCode(customerData.postalCode),
        lastName: stringUtils.normalizeWidth(customerData.lastName).trim(),
        firstName: stringUtils.normalizeWidth(customerData.firstName).trim(),
      } : null,
    };
  },

  /**
   * 顧客のリスク評価
   * @param customerHistory 顧客履歴
   * @returns リスク評価結果
   */
  assessCustomerRisk: (customerHistory: {
    completedOrders: number;
    canceledOrders: number;
    latePayments: number;
    totalSpent: number;
    accountAge: number; // 日数
  }) => {
    let riskScore = 0;
    const factors: string[] = [];

    // キャンセル率
    const totalOrders = customerHistory.completedOrders + customerHistory.canceledOrders;
    if (totalOrders > 0) {
      const cancelRate = mathUtils.calculatePercentage(customerHistory.canceledOrders, totalOrders);
      if (cancelRate > 20) {
        riskScore += 2;
        factors.push('キャンセル率が高い');
      }
    }

    // 遅延支払い
    if (customerHistory.latePayments > 0) {
      riskScore += customerHistory.latePayments > 3 ? 3 : 1;
      factors.push('支払い遅延の履歴あり');
    }

    // 新規顧客
    if (customerHistory.accountAge < 30) {
      riskScore += 1;
      factors.push('新規顧客');
    }

    // 高額顧客は信頼度アップ
    if (customerHistory.totalSpent > 500000) {
      riskScore = Math.max(0, riskScore - 2);
      factors.push('高額利用顧客');
    }

    // リスクレベル判定
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore <= 1) riskLevel = 'low';
    else if (riskScore <= 3) riskLevel = 'medium';
    else riskLevel = 'high';

    return {
      riskScore,
      riskLevel,
      factors,
      recommendedActions: generateRiskRecommendations(riskLevel),
    };
  },
};

/**
 * 在庫・車両管理のビジネスロジック
 */
export const fleetManagementLogic = {
  /**
   * 最適なトラック割り当ての計算
   * @param requirements 要件
   * @param availableTrucks 利用可能なトラック
   * @returns 割り当て提案
   */
  findOptimalTruckAssignment: (
    requirements: {
      totalPoints: number;
      distance: number;
      timeSlot: string;
      preferredDate: Date;
    },
    availableTrucks: Array<{
      id: string;
      name: string;
      capacity: number;
      costPerKm: number;
      availability: Date[];
    }>
  ) => {
    const { totalPoints, distance, timeSlot, preferredDate } = requirements;

    // 容量要件を満たすトラックをフィルタ
    const suitableTrucks = availableTrucks.filter(truck => 
      truck.capacity >= totalPoints &&
      truck.availability.some(date => 
        dateUtils.isDateInRange(preferredDate, date, date)
      )
    );

    if (suitableTrucks.length === 0) {
      return {
        success: false,
        message: '指定日に利用可能なトラックがありません',
        alternatives: suggestAlternativeDates(availableTrucks, preferredDate),
      };
    }

    // コスト効率でソート
    const rankedTrucks = suitableTrucks
      .map(truck => ({
        ...truck,
        totalCost: calculateTruckTotalCost(truck, distance, timeSlot),
        efficiency: truck.capacity / calculateTruckTotalCost(truck, distance, timeSlot),
      }))
      .sort((a, b) => b.efficiency - a.efficiency);

    return {
      success: true,
      recommendedTruck: rankedTrucks[0],
      alternatives: rankedTrucks.slice(1, 3),
      costComparison: rankedTrucks.map(truck => ({
        name: truck.name,
        cost: truck.totalCost,
        efficiency: Math.round(truck.efficiency * 100) / 100,
      })),
    };
  },
};

// ヘルパー関数群（内部でのみ使用）

/**
 * ポイントから基本料金率を計算
 */
function calculateBaseRateFromPoints(points: number): number {
  // ポイント数に応じた基本料金率の計算ロジック
  if (points <= 50) return 800;
  if (points <= 100) return 1000;
  if (points <= 200) return 1200;
  return 1500;
}

/**
 * リスクレベルに応じた推奨アクション
 */
function generateRiskRecommendations(riskLevel: 'low' | 'medium' | 'high'): string[] {
  switch (riskLevel) {
    case 'low':
      return ['通常対応で問題ありません'];
    case 'medium':
      return [
        '事前入金を検討してください',
        '詳細な見積書を提供してください',
      ];
    case 'high':
      return [
        '事前入金を必須としてください',
        '詳細な契約書を作成してください',
        '管理者承認を得てください',
      ];
    default:
      return [];
  }
}

/**
 * トラックの総コスト計算
 */
function calculateTruckTotalCost(
  truck: { costPerKm: number },
  distance: number,
  timeSlot: string
): number {
  const baseCost = truck.costPerKm * distance;
  const surchargeRate = timeSlot === 'early_morning' || timeSlot === 'night' ? 1.2 : 1.0;
  return Math.floor(baseCost * surchargeRate);
}

/**
 * 代替日程の提案
 */
function suggestAlternativeDates(
  trucks: Array<{ availability: Date[] }>,
  preferredDate: Date
): Date[] {
  const allAvailableDates = trucks.flatMap(truck => truck.availability);
  const uniqueDates = Array.from(new Set(allAvailableDates.map(d => d.getTime())))
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());

  // 希望日に近い日程を3つまで提案
  const preferredTime = preferredDate.getTime();
  return uniqueDates
    .map(date => ({
      date,
      timeDiff: Math.abs(date.getTime() - preferredTime),
    }))
    .sort((a, b) => a.timeDiff - b.timeDiff)
    .slice(0, 3)
    .map(item => item.date);
}

// ビジネスロジック関数をまとめてエクスポート
const businessLogic = {
  movingEstimateLogic,
  customerManagementLogic,
  fleetManagementLogic,
};

export default businessLogic;