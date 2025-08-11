/**
 * 日付と時刻のフォーマット用ユーティリティ関数
 * 引越し管理システム全体で使用される共通関数
 */

/**
 * 日付文字列を日本語形式でフォーマットする
 * @param dateString - ISO形式の日付文字列 (例: "2023-10-15")
 * @returns 日本語形式の日付文字列 (例: "10月15日")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * 時刻文字列を読みやすい形式でフォーマットする
 * @param time - 24時間形式の時刻文字列 (例: "14:30")
 * @returns フォーマットされた時刻文字列 (例: "14:30")
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

/**
 * DateオブジェクトをローカルタイムゾーンのYYYY-MM-DD形式に変換する
 * @param date - Dateオブジェクト
 * @returns YYYY-MM-DD形式の日付文字列
 */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};