/**
 * モーダル状態管理用カスタムフック
 * 複数のモーダル間での状態管理を簡潔にする
 */
import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

/**
 * 複数のモーダル状態を管理するフック
 */
export const useModalManager = <T extends string>(modalIds: T[]) => {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());

  const openModal = useCallback((modalId: T) => {
    setOpenModals(prev => new Set(prev).add(modalId));
  }, []);

  const closeModal = useCallback((modalId: T) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modalId);
      return next;
    });
  }, []);

  const toggleModal = useCallback((modalId: T) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      if (next.has(modalId)) {
        next.delete(modalId);
      } else {
        next.add(modalId);
      }
      return next;
    });
  }, []);

  const isModalOpen = useCallback((modalId: T) => {
    return openModals.has(modalId);
  }, [openModals]);

  const closeAllModals = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  return {
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    closeAllModals
  };
};

export default useModal;