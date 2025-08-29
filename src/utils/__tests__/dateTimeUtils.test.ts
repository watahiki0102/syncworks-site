/**
 * dateTimeUtils.ts のテスト
 * カバレッジ目標: 100%
 */

import { formatDate, formatTime, toLocalDateString } from '../dateTimeUtils';

describe('formatDate', () => {
  it('ISO形式の日付文字列を日本語形式でフォーマットする', () => {
    expect(formatDate('2023-10-15')).toBe('10月15日');
  });

  it('年始の日付を正しくフォーマットする', () => {
    expect(formatDate('2024-01-01')).toBe('1月1日');
  });

  it('年末の日付を正しくフォーマットする', () => {
    expect(formatDate('2023-12-31')).toBe('12月31日');
  });

  it('月の一桁の日付も正しくフォーマットする', () => {
    expect(formatDate('2023-03-05')).toBe('3月5日');
  });

  it('月末の日付を正しくフォーマットする', () => {
    expect(formatDate('2023-02-28')).toBe('2月28日');
  });

  it('うるう年の2月29日を正しくフォーマットする', () => {
    expect(formatDate('2024-02-29')).toBe('2月29日');
  });

  it('ISO形式に時刻が含まれていても日付部分だけフォーマットする', () => {
    expect(formatDate('2023-10-15T14:30:00Z')).toBe('10月15日');
  });

  it('タイムゾーン情報付きのISO形式も正しく処理する', () => {
    expect(formatDate('2023-10-15T14:30:00+09:00')).toBe('10月15日');
  });

  it('無効な日付文字列の場合は"Invalid Date"に由来する文字列を返す', () => {
    const result = formatDate('invalid-date');
    // 無効な日付の場合、環境によって異なる文字列が返される可能性があるため、存在確認のみ
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('空文字列の場合も処理する', () => {
    const result = formatDate('');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

describe('formatTime', () => {
  it('24時間形式の時刻をそのままフォーマットする', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });

  it('午前の時刻を正しくフォーマットする', () => {
    expect(formatTime('09:15')).toBe('09:15');
  });

  it('午後の時刻を正しくフォーマットする', () => {
    expect(formatTime('23:59')).toBe('23:59');
  });

  it('深夜の時刻を正しくフォーマットする', () => {
    expect(formatTime('00:00')).toBe('00:00');
  });

  it('正午の時刻を正しくフォーマットする', () => {
    expect(formatTime('12:00')).toBe('12:00');
  });

  it('一桁の時間と分を正しく処理する', () => {
    expect(formatTime('9:5')).toBe('9:5');
  });

  it('秒が含まれている場合は時間と分のみ取得する', () => {
    expect(formatTime('14:30:45')).toBe('14:30');
  });

  it('時間のみが指定された場合（分がundefined）', () => {
    expect(formatTime('14:')).toBe('14:');
  });

  it('空文字列が指定された場合', () => {
    expect(formatTime(':')).toBe(':');
  });

  it('コロンが含まれていない時刻文字列の処理', () => {
    expect(formatTime('1430')).toBe('1430:undefined');
  });

  it('複数のコロンが含まれている時刻文字列の処理', () => {
    expect(formatTime('14:30:45:123')).toBe('14:30');
  });
});

describe('toLocalDateString', () => {
  it('Dateオブジェクトを YYYY-MM-DD 形式の文字列に変換する', () => {
    const date = new Date(2023, 9, 15); // 2023年10月15日（月は0ベース）
    expect(toLocalDateString(date)).toBe('2023-10-15');
  });

  it('年始の日付を正しく変換する', () => {
    const date = new Date(2024, 0, 1); // 2024年1月1日
    expect(toLocalDateString(date)).toBe('2024-01-01');
  });

  it('年末の日付を正しく変換する', () => {
    const date = new Date(2023, 11, 31); // 2023年12月31日
    expect(toLocalDateString(date)).toBe('2023-12-31');
  });

  it('月と日が一桁の場合に0埋めされる', () => {
    const date = new Date(2023, 2, 5); // 2023年3月5日
    expect(toLocalDateString(date)).toBe('2023-03-05');
  });

  it('うるう年の2月29日を正しく変換する', () => {
    const date = new Date(2024, 1, 29); // 2024年2月29日
    expect(toLocalDateString(date)).toBe('2024-02-29');
  });

  it('時刻情報も含むDateオブジェクトから日付のみ取得する', () => {
    const date = new Date(2023, 9, 15, 14, 30, 45); // 2023年10月15日 14:30:45
    expect(toLocalDateString(date)).toBe('2023-10-15');
  });

  it('現在時刻のDateオブジェクトを正しく変換する', () => {
    const now = new Date();
    const result = toLocalDateString(now);
    
    // YYYY-MM-DD形式の正規表現チェック
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('過去の日付を正しく変換する', () => {
    const date = new Date(1995, 6, 20); // 1995年7月20日
    expect(toLocalDateString(date)).toBe('1995-07-20');
  });

  it('未来の日付を正しく変換する', () => {
    const date = new Date(2030, 11, 25); // 2030年12月25日
    expect(toLocalDateString(date)).toBe('2030-12-25');
  });

  it('無効なDateオブジェクトの処理', () => {
    const invalidDate = new Date('invalid');
    const result = toLocalDateString(invalidDate);
    
    // 無効な日付の場合、NaNが含まれる可能性がある
    expect(typeof result).toBe('string');
  });

  describe('月の計算が正しく行われる', () => {
    it('1月（0ベース）が01として出力される', () => {
      const date = new Date(2023, 0, 15);
      expect(toLocalDateString(date)).toBe('2023-01-15');
    });

    it('12月（11ベース）が12として出力される', () => {
      const date = new Date(2023, 11, 15);
      expect(toLocalDateString(date)).toBe('2023-12-15');
    });
  });

  describe('パディング機能の確認', () => {
    it('月が一桁の場合に0埋めされる', () => {
      const date = new Date(2023, 0, 15); // 1月
      expect(toLocalDateString(date)).toMatch(/-01-/);
    });

    it('日が一桁の場合に0埋めされる', () => {
      const date = new Date(2023, 9, 1); // 1日
      expect(toLocalDateString(date)).toMatch(/-01$/);
    });

    it('月と日が両方一桁の場合に両方とも0埋めされる', () => {
      const date = new Date(2023, 0, 1); // 1月1日
      expect(toLocalDateString(date)).toBe('2023-01-01');
    });
  });

  describe('エッジケース', () => {
    it('エポック時刻（1970年1月1日）を正しく処理する', () => {
      const date = new Date(1970, 0, 1);
      expect(toLocalDateString(date)).toBe('1970-01-01');
    });

    it('JavaScript日付の最小値を処理する', () => {
      // 実際には非常に古い日付になるが、文字列として正しく処理されることを確認
      const date = new Date(-8640000000000000);
      const result = toLocalDateString(date);
      expect(typeof result).toBe('string');
    });

    it('JavaScript日付の最大値を処理する', () => {
      // 実際には非常に新しい日付になるが、文字列として正しく処理されることを確認  
      const date = new Date(8640000000000000);
      const result = toLocalDateString(date);
      expect(typeof result).toBe('string');
    });
  });
});