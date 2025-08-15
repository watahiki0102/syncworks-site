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

/**
 * 住所を短縮表示用にフォーマット
 * @param address 住所文字列
 * @param mode 表示モード（'full' | 'compact' | 'mini' | 'too-narrow'）
 * @returns 短縮された住所文字列
 */
export function shortenAddress(address: string, mode: 'full' | 'compact' | 'mini' | 'too-narrow' = 'compact'): string {
  if (!address) return '';
  
  // 住所を解析して市区町村を優先
  const parts = address.split(/[都道府県市区町村]/).filter(Boolean);
  
  // モードに応じた長さ制限
  const maxLengths = {
    'full': 20,
    'compact': 15,
    'mini': 10,
    'too-narrow': 8
  };
  
  const maxLength = maxLengths[mode];
  
  // 市区町村が見つかった場合はそれを優先
  if (parts.length >= 2) {
    const cityTown = parts[1]; // 市区町村部分
    if (cityTown.length <= maxLength) {
      return cityTown;
    }
    return cityTown.substring(0, maxLength - 1) + '…';
  }
  
  // 市区町村が見つからない場合は全体を短縮
  if (address.length <= maxLength) {
    return address;
  }
  
  return address.substring(0, maxLength - 1) + '…';
}
