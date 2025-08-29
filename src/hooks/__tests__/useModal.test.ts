/**
 * useModal.ts のテスト
 * カバレッジ目標: 100%
 */

import { renderHook, act } from '@testing-library/react';
import { useModal, useModalManager } from '../useModal';

describe('useModal', () => {
  it('初期状態でモーダルが閉じている', () => {
    const { result } = renderHook(() => useModal());

    expect(result.current.isOpen).toBe(false);
  });

  it('openModal でモーダルが開く', () => {
    const { result } = renderHook(() => useModal());

    act(() => {
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closeModal でモーダルが閉じる', () => {
    const { result } = renderHook(() => useModal());

    // 先に開く
    act(() => {
      result.current.openModal();
    });
    expect(result.current.isOpen).toBe(true);

    // 閉じる
    act(() => {
      result.current.closeModal();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('toggleModal でモーダルの状態が切り替わる', () => {
    const { result } = renderHook(() => useModal());

    // 初期は閉じている
    expect(result.current.isOpen).toBe(false);

    // 開く
    act(() => {
      result.current.toggleModal();
    });
    expect(result.current.isOpen).toBe(true);

    // 閉じる
    act(() => {
      result.current.toggleModal();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('openModal関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useModal());
    const openModal1 = result.current.openModal;

    rerender();
    const openModal2 = result.current.openModal;

    expect(openModal1).toBe(openModal2);
  });

  it('closeModal関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useModal());
    const closeModal1 = result.current.closeModal;

    rerender();
    const closeModal2 = result.current.closeModal;

    expect(closeModal1).toBe(closeModal2);
  });

  it('toggleModal関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useModal());
    const toggleModal1 = result.current.toggleModal;

    rerender();
    const toggleModal2 = result.current.toggleModal;

    expect(toggleModal1).toBe(toggleModal2);
  });
});

describe('useModalManager', () => {
  const modalIds = ['modal1', 'modal2', 'modal3'] as const;

  it('初期状態ですべてのモーダルが閉じている', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    modalIds.forEach(id => {
      expect(result.current.isModalOpen(id)).toBe(false);
    });
  });

  it('openModal で指定のモーダルが開く', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    act(() => {
      result.current.openModal('modal1');
    });

    expect(result.current.isModalOpen('modal1')).toBe(true);
    expect(result.current.isModalOpen('modal2')).toBe(false);
    expect(result.current.isModalOpen('modal3')).toBe(false);
  });

  it('closeModal で指定のモーダルが閉じる', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    // 先に開く
    act(() => {
      result.current.openModal('modal1');
      result.current.openModal('modal2');
    });
    expect(result.current.isModalOpen('modal1')).toBe(true);
    expect(result.current.isModalOpen('modal2')).toBe(true);

    // modal1を閉じる
    act(() => {
      result.current.closeModal('modal1');
    });
    expect(result.current.isModalOpen('modal1')).toBe(false);
    expect(result.current.isModalOpen('modal2')).toBe(true);
  });

  it('toggleModal で指定のモーダルの状態が切り替わる', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    // 初期は閉じている
    expect(result.current.isModalOpen('modal1')).toBe(false);

    // 開く
    act(() => {
      result.current.toggleModal('modal1');
    });
    expect(result.current.isModalOpen('modal1')).toBe(true);

    // 閉じる
    act(() => {
      result.current.toggleModal('modal1');
    });
    expect(result.current.isModalOpen('modal1')).toBe(false);
  });

  it('複数のモーダルを同時に開ける', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    act(() => {
      result.current.openModal('modal1');
      result.current.openModal('modal2');
      result.current.openModal('modal3');
    });

    modalIds.forEach(id => {
      expect(result.current.isModalOpen(id)).toBe(true);
    });
  });

  it('closeAllModals ですべてのモーダルが閉じる', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    // 先にすべて開く
    act(() => {
      result.current.openModal('modal1');
      result.current.openModal('modal2');
      result.current.openModal('modal3');
    });
    modalIds.forEach(id => {
      expect(result.current.isModalOpen(id)).toBe(true);
    });

    // すべて閉じる
    act(() => {
      result.current.closeAllModals();
    });
    modalIds.forEach(id => {
      expect(result.current.isModalOpen(id)).toBe(false);
    });
  });

  it('同じモーダルを複数回開いても状態は変わらない', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    act(() => {
      result.current.openModal('modal1');
      result.current.openModal('modal1'); // 重複
      result.current.openModal('modal1'); // 重複
    });

    expect(result.current.isModalOpen('modal1')).toBe(true);
  });

  it('閉じているモーダルを複数回閉じても状態は変わらない', () => {
    const { result } = renderHook(() => useModalManager(modalIds));

    act(() => {
      result.current.closeModal('modal1'); // まだ開いていない
      result.current.closeModal('modal1'); // まだ開いていない
    });

    expect(result.current.isModalOpen('modal1')).toBe(false);
  });

  it('存在しないモーダルIDでも動作する', () => {
    const { result } = renderHook(() => useModalManager(['modal1']));

    act(() => {
      // 型安全性のため、実際のプロダクションではこれは発生しないが
      // ライブラリとしての堅牢性をテスト
      (result.current.openModal as any)('nonexistent');
      (result.current.closeModal as any)('nonexistent');
      (result.current.toggleModal as any)('nonexistent');
    });

    // エラーが発生しないことを確認
    expect(result.current.isModalOpen('modal1')).toBe(false);
  });

  it('関数の参照が安定している', () => {
    const { result, rerender } = renderHook(() => useModalManager(modalIds));
    
    const openModal1 = result.current.openModal;
    const closeModal1 = result.current.closeModal;
    const toggleModal1 = result.current.toggleModal;
    const closeAllModals1 = result.current.closeAllModals;

    rerender();

    expect(result.current.openModal).toBe(openModal1);
    expect(result.current.closeModal).toBe(closeModal1);
    expect(result.current.toggleModal).toBe(toggleModal1);
    expect(result.current.closeAllModals).toBe(closeAllModals1);
  });

  it('isModalOpen が openModals 状態の変更に反応する', () => {
    const { result } = renderHook(() => useModalManager(modalIds));
    
    const isModalOpen1 = result.current.isModalOpen;

    act(() => {
      result.current.openModal('modal1');
    });

    // isModalOpenの参照は変わるはず（openModalsに依存しているため）
    const isModalOpen2 = result.current.isModalOpen;
    expect(isModalOpen1).not.toBe(isModalOpen2);
  });

  describe('エッジケース', () => {
    it('空の配列でも動作する', () => {
      const { result } = renderHook(() => useModalManager([]));

      expect(() => {
        act(() => {
          result.current.closeAllModals();
        });
      }).not.toThrow();
    });

    it('単一のモーダルIDでも動作する', () => {
      const { result } = renderHook(() => useModalManager(['single']));

      act(() => {
        result.current.openModal('single');
      });

      expect(result.current.isModalOpen('single')).toBe(true);

      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.isModalOpen('single')).toBe(false);
    });
  });
});