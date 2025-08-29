/**
 * styleUtils.ts のテスト
 * カバレッジ目標: 100%
 */

import {
  getStatusStyle,
  getPriorityStyle,
  getWorkTypeDisplay,
  getUtilizationColor,
  classNames,
  getHashColor,
  getCustomerColor,
  getResponsivePadding,
  getResponsiveText,
  getButtonStyle
} from '../styleUtils';

describe('getStatusStyle', () => {
  describe('一般的なステータス', () => {
    it('activeステータスのbadgeスタイルを返す', () => {
      expect(getStatusStyle('active')).toBe('bg-green-100 text-green-800');
      expect(getStatusStyle('active', 'badge')).toBe('bg-green-100 text-green-800');
    });

    it('activeステータスの各種タイプのスタイルを返す', () => {
      expect(getStatusStyle('active', 'bg')).toBe('bg-green-50');
      expect(getStatusStyle('active', 'text')).toBe('text-green-600');
      expect(getStatusStyle('active', 'border')).toBe('border-green-200');
    });

    it('inactiveステータスのスタイルを返す', () => {
      expect(getStatusStyle('inactive')).toBe('bg-red-100 text-red-800');
      expect(getStatusStyle('inactive', 'bg')).toBe('bg-red-50');
      expect(getStatusStyle('inactive', 'text')).toBe('text-red-600');
      expect(getStatusStyle('inactive', 'border')).toBe('border-red-200');
    });

    it('pendingステータスのスタイルを返す', () => {
      expect(getStatusStyle('pending')).toBe('bg-yellow-100 text-yellow-800');
      expect(getStatusStyle('pending', 'bg')).toBe('bg-yellow-50');
      expect(getStatusStyle('pending', 'text')).toBe('text-yellow-600');
      expect(getStatusStyle('pending', 'border')).toBe('border-yellow-200');
    });

    it('completedステータスのスタイルを返す', () => {
      expect(getStatusStyle('completed')).toBe('bg-green-100 text-green-800');
    });

    it('cancelledステータスのスタイルを返す', () => {
      expect(getStatusStyle('cancelled')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('トラック関連ステータス', () => {
    it('availableステータスのスタイルを返す', () => {
      expect(getStatusStyle('available')).toBe('bg-green-100 text-green-800');
    });

    it('maintenanceステータスのスタイルを返す', () => {
      expect(getStatusStyle('maintenance')).toBe('bg-yellow-100 text-yellow-800');
    });
  });

  describe('契約関連ステータス', () => {
    it('confirmedステータスのスタイルを返す', () => {
      expect(getStatusStyle('confirmed')).toBe('bg-green-100 text-green-800');
    });

    it('estimateステータスのスタイルを返す', () => {
      expect(getStatusStyle('estimate')).toBe('bg-orange-100 text-orange-800');
    });
  });

  describe('案件関連ステータス', () => {
    it('unansweredステータスのスタイルを返す', () => {
      expect(getStatusStyle('unanswered')).toBe('bg-gray-100 text-gray-800');
    });

    it('answeredステータスのスタイルを返す', () => {
      expect(getStatusStyle('answered')).toBe('bg-blue-100 text-blue-800');
    });

    it('contractedステータスのスタイルを返す', () => {
      expect(getStatusStyle('contracted')).toBe('bg-green-100 text-green-800');
    });

    it('lostステータスのスタイルを返す', () => {
      expect(getStatusStyle('lost')).toBe('bg-red-100 text-red-800');
    });
  });

  describe('未知のステータス', () => {
    it('未知のステータスの場合はpendingスタイルをデフォルトで返す', () => {
      expect(getStatusStyle('unknown')).toBe('bg-yellow-100 text-yellow-800');
      expect(getStatusStyle('invalid', 'bg')).toBe('bg-yellow-50');
      expect(getStatusStyle('nonexistent', 'text')).toBe('text-yellow-600');
      expect(getStatusStyle('', 'border')).toBe('border-yellow-200');
    });
  });
});

describe('getPriorityStyle', () => {
  it('高優先度のスタイルを返す', () => {
    expect(getPriorityStyle('high')).toBe('bg-red-100 text-red-800');
    expect(getPriorityStyle('high', 'bg')).toBe('bg-red-50');
    expect(getPriorityStyle('high', 'text')).toBe('text-red-600');
    expect(getPriorityStyle('high', 'border')).toBe('border-red-200');
  });

  it('中優先度のスタイルを返す', () => {
    expect(getPriorityStyle('medium')).toBe('bg-yellow-100 text-yellow-800');
    expect(getPriorityStyle('medium', 'bg')).toBe('bg-yellow-50');
    expect(getPriorityStyle('medium', 'text')).toBe('text-yellow-600');
    expect(getPriorityStyle('medium', 'border')).toBe('border-yellow-200');
  });

  it('低優先度のスタイルを返す', () => {
    expect(getPriorityStyle('low')).toBe('bg-green-100 text-green-800');
    expect(getPriorityStyle('low', 'bg')).toBe('bg-green-50');
    expect(getPriorityStyle('low', 'text')).toBe('text-green-600');
    expect(getPriorityStyle('low', 'border')).toBe('border-green-200');
  });
});

describe('getWorkTypeDisplay', () => {
  it('積込作業タイプの情報を返す', () => {
    const result = getWorkTypeDisplay('loading');
    expect(result).toEqual({
      icon: '📦',
      label: '積込',
      color: 'bg-blue-100 text-blue-800'
    });
  });

  it('移動作業タイプの情報を返す', () => {
    const result = getWorkTypeDisplay('moving');
    expect(result).toEqual({
      icon: '🚚',
      label: '移動',
      color: 'bg-green-100 text-green-800'
    });
  });

  it('積卸作業タイプの情報を返す', () => {
    const result = getWorkTypeDisplay('unloading');
    expect(result).toEqual({
      icon: '📥',
      label: '積卸',
      color: 'bg-purple-100 text-purple-800'
    });
  });

  it('整備作業タイプの情報を返す', () => {
    const result = getWorkTypeDisplay('maintenance');
    expect(result).toEqual({
      icon: '🔧',
      label: '整備',
      color: 'bg-orange-100 text-orange-800'
    });
  });

  it('休憩作業タイプの情報を返す', () => {
    const result = getWorkTypeDisplay('break');
    expect(result).toEqual({
      icon: '☕',
      label: '休憩',
      color: 'bg-gray-100 text-gray-800'
    });
  });

  it('その他作業タイプの情報を返す', () => {
    const result = getWorkTypeDisplay('other');
    expect(result).toEqual({
      icon: '📝',
      label: 'その他',
      color: 'bg-gray-100 text-gray-800'
    });
  });

  it('未知の作業タイプの場合はその他をデフォルトで返す', () => {
    const result = getWorkTypeDisplay('unknown');
    expect(result).toEqual({
      icon: '📝',
      label: 'その他',
      color: 'bg-gray-100 text-gray-800'
    });
  });
});

describe('getUtilizationColor', () => {
  it('30%未満は緑色を返す', () => {
    expect(getUtilizationColor(0)).toBe('bg-green-100 text-green-800');
    expect(getUtilizationColor(29)).toBe('bg-green-100 text-green-800');
  });

  it('30%以上70%未満は黄色を返す', () => {
    expect(getUtilizationColor(30)).toBe('bg-yellow-100 text-yellow-800');
    expect(getUtilizationColor(50)).toBe('bg-yellow-100 text-yellow-800');
    expect(getUtilizationColor(69)).toBe('bg-yellow-100 text-yellow-800');
  });

  it('70%以上は赤色を返す', () => {
    expect(getUtilizationColor(70)).toBe('bg-red-100 text-red-800');
    expect(getUtilizationColor(90)).toBe('bg-red-100 text-red-800');
    expect(getUtilizationColor(100)).toBe('bg-red-100 text-red-800');
  });

  describe('境界値テスト', () => {
    it('境界値29.99は緑色', () => {
      expect(getUtilizationColor(29.99)).toBe('bg-green-100 text-green-800');
    });

    it('境界値30は黄色', () => {
      expect(getUtilizationColor(30)).toBe('bg-yellow-100 text-yellow-800');
    });

    it('境界値69.99は黄色', () => {
      expect(getUtilizationColor(69.99)).toBe('bg-yellow-100 text-yellow-800');
    });

    it('境界値70は赤色', () => {
      expect(getUtilizationColor(70)).toBe('bg-red-100 text-red-800');
    });
  });
});

describe('classNames', () => {
  it('文字列クラス名を結合する', () => {
    expect(classNames('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('undefinedをフィルタリングする', () => {
    expect(classNames('class1', undefined, 'class3')).toBe('class1 class3');
  });

  it('nullをフィルタリングする', () => {
    expect(classNames('class1', null, 'class3')).toBe('class1 class3');
  });

  it('falseをフィルタリングする', () => {
    expect(classNames('class1', false, 'class3')).toBe('class1 class3');
  });

  it('空文字列をフィルタリングする', () => {
    expect(classNames('class1', '', 'class3')).toBe('class1 class3');
  });

  it('trueは文字列として保持される', () => {
    expect(classNames('class1', true, 'class3')).toBe('class1 true class3');
  });

  it('すべてが無効な値の場合は空文字列を返す', () => {
    expect(classNames(undefined, null, false, '')).toBe('');
  });

  it('引数なしの場合は空文字列を返す', () => {
    expect(classNames()).toBe('');
  });

  it('複雑な組み合わせ', () => {
    const condition = true;
    const anotherCondition = false;
    expect(
      classNames(
        'base-class',
        condition && 'conditional-class',
        anotherCondition && 'should-not-appear',
        undefined,
        null,
        'final-class'
      )
    ).toBe('base-class conditional-class final-class');
  });
});

describe('getHashColor', () => {
  it('同じ文字列は同じ色を生成する', () => {
    const color1 = getHashColor('test');
    const color2 = getHashColor('test');
    expect(color1).toBe(color2);
  });

  it('異なる文字列は異なる色を生成する', () => {
    const color1 = getHashColor('test1');
    const color2 = getHashColor('test2');
    expect(color1).not.toBe(color2);
  });

  it('HSLAフォーマットの色を返す', () => {
    const color = getHashColor('test');
    expect(color).toMatch(/^hsla\(\d+, 70%, 80%, 0\.1\)$/);
  });

  it('カスタムアルファ値を適用する', () => {
    const color = getHashColor('test', 0.5);
    expect(color).toMatch(/^hsla\(\d+, 70%, 80%, 0\.5\)$/);
  });

  it('空文字列でも色を生成する', () => {
    const color = getHashColor('');
    expect(color).toMatch(/^hsla\(\d+, 70%, 80%, 0\.1\)$/);
  });

  it('日本語文字列でも色を生成する', () => {
    const color = getHashColor('テスト');
    expect(color).toMatch(/^hsla\(\d+, 70%, 80%, 0\.1\)$/);
  });

  it('特殊文字を含む文字列でも色を生成する', () => {
    const color = getHashColor('test@#$%^&*()');
    expect(color).toMatch(/^hsla\(\d+, 70%, 80%, 0\.1\)$/);
  });

  it('非常に長い文字列でも処理する', () => {
    const longString = 'a'.repeat(1000);
    const color = getHashColor(longString);
    expect(color).toMatch(/^hsla\(\d+, 70%, 80%, 0\.1\)$/);
  });
});

describe('getCustomerColor', () => {
  it('同じ顧客名は同じ色を返す', () => {
    const color1 = getCustomerColor('山田太郎');
    const color2 = getCustomerColor('山田太郎');
    expect(color1).toBe(color2);
  });

  it('異なる顧客名は異なる色を返す可能性がある', () => {
    const color1 = getCustomerColor('山田太郎');
    const color2 = getCustomerColor('佐藤次郎');
    // 色の配列が有限なので、異なることを保証はできないが、通常は異なる
    expect(typeof color1).toBe('string');
    expect(typeof color2).toBe('string');
  });

  it('定義された色パレットから色を返す', () => {
    const validColors = [
      '#e0f2fe', '#fce7f3', '#dcfce7', '#fef3c7', '#f3e8ff',
      '#fed7aa', '#ccfbf1', '#fecaca', '#dbeafe', '#e0e7ff'
    ];
    
    const color = getCustomerColor('テスト顧客');
    expect(validColors).toContain(color);
  });

  it('空文字列の顧客名でも色を返す', () => {
    const color = getCustomerColor('');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('数字のみの顧客名でも色を返す', () => {
    const color = getCustomerColor('12345');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('英語の顧客名でも色を返す', () => {
    const color = getCustomerColor('John Smith');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('getResponsivePadding', () => {
  it('smサイズのパディングクラスを返す', () => {
    expect(getResponsivePadding('sm')).toBe('px-2 sm:px-4 lg:px-6');
  });

  it('mdサイズ（デフォルト）のパディングクラスを返す', () => {
    expect(getResponsivePadding('md')).toBe('px-4 sm:px-6 lg:px-8');
    expect(getResponsivePadding()).toBe('px-4 sm:px-6 lg:px-8');
  });

  it('lgサイズのパディングクラスを返す', () => {
    expect(getResponsivePadding('lg')).toBe('px-6 sm:px-8 lg:px-12');
  });
});

describe('getResponsiveText', () => {
  it('smサイズのテキストクラスを返す', () => {
    expect(getResponsiveText('sm')).toBe('text-sm sm:text-base');
  });

  it('mdサイズ（デフォルト）のテキストクラスを返す', () => {
    expect(getResponsiveText('md')).toBe('text-base sm:text-lg');
    expect(getResponsiveText()).toBe('text-base sm:text-lg');
  });

  it('lgサイズのテキストクラスを返す', () => {
    expect(getResponsiveText('lg')).toBe('text-lg sm:text-xl lg:text-2xl');
  });
});

describe('getButtonStyle', () => {
  it('primaryボタンのスタイルを返す（デフォルト）', () => {
    const style = getButtonStyle();
    expect(style).toContain('bg-blue-600');
    expect(style).toContain('text-white');
    expect(style).toContain('border-blue-600');
    expect(style).toContain('hover:bg-blue-700');
  });

  it('primaryボタンの明示的なスタイルを返す', () => {
    const style = getButtonStyle('primary');
    expect(style).toContain('bg-blue-600');
    expect(style).toContain('text-white');
  });

  it('secondaryボタンのスタイルを返す', () => {
    const style = getButtonStyle('secondary');
    expect(style).toContain('bg-gray-600');
    expect(style).toContain('text-white');
    expect(style).toContain('border-gray-600');
  });

  it('outlineボタンのスタイルを返す', () => {
    const style = getButtonStyle('outline');
    expect(style).toContain('bg-transparent');
    expect(style).toContain('text-gray-700');
    expect(style).toContain('border-gray-300');
  });

  it('ghostボタンのスタイルを返す', () => {
    const style = getButtonStyle('ghost');
    expect(style).toContain('bg-transparent');
    expect(style).toContain('border-transparent');
  });

  it('dangerボタンのスタイルを返す', () => {
    const style = getButtonStyle('danger');
    expect(style).toContain('bg-red-600');
    expect(style).toContain('text-white');
    expect(style).toContain('border-red-600');
  });

  describe('ボタンサイズ', () => {
    it('smサイズのクラスを含む', () => {
      const style = getButtonStyle('primary', 'sm');
      expect(style).toContain('px-3 py-2 text-sm');
    });

    it('mdサイズ（デフォルト）のクラスを含む', () => {
      const style = getButtonStyle('primary', 'md');
      expect(style).toContain('px-4 py-2 text-sm');
    });

    it('lgサイズのクラスを含む', () => {
      const style = getButtonStyle('primary', 'lg');
      expect(style).toContain('px-6 py-3 text-base');
    });
  });

  describe('基本クラス', () => {
    it('すべてのボタンに共通の基本クラスを含む', () => {
      const style = getButtonStyle();
      expect(style).toContain('inline-flex');
      expect(style).toContain('items-center');
      expect(style).toContain('justify-center');
      expect(style).toContain('font-medium');
      expect(style).toContain('rounded-lg');
      expect(style).toContain('border');
      expect(style).toContain('transition-colors');
      expect(style).toContain('duration-200');
      expect(style).toContain('focus:outline-none');
      expect(style).toContain('focus:ring-2');
      expect(style).toContain('focus:ring-offset-2');
      expect(style).toContain('disabled:opacity-50');
      expect(style).toContain('disabled:cursor-not-allowed');
    });
  });

  describe('複合設定', () => {
    it('バリアントとサイズの組み合わせが正しく動作する', () => {
      const style = getButtonStyle('danger', 'lg');
      expect(style).toContain('bg-red-600');
      expect(style).toContain('px-6 py-3 text-base');
      expect(style).toContain('inline-flex');
    });
  });
});

describe('デフォルトエクスポート', () => {
  it('すべての関数がデフォルトエクスポートに含まれている', async () => {
    const styleUtils = (await import('../styleUtils')).default;
    
    expect(styleUtils.getStatusStyle).toBeDefined();
    expect(styleUtils.getPriorityStyle).toBeDefined();
    expect(styleUtils.getWorkTypeDisplay).toBeDefined();
    expect(styleUtils.getUtilizationColor).toBeDefined();
    expect(styleUtils.classNames).toBeDefined();
    expect(styleUtils.getHashColor).toBeDefined();
    expect(styleUtils.getCustomerColor).toBeDefined();
    expect(styleUtils.getResponsivePadding).toBeDefined();
    expect(styleUtils.getResponsiveText).toBeDefined();
    expect(styleUtils.getButtonStyle).toBeDefined();
  });
});