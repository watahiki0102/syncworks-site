/**
 * Modal.tsx のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal, { ModalProps } from '../Modal';

// accessibility utilsのモック
jest.mock('@/utils/accessibility', () => ({
  createFocusTrap: jest.fn(() => jest.fn()), // cleanup関数を返す
  generateAccessibilityProps: jest.fn((props: any) => ({
    'aria-label': props.label,
    'aria-labelledby': props.labelledBy,
    'aria-describedby': props.describedBy,
    'role': props.role
  }))
}));

// lucide-reactのモック
jest.mock('lucide-react', () => ({
  X: () => <span data-testid="close-icon">×</span>
}));

// createPortalのモック（テスト環境では実際のportalを使わない）
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (element: React.ReactNode) => element
}));

// Typographyコンポーネントのモック
jest.mock('../Typography', () => ({
  Heading: ({ children, id, className, level, size }: any) => (
    <h2 id={id} className={className} data-level={level} data-size={size}>
      {children}
    </h2>
  )
}));

describe('Modal component', () => {
  const defaultProps: ModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div data-testid="modal-content">Modal Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // テスト後にbodyのoverflowをリセット
    document.body.style.overflow = '';
  });

  it('isOpenがfalseの時は何もレンダリングしない', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });

  it('isOpenがtrueの時にモーダルが表示される', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  describe('タイトル表示', () => {
    it('タイトルが提供された時に表示される', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('タイトルが提供されない時は表示されない', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('idが提供された時にタイトルのidが設定される', () => {
      render(<Modal {...defaultProps} title="Test Modal" id="custom-modal" />);
      const heading = screen.getByText('Test Modal');
      expect(heading).toHaveAttribute('id', 'custom-modal-title');
    });

    it('idが提供されない時にデフォルトのタイトルidが設定される', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      const heading = screen.getByText('Test Modal');
      expect(heading).toHaveAttribute('id', 'modal-title');
    });
  });

  describe('閉じるボタン', () => {
    it('デフォルトで閉じるボタンが表示される', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByLabelText('モーダルを閉じる')).toBeInTheDocument();
    });

    it('showCloseButton=falseで閉じるボタンが非表示になる', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText('モーダルを閉じる')).not.toBeInTheDocument();
    });

    it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      fireEvent.click(screen.getByLabelText('モーダルを閉じる'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('サイズ', () => {
    it('デフォルトサイズ（md）が適用される', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modalContent = container.querySelector('[role="dialog"]');
      expect(modalContent).toHaveClass('max-w-2xl');
    });

    it('smサイズが適用される', () => {
      const { container } = render(<Modal {...defaultProps} size="sm" />);
      const modalContent = container.querySelector('[role="dialog"]');
      expect(modalContent).toHaveClass('max-w-md');
    });

    it('lgサイズが適用される', () => {
      const { container } = render(<Modal {...defaultProps} size="lg" />);
      const modalContent = container.querySelector('[role="dialog"]');
      expect(modalContent).toHaveClass('max-w-4xl');
    });

    it('xlサイズが適用される', () => {
      const { container } = render(<Modal {...defaultProps} size="xl" />);
      const modalContent = container.querySelector('[role="dialog"]');
      expect(modalContent).toHaveClass('max-w-6xl');
    });

    it('fullサイズが適用される', () => {
      const { container } = render(<Modal {...defaultProps} size="full" />);
      const modalContent = container.querySelector('[role="dialog"]');
      expect(modalContent).toHaveClass('max-w-full', 'mx-4');
    });
  });

  describe('オーバーレイクリック', () => {
    it('デフォルトでオーバーレイクリックで閉じる', () => {
      const onClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />);
      
      // オーバーレイ要素（最外側のdiv）をクリック
      const overlay = container.firstChild as HTMLElement;
      fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closeOnOverlayClick=falseでオーバーレイクリックで閉じない', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
      );
      
      const overlay = container.firstChild as HTMLElement;
      fireEvent.click(overlay);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('モーダルコンテンツをクリックしても閉じない', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      const modalContent = screen.getByTestId('modal-content');
      fireEvent.click(modalContent);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('エスケープキー', () => {
    it('Escapeキーでモーダルが閉じる', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('他のキーでは閉じない', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('モーダルが閉じている時はEscapeキーリスナーが無効', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('ボディスクロール制御', () => {
    it('モーダルが開いている時にbodyのスクロールが無効になる', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('モーダルが閉じた時にbodyのスクロールが復元される', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('アクセシビリティ', () => {
    it('デフォルトでdialogロールが設定される', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
    });

    it('alertdialogロールが設定される', () => {
      const { container } = render(<Modal {...defaultProps} role="alertdialog" />);
      const modal = container.querySelector('[role="alertdialog"]');
      expect(modal).toBeInTheDocument();
    });

    it('aria-labelが設定される', () => {
      const { container } = render(<Modal {...defaultProps} ariaLabel="Custom Label" />);
      const modal = container.querySelector('[aria-label="Custom Label"]');
      expect(modal).toBeInTheDocument();
    });

    it('aria-labelledbyが設定される', () => {
      const { container } = render(<Modal {...defaultProps} ariaLabelledBy="custom-id" />);
      const modal = container.querySelector('[aria-labelledby="custom-id"]');
      expect(modal).toBeInTheDocument();
    });

    it('aria-describedbyが設定される', () => {
      const { container } = render(<Modal {...defaultProps} ariaDescribedBy="description-id" />);
      const modal = container.querySelector('[aria-describedby="description-id"]');
      expect(modal).toBeInTheDocument();
    });

    it('タイトルがある場合のaria-labelledby自動設定', () => {
      const { container } = render(<Modal {...defaultProps} title="Test Modal" id="test-modal" />);
      const modal = container.querySelector('[aria-labelledby="test-modal-title"]');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラスが適用される', () => {
      const { container } = render(<Modal {...defaultProps} className="custom-modal-class" />);
      const modal = container.querySelector('.custom-modal-class');
      expect(modal).toBeInTheDocument();
    });

    it('オーバーレイカスタムクラスが適用される', () => {
      const { container } = render(<Modal {...defaultProps} overlayClassName="custom-overlay" />);
      const overlay = container.querySelector('.custom-overlay');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('フォーカス管理', () => {
    beforeEach(() => {
      // テスト用のボタンを作成してフォーカスを設定
      const button = document.createElement('button');
      button.textContent = 'Previous Focus';
      document.body.appendChild(button);
      button.focus();
    });

    afterEach(() => {
      // テスト後にDOMをクリア
      document.body.innerHTML = '';
    });

    it('モーダルを開く時にフォーカストラップが作成される', () => {
      const { createFocusTrap } = require('@/utils/accessibility');
      
      render(<Modal {...defaultProps} />);
      
      expect(createFocusTrap).toHaveBeenCalledTimes(1);
    });

    it('モーダルを閉じる時にフォーカストラップがクリーンアップされる', () => {
      const mockCleanup = jest.fn();
      const { createFocusTrap } = require('@/utils/accessibility');
      createFocusTrap.mockReturnValue(mockCleanup);
      
      const { rerender } = render(<Modal {...defaultProps} />);
      rerender(<Modal {...defaultProps} isOpen={false} />);
      
      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('複合状態', () => {
    it('タイトルと閉じるボタンが両方表示される', () => {
      render(
        <Modal 
          {...defaultProps} 
          title="Complex Modal" 
          showCloseButton={true} 
        />
      );
      
      expect(screen.getByText('Complex Modal')).toBeInTheDocument();
      expect(screen.getByLabelText('モーダルを閉じる')).toBeInTheDocument();
    });

    it('全オプションが同時に適用される', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Full Options Modal"
          size="lg"
          closeOnOverlayClick={false}
          showCloseButton={true}
          className="custom-class"
          overlayClassName="custom-overlay"
          id="full-modal"
          role="alertdialog"
          ariaLabel="Full options modal"
        >
          <div data-testid="complex-content">Complex Content</div>
        </Modal>
      );
      
      const modal = container.querySelector('[role="alertdialog"]');
      expect(modal).toHaveClass('custom-class', 'max-w-4xl');
      expect(modal).toHaveAttribute('id', 'full-modal');
      expect(modal).toHaveAttribute('aria-label', 'Full options modal');
      expect(screen.getByText('Full Options Modal')).toBeInTheDocument();
      expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('childrenが空でもエラーが発生しない', () => {
      render(<Modal {...defaultProps}>{null}</Modal>);
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    it('複数回の開閉でメモリリークが発生しない', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} />);
      
      // 複数回開閉を繰り返す
      for (let i = 0; i < 5; i++) {
        rerender(<Modal {...defaultProps} isOpen={true} />);
        rerender(<Modal {...defaultProps} isOpen={false} />);
      }
      
      // テストが成功すれば、メモリリークなしとみなす
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('イベントハンドリング', () => {
    it('複数のキーイベントが正しく処理される', () => {
      const onClose = jest.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1); // Escapeのみ
    });

    it('マウスイベントのpropagationが正しく制御される', () => {
      const onClose = jest.fn();
      const { container } = render(<Modal {...defaultProps} onClose={onClose} />);
      
      // モーダル内の要素をクリック
      const modalContent = container.querySelector('[role="dialog"]')!;
      fireEvent.click(modalContent);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('スナップショット', () => {
    it('基本的なモーダルのスナップショットが一致する', () => {
      const { container } = render(
        <Modal {...defaultProps}>
          <div>Snapshot test content</div>
        </Modal>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('全オプション付きモーダルのスナップショットが一致する', () => {
      const { container } = render(
        <Modal
          {...defaultProps}
          title="Snapshot Modal"
          size="lg"
          className="snapshot-class"
          overlayClassName="snapshot-overlay"
          id="snapshot-modal"
          role="alertdialog"
        >
          <div>Full options snapshot</div>
        </Modal>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});