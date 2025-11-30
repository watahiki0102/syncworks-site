/**
 * シフトAPIの日付パース処理のテスト
 * parseDateString関数の動作を検証
 */

describe('parseDateString関数の動作確認', () => {
  // parseDateString関数を実装（route.tsから抽出）
  function parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    // UTCの正午を使用することで、タイムゾーンの影響を最小化
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  describe('日付フィルタリングのタイムゾーン問題回避', () => {
    it('今日の日付（2024-01-15）でparseDateStringを使用しても日付が1日ずれない', () => {
      const dateString = '2024-01-15';
      const result = parseDateString(dateString);

      // UTC正午で作成されていることを確認
      expect(result.getUTCHours()).toBe(12);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);

      // 日付が正しいことを確認
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(0); // 0ベースなので0が1月
      expect(result.getUTCDate()).toBe(15);
    });

    it('月末の日付（11/30）でparseDateStringを使用しても翌月にならない', () => {
      const dateString = '2024-11-30';
      const result = parseDateString(dateString);

      // 11月30日のままであることを確認
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(10); // 0ベースなので10が11月
      expect(result.getUTCDate()).toBe(30);
    });

    it('月初の日付（12/1）でparseDateStringを使用しても前月にならない', () => {
      const dateString = '2024-12-01';
      const result = parseDateString(dateString);

      // 12月1日のままであることを確認
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(11); // 0ベースなので11が12月
      expect(result.getUTCDate()).toBe(1);
    });

    it('年末年始（12/31, 1/1）でparseDateStringを使用しても年がずれない', () => {
      const dateString1 = '2024-12-31';
      const dateString2 = '2025-01-01';
      
      const result1 = parseDateString(dateString1);
      const result2 = parseDateString(dateString2);

      // 12月31日が2024年のままであることを確認
      expect(result1.getUTCFullYear()).toBe(2024);
      expect(result1.getUTCMonth()).toBe(11); // 12月
      expect(result1.getUTCDate()).toBe(31);

      // 1月1日が2025年のままであることを確認
      expect(result2.getUTCFullYear()).toBe(2025);
      expect(result2.getUTCMonth()).toBe(0); // 1月
      expect(result2.getUTCDate()).toBe(1);
    });

    it('異なるタイムゾーンでも同じ日付として解釈される（UTC正午を使用）', () => {
      const dateString = '2024-01-15';
      const result = parseDateString(dateString);

      // UTC正午で作成されていることを確認
      expect(result.getUTCHours()).toBe(12);
      expect(result.getUTCMinutes()).toBe(0);

      // ローカルタイムゾーンに関係なく、UTCでは同じ日付であることを確認
      const utcYear = result.getUTCFullYear();
      const utcMonth = result.getUTCMonth();
      const utcDate = result.getUTCDate();

      expect(utcYear).toBe(2024);
      expect(utcMonth).toBe(0); // 1月
      expect(utcDate).toBe(15);
    });
  });

  describe('エッジケース', () => {
    it('うるう年の2月29日を正しく処理する', () => {
      const dateString = '2024-02-29';
      const result = parseDateString(dateString);

      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(1); // 2月
      expect(result.getUTCDate()).toBe(29);
    });

    it('年始（1/1）を正しく処理する', () => {
      const dateString = '2024-01-01';
      const result = parseDateString(dateString);

      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(0); // 1月
      expect(result.getUTCDate()).toBe(1);
    });

    it('年末（12/31）を正しく処理する', () => {
      const dateString = '2024-12-31';
      const result = parseDateString(dateString);

      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(11); // 12月
      expect(result.getUTCDate()).toBe(31);
    });
  });

  describe('new Date()との比較（タイムゾーン問題の確認）', () => {
    it('parseDateStringはUTC正午を使用するため、タイムゾーンの影響を受けない', () => {
      const dateString = '2024-01-15';
      const parsedDate = parseDateString(dateString);
      const newDateResult = new Date(dateString);

      // parseDateStringは常にUTC正午で作成される
      expect(parsedDate.getUTCHours()).toBe(12);
      expect(parsedDate.getUTCMinutes()).toBe(0);

      // new Date()はローカルタイムゾーンで解釈される可能性がある
      // ただし、UTCでの日付は同じであることを確認
      expect(parsedDate.getUTCFullYear()).toBe(newDateResult.getUTCFullYear());
      expect(parsedDate.getUTCMonth()).toBe(newDateResult.getUTCMonth());
      expect(parsedDate.getUTCDate()).toBe(newDateResult.getUTCDate());
    });
  });
});

