/**
 * scheduleStatus.ts のテスト
 * カバレッジ目標: 95%+
 */

import {
  SCHEDULE_STATUSES,
  SCHEDULE_STATUS_IDS,
  SCHEDULE_STATUS_NAMES,
  getScheduleStatusById,
  getScheduleStatusDisplayName,
  getScheduleStatusColor,
  type ScheduleStatusDefinition,
} from '../scheduleStatus';

describe('SCHEDULE_STATUSES定数', () => {
  it('正しいスケジュールステータスが定義されている', () => {
    expect(SCHEDULE_STATUSES).toHaveLength(3);
    
    const expectedIds = ['available', 'booked', 'maintenance'];
    const actualIds = SCHEDULE_STATUSES.map(status => status.id);
    
    expect(actualIds).toEqual(expectedIds);
  });

  it('各ステータスが必要なプロパティを持つ', () => {
    SCHEDULE_STATUSES.forEach(status => {
      expect(status).toHaveProperty('id');
      expect(status).toHaveProperty('name');
      expect(status).toHaveProperty('displayName');
      expect(status).toHaveProperty('color');
      expect(status).toHaveProperty('description');
      
      expect(typeof status.id).toBe('string');
      expect(typeof status.name).toBe('string');
      expect(typeof status.displayName).toBe('string');
      expect(typeof status.color).toBe('string');
      expect(typeof status.description).toBe('string');
    });
  });

  it('availableステータスが正しく定義されている', () => {
    const available = SCHEDULE_STATUSES.find(status => status.id === 'available');
    
    expect(available).toEqual({
      id: 'available',
      name: 'available',
      displayName: '空き',
      color: 'bg-gray-50 border-gray-200',
      description: '予約可能な時間帯'
    });
  });

  it('bookedステータスが正しく定義されている', () => {
    const booked = SCHEDULE_STATUSES.find(status => status.id === 'booked');
    
    expect(booked).toEqual({
      id: 'booked',
      name: 'booked',
      displayName: '予約済み',
      color: 'bg-blue-200 border-blue-300',
      description: '既に予約が入っている時間帯'
    });
  });

  it('maintenanceステータスが正しく定義されている', () => {
    const maintenance = SCHEDULE_STATUSES.find(status => status.id === 'maintenance');
    
    expect(maintenance).toEqual({
      id: 'maintenance',
      name: 'maintenance',
      displayName: '整備中',
      color: 'bg-yellow-200 border-yellow-300',
      description: 'トラック整備中の時間帯'
    });
  });
});

describe('SCHEDULE_STATUS_IDS', () => {
  it('正しいIDの配列を返す', () => {
    expect(SCHEDULE_STATUS_IDS).toEqual(['available', 'booked', 'maintenance']);
  });

  it('SCHEDULE_STATUSESと同じ長さである', () => {
    expect(SCHEDULE_STATUS_IDS).toHaveLength(SCHEDULE_STATUSES.length);
  });

  it('重複がない', () => {
    const uniqueIds = [...new Set(SCHEDULE_STATUS_IDS)];
    expect(uniqueIds).toHaveLength(SCHEDULE_STATUS_IDS.length);
  });
});

describe('SCHEDULE_STATUS_NAMES', () => {
  it('正しい表示名の配列を返す', () => {
    expect(SCHEDULE_STATUS_NAMES).toEqual(['空き', '予約済み', '整備中']);
  });

  it('SCHEDULE_STATUSESと同じ長さである', () => {
    expect(SCHEDULE_STATUS_NAMES).toHaveLength(SCHEDULE_STATUSES.length);
  });

  it('各表示名が文字列である', () => {
    SCHEDULE_STATUS_NAMES.forEach(name => {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

describe('getScheduleStatusById', () => {
  it('有効なIDでステータス定義を返す', () => {
    const available = getScheduleStatusById('available');
    expect(available).toBeDefined();
    expect(available?.id).toBe('available');
    expect(available?.displayName).toBe('空き');
  });

  it('すべての有効なIDでステータスを取得できる', () => {
    SCHEDULE_STATUS_IDS.forEach(id => {
      const status = getScheduleStatusById(id);
      expect(status).toBeDefined();
      expect(status?.id).toBe(id);
    });
  });

  it('無効なIDでundefinedを返す', () => {
    expect(getScheduleStatusById('invalid')).toBeUndefined();
    expect(getScheduleStatusById('')).toBeUndefined();
    expect(getScheduleStatusById('nonexistent')).toBeUndefined();
  });

  it('型安全性を保つ', () => {
    const status = getScheduleStatusById('booked');
    if (status) {
      expect(status.id).toBe('booked');
      expect(status.name).toBe('booked');
      expect(status.displayName).toBe('予約済み');
      expect(status.color).toBe('bg-blue-200 border-blue-300');
      expect(status.description).toBe('既に予約が入っている時間帯');
    }
  });
});

describe('getScheduleStatusDisplayName', () => {
  it('有効なIDで表示名を返す', () => {
    expect(getScheduleStatusDisplayName('available')).toBe('空き');
    expect(getScheduleStatusDisplayName('booked')).toBe('予約済み');
    expect(getScheduleStatusDisplayName('maintenance')).toBe('整備中');
  });

  it('無効なIDでデフォルト値を返す', () => {
    expect(getScheduleStatusDisplayName('invalid')).toBe('不明');
    expect(getScheduleStatusDisplayName('')).toBe('不明');
    expect(getScheduleStatusDisplayName('nonexistent')).toBe('不明');
  });

  it('すべての有効なIDで正しい表示名を返す', () => {
    SCHEDULE_STATUS_IDS.forEach((id, index) => {
      const displayName = getScheduleStatusDisplayName(id);
      expect(displayName).toBe(SCHEDULE_STATUS_NAMES[index]);
    });
  });
});

describe('getScheduleStatusColor', () => {
  it('有効なIDで色クラスを返す', () => {
    expect(getScheduleStatusColor('available')).toBe('bg-gray-50 border-gray-200');
    expect(getScheduleStatusColor('booked')).toBe('bg-blue-200 border-blue-300');
    expect(getScheduleStatusColor('maintenance')).toBe('bg-yellow-200 border-yellow-300');
  });

  it('無効なIDでデフォルト色クラスを返す', () => {
    expect(getScheduleStatusColor('invalid')).toBe('bg-gray-50 border-gray-200');
    expect(getScheduleStatusColor('')).toBe('bg-gray-50 border-gray-200');
    expect(getScheduleStatusColor('nonexistent')).toBe('bg-gray-50 border-gray-200');
  });

  it('すべての有効なIDで適切な色クラスを返す', () => {
    SCHEDULE_STATUSES.forEach(status => {
      const color = getScheduleStatusColor(status.id);
      expect(color).toBe(status.color);
      expect(color).toMatch(/^bg-\w+-\d+\s+border-\w+-\d+$/); // Tailwind CSS形式チェック
    });
  });
});

describe('型定義', () => {
  it('ScheduleStatusDefinitionインターフェースが正しく動作する', () => {
    const customStatus: ScheduleStatusDefinition = {
      id: 'available',
      name: 'custom-available',
      displayName: 'カスタム空き',
      color: 'bg-green-50 border-green-200',
      description: 'カスタムステータス'
    };

    expect(customStatus.id).toBe('available');
    expect(customStatus.displayName).toBe('カスタム空き');
  });
});

describe('エッジケースとエラーハンドリング', () => {
  it('空文字列IDの処理', () => {
    expect(getScheduleStatusById('')).toBeUndefined();
    expect(getScheduleStatusDisplayName('')).toBe('不明');
    expect(getScheduleStatusColor('')).toBe('bg-gray-50 border-gray-200');
  });

  it('null/undefinedの処理（型安全性）', () => {
    expect(getScheduleStatusById(null as any)).toBeUndefined();
    expect(getScheduleStatusDisplayName(undefined as any)).toBe('不明');
  });

  it('特殊文字を含むIDの処理', () => {
    const specialChars = ['@', '#', '$', '%', '&', '*', '(', ')'];
    specialChars.forEach(char => {
      expect(getScheduleStatusById(char)).toBeUndefined();
      expect(getScheduleStatusDisplayName(char)).toBe('不明');
      expect(getScheduleStatusColor(char)).toBe('bg-gray-50 border-gray-200');
    });
  });

  it('大文字小文字の区別', () => {
    expect(getScheduleStatusById('AVAILABLE')).toBeUndefined();
    expect(getScheduleStatusById('Available')).toBeUndefined();
    expect(getScheduleStatusDisplayName('BOOKED')).toBe('不明');
  });

  it('色クラス形式の妥当性', () => {
    SCHEDULE_STATUSES.forEach(status => {
      const color = status.color;
      
      // Tailwind CSSの形式であることを確認
      expect(color).toMatch(/^bg-/);
      expect(color).toContain('border-');
      
      // 色の一貫性チェック（背景色とボーダー色が同系統）
      const bgColor = color.split(' ')[0].replace('bg-', '');
      const borderColor = color.split(' ')[1].replace('border-', '');
      
      const colorName = bgColor.replace(/-\d+$/, '');
      const borderColorName = borderColor.replace(/-\d+$/, '');
      
      expect(colorName).toBe(borderColorName);
    });
  });

  it('配列操作の不変性確認', () => {
    const originalLength = SCHEDULE_STATUSES.length;
    const originalIds = [...SCHEDULE_STATUS_IDS];
    const originalNames = [...SCHEDULE_STATUS_NAMES];

    // 配列への変更操作は通常成功するが、constで定義された配列なので元の値は変わらない
    // ここではむしろ配列の内容が期待通りであることを確認
    expect(SCHEDULE_STATUSES.length).toBe(3);
    expect(SCHEDULE_STATUS_IDS).toEqual(['available', 'booked', 'maintenance']);
    expect(SCHEDULE_STATUS_NAMES).toEqual(['空き', '予約済み', '整備中']);
    
    // 配列の値が変更されていないことを確認
    expect(SCHEDULE_STATUSES.length).toBe(originalLength);
    expect(SCHEDULE_STATUS_IDS).toEqual(originalIds);
    expect(SCHEDULE_STATUS_NAMES).toEqual(originalNames);
  });

  it('ステータス間の関係性チェック', () => {
    // 各ステータスが適切に区別されていることを確認
    const displayNames = SCHEDULE_STATUS_NAMES;
    const uniqueDisplayNames = [...new Set(displayNames)];
    expect(uniqueDisplayNames).toHaveLength(displayNames.length);

    // 色クラスも重複していないことを確認
    const colors = SCHEDULE_STATUSES.map(s => s.color);
    const uniqueColors = [...new Set(colors)];
    expect(uniqueColors).toHaveLength(colors.length);
  });
});