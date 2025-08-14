/**
 * 金額を日本円形式でフォーマット
 * @param value 金額（数値またはnull/undefined）
 * @returns フォーマットされた文字列（例：¥123,456（税込））
 */
export function formatPriceJPY(value?: number | null): string {
  if (value == null) return '-';
  return `¥${value.toLocaleString()}（税込）`;
}

/**
 * 日付文字列をYMD形式でフォーマット
 * @param dateStr 日付文字列またはnull/undefined
 * @returns フォーマットされた文字列（例：2024/01/15）または '-'
 */
export function formatDateYMD(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
  } catch {
    return '-';
  }
}

/**
 * 時間文字列をHH:mm形式でフォーマット
 * @param t 時間文字列（例：09:30）
 * @returns フォーマットされた時間文字列
 */
export function formatHHmm(t: string): string {
  if (!t) return '-';
  // 既にHH:mm形式の場合はそのまま返す
  if (/^\d{2}:\d{2}$/.test(t)) {
    return t;
  }
  // その他の形式の場合は適切に変換
  try {
    const [hours, minutes] = t.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch {
    return t;
  }
}
