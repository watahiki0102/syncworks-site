/**
 * SimpleModal コンポーネントのテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleModal, ConfirmModal, AlertModal, FormModal } from '../SimpleModal';

// Modalコンポーネントのモック
jest.mock('../Modal', () => ({
  Modal: ({ children, isOpen, onClose, title, size, ...props }: any) => {
    if (!isOpen) return null;
    
    return (
      <div data-testid="modal-wrapper" data-size={size} {...props}>
        <div data-testid="modal-header">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <button onClick={onClose} data-testid="close-button">Close</button>
      </div>
    );
  },
}));

describe('SimpleModal', () => {
  describe('基本機能', () => {
    it('基本的なモーダルがレンダリングされる', () => {
      render(
        <SimpleModal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal Content</p>
        </SimpleModal>
      );
      
      expect(screen.getByTestId('modal-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Test Modal');
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('isOpen=falseでモーダルが表示されない', () => {
      render(
        <SimpleModal isOpen={false} onClose={() => {}} title="Hidden Modal">
          <p>Should not be visible</p>
        </SimpleModal>
      );
      
      expect(screen.queryByTestId('modal-wrapper')).not.toBeInTheDocument();
    });

    it('onCloseが呼び出される', () => {
      const handleClose = jest.fn();
      render(
        <SimpleModal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Content</p>
        </SimpleModal>
      );
      
      fireEvent.click(screen.getByTestId('close-button'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('children prop', () => {
    it('複数の子要素が表示される', () => {
      render(
        <SimpleModal isOpen={true} onClose={() => {}} title="Multi Content">
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </SimpleModal>
      );
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Button')).toBeInTheDocument();
    });

    it('React要素がchildren として渡される', () => {
      const CustomComponent = () => <div>Custom Component Content</div>;
      
      render(
        <SimpleModal isOpen={true} onClose={() => {}} title="Custom Content">
          <CustomComponent />
        </SimpleModal>
      );
      
      expect(screen.getByText('Custom Component Content')).toBeInTheDocument();
    });

    it('nullのchildrenでも動作する', () => {
      render(
        <SimpleModal isOpen={true} onClose={() => {}} title="Null Children">
          {null}
        </SimpleModal>
      );
      
      expect(screen.getByTestId('modal-wrapper')).toBeInTheDocument();
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Null Children');
    });
  });

  describe('footer prop', () => {
    it('showFooter=trueかつfooterありで フッターが表示される（デフォルト）', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="With Footer"
          footer={<button>Footer Button</button>}
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('showFooter=falseでフッターが表示されない', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="No Footer"
          showFooter={false}
          footer={<button>Should not show</button>}
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
    });

    it('footerがnullでフッターが表示されない', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Null Footer"
          footer={null}
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      // フッターの背景要素もチェック
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent.querySelector('.bg-gray-50')).not.toBeInTheDocument();
    });

    it('footerがundefinedでフッターが表示されない', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Undefined Footer"
          footer={undefined}
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      const modalContent = screen.getByTestId('modal-content');
      expect(modalContent.querySelector('.bg-gray-50')).not.toBeInTheDocument();
    });

    it('複数のボタンを含むfooter', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Multi Button Footer"
          footer={
            <>
              <button>Cancel</button>
              <button>Save</button>
              <button>Delete</button>
            </>
          }
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('showFooter prop', () => {
    it('showFooter=trueが明示的に設定される', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Explicit Show Footer"
          showFooter={true}
          footer={<button>Shown Footer</button>}
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.getByText('Shown Footer')).toBeInTheDocument();
    });

    it('showFooter=falseが明示的に設定される', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Explicit Hide Footer"
          showFooter={false}
          footer={<button>Hidden Footer</button>}
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.queryByText('Hidden Footer')).not.toBeInTheDocument();
    });
  });

  describe('Modal propsの伝播', () => {
    it('size propが基礎Modalに渡される', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Sized Modal"
          size="lg"
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.getByTestId('modal-wrapper')).toHaveAttribute('data-size', 'lg');
    });

    it('その他のModal propsが渡される', () => {
      render(
        <SimpleModal 
          isOpen={true} 
          onClose={() => {}} 
          title="Custom Props"
          data-custom="test-value"
        >
          <p>Content</p>
        </SimpleModal>
      );
      
      expect(screen.getByTestId('modal-wrapper')).toHaveAttribute('data-custom', 'test-value');
    });
  });
});

describe('ConfirmModal', () => {
  describe('基本機能', () => {
    it('確認ダイアログがレンダリングされる', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm Action"
          message="Are you sure?"
        />
      );
      
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Confirm Action');
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      expect(screen.getByText('確認')).toBeInTheDocument(); // デフォルトの確認テキスト
      expect(screen.getByText('キャンセル')).toBeInTheDocument(); // デフォルトのキャンセルテキスト
    });

    it('onConfirmが呼び出される', () => {
      const handleConfirm = jest.fn();
      const handleClose = jest.fn();
      
      render(
        <ConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Test Confirm"
          message="Test message"
        />
      );
      
      fireEvent.click(screen.getByText('確認'));
      
      expect(handleConfirm).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1); // onConfirm後にonCloseも呼ばれる
    });

    it('キャンセルボタンでonCloseが呼び出される', () => {
      const handleClose = jest.fn();
      
      render(
        <ConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={() => {}}
          title="Test Cancel"
          message="Test message"
        />
      );
      
      fireEvent.click(screen.getByText('キャンセル'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('カスタムテキスト', () => {
    it('カスタム確認テキストが表示される', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Custom Confirm"
          message="Custom message"
          confirmText="OK"
        />
      );
      
      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.queryByText('確認')).not.toBeInTheDocument();
    });

    it('カスタムキャンセルテキストが表示される', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Custom Cancel"
          message="Custom message"
          cancelText="No"
        />
      );
      
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.queryByText('キャンセル')).not.toBeInTheDocument();
    });

    it('両方のカスタムテキストが表示される', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Both Custom"
          message="Custom message"
          confirmText="Yes"
          cancelText="No"
        />
      );
      
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
    });
  });

  describe('variant prop', () => {
    it('default variantが適用される（デフォルト）', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Default Variant"
          message="Test message"
        />
      );
      
      const confirmButton = screen.getByText('確認');
      expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    });

    it('default variantが明示的に設定される', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Explicit Default"
          message="Test message"
          variant="default"
        />
      );
      
      const confirmButton = screen.getByText('確認');
      expect(confirmButton).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    });

    it('danger variantが適用される', () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Danger Variant"
          message="This is dangerous"
          variant="danger"
        />
      );
      
      const confirmButton = screen.getByText('確認');
      expect(confirmButton).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white');
    });
  });
});

describe('AlertModal', () => {
  describe('基本機能', () => {
    it('アラートモーダルがレンダリングされる', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Alert Title"
          message="Alert message"
        />
      );
      
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Alert Title');
      expect(screen.getByText('Alert message')).toBeInTheDocument();
      expect(screen.getByText('閉じる')).toBeInTheDocument(); // デフォルトボタンテキスト
    });

    it('onCloseが呼び出される', () => {
      const handleClose = jest.fn();
      
      render(
        <AlertModal
          isOpen={true}
          onClose={handleClose}
          title="Test Alert"
          message="Test message"
        />
      );
      
      fireEvent.click(screen.getByText('閉じる'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('カスタムボタンテキストが表示される', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Custom Button"
          message="Test message"
          buttonText="OK"
        />
      );
      
      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.queryByText('閉じる')).not.toBeInTheDocument();
    });
  });

  describe('variant prop', () => {
    it('info variant（デフォルト）が適用される', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Info Alert"
          message="Info message"
        />
      );
      
      expect(screen.getByText('ℹ️')).toBeInTheDocument();
      const container = screen.getByText('Info message').closest('div');
      expect(container).toHaveClass('bg-blue-50');
    });

    it('success variantが適用される', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Success Alert"
          message="Success message"
          variant="success"
        />
      );
      
      expect(screen.getByText('✅')).toBeInTheDocument();
      const container = screen.getByText('Success message').closest('div');
      expect(container).toHaveClass('bg-green-50');
    });

    it('warning variantが適用される', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Warning Alert"
          message="Warning message"
          variant="warning"
        />
      );
      
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      const container = screen.getByText('Warning message').closest('div');
      expect(container).toHaveClass('bg-yellow-50');
    });

    it('error variantが適用される', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Error Alert"
          message="Error message"
          variant="error"
        />
      );
      
      expect(screen.getByText('❌')).toBeInTheDocument();
      const container = screen.getByText('Error message').closest('div');
      expect(container).toHaveClass('bg-red-50');
    });

    it('info variantが明示的に設定される', () => {
      render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Explicit Info"
          message="Info message"
          variant="info"
        />
      );
      
      expect(screen.getByText('ℹ️')).toBeInTheDocument();
      const container = screen.getByText('Info message').closest('div');
      expect(container).toHaveClass('bg-blue-50');
    });
  });
});

describe('FormModal', () => {
  describe('基本機能', () => {
    it('フォームモーダルがレンダリングされる', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Form Modal"
        >
          <input type="text" placeholder="Form input" />
        </FormModal>
      );
      
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Form Modal');
      expect(screen.getByPlaceholderText('Form input')).toBeInTheDocument();
      expect(screen.getByText('保存')).toBeInTheDocument(); // デフォルト送信テキスト
      expect(screen.getByText('キャンセル')).toBeInTheDocument(); // デフォルトキャンセルテキスト
    });

    it('onSubmitが呼び出される', () => {
      const handleSubmit = jest.fn();
      
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={handleSubmit}
          title="Test Form"
        >
          <input type="text" />
        </FormModal>
      );
      
      fireEvent.click(screen.getByText('保存'));
      
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('onCloseが呼び出される', () => {
      const handleClose = jest.fn();
      
      render(
        <FormModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={() => {}}
          title="Test Close"
        >
          <input type="text" />
        </FormModal>
      );
      
      fireEvent.click(screen.getByText('キャンセル'));
      
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('カスタムテキスト', () => {
    it('カスタム送信テキストが表示される', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Custom Submit"
          submitText="Create"
        >
          <input type="text" />
        </FormModal>
      );
      
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.queryByText('保存')).not.toBeInTheDocument();
    });

    it('カスタムキャンセルテキストが表示される', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Custom Cancel"
          cancelText="Abort"
        >
          <input type="text" />
        </FormModal>
      );
      
      expect(screen.getByText('Abort')).toBeInTheDocument();
      expect(screen.queryByText('キャンセル')).not.toBeInTheDocument();
    });
  });

  describe('isSubmitting prop', () => {
    it('isSubmitting=falseで通常状態（デフォルト）', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Normal State"
        >
          <input type="text" />
        </FormModal>
      );
      
      const submitButton = screen.getByText('保存');
      const cancelButton = screen.getByText('キャンセル');
      
      expect(submitButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('保存');
    });

    it('isSubmitting=trueで送信中状態', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Submitting State"
          isSubmitting={true}
        >
          <input type="text" />
        </FormModal>
      );
      
      const submitButton = screen.getByText('処理中...');
      const cancelButton = screen.getByText('キャンセル');
      
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('isValid prop', () => {
    it('isValid=trueで送信可能（デフォルト）', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Valid Form"
        >
          <input type="text" />
        </FormModal>
      );
      
      const submitButton = screen.getByText('保存');
      expect(submitButton).not.toBeDisabled();
    });

    it('isValid=falseで送信無効', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Invalid Form"
          isValid={false}
        >
          <input type="text" />
        </FormModal>
      );
      
      const submitButton = screen.getByText('保存');
      expect(submitButton).toBeDisabled();
    });

    it('isSubmitting=trueかつisValid=falseで送信無効', () => {
      render(
        <FormModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={() => {}}
          title="Both Disabled"
          isSubmitting={true}
          isValid={false}
        >
          <input type="text" />
        </FormModal>
      );
      
      const submitButton = screen.getByText('処理中...');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('複合テスト', () => {
    it('すべてのカスタムプロパティが適用される', () => {
      const handleSubmit = jest.fn();
      const handleClose = jest.fn();
      
      render(
        <FormModal
          isOpen={true}
          onClose={handleClose}
          onSubmit={handleSubmit}
          title="Full Custom Form"
          submitText="Update"
          cancelText="Discard"
          isSubmitting={false}
          isValid={true}
        >
          <input type="text" placeholder="Custom input" />
        </FormModal>
      );
      
      expect(screen.getByTestId('modal-header')).toHaveTextContent('Full Custom Form');
      expect(screen.getByPlaceholderText('Custom input')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('Discard')).toBeInTheDocument();
      
      const submitButton = screen.getByText('Update');
      const cancelButton = screen.getByText('Discard');
      
      expect(submitButton).not.toBeDisabled();
      expect(cancelButton).not.toBeDisabled();
      
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      
      fireEvent.click(cancelButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});