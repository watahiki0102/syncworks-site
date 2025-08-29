/**
 * Input.tsx のテスト
 * カバレッジ目標: 100%
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('基本的な入力フィールドを表示する', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('form-input');
  });

  it('ラベルが正しく表示される', () => {
    render(<Input label="Name" placeholder="Enter name" />);
    
    const label = screen.getByText('Name');
    const input = screen.getByPlaceholderText('Enter name');
    
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('必須項目のラベルが正しく表示される', () => {
    render(<Input label="Required Field" required />);
    
    const label = screen.getByText('Required Field');
    expect(label).toHaveClass('form-label-required');
  });

  it('エラーメッセージが表示される', () => {
    render(<Input error="This field is required" />);
    
    const errorMessage = screen.getByText('This field is required');
    const input = screen.getByRole('textbox');
    
    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveClass('focus:border-red-500');
    expect(input).toHaveClass('focus:ring-red-200');
  });

  it('ヘルプテキストが表示される', () => {
    render(<Input helperText="Enter your full name" />);
    
    const helpText = screen.getByText('Enter your full name');
    expect(helpText).toBeInTheDocument();
    expect(helpText).toHaveClass('form-help');
  });

  it('エラーがある場合はヘルプテキストを非表示にする', () => {
    render(
      <Input 
        error="This field is required" 
        helperText="This should not be shown"
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.queryByText('This should not be shown')).not.toBeInTheDocument();
  });

  describe('バリアント', () => {
    it('defaultバリアントのクラスが適用される', () => {
      render(<Input variant="default" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input');
    });

    it('filledバリアントのクラスが適用される', () => {
      render(<Input variant="filled" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-50');
      expect(input).toHaveClass('border-gray-200');
      expect(input).toHaveClass('focus:bg-white');
    });
  });

  describe('サイズ', () => {
    it('デフォルトサイズが適用される', () => {
      render(<Input inputSize="default" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('form-input');
    });

    it('smallサイズのクラスが適用される', () => {
      render(<Input inputSize="sm" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('py-2');
      expect(input).toHaveClass('px-3');
      expect(input).toHaveClass('text-sm');
    });

    it('largeサイズのクラスが適用される', () => {
      render(<Input inputSize="lg" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('py-4');
      expect(input).toHaveClass('px-5');
      expect(input).toHaveClass('text-base');
    });
  });

  describe('アイコン', () => {
    it('左側アイコンが表示される', () => {
      const LeftIcon = <span data-testid="left-icon">📧</span>;
      render(<Input leftIcon={LeftIcon} />);
      
      const icon = screen.getByTestId('left-icon');
      const input = screen.getByRole('textbox');
      
      expect(icon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10');
    });

    it('右側アイコンが表示される', () => {
      const RightIcon = <span data-testid="right-icon">🔍</span>;
      render(<Input rightIcon={RightIcon} />);
      
      const icon = screen.getByTestId('right-icon');
      const input = screen.getByRole('textbox');
      
      expect(icon).toBeInTheDocument();
      expect(input).toHaveClass('pr-10');
    });

    it('両側にアイコンが表示される', () => {
      const LeftIcon = <span data-testid="left-icon">📧</span>;
      const RightIcon = <span data-testid="right-icon">🔍</span>;
      render(<Input leftIcon={LeftIcon} rightIcon={RightIcon} />);
      
      const leftIcon = screen.getByTestId('left-icon');
      const rightIcon = screen.getByTestId('right-icon');
      const input = screen.getByRole('textbox');
      
      expect(leftIcon).toBeInTheDocument();
      expect(rightIcon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10');
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('レイアウト', () => {
    it('fullWidthがtrueの場合、全幅になる', () => {
      const { container } = render(<Input fullWidth />);
      
      const formGroup = container.querySelector('.form-group');
      const input = screen.getByRole('textbox');
      
      expect(formGroup).toHaveClass('w-full');
      expect(input).toHaveClass('w-full');
    });

    it('fullWidthがfalseの場合、全幅にならない', () => {
      const { container } = render(<Input fullWidth={false} />);
      
      const formGroup = container.querySelector('.form-group');
      const input = screen.getByRole('textbox');
      
      expect(formGroup).not.toHaveClass('w-full');
      expect(input).not.toHaveClass('w-full');
    });
  });

  describe('HTML属性', () => {
    it('カスタムIDが設定される', () => {
      render(<Input id="custom-input" label="Custom Input" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Custom Input');
      
      expect(input).toHaveAttribute('id', 'custom-input');
      expect(label).toHaveAttribute('for', 'custom-input');
    });

    it('IDが未指定の場合、自動生成される', () => {
      render(<Input label="Auto ID" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Auto ID');
      
      expect(input.id).toMatch(/^input-[a-z0-9]{9}$/);
      expect(label).toHaveAttribute('for', input.id);
    });

    it('追加のHTML属性が適用される', () => {
      render(
        <Input 
          type="email"
          placeholder="Enter email"
          maxLength={100}
          required
          disabled
        />
      );
      
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter email');
      expect(input).toHaveAttribute('maxLength', '100');
      expect(input).toBeRequired();
      expect(input).toBeDisabled();
    });

    it('カスタムclassNameが適用される', () => {
      render(<Input className="custom-input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('form-input'); // デフォルトクラスも保持
    });
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {
      const inputRef = { current: null };
      render(<Input ref={inputRef} />);
      
      expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('イベントハンドリング', () => {
    it('onChange イベントが正しく動作する', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            value: 'test value'
          })
        })
      );
    });

    it('onFocus イベントが正しく動作する', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('onBlur イベントが正しく動作する', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('エラーアイコン', () => {
    it('エラー時にアイコンが表示される', () => {
      const { container } = render(<Input error="Error message" />);
      
      const errorIcon = container.querySelector('svg');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveClass('w-4', 'h-4');
    });

    it('エラーがない場合はアイコンが表示されない', () => {
      const { container } = render(<Input />);
      
      const errorIcon = container.querySelector('.form-error svg');
      expect(errorIcon).not.toBeInTheDocument();
    });
  });

  describe('複数設定の組み合わせ', () => {
    it('すべての設定が同時に適用される', () => {
      const LeftIcon = <span data-testid="left-icon">📧</span>;
      const RightIcon = <span data-testid="right-icon">🔍</span>;
      
      render(
        <Input
          label="Complex Input"
          error="Error message"
          helperText="Help text (should not show)"
          variant="filled"
          inputSize="lg"
          leftIcon={LeftIcon}
          rightIcon={RightIcon}
          fullWidth
          required
          className="custom-class"
        />
      );
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Complex Input');
      
      expect(label).toHaveClass('form-label-required');
      expect(input).toHaveClass('bg-gray-50', 'py-4', 'px-5', 'text-base');
      expect(input).toHaveClass('pl-10', 'pr-10');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('custom-class');
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Help text (should not show)')).not.toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayNameが正しく設定される', () => {
      expect(Input.displayName).toBe('Input');
    });
  });

  describe('アクセシビリティ', () => {
    it('ラベルとinputの関連付けが正しい', () => {
      render(<Input label="Accessible Input" />);
      
      const input = screen.getByRole('textbox', { name: 'Accessible Input' });
      expect(input).toBeInTheDocument();
    });

    it('エラーメッセージがaria-describedbyで関連付けられる（将来の拡張用）', () => {
      render(<Input label="Error Input" error="This is an error" />);
      
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('This is an error');
      
      expect(input).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });
  });
});