/**
 * useLocalStorage.ts のテスト
 * カバレッジ目標: 90%+
 */

import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useSessionStorage } from '../useLocalStorage';

// localStorageのモック
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

// console.errorとconsole.warnのモック
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

describe('useLocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('基本機能', () => {
    it('初期値が正しく設定される', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('既存の値がある場合はそれを使用する', () => {
      mockLocalStorage.getItem.mockReturnValue('"existing-value"');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('existing-value');
    });

    it('値を正しく更新できる', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '"new-value"');
    });

    it('関数を使った値の更新ができる', () => {
      mockLocalStorage.getItem.mockReturnValue('"initial"');
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1](prev => prev + '-updated');
      });

      expect(result.current[0]).toBe('initial-updated');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', '"initial-updated"');
    });
  });

  describe('データ型の処理', () => {
    it('文字列データを正しく処理する', () => {
      mockLocalStorage.getItem.mockReturnValue('"test-string"');
      
      const { result } = renderHook(() => useLocalStorage('test-key', ''));

      expect(result.current[0]).toBe('test-string');
    });

    it('数値データを正しく処理する', () => {
      mockLocalStorage.getItem.mockReturnValue('42');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      expect(result.current[0]).toBe(42);
    });

    it('ブール値データを正しく処理する', () => {
      mockLocalStorage.getItem.mockReturnValue('true');
      
      const { result } = renderHook(() => useLocalStorage('test-key', false));

      expect(result.current[0]).toBe(true);
    });

    it('オブジェクトデータを正しく処理する', () => {
      const testObject = { name: 'test', value: 123 };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testObject));
      
      const { result } = renderHook(() => useLocalStorage('test-key', {}));

      expect(result.current[0]).toEqual(testObject);
    });

    it('配列データを正しく処理する', () => {
      const testArray = [1, 2, 3, 'four'];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testArray));
      
      const { result } = renderHook(() => useLocalStorage('test-key', []));

      expect(result.current[0]).toEqual(testArray);
    });
  });

  describe('エラー処理', () => {
    it('不正なJSONの場合は初期値を使用し警告を出す', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error reading localStorage key "test-key":',
        expect.any(Error)
      );
    });

    it('localStorageアクセスエラーを適切に処理する', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage access denied');
      });
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error reading localStorage key "test-key":',
        expect.any(Error)
      );
    });

    it('値の設定時のエラーを適切に処理する', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage setItem failed');
      });
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error setting localStorage key "test-key":',
        expect.any(Error)
      );
    });
  });

  describe('関数の参照安定性', () => {
    it('setValue関数の参照が安定している', () => {
      const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'));
      const setValue1 = result.current[1];

      rerender();
      const setValue2 = result.current[1];

      expect(setValue1).toBe(setValue2);
    });

    it('removeValue関数の参照が安定している', () => {
      const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'));
      const removeValue1 = result.current[2];

      rerender();
      const removeValue2 = result.current[2];

      expect(removeValue1).toBe(removeValue2);
    });
  });
});

describe('useSessionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('基本機能', () => {
    it('初期値が正しく設定される', () => {
      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('既存の値がある場合はそれを使用する', () => {
      mockSessionStorage.getItem.mockReturnValue('"existing-value"');
      
      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('existing-value');
    });

    it('値を正しく更新できる', () => {
      const { result } = renderHook(() => useSessionStorage('test-key', 'initial'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test-key', '"new-value"');
    });
  });

  describe('エラー処理', () => {
    it('不正なJSONの場合は初期値を使用し警告を出す', () => {
      mockSessionStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useSessionStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error reading sessionStorage key "test-key":',
        expect.any(Error)
      );
    });

    it('sessionStorageアクセスエラーを適切に処理する', () => {
      mockSessionStorage.getItem.mockImplementation(() => {
        throw new Error('sessionStorage access denied');
      });
      
      const { result } = renderHook(() => useSessionStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Error reading sessionStorage key "test-key":',
        expect.any(Error)
      );
    });
  });
});

describe('edge cases', () => {
  it('null値の処理', () => {
    mockLocalStorage.getItem.mockReturnValue('null');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    expect(result.current[0]).toBe(null);
  });

  it('undefined値の処理', () => {
    mockLocalStorage.getItem.mockReturnValue('undefined');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    // undefinedはJSONでは表現できないため、初期値が使用される
    expect(result.current[0]).toBe('fallback');
  });

  it('空文字列の処理', () => {
    mockLocalStorage.getItem.mockReturnValue('""');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

    expect(result.current[0]).toBe('');
  });

  it('removeValue機能の確認', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('initial'); // 初期値に戻る
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
  });
});