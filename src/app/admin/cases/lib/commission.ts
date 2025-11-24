/**
 * 手数料計算ユーティリティ
 * SyncMovingからの仲介手数料計算ロジック
 */

/**
 * 手数料率（デフォルト: 10%）
 */
export const DEFAULT_COMMISSION_RATE = 0.1;

/**
 * 手数料を計算する
 * @param amount - 受注金額（税込）
 * @param rate - 手数料率（デフォルト: 10%）
 * @returns 計算された手数料（小数点以下四捨五入）
 */
export const calculateCommission = (amount: number, rate: number = DEFAULT_COMMISSION_RATE): number => {
  return Math.round(amount * rate);
};

/**
 * 複数案件の合計手数料を計算する
 * @param amounts - 受注金額の配列
 * @param rate - 手数料率（デフォルト: 10%）
 * @returns 合計手数料
 */
export const calculateTotalCommission = (amounts: number[], rate: number = DEFAULT_COMMISSION_RATE): number => {
  return amounts.reduce((total, amount) => total + calculateCommission(amount, rate), 0);
};
