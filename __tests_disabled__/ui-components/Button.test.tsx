/**
 * Button.tsx のテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';
import { ButtonProps } from '../Button';

describe('Button component', () => {
  it('デフォルトの設定でレンダリングされる', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  describe('バリアント', () => {
    it('primary バリアントが正しく適用される', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('secondary バリアントが正しく適用される', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary');
    });

    it('outline バリアントが正しく適用される', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-outline');
    });

    it('ghost バリアントが正しく適用される', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-ghost');
    });

    it('destructive バリアントが正しく適用される', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    it('不正なバリアントの場合はデフォルトが適用される', () => {
      render(<Button variant={'invalid' as any}>Invalid</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });
  });

  describe('サイズ', () => {
    it('default サイズが正しく適用される', () => {
      render(<Button size="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn');
      expect(button).not.toHaveClass('btn-sm', 'btn-lg');
    });

    it('sm サイズが正しく適用される', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-sm');
    });

    it('lg サイズが正しく適用される', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-lg');
    });
  });

  describe('ローディング状態', () => {
    it('ローディング時にスピナーが表示される', () => {
      render(<Button isLoading>Loading</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-75', 'cursor-not-allowed');
      expect(button).toBeDisabled();
      
      // スピナーアイコンが存在することを確認
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('ローディング時にアイコンが非表示になる', () => {
      render(
        <Button 
          isLoading 
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Loading
        </Button>
      );
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('ローディング解除時にアイコンが表示される', () => {
      render(
        <Button 
          isLoading={false} 
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Normal
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('アイコン', () => {
    it('leftIcon が正しく表示される', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">←</span>}>
          With Left Icon
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('rightIcon が正しく表示される', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">→</span>}>
          With Right Icon
        </Button>
      );
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('両方のアイコンが正しく表示される', () => {
      render(
        <Button 
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Both Icons
        </Button>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('アイコンがある時にテキストに適切なマージンが付く', () => {
      render(
        <Button leftIcon={<span>←</span>}>
          Text with margin
        </Button>
      );
      
      const span = screen.getByText('Text with margin');
      expect(span).toHaveClass('mx-1');
    });
  });

  describe('フルWidth', () => {
    it('fullWidth が true の場合に w-full クラスが適用される', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('fullWidth が false の場合に w-full クラスが適用されない', () => {
      render(<Button fullWidth={false}>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('無効化', () => {
    it('disabled が true の場合にボタンが無効化される', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disabled が false の場合にボタンが有効になる', () => {
      render(<Button disabled={false}>Enabled</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('ローディング中でもボタンが無効化される', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムクラスが正しく適用される', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('空のクラス名でもエラーが発生しない', () => {
      render(<Button className="">No Custom Class</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('タイプ属性', () => {
    it('デフォルトでtype="button"が設定される', () => {
      render(<Button>Default Type</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('カスタムタイプが正しく設定される', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('イベントハンドリング', () => {
    it('onClick イベントが正しく呼び出される', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('ローディング中はクリックイベントが無効化される', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} isLoading>Loading</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // ボタンが無効化されているためクリックイベントは発火しない
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('disabled時はクリックイベントが無効化される', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('ref転送', () => {
    it('ref が正しく転送される', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>With Ref</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('With Ref');
    });
  });

  describe('HTML属性', () => {
    it('aria-label が正しく適用される', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('data属性が正しく適用される', () => {
      render(<Button data-testid="custom-button">Custom</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });

    it('その他のHTML属性が正しく適用される', () => {
      render(<Button id="custom-id" tabIndex={1}>Custom Attrs</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'custom-id');
      expect(button).toHaveAttribute('tabIndex', '1');
    });
  });

  describe('複合状態', () => {
    it('複数の状態が同時に適用される', () => {
      render(
        <Button 
          variant="secondary"
          size="lg"
          fullWidth
          className="extra-class"
        >
          Complex Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn', 'btn-secondary', 'btn-lg', 'w-full', 'extra-class');
    });

    it('ローディング + アイコン + フルwidth の組み合わせ', () => {
      render(
        <Button 
          isLoading
          leftIcon={<span>←</span>}
          fullWidth
          variant="destructive"
        >
          Loading Full Width
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full', 'opacity-75', 'cursor-not-allowed', 'bg-red-600');
      expect(button).toBeDisabled();
    });
  });

  describe('displayName', () => {
    it('正しいdisplayNameが設定されている', () => {
      expect(Button.displayName).toBe('Button');
    });
  });

  describe('スナップショット', () => {
    it('基本的なボタンのスナップショットが一致する', () => {
      const { container } = render(<Button>Snapshot Test</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('全オプション付きボタンのスナップショットが一致する', () => {
      const { container } = render(
        <Button 
          variant="destructive"
          size="lg"
          isLoading
          fullWidth
          className="test-class"
        >
          Full Options
        </Button>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});