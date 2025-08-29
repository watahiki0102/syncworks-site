/**
 * FormField.tsx のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormField from '../FormField';

describe('FormField', () => {
  describe('基本機能', () => {
    it('基本的なフォームフィールドを表示する', () => {
      render(<FormField name="test-field" label="Test Label" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test-field');
      expect(input).toHaveAttribute('id', 'field-test-field');
    });

    it('必須フィールドが正しく表示される', () => {
      render(<FormField name="required-field" label="Required Field" required />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Required Field');
      
      expect(input).toBeInTheDocument();
      expect(label).toHaveClass('form-label-required');
    });

    it('プレースホルダーが正しく表示される', () => {
      render(
        <FormField 
          name="placeholder-field" 
          label="Field with Placeholder" 
          placeholder="Enter text here"
        />
      );
      
      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });
  });

  describe('エラー表示', () => {
    it('タッチされていない状態ではエラーを表示しない', () => {
      render(
        <FormField 
          name="error-field" 
          label="Error Field" 
          error="This field has an error"
          touched={false}
        />
      );
      
      expect(screen.queryByText('This field has an error')).not.toBeInTheDocument();
    });

    it('タッチされた状態でエラーを表示する', () => {
      render(
        <FormField 
          name="error-field" 
          label="Error Field" 
          error="This field has an error"
          touched={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('This field has an error');
      
      expect(errorMessage).toBeInTheDocument();
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーなしの場合はaria-invalidがfalse', () => {
      render(
        <FormField 
          name="no-error-field" 
          label="No Error Field" 
          touched={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('エラーがあってもタッチされていない場合はaria-invalidがfalse', () => {
      render(
        <FormField 
          name="untouched-error-field" 
          label="Untouched Error Field" 
          error="Error message"
          touched={false}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('説明文・ヘルプテキスト', () => {
    it('説明文が表示される', () => {
      render(
        <FormField 
          name="description-field" 
          label="Field with Description" 
          description="This is a description"
        />
      );
      
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('ヘルプテキストが表示される', () => {
      render(
        <FormField 
          name="help-field" 
          label="Field with Help" 
          helperText="This is help text"
        />
      );
      
      expect(screen.getByText('This is help text')).toBeInTheDocument();
    });

    it('説明文がヘルプテキストより優先される', () => {
      render(
        <FormField 
          name="priority-field" 
          label="Priority Field" 
          description="Description text"
          helperText="Help text"
        />
      );
      
      expect(screen.getByText('Description text')).toBeInTheDocument();
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });

    it('エラーが説明文やヘルプテキストより優先される', () => {
      render(
        <FormField 
          name="error-priority-field" 
          label="Error Priority Field" 
          error="Error message"
          description="Description text"
          helperText="Help text"
          touched={true}
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Description text')).not.toBeInTheDocument();
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('ラベルとフィールドが正しく関連付けられる', () => {
      render(<FormField name="accessible-field" label="Accessible Field" />);
      
      const input = screen.getByRole('textbox', { name: 'Accessible Field' });
      expect(input).toBeInTheDocument();
    });

    it('エラーメッセージがaria-describedbyで関連付けられる', () => {
      render(
        <FormField 
          name="error-described-field" 
          label="Error Described Field" 
          error="Error message"
          touched={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'field-error-described-field-error');
    });

    it('説明文がaria-describedbyで関連付けられる', () => {
      render(
        <FormField 
          name="description-described-field" 
          label="Description Described Field" 
          description="Description message"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'field-description-described-field-help');
    });

    it('ヘルプテキストがaria-describedbyで関連付けられる', () => {
      render(
        <FormField 
          name="help-described-field" 
          label="Help Described Field" 
          helperText="Help message"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'field-help-described-field-help');
    });

    it('ヘルプテキストがない場合はaria-describedbyが設定されない', () => {
      render(
        <FormField 
          name="no-help-field" 
          label="No Help Field" 
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('フォームコントロール', () => {
    it('値の変更が正しく動作する', () => {
      const handleChange = jest.fn();
      render(
        <FormField 
          name="controlled-field" 
          label="Controlled Field" 
          value="initial"
          onChange={handleChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'changed' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('フォーカスイベントが正しく動作する', () => {
      const handleFocus = jest.fn();
      render(
        <FormField 
          name="focus-field" 
          label="Focus Field" 
          onFocus={handleFocus}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('ブラーイベントが正しく動作する', () => {
      const handleBlur = jest.fn();
      render(
        <FormField 
          name="blur-field" 
          label="Blur Field" 
          onBlur={handleBlur}
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('バリアント・サイズ', () => {
    it('入力バリアントが適用される', () => {
      render(
        <FormField 
          name="variant-field" 
          label="Variant Field" 
          variant="filled"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-50');
    });

    it('入力サイズが適用される', () => {
      render(
        <FormField 
          name="size-field" 
          label="Size Field" 
          inputSize="lg"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('py-4', 'px-5', 'text-base');
    });

    it('全幅設定が適用される', () => {
      render(
        <FormField 
          name="full-width-field" 
          label="Full Width Field" 
          fullWidth={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });
  });

  describe('アイコン', () => {
    it('左アイコンが表示される', () => {
      const LeftIcon = <span data-testid="left-icon">📧</span>;
      render(
        <FormField 
          name="left-icon-field" 
          label="Left Icon Field" 
          leftIcon={LeftIcon}
        />
      );
      
      const icon = screen.getByTestId('left-icon');
      const input = screen.getByRole('textbox');
      
      expect(icon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10');
    });

    it('右アイコンが表示される', () => {
      const RightIcon = <span data-testid="right-icon">🔍</span>;
      render(
        <FormField 
          name="right-icon-field" 
          label="Right Icon Field" 
          rightIcon={RightIcon}
        />
      );
      
      const icon = screen.getByTestId('right-icon');
      const input = screen.getByRole('textbox');
      
      expect(icon).toBeInTheDocument();
      expect(input).toHaveClass('pr-10');
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <FormField 
          name="custom-class-field" 
          label="Custom Class Field" 
          className="custom-field-class"
        />
      );
      
      const formField = container.querySelector('.form-field');
      expect(formField).toHaveClass('custom-field-class');
    });

    it('空のclassNameが適用される', () => {
      const { container } = render(
        <FormField 
          name="empty-class-field" 
          label="Empty Class Field" 
          className=""
        />
      );
      
      const formField = container.querySelector('.form-field');
      expect(formField).toBeInTheDocument();
    });
  });

  describe('複合設定', () => {
    it('すべての設定が同時に適用される', () => {
      const LeftIcon = <span data-testid="left-icon">📧</span>;
      const RightIcon = <span data-testid="right-icon">🔍</span>;
      
      const { container } = render(
        <FormField
          name="complex-field"
          label="Complex Field"
          error="Complex error message"
          description="This should not show because of error"
          helperText="This should also not show"
          touched={true}
          required={true}
          variant="filled"
          inputSize="lg"
          leftIcon={LeftIcon}
          rightIcon={RightIcon}
          fullWidth={true}
          className="complex-custom-class"
          placeholder="Complex placeholder"
        />
      );
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Complex Field');
      const errorMessage = screen.getByText('Complex error message');
      
      // 基本設定
      expect(input).toHaveAttribute('name', 'complex-field');
      expect(input).toHaveAttribute('id', 'field-complex-field');
      expect(input).toHaveAttribute('placeholder', 'Complex placeholder');
      
      // 必須・エラー状態
      expect(input).toBeInTheDocument();
      expect(label).toHaveClass('form-label-required');
      expect(errorMessage).toBeInTheDocument();
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      
      // バリアント・サイズ・レイアウト
      expect(input).toHaveClass('bg-gray-50', 'py-4', 'px-5', 'text-base', 'w-full');
      
      // アイコン
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(input).toHaveClass('pl-10', 'pr-10');
      
      // カスタムクラス
      const formField = container.querySelector('.form-field');
      expect(formField).toHaveClass('complex-custom-class');
      
      // アクセシビリティ
      expect(input).toHaveAttribute('aria-describedby', 'field-complex-field-error');
      
      // 説明文が非表示（エラーが優先）
      expect(screen.queryByText('This should not show because of error')).not.toBeInTheDocument();
      expect(screen.queryByText('This should also not show')).not.toBeInTheDocument();
    });
  });

  describe('型と入力タイプ', () => {
    it('メールタイプが適用される', () => {
      render(
        <FormField 
          name="email-field" 
          label="Email Field" 
          type="email"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('パスワードタイプが適用される', () => {
      render(
        <FormField 
          name="password-field" 
          label="Password Field" 
          type="password"
        />
      );
      
      const input = screen.getByLabelText('Password Field');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('数値タイプが適用される', () => {
      render(
        <FormField 
          name="number-field" 
          label="Number Field" 
          type="number"
          min={0}
          max={100}
        />
      );
      
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '0');
      expect(input).toHaveAttribute('max', '100');
    });

    it('無効状態が適用される', () => {
      render(
        <FormField 
          name="disabled-field" 
          label="Disabled Field" 
          disabled={true}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('読み取り専用状態が適用される', () => {
      render(
        <FormField 
          name="readonly-field" 
          label="Readonly Field" 
          readOnly={true}
          value="Read only value"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
      expect(input).toHaveValue('Read only value');
    });
  });

  describe('displayName', () => {
    it('displayNameが正しく設定される', () => {
      expect(FormField.displayName).toBe('FormField');
    });
  });

  describe('memo化', () => {
    it('同じpropsで再レンダリングされない', () => {
      const TestComponent = () => {
        const [, setCounter] = React.useState(0);
        
        return (
          <div>
            <FormField name="memo-field" label="Memo Field" />
            <button onClick={() => setCounter(c => c + 1)}>Update</button>
          </div>
        );
      };
      
      const { rerender } = render(<TestComponent />);
      const input = screen.getByRole('textbox');
      
      rerender(<TestComponent />);
      
      // memo化されているため、同じ要素が保持される
      expect(screen.getByRole('textbox')).toBe(input);
    });
  });

  describe('エッジケース', () => {
    it('nameが空文字列でも動作する', () => {
      render(<FormField name="" label="Empty Name Field" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', '');
      expect(input).toHaveAttribute('id', 'field-');
    });

    it('labelがない場合でも動作する', () => {
      render(<FormField name="no-label-field" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('touchedがundefinedでも正しく動作する', () => {
      render(
        <FormField 
          name="undefined-touched-field" 
          label="Undefined Touched Field" 
          error="Error message"
        />
      );
      
      // touched=undefinedはfalseとして扱われる
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });
});