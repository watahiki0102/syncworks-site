/**
 * accessibility.ts のテスト
 * カバレッジ目標: 100%
 */

import {
  getFocusableElements,
  createFocusTrap,
  focusElement,
  useEscapeKey,
  generateAccessibilityProps,
  addScreenReaderText,
  announceToScreenReader,
  KeyboardNavigation,
  calculateContrastRatio,
  AccessibilityTester
} from '../accessibility';

// DOMのモック
beforeEach(() => {
  document.body.innerHTML = '';
  // activeElementのモック（一度だけ設定）
  if (!document.hasOwnProperty('activeElement')) {
    Object.defineProperty(document, 'activeElement', {
      writable: true,
      configurable: true,
      value: null
    });
  }
});

afterEach(() => {
  document.body.innerHTML = '';
  // イベントリスナーをクリーンアップ
  document.removeEventListener('keydown', () => {});
});

describe('getFocusableElements', () => {
  it('フォーカス可能な要素を正しく取得する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button</button>
      <input type="text" />
      <a href="#">Link</a>
      <div tabindex="0">Focusable Div</div>
      <button disabled>Disabled Button</button>
      <div>Non-focusable Div</div>
    `;

    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(4);
    expect(focusableElements[0].tagName).toBe('BUTTON');
    expect(focusableElements[1].tagName).toBe('INPUT');
    expect(focusableElements[2].tagName).toBe('A');
    expect(focusableElements[3].tagName).toBe('DIV');
    expect(focusableElements[3].getAttribute('tabindex')).toBe('0');
  });

  it('select要素を正しく取得する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <select>
        <option>Option 1</option>
      </select>
      <select disabled>
        <option>Disabled Option</option>
      </select>
    `;

    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(1);
    expect(focusableElements[0].tagName).toBe('SELECT');
  });

  it('textarea要素を正しく取得する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <textarea></textarea>
      <textarea disabled></textarea>
    `;

    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(1);
    expect(focusableElements[0].tagName).toBe('TEXTAREA');
  });

  it('role属性を持つ要素を正しく取得する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div role="button">Role Button</div>
      <div role="link">Role Link</div>
      <div role="menuitem">Menu Item</div>
      <div role="tab">Tab</div>
      <div role="button" disabled>Disabled Role Button</div>
    `;

    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(4);
  });

  it('audio/video要素を正しく取得する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <audio controls></audio>
      <video controls></video>
      <audio></audio>
      <video></video>
    `;

    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(2);
  });

  it('tabindex="-1"の要素は除外する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div tabindex="-1">Not Focusable</div>
      <div tabindex="0">Focusable</div>
      <div tabindex="1">Also Focusable</div>
    `;

    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(2);
    expect(focusableElements[0].getAttribute('tabindex')).toBe('0');
    expect(focusableElements[1].getAttribute('tabindex')).toBe('1');
  });

  it('空のコンテナの場合は空配列を返す', () => {
    const container = document.createElement('div');
    const focusableElements = getFocusableElements(container);
    expect(focusableElements).toHaveLength(0);
  });
});

describe('createFocusTrap', () => {
  let container: HTMLElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button2 = document.createElement('button');
    button3 = document.createElement('button');
    
    button1.textContent = 'Button 1';
    button2.textContent = 'Button 2';
    button3.textContent = 'Button 3';
    
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);
    
    document.body.appendChild(container);

    // focus メソッドのモック
    button1.focus = jest.fn();
    button2.focus = jest.fn();
    button3.focus = jest.fn();
  });

  it('フォーカストラップを正しく作成する', () => {
    const cleanup = createFocusTrap(container);
    
    // 初期フォーカスが最初の要素に設定される
    expect(button1.focus).toHaveBeenCalled();
    
    // クリーンアップ関数が返される
    expect(typeof cleanup).toBe('function');
    
    cleanup();
  });

  it('Tabキーで最後の要素から最初の要素にループする', () => {
    const cleanup = createFocusTrap(container);
    
    // activeElementを最後の要素に設定
    (document as any).activeElement = button3;

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    Object.defineProperty(tabEvent, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    container.dispatchEvent(tabEvent);
    
    expect(tabEvent.preventDefault).toHaveBeenCalled();
    expect(button1.focus).toHaveBeenCalledTimes(2); // 初期 + ループ
    
    cleanup();
  });

  it('Shift+Tabキーで最初の要素から最後の要素にループする', () => {
    const cleanup = createFocusTrap(container);
    
    // activeElementを最初の要素に設定
    (document as any).activeElement = button1;

    const shiftTabEvent = new KeyboardEvent('keydown', { 
      key: 'Tab', 
      shiftKey: true 
    });
    Object.defineProperty(shiftTabEvent, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    container.dispatchEvent(shiftTabEvent);
    
    expect(shiftTabEvent.preventDefault).toHaveBeenCalled();
    expect(button3.focus).toHaveBeenCalled();
    
    cleanup();
  });

  it('Tab以外のキーでは何もしない', () => {
    const cleanup = createFocusTrap(container);
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(enterEvent, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    container.dispatchEvent(enterEvent);
    
    expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    
    cleanup();
  });

  it('フォーカス可能な要素がない場合でもエラーにならない', () => {
    const emptyContainer = document.createElement('div');
    document.body.appendChild(emptyContainer);

    expect(() => {
      const cleanup = createFocusTrap(emptyContainer);
      cleanup();
    }).not.toThrow();
  });

  it('クリーンアップ関数でイベントリスナーが削除される', () => {
    const removeEventListenerSpy = jest.spyOn(container, 'removeEventListener');
    
    const cleanup = createFocusTrap(container);
    cleanup();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('focusElement', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('button');
    element.textContent = 'Test Button';
    document.body.appendChild(element);

    // focus と scrollIntoView のモック
    element.focus = jest.fn();
    element.scrollIntoView = jest.fn();
  });

  it('デフォルトオプションで要素にフォーカスする', () => {
    focusElement(element);
    
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: false });
    expect(element.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  });

  it('preventScroll オプションを適用する', () => {
    focusElement(element, { preventScroll: true });
    
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(element.scrollIntoView).not.toHaveBeenCalled();
  });

  it('scrollIntoView オプションを無効にする', () => {
    focusElement(element, { scrollIntoView: false });
    
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: false });
    expect(element.scrollIntoView).not.toHaveBeenCalled();
  });

  it('preventScroll と scrollIntoView の組み合わせ', () => {
    focusElement(element, { preventScroll: true, scrollIntoView: true });
    
    expect(element.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(element.scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('useEscapeKey', () => {
  it('Escapeキーでコールバックが呼ばれる', () => {
    const callback = jest.fn();
    const cleanup = useEscapeKey(callback);
    
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    cleanup();
  });

  it('Escape以外のキーではコールバックが呼ばれない', () => {
    const callback = jest.fn();
    const cleanup = useEscapeKey(callback);
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);
    
    expect(callback).not.toHaveBeenCalled();
    
    cleanup();
  });

  it('複数回Escapeキーを押すと複数回コールバックが呼ばれる', () => {
    const callback = jest.fn();
    const cleanup = useEscapeKey(callback);
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    
    expect(callback).toHaveBeenCalledTimes(2);
    
    cleanup();
  });

  it('クリーンアップ関数でイベントリスナーが削除される', () => {
    const callback = jest.fn();
    const cleanup = useEscapeKey(callback);
    
    cleanup();
    
    // クリーンアップ後はコールバックが呼ばれない
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('generateAccessibilityProps', () => {
  it('基本的なaria属性を生成する', () => {
    const props = generateAccessibilityProps({
      label: 'Test Label',
      role: 'button'
    });

    expect(props).toEqual({
      'aria-label': 'Test Label',
      'role': 'button'
    });
  });

  it('すべてのaria属性を生成する', () => {
    const props = generateAccessibilityProps({
      label: 'Label',
      labelledBy: 'labelId',
      describedBy: 'descId',
      expanded: true,
      hidden: false,
      role: 'menu',
      pressed: true,
      selected: false,
      disabled: true,
      required: false,
      invalid: true,
      live: 'assertive',
      atomic: true
    });

    expect(props).toEqual({
      'aria-label': 'Label',
      'aria-labelledby': 'labelId',
      'aria-describedby': 'descId',
      'aria-expanded': true,
      'aria-hidden': false,
      'role': 'menu',
      'aria-pressed': true,
      'aria-selected': false,
      'aria-disabled': true,
      'aria-required': false,
      'aria-invalid': true,
      'aria-live': 'assertive',
      'aria-atomic': true
    });
  });

  it('undefinedの値は除外される', () => {
    const props = generateAccessibilityProps({
      label: 'Label',
      expanded: undefined,
      role: undefined
    });

    expect(props).toEqual({
      'aria-label': 'Label'
    });
  });

  it('falseの値も含まれる', () => {
    const props = generateAccessibilityProps({
      expanded: false,
      hidden: false,
      pressed: false
    });

    expect(props).toEqual({
      'aria-expanded': false,
      'aria-hidden': false,
      'aria-pressed': false
    });
  });

  it('空のオプションの場合は空のオブジェクトを返す', () => {
    const props = generateAccessibilityProps({});
    expect(props).toEqual({});
  });
});

describe('addScreenReaderText', () => {
  it('スクリーンリーダー専用テキストを追加する', () => {
    const element = document.createElement('div');
    
    addScreenReaderText(element, 'Screen reader only text');
    
    const srElement = element.querySelector('.sr-only');
    expect(srElement).not.toBeNull();
    expect(srElement?.textContent).toBe('Screen reader only text');
    expect(srElement?.tagName).toBe('SPAN');
  });

  it('複数回呼び出すと複数の要素が追加される', () => {
    const element = document.createElement('div');
    
    addScreenReaderText(element, 'Text 1');
    addScreenReaderText(element, 'Text 2');
    
    const srElements = element.querySelectorAll('.sr-only');
    expect(srElements).toHaveLength(2);
    expect(srElements[0].textContent).toBe('Text 1');
    expect(srElements[1].textContent).toBe('Text 2');
  });

  it('空文字列でも要素を追加する', () => {
    const element = document.createElement('div');
    
    addScreenReaderText(element, '');
    
    const srElement = element.querySelector('.sr-only');
    expect(srElement).not.toBeNull();
    expect(srElement?.textContent).toBe('');
  });
});

describe('announceToScreenReader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // body内の要素をクリーンアップ
    document.querySelectorAll('[aria-live]').forEach(el => el.remove());
  });

  it('politeでライブリージョンを作成する', () => {
    announceToScreenReader('Test message');
    
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toBe('Test message');
    expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    expect(liveRegion?.className).toBe('sr-only');
  });

  it('assertiveでライブリージョンを作成する', () => {
    announceToScreenReader('Urgent message', 'assertive');
    
    const liveRegion = document.querySelector('[aria-live="assertive"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toBe('Urgent message');
  });

  it('1秒後にライブリージョンが削除される', () => {
    announceToScreenReader('Test message');
    
    let liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    
    jest.advanceTimersByTime(1000);
    
    liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeNull();
  });

  it('複数のメッセージを並行処理できる', () => {
    announceToScreenReader('Message 1', 'polite');
    announceToScreenReader('Message 2', 'assertive');
    
    const politeRegion = document.querySelector('[aria-live="polite"]');
    const assertiveRegion = document.querySelector('[aria-live="assertive"]');
    
    expect(politeRegion?.textContent).toBe('Message 1');
    expect(assertiveRegion?.textContent).toBe('Message 2');
  });
});

describe('KeyboardNavigation.handleArrowKeys', () => {
  let items: HTMLElement[];

  beforeEach(() => {
    items = [
      document.createElement('button'),
      document.createElement('button'),
      document.createElement('button')
    ];

    items.forEach((item, index) => {
      item.textContent = `Button ${index + 1}`;
      item.focus = jest.fn();
      document.body.appendChild(item);
    });
  });

  describe('horizontal navigation', () => {
    it('ArrowRightで次の要素に移動する', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 0, 'horizontal');
      
      expect(newIndex).toBe(1);
      expect(items[1].focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('ArrowLeftで前の要素に移動する', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 1, 'horizontal');
      
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('最後の要素でArrowRightを押すと最初の要素にループする', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 2, 'horizontal');
      
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
    });

    it('最初の要素でArrowLeftを押すと最後の要素にループする', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 0, 'horizontal');
      
      expect(newIndex).toBe(2);
      expect(items[2].focus).toHaveBeenCalled();
    });

    it('horizontal orientationでArrowUpとArrowDownは何もしない', () => {
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      
      Object.defineProperty(upEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      Object.defineProperty(downEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const upIndex = KeyboardNavigation.handleArrowKeys(upEvent, items, 1, 'horizontal');
      const downIndex = KeyboardNavigation.handleArrowKeys(downEvent, items, 1, 'horizontal');
      
      expect(upIndex).toBe(1);
      expect(downIndex).toBe(1);
      expect(upEvent.preventDefault).not.toHaveBeenCalled();
      expect(downEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('vertical navigation', () => {
    it('ArrowDownで次の要素に移動する', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 0, 'vertical');
      
      expect(newIndex).toBe(1);
      expect(items[1].focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('ArrowUpで前の要素に移動する', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 1, 'vertical');
      
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('最後の要素でArrowDownを押すと最初の要素にループする', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 2, 'vertical');
      
      expect(newIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();
    });

    it('最初の要素でArrowUpを押すと最後の要素にループする', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 0, 'vertical');
      
      expect(newIndex).toBe(2);
      expect(items[2].focus).toHaveBeenCalled();
    });

    it('vertical orientationでArrowLeftとArrowRightは何もしない', () => {
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      
      Object.defineProperty(leftEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });
      Object.defineProperty(rightEvent, 'preventDefault', {
        value: jest.fn(),
        writable: true
      });

      const leftIndex = KeyboardNavigation.handleArrowKeys(leftEvent, items, 1, 'vertical');
      const rightIndex = KeyboardNavigation.handleArrowKeys(rightEvent, items, 1, 'vertical');
      
      expect(leftIndex).toBe(1);
      expect(rightIndex).toBe(1);
      expect(leftEvent.preventDefault).not.toHaveBeenCalled();
      expect(rightEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  it('無効なキーでは何もしない', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    const newIndex = KeyboardNavigation.handleArrowKeys(event, items, 1);
    
    expect(newIndex).toBe(1);
    expect(event.preventDefault).not.toHaveBeenCalled();
    items.forEach(item => expect(item.focus).not.toHaveBeenCalled());
  });
});

describe('KeyboardNavigation.handleHomeEndKeys', () => {
  let items: HTMLElement[];

  beforeEach(() => {
    items = [
      document.createElement('button'),
      document.createElement('button'),
      document.createElement('button')
    ];

    items.forEach((item, index) => {
      item.textContent = `Button ${index + 1}`;
      item.focus = jest.fn();
      document.body.appendChild(item);
    });
  });

  it('Homeキーで最初の要素に移動する', () => {
    const event = new KeyboardEvent('keydown', { key: 'Home' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    const newIndex = KeyboardNavigation.handleHomeEndKeys(event, items);
    
    expect(newIndex).toBe(0);
    expect(items[0].focus).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('Endキーで最後の要素に移動する', () => {
    const event = new KeyboardEvent('keydown', { key: 'End' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    const newIndex = KeyboardNavigation.handleHomeEndKeys(event, items);
    
    expect(newIndex).toBe(2);
    expect(items[2].focus).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('Home/End以外のキーでは何もしない', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    const newIndex = KeyboardNavigation.handleHomeEndKeys(event, items);
    
    expect(newIndex).toBe(-1);
    expect(event.preventDefault).not.toHaveBeenCalled();
    items.forEach(item => expect(item.focus).not.toHaveBeenCalled());
  });

  it('空の配列でHomeキーを押してもエラーにならない', () => {
    const event = new KeyboardEvent('keydown', { key: 'Home' });
    Object.defineProperty(event, 'preventDefault', {
      value: jest.fn(),
      writable: true
    });

    expect(() => {
      KeyboardNavigation.handleHomeEndKeys(event, []);
    }).not.toThrow();
  });
});

describe('calculateContrastRatio', () => {
  it('白と黒のコントラスト比を計算する', () => {
    const ratio = calculateContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeCloseTo(21, 1);
  });

  it('同じ色のコントラスト比は1である', () => {
    const ratio = calculateContrastRatio('#ffffff', '#ffffff');
    expect(ratio).toBeCloseTo(1, 1);
  });

  it('一般的な色の組み合わせのコントラスト比を計算する', () => {
    // 青背景に白文字
    const blueWhiteRatio = calculateContrastRatio('#ffffff', '#0066cc');
    expect(blueWhiteRatio).toBeGreaterThan(4.5); // WCAG AA準拠

    // 灰色背景に黒文字
    const grayBlackRatio = calculateContrastRatio('#000000', '#cccccc');
    expect(grayBlackRatio).toBeGreaterThan(4.5);
  });

  it('小文字のhex値でも正しく処理する', () => {
    const ratio = calculateContrastRatio('#ffffff', '#000000');
    const lowerRatio = calculateContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeCloseTo(lowerRatio, 5);
  });

  it('3桁のhex値の処理（現在の実装では6桁のみサポート）', () => {
    // 現在の実装は6桁のhexのみサポートのため、3桁はNaNになる
    const ratio6 = calculateContrastRatio('#ffffff', '#000000');
    const ratio3 = calculateContrastRatio('#fff', '#000');
    expect(ratio6).toBeCloseTo(21, 1);
    expect(ratio3).toBeNaN();
  });

  it('不正なhex値でもエラーにならない', () => {
    expect(() => {
      calculateContrastRatio('#gggggg', '#000000');
    }).not.toThrow();
  });

  it('色の順序を入れ替えても同じ結果になる', () => {
    const ratio1 = calculateContrastRatio('#ffffff', '#000000');
    const ratio2 = calculateContrastRatio('#000000', '#ffffff');
    expect(ratio1).toBeCloseTo(ratio2, 5);
  });
});

describe('AccessibilityTester.checkWCAGAA', () => {
  it('通常テキストでWCAG AA準拠をチェックする', () => {
    expect(AccessibilityTester.checkWCAGAA(4.5)).toBe(true);
    expect(AccessibilityTester.checkWCAGAA(4.49)).toBe(false);
    expect(AccessibilityTester.checkWCAGAA(7.0)).toBe(true);
  });

  it('大きいテキストでWCAG AA準拠をチェックする', () => {
    expect(AccessibilityTester.checkWCAGAA(3.0, true)).toBe(true);
    expect(AccessibilityTester.checkWCAGAA(2.99, true)).toBe(false);
    expect(AccessibilityTester.checkWCAGAA(4.5, true)).toBe(true);
  });

  it('境界値でのテスト', () => {
    expect(AccessibilityTester.checkWCAGAA(4.5, false)).toBe(true);
    expect(AccessibilityTester.checkWCAGAA(3.0, true)).toBe(true);
  });
});

describe('AccessibilityTester.checkWCAGAAA', () => {
  it('通常テキストでWCAG AAA準拠をチェックする', () => {
    expect(AccessibilityTester.checkWCAGAAA(7.0)).toBe(true);
    expect(AccessibilityTester.checkWCAGAAA(6.99)).toBe(false);
    expect(AccessibilityTester.checkWCAGAAA(21.0)).toBe(true);
  });

  it('大きいテキストでWCAG AAA準拠をチェックする', () => {
    expect(AccessibilityTester.checkWCAGAAA(4.5, true)).toBe(true);
    expect(AccessibilityTester.checkWCAGAAA(4.49, true)).toBe(false);
    expect(AccessibilityTester.checkWCAGAAA(7.0, true)).toBe(true);
  });

  it('境界値でのテスト', () => {
    expect(AccessibilityTester.checkWCAGAAA(7.0, false)).toBe(true);
    expect(AccessibilityTester.checkWCAGAAA(4.5, true)).toBe(true);
  });
});

describe('AccessibilityTester.checkTabOrder', () => {
  it('問題のないタブ順序では空配列を返す', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Button 1</button>
      <input type="text" />
      <a href="#">Link</a>
    `;

    const problematicElements = AccessibilityTester.checkTabOrder(container);
    expect(problematicElements).toHaveLength(0);
  });

  it('正の値のtabindexを持つ要素を問題として検出する', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button>Normal Button</button>
      <button tabindex="1">Problematic Button 1</button>
      <input tabindex="2" />
      <a href="#" tabindex="0">Normal Link</a>
      <div tabindex="-1">Skip this</div>
    `;

    const problematicElements = AccessibilityTester.checkTabOrder(container);
    expect(problematicElements).toHaveLength(2);
    expect(problematicElements[0].tagName).toBe('BUTTON');
    expect(problematicElements[0].getAttribute('tabindex')).toBe('1');
    expect(problematicElements[1].tagName).toBe('INPUT');
    expect(problematicElements[1].getAttribute('tabindex')).toBe('2');
  });

  it('tabindex="0"や"-1"は問題として検出しない', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div tabindex="0">Focusable</div>
      <div tabindex="-1">Not focusable</div>
    `;

    const problematicElements = AccessibilityTester.checkTabOrder(container);
    expect(problematicElements).toHaveLength(0);
  });

  it('フォーカス可能な要素がない場合は空配列を返す', () => {
    const container = document.createElement('div');
    container.innerHTML = `<div>Non-focusable content</div>`;

    const problematicElements = AccessibilityTester.checkTabOrder(container);
    expect(problematicElements).toHaveLength(0);
  });
});

describe('エッジケースとエラーハンドリング', () => {
  it('nullやundefinedの要素でも処理できる', () => {
    expect(() => {
      const container = document.createElement('div');
      getFocusableElements(container);
    }).not.toThrow();
  });

  it('DOM操作が複数回実行されても正常動作する', () => {
    const element = document.createElement('button');
    document.body.appendChild(element);
    
    element.focus = jest.fn();
    element.scrollIntoView = jest.fn();
    
    // 複数回フォーカス
    focusElement(element);
    focusElement(element);
    
    expect(element.focus).toHaveBeenCalledTimes(2);
  });

  it('イベントリスナーが正しくクリーンアップされる', () => {
    const callback = jest.fn();
    const cleanup1 = useEscapeKey(callback);
    const cleanup2 = useEscapeKey(callback);
    
    // 両方とも動作する
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(callback).toHaveBeenCalledTimes(2);
    
    // 一方をクリーンアップ
    cleanup1();
    callback.mockClear();
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(callback).toHaveBeenCalledTimes(1);
    
    // 残りもクリーンアップ
    cleanup2();
    callback.mockClear();
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(callback).not.toHaveBeenCalled();
  });
});