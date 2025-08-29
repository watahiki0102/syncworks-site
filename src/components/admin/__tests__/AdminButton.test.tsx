/**
 * AdminButton コンポーネントのテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminButton from '../AdminButton';

describe('AdminButton', () => {
  describe('基本機能', () => {
    it('基本的なボタンがレンダリングされる', () => {
      render(<AdminButton>クリック</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('クリック');
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('ボタンがクリックされる', () => {
      const handleClick = jest.fn();
      render(<AdminButton onClick={handleClick}>クリック</AdminButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('HTML属性が正しく渡される', () => {
      render(
        <AdminButton 
          id="test-button" 
          data-testid="admin-btn" 
          type="submit"
        >
          Submit
        </AdminButton>
      );
      
      const button = screen.getByTestId('admin-btn');
      expect(button).toHaveAttribute('id', 'test-button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('variant prop', () => {
    it('primary variantが適用される（デフォルト）', () => {
      render(<AdminButton>Primary</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'focus:ring-blue-500');
    });

    it('primary variantが明示的に適用される', () => {
      render(<AdminButton variant="primary">Primary Explicit</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    });

    it('secondary variantが適用される', () => {
      render(<AdminButton variant="secondary">Secondary</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-600', 'hover:bg-gray-700', 'text-white', 'focus:ring-gray-500');
    });

    it('success variantが適用される', () => {
      render(<AdminButton variant="success">Success</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-600', 'hover:bg-green-700', 'text-white', 'focus:ring-green-500');
    });

    it('warning variantが適用される', () => {
      render(<AdminButton variant="warning">Warning</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-orange-600', 'hover:bg-orange-700', 'text-white', 'focus:ring-orange-500');
    });

    it('danger variantが適用される', () => {
      render(<AdminButton variant="danger">Danger</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'hover:bg-red-700', 'text-white', 'focus:ring-red-500');
    });

    it('ghost variantが適用される', () => {
      render(<AdminButton variant="ghost">Ghost</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'hover:bg-gray-100', 'text-gray-700', 'border-gray-300', 'focus:ring-gray-500');
    });

    it('不正なvariantでprimaryが適用される', () => {
      render(<AdminButton variant={'invalid' as any}>Invalid</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700', 'text-white');
    });
  });

  describe('size prop', () => {
    it('md sizeが適用される（デフォルト）', () => {
      render(<AdminButton>Medium</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('xs sizeが適用される', () => {
      render(<AdminButton size="xs">Extra Small</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-2.5', 'py-1.5', 'text-xs');
    });

    it('sm sizeが適用される', () => {
      render(<AdminButton size="sm">Small</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('md sizeが明示的に適用される', () => {
      render(<AdminButton size="md">Medium Explicit</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('lg sizeが適用される', () => {
      render(<AdminButton size="lg">Large</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('不正なsizeでmdが適用される', () => {
      render(<AdminButton size={'xl' as any}>Invalid Size</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });
  });

  describe('loading prop', () => {
    it('loadingでない場合は通常の表示', () => {
      render(<AdminButton loading={false}>Not Loading</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Not Loading');
      expect(button).not.toBeDisabled();
      expect(button.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    it('loading状態でスピナーとテキストが表示される', () => {
      render(<AdminButton loading>Loading Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('processing...');
      expect(button).toBeDisabled();
      
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-4', 'w-4', 'border-b-2', 'border-current');
    });

    it('loading=trueで明示的に設定される', () => {
      render(<AdminButton loading={true}>Explicit Loading</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('processing...');
      expect(button).toBeDisabled();
    });
  });

  describe('icon prop', () => {
    it('アイコンなしでは通常表示', () => {
      render(<AdminButton>No Icon</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('No Icon');
      expect(button.querySelector('.text-base')).not.toBeInTheDocument();
    });

    it('左側にアイコンが表示される（デフォルト）', () => {
      render(<AdminButton icon="🔥">Left Icon</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🔥Left Icon');
      
      const iconSpan = button.querySelector('.text-base');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toHaveTextContent('🔥');
      expect(iconSpan?.parentElement).toHaveClass('mr-2'); // 右マージン
    });

    it('右側にアイコンが表示される', () => {
      render(<AdminButton icon="🔥" iconPosition="right">Right Icon</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Right Icon🔥');
      
      const iconSpan = button.querySelector('.text-base');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan?.parentElement).toHaveClass('ml-2'); // 左マージン
    });

    it('テキストなしでアイコンのみの場合はマージンなし', () => {
      render(<AdminButton icon="🔥" />);
      
      const button = screen.getByRole('button');
      const iconWrapper = button.querySelector('span');
      expect(iconWrapper).not.toHaveClass('mr-2', 'ml-2');
    });

    it('loading状態ではアイコンが表示されない', () => {
      render(<AdminButton icon="🔥" loading>Loading with Icon</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('processing...');
      expect(button.querySelector('.text-base')).not.toBeInTheDocument();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('iconPosition="left"が明示的に設定される', () => {
      render(<AdminButton icon="⭐" iconPosition="left">Left Star</AdminButton>);
      
      const button = screen.getByRole('button');
      const iconSpan = button.querySelector('.text-base');
      expect(iconSpan?.parentElement).toHaveClass('mr-2');
    });
  });

  describe('disabled prop', () => {
    it('disabledでない場合は有効', () => {
      render(<AdminButton disabled={false}>Enabled</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      // CSSクラスは常に含まれるが、disabled状態でないため適用されない
      expect(button).toHaveClass('disabled:opacity-50'); // Tailwindでは常にクラスが適用される
    });

    it('disabled状態では無効化される', () => {
      render(<AdminButton disabled>Disabled Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('loading状態でも無効化される', () => {
      render(<AdminButton loading>Loading Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disabled=trueとloading=trueの両方で無効化される', () => {
      render(<AdminButton disabled loading>Both Disabled</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('fullWidth prop', () => {
    it('fullWidth=falseでは幅制限なし（デフォルト）', () => {
      render(<AdminButton fullWidth={false}>Normal Width</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('fullWidth=trueで全幅になる', () => {
      render(<AdminButton fullWidth>Full Width</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('fullWidthが明示的にtrueに設定される', () => {
      render(<AdminButton fullWidth={true}>Explicit Full Width</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('className prop', () => {
    it('カスタムclassNameが追加される', () => {
      render(<AdminButton className="custom-class">Custom Class</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('inline-flex'); // 基本クラスも維持
    });

    it('複数のカスタムクラスが追加される', () => {
      render(<AdminButton className="custom-1 custom-2 custom-3">Multiple Classes</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-1', 'custom-2', 'custom-3');
    });

    it('空のclassNameでも動作する', () => {
      render(<AdminButton className="">Empty ClassName</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('inline-flex'); // 基本クラスは適用される
    });
  });

  describe('複合プロパティテスト', () => {
    it('すべてのプロパティが組み合わされて動作する', () => {
      const handleClick = jest.fn();
      
      render(
        <AdminButton
          variant="success"
          size="lg"
          icon="✓"
          iconPosition="left"
          fullWidth
          className="test-button"
          onClick={handleClick}
        >
          Complete Button
        </AdminButton>
      );
      
      const button = screen.getByRole('button');
      
      // variant
      expect(button).toHaveClass('bg-green-600', 'hover:bg-green-700', 'text-white');
      
      // size
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
      
      // fullWidth
      expect(button).toHaveClass('w-full');
      
      // className
      expect(button).toHaveClass('test-button');
      
      // icon
      const iconSpan = button.querySelector('.text-base');
      expect(iconSpan).toBeInTheDocument();
      expect(iconSpan).toHaveTextContent('✓');
      
      // click handler
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('loading + icon の組み合わせではスピナーが優先される', () => {
      render(
        <AdminButton
          loading
          icon="🔥"
          iconPosition="right"
        >
          Loading with Icon
        </AdminButton>
      );
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveTextContent('processing...');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
      expect(button.querySelector('.text-base')).not.toBeInTheDocument(); // アイコンは表示されない
    });

    it('disabled + onClick では クリックされない', () => {
      const handleClick = jest.fn();
      
      render(
        <AdminButton disabled onClick={handleClick}>
          Disabled Button
        </AdminButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('CSS クラス処理', () => {
    it('基本クラスが正しく設定される', () => {
      render(<AdminButton>Test</AdminButton>);
      
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass(
        'inline-flex', 'items-center', 'justify-center',
        'font-medium', 'rounded-lg', 'border',
        'transition-colors', 'duration-200',
        'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2',
        'disabled:opacity-50', 'disabled:cursor-not-allowed'
      );
    });

    it('クラス文字列の余分な空白が除去される', () => {
      render(<AdminButton className="test">Test</AdminButton>);
      
      const button = screen.getByRole('button');
      
      // クラス名に連続する空白がないことを確認
      expect(button.className).not.toMatch(/\s{2,}/);
      expect(button.className).not.toMatch(/^\s|\s$/);
    });
  });

  describe('アクセシビリティ', () => {
    it('ボタンとして適切な role が設定される', () => {
      render(<AdminButton>Accessible Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('disabled状態がスクリーンリーダーに伝わる', () => {
      render(<AdminButton disabled>Disabled Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('loading状態でもdisabled属性が設定される', () => {
      render(<AdminButton loading>Loading Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('フォーカススタイルが適用される', () => {
      render(<AdminButton>Focusable Button</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('エッジケース', () => {
    it('children が null でも動作する', () => {
      render(<AdminButton>{null}</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('children が undefined でも動作する', () => {
      render(<AdminButton>{undefined}</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('空文字のiconでも動作する', () => {
      render(<AdminButton icon="">Empty Icon</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Empty Icon');
    });

    it('非常に長いテキストでも動作する', () => {
      const longText = 'A'.repeat(100);
      render(<AdminButton>{longText}</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('特殊文字を含むテキストでも動作する', () => {
      render(<AdminButton>特殊文字 @#$%^&*()_+</AdminButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('特殊文字 @#$%^&*()_+');
    });
  });
});