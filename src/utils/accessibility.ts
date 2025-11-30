/**
 * アクセシビリティ対応のためのユーティリティ関数
 * - キーボードナビゲーション
 * - スクリーンリーダー対応
 * - フォーカス管理
 */

/**
 * フォーカス可能な要素のセレクタ
 */
const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([disabled])',
  '[role="link"]:not([disabled])',
  '[role="menuitem"]:not([disabled])',
  '[role="tab"]:not([disabled])',
  'audio[controls]',
  'video[controls]'
].join(', ');

/**
 * 要素内のフォーカス可能な要素を取得
 * @param container - コンテナ要素
 * @returns フォーカス可能な要素の配列
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)) as HTMLElement[];
}

/**
 * フォーカストラップを作成
 * @param container - トラップするコンテナ要素
 * @returns クリーンアップ関数
 */
export function createFocusTrap(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {return;}

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  
  // 初期フォーカス
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * 要素にフォーカスを設定（スムーズスクロール付き）
 * @param element - フォーカスする要素
 * @param options - オプション
 */
export function focusElement(
  element: HTMLElement, 
  options: { 
    preventScroll?: boolean; 
    scrollIntoView?: boolean; 
  } = {}
): void {
  const { preventScroll = false, scrollIntoView = true } = options;

  element.focus({ preventScroll });

  if (scrollIntoView && !preventScroll) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }
}

/**
 * エスケープキーでの閉じる処理
 * @param callback - エスケープキーが押されたときのコールバック
 * @returns クリーンアップ関数
 */
export function useEscapeKey(callback: () => void): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * アクセシビリティ属性を生成
 * @param options - オプション
 * @returns アクセシビリティ属性のオブジェクト
 */
export function generateAccessibilityProps(options: {
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  expanded?: boolean;
  hidden?: boolean;
  role?: string;
  pressed?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'off' | 'polite' | 'assertive';
  atomic?: boolean;
}) {
  const props: Record<string, string | boolean> = {};

  if (options.label) {props['aria-label'] = options.label;}
  if (options.labelledBy) {props['aria-labelledby'] = options.labelledBy;}
  if (options.describedBy) {props['aria-describedby'] = options.describedBy;}
  if (options.expanded !== undefined) {props['aria-expanded'] = options.expanded;}
  if (options.hidden !== undefined) {props['aria-hidden'] = options.hidden;}
  if (options.pressed !== undefined) {props['aria-pressed'] = options.pressed;}
  if (options.selected !== undefined) {props['aria-selected'] = options.selected;}
  if (options.disabled !== undefined) {props['aria-disabled'] = options.disabled;}
  if (options.required !== undefined) {props['aria-required'] = options.required;}
  if (options.invalid !== undefined) {props['aria-invalid'] = options.invalid;}
  if (options.live) {props['aria-live'] = options.live;}
  if (options.atomic !== undefined) {props['aria-atomic'] = options.atomic;}
  if (options.role) {props.role = options.role;}

  return props;
}

/**
 * スクリーンリーダー専用テキストを追加
 * @param element - 要素
 * @param text - スクリーンリーダー専用テキスト
 */
export function addScreenReaderText(element: HTMLElement, text: string): void {
  const srElement = document.createElement('span');
  srElement.className = 'sr-only';
  srElement.textContent = text;
  element.appendChild(srElement);
}

/**
 * ライブリージョンでアナウンス
 * @param message - アナウンスするメッセージ
 * @param politeness - アナウンスの優先度
 */
export function announceToScreenReader(
  message: string, 
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', politeness);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // 少し遅延してから削除
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * キーボードナビゲーション用のヘルパー
 */
export const KeyboardNavigation = {
  /**
   * 矢印キーでの移動処理
   * @param event - キーボードイベント
   * @param items - ナビゲーション対象の要素
   * @param currentIndex - 現在のインデックス
   * @param orientation - 方向（horizontal/vertical）
   * @returns 新しいインデックス
   */
  handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'horizontal'
  ): number {
    const { key } = event;
    let newIndex = currentIndex;

    if (orientation === 'horizontal') {
      if (key === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else if (key === 'ArrowRight') {
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
    } else {
      if (key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else if (key === 'ArrowDown') {
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      items[newIndex]?.focus();
    }

    return newIndex;
  },

  /**
   * Home/Endキーでの移動処理
   * @param event - キーボードイベント
   * @param items - ナビゲーション対象の要素
   * @returns 新しいインデックス
   */
  handleHomeEndKeys(event: KeyboardEvent, items: HTMLElement[]): number {
    const { key } = event;
    let newIndex = -1;

    if (key === 'Home') {
      newIndex = 0;
    } else if (key === 'End') {
      newIndex = items.length - 1;
    }

    if (newIndex !== -1) {
      event.preventDefault();
      items[newIndex]?.focus();
    }

    return newIndex;
  }
};

/**
 * カラーコントラスト比を計算
 * @param color1 - 前景色（hex形式）
 * @param color2 - 背景色（hex形式）
 * @returns コントラスト比
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(component => {
      const normalized = component / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * アクセシビリティテストヘルパー
 */
export const AccessibilityTester = {
  /**
   * WCAG AA準拠をチェック
   * @param contrastRatio - コントラスト比
   * @param isLargeText - 大きいテキストかどうか
   * @returns WCAG AA準拠かどうか
   */
  checkWCAGAA(contrastRatio: number, isLargeText = false): boolean {
    return contrastRatio >= (isLargeText ? 3 : 4.5);
  },

  /**
   * WCAG AAA準拠をチェック
   * @param contrastRatio - コントラスト比
   * @param isLargeText - 大きいテキストかどうか
   * @returns WCAG AAA準拠かどうか
   */
  checkWCAGAAA(contrastRatio: number, isLargeText = false): boolean {
    return contrastRatio >= (isLargeText ? 4.5 : 7);
  },

  /**
   * フォーカス可能な要素にタブインデックスが適切に設定されているかチェック
   * @param container - チェックするコンテナ
   * @returns 問題のある要素の配列
   */
  checkTabOrder(container: HTMLElement): HTMLElement[] {
    const focusableElements = getFocusableElements(container);
    const problematicElements: HTMLElement[] = [];

    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        problematicElements.push(element);
      }
    });

    return problematicElements;
  }
}; 