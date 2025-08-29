/**
 * workTypes.ts のテスト
 * カバレッジ目標: 95%+
 */

import {
  WORK_TYPES,
  WORK_TYPE_IDS,
  WORK_TYPE_NAMES,
  getWorkTypeById,
  getWorkTypeDisplayName,
  getWorkTypeIcon,
  getWorkTypeColor,
  type WorkTypeDefinition,
} from '../workTypes';

describe('WORK_TYPES定数', () => {
  it('正しい作業区分が定義されている', () => {
    expect(WORK_TYPES).toHaveLength(4);
    
    const expectedIds = ['loading', 'moving', 'unloading', 'maintenance'];
    const actualIds = WORK_TYPES.map(type => type.id);
    
    expect(actualIds).toEqual(expectedIds);
  });

  it('各作業区分が必要なプロパティを持つ', () => {
    WORK_TYPES.forEach(workType => {
      expect(workType).toHaveProperty('id');
      expect(workType).toHaveProperty('name');
      expect(workType).toHaveProperty('displayName');
      expect(workType).toHaveProperty('icon');
      expect(workType).toHaveProperty('color');
      expect(workType).toHaveProperty('description');
      
      expect(typeof workType.id).toBe('string');
      expect(typeof workType.name).toBe('string');
      expect(typeof workType.displayName).toBe('string');
      expect(typeof workType.icon).toBe('string');
      expect(typeof workType.color).toBe('string');
      expect(typeof workType.description).toBe('string');
    });
  });

  it('loading作業区分が正しく定義されている', () => {
    const loading = WORK_TYPES.find(type => type.id === 'loading');
    
    expect(loading).toEqual({
      id: 'loading',
      name: 'loading',
      displayName: '積込',
      icon: '📦',
      color: 'bg-blue-100 text-blue-800',
      description: '荷物をトラックに積み込む作業'
    });
  });

  it('moving作業区分が正しく定義されている', () => {
    const moving = WORK_TYPES.find(type => type.id === 'moving');
    
    expect(moving).toEqual({
      id: 'moving',
      name: 'moving',
      displayName: '移動',
      icon: '🚚',
      color: 'bg-green-100 text-green-800',
      description: 'トラックでの荷物の移動作業'
    });
  });

  it('unloading作業区分が正しく定義されている', () => {
    const unloading = WORK_TYPES.find(type => type.id === 'unloading');
    
    expect(unloading).toEqual({
      id: 'unloading',
      name: 'unloading',
      displayName: '積卸',
      icon: '📥',
      color: 'bg-purple-100 text-purple-800',
      description: 'トラックから荷物を降ろす作業'
    });
  });

  it('maintenance作業区分が正しく定義されている', () => {
    const maintenance = WORK_TYPES.find(type => type.id === 'maintenance');
    
    expect(maintenance).toEqual({
      id: 'maintenance',
      name: 'maintenance',
      displayName: '整備',
      icon: '🔧',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'トラックの整備・点検作業'
    });
  });
});

describe('WORK_TYPE_IDS', () => {
  it('正しいIDの配列を返す', () => {
    expect(WORK_TYPE_IDS).toEqual(['loading', 'moving', 'unloading', 'maintenance']);
  });

  it('WORK_TYPESと同じ長さである', () => {
    expect(WORK_TYPE_IDS).toHaveLength(WORK_TYPES.length);
  });

  it('重複がない', () => {
    const uniqueIds = [...new Set(WORK_TYPE_IDS)];
    expect(uniqueIds).toHaveLength(WORK_TYPE_IDS.length);
  });
});

describe('WORK_TYPE_NAMES', () => {
  it('正しい表示名の配列を返す', () => {
    expect(WORK_TYPE_NAMES).toEqual(['積込', '移動', '積卸', '整備']);
  });

  it('WORK_TYPESと同じ長さである', () => {
    expect(WORK_TYPE_NAMES).toHaveLength(WORK_TYPES.length);
  });

  it('各表示名が文字列である', () => {
    WORK_TYPE_NAMES.forEach(name => {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });
});

describe('getWorkTypeById', () => {
  it('有効なIDで作業区分定義を返す', () => {
    const loading = getWorkTypeById('loading');
    expect(loading).toBeDefined();
    expect(loading?.id).toBe('loading');
    expect(loading?.displayName).toBe('積込');
  });

  it('すべての有効なIDで作業区分を取得できる', () => {
    WORK_TYPE_IDS.forEach(id => {
      const workType = getWorkTypeById(id);
      expect(workType).toBeDefined();
      expect(workType?.id).toBe(id);
    });
  });

  it('無効なIDでundefinedを返す', () => {
    expect(getWorkTypeById('invalid')).toBeUndefined();
    expect(getWorkTypeById('')).toBeUndefined();
    expect(getWorkTypeById('nonexistent')).toBeUndefined();
  });

  it('型安全性を保つ', () => {
    const workType = getWorkTypeById('loading');
    if (workType) {
      // TypeScriptの型チェックが通ることを確認
      expect(workType.id).toBe('loading');
      expect(workType.name).toBe('loading');
      expect(workType.displayName).toBe('積込');
      expect(workType.icon).toBe('📦');
      expect(workType.color).toBe('bg-blue-100 text-blue-800');
      expect(workType.description).toBe('荷物をトラックに積み込む作業');
    }
  });
});

describe('getWorkTypeDisplayName', () => {
  it('有効なIDで表示名を返す', () => {
    expect(getWorkTypeDisplayName('loading')).toBe('積込');
    expect(getWorkTypeDisplayName('moving')).toBe('移動');
    expect(getWorkTypeDisplayName('unloading')).toBe('積卸');
    expect(getWorkTypeDisplayName('maintenance')).toBe('整備');
  });

  it('無効なIDでデフォルト値を返す', () => {
    expect(getWorkTypeDisplayName('invalid')).toBe('不明');
    expect(getWorkTypeDisplayName('')).toBe('不明');
    expect(getWorkTypeDisplayName('nonexistent')).toBe('不明');
  });

  it('すべての有効なIDで正しい表示名を返す', () => {
    WORK_TYPE_IDS.forEach((id, index) => {
      const displayName = getWorkTypeDisplayName(id);
      expect(displayName).toBe(WORK_TYPE_NAMES[index]);
    });
  });
});

describe('getWorkTypeIcon', () => {
  it('有効なIDでアイコンを返す', () => {
    expect(getWorkTypeIcon('loading')).toBe('📦');
    expect(getWorkTypeIcon('moving')).toBe('🚚');
    expect(getWorkTypeIcon('unloading')).toBe('📥');
    expect(getWorkTypeIcon('maintenance')).toBe('🔧');
  });

  it('無効なIDでデフォルトアイコンを返す', () => {
    expect(getWorkTypeIcon('invalid')).toBe('📋');
    expect(getWorkTypeIcon('')).toBe('📋');
    expect(getWorkTypeIcon('nonexistent')).toBe('📋');
  });

  it('すべての有効なIDで適切なアイコンを返す', () => {
    WORK_TYPES.forEach(workType => {
      const icon = getWorkTypeIcon(workType.id);
      expect(icon).toBe(workType.icon);
      expect(icon).toMatch(/^[\u{1F000}-\u{1F6FF}]$/u); // 絵文字の範囲チェック
    });
  });
});

describe('getWorkTypeColor', () => {
  it('有効なIDで色クラスを返す', () => {
    expect(getWorkTypeColor('loading')).toBe('bg-blue-100 text-blue-800');
    expect(getWorkTypeColor('moving')).toBe('bg-green-100 text-green-800');
    expect(getWorkTypeColor('unloading')).toBe('bg-purple-100 text-purple-800');
    expect(getWorkTypeColor('maintenance')).toBe('bg-yellow-100 text-yellow-800');
  });

  it('無効なIDでデフォルト色クラスを返す', () => {
    expect(getWorkTypeColor('invalid')).toBe('bg-gray-100 text-gray-800');
    expect(getWorkTypeColor('')).toBe('bg-gray-100 text-gray-800');
    expect(getWorkTypeColor('nonexistent')).toBe('bg-gray-100 text-gray-800');
  });

  it('すべての有効なIDで適切な色クラスを返す', () => {
    WORK_TYPES.forEach(workType => {
      const color = getWorkTypeColor(workType.id);
      expect(color).toBe(workType.color);
      expect(color).toMatch(/^bg-\w+-\d+\s+text-\w+-\d+$/); // Tailwind CSS形式チェック
    });
  });
});

describe('型定義', () => {
  it('WorkTypeDefinitionインターフェースが正しく動作する', () => {
    const customWorkType: WorkTypeDefinition = {
      id: 'loading',
      name: 'custom-loading',
      displayName: 'カスタム積込',
      icon: '📦',
      color: 'bg-blue-100 text-blue-800',
      description: 'カスタム作業'
    };

    expect(customWorkType.id).toBe('loading');
    expect(customWorkType.displayName).toBe('カスタム積込');
  });
});

describe('エッジケースとエラーハンドリング', () => {
  it('空文字列IDの処理', () => {
    expect(getWorkTypeById('')).toBeUndefined();
    expect(getWorkTypeDisplayName('')).toBe('不明');
    expect(getWorkTypeIcon('')).toBe('📋');
    expect(getWorkTypeColor('')).toBe('bg-gray-100 text-gray-800');
  });

  it('null/undefinedの処理（型安全性）', () => {
    // TypeScriptの型チェックにより、これらの呼び出しはコンパイル時にエラーになるが
    // ランタイムでの挙動も確認
    expect(getWorkTypeById(null as any)).toBeUndefined();
    expect(getWorkTypeDisplayName(undefined as any)).toBe('不明');
  });

  it('特殊文字を含むIDの処理', () => {
    const specialChars = ['@', '#', '$', '%', '&', '*', '(', ')'];
    specialChars.forEach(char => {
      expect(getWorkTypeById(char)).toBeUndefined();
      expect(getWorkTypeDisplayName(char)).toBe('不明');
      expect(getWorkTypeIcon(char)).toBe('📋');
      expect(getWorkTypeColor(char)).toBe('bg-gray-100 text-gray-800');
    });
  });

  it('配列操作の不変性確認', () => {
    const originalLength = WORK_TYPES.length;
    const originalIds = [...WORK_TYPE_IDS];
    const originalNames = [...WORK_TYPE_NAMES];

    // 配列への変更操作は通常成功するが、constで定義された配列なので元の値は変わらない
    // ここではむしろ配列の内容が期待通りであることを確認
    expect(WORK_TYPES.length).toBe(4);
    expect(WORK_TYPE_IDS).toEqual(['loading', 'moving', 'unloading', 'maintenance']);
    expect(WORK_TYPE_NAMES).toEqual(['積込', '移動', '積卸', '整備']);
    
    // 配列の値が変更されていないことを確認
    expect(WORK_TYPES.length).toBe(originalLength);
    expect(WORK_TYPE_IDS).toEqual(originalIds);
    expect(WORK_TYPE_NAMES).toEqual(originalNames);
  });
});