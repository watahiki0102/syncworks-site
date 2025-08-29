/**
 * Card.tsx のテスト
 * カバレッジ目標: 100%
 */

import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody, CardFooter } from '../Card';

describe('Card', () => {
  it('子要素を正しく表示する', () => {
    render(<Card>Card Content</Card>);
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('デフォルトクラスが適用される', () => {
    const { container } = render(<Card>Content</Card>);
    const cardElement = container.firstChild as HTMLElement;
    
    expect(cardElement).toHaveClass('card');
  });

  describe('バリアント', () => {
    it('defaultバリアントのクラスが適用される', () => {
      const { container } = render(<Card variant="default">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card');
    });

    it('minimalバリアントのクラスが適用される', () => {
      const { container } = render(<Card variant="minimal">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card-minimal');
    });

    it('elevatedバリアントのクラスが適用される', () => {
      const { container } = render(<Card variant="elevated">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card-elevated');
    });
  });

  describe('パディング', () => {
    it('デフォルトパディングが適用される', () => {
      const { container } = render(<Card>Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card');
      // デフォルトパディングでは特別なクラスは追加されない
    });

    it('noneパディングが適用される', () => {
      const { container } = render(<Card padding="none">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('p-0');
    });

    it('smパディングが適用される', () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('p-4');
    });

    it('lgパディングが適用される', () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('p-8');
    });
  });

  describe('ホバー効果', () => {
    it('hoverableがfalseの場合はhover効果が無効', () => {
      const { container } = render(<Card hoverable={false}>Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('hover:transform-none');
      expect(cardElement).not.toHaveClass('cursor-pointer');
    });

    it('hoverableがtrueの場合はcursor-pointerが適用される', () => {
      const { container } = render(<Card hoverable={true}>Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('cursor-pointer');
      expect(cardElement).not.toHaveClass('hover:transform-none');
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('custom-class');
      expect(cardElement).toHaveClass('card'); // デフォルトクラスも保持
    });

    it('複数のカスタムクラスが適用される', () => {
      const { container } = render(<Card className="class1 class2">Content</Card>);
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('class1');
      expect(cardElement).toHaveClass('class2');
    });
  });

  describe('HTMLプロパティ', () => {
    it('追加のHTMLプロパティが正しく渡される', () => {
      render(
        <Card data-testid="test-card" id="card-id" role="button">
          Content
        </Card>
      );
      
      const cardElement = screen.getByTestId('test-card');
      expect(cardElement).toHaveAttribute('id', 'card-id');
      expect(cardElement).toHaveAttribute('role', 'button');
    });

    it('イベントハンドラーが正しく設定される', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Content</Card>);
      
      const cardElement = screen.getByText('Content').parentElement!;
      cardElement.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ref の転送', () => {
    it('refが正しく転送される', () => {
      const ref = { current: null };
      render(<Card ref={ref}>Content</Card>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('複数の設定の組み合わせ', () => {
    it('すべての設定が同時に適用される', () => {
      const { container } = render(
        <Card 
          variant="elevated" 
          padding="lg" 
          hoverable={true} 
          className="custom-class"
        >
          Content
        </Card>
      );
      
      const cardElement = container.firstChild as HTMLElement;
      
      expect(cardElement).toHaveClass('card-elevated');
      expect(cardElement).toHaveClass('p-8');
      expect(cardElement).toHaveClass('cursor-pointer');
      expect(cardElement).toHaveClass('custom-class');
    });
  });
});

describe('CardHeader', () => {
  it('子要素を正しく表示する', () => {
    render(<CardHeader>Header Content</CardHeader>);
    
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('デフォルトクラスが適用される', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const headerElement = container.firstChild as HTMLElement;
    
    expect(headerElement).toHaveClass('card-header');
  });

  describe('パディング', () => {
    it('noneパディングが適用される', () => {
      const { container } = render(<CardHeader padding="none">Header</CardHeader>);
      const headerElement = container.firstChild as HTMLElement;
      
      expect(headerElement).toHaveClass('p-0');
    });

    it('smパディングが適用される', () => {
      const { container } = render(<CardHeader padding="sm">Header</CardHeader>);
      const headerElement = container.firstChild as HTMLElement;
      
      expect(headerElement).toHaveClass('p-4');
    });

    it('lgパディングが適用される', () => {
      const { container } = render(<CardHeader padding="lg">Header</CardHeader>);
      const headerElement = container.firstChild as HTMLElement;
      
      expect(headerElement).toHaveClass('p-8');
    });
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
    const headerElement = container.firstChild as HTMLElement;
    
    expect(headerElement).toHaveClass('custom-header');
    expect(headerElement).toHaveClass('card-header');
  });

  it('refが正しく転送される', () => {
    const ref = { current: null };
    render(<CardHeader ref={ref}>Header</CardHeader>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('displayNameが正しく設定される', () => {
    expect(CardHeader.displayName).toBe('CardHeader');
  });
});

describe('CardBody', () => {
  it('子要素を正しく表示する', () => {
    render(<CardBody>Body Content</CardBody>);
    
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('デフォルトクラスが適用される', () => {
    const { container } = render(<CardBody>Body</CardBody>);
    const bodyElement = container.firstChild as HTMLElement;
    
    expect(bodyElement).toHaveClass('card-body');
  });

  describe('パディング', () => {
    it('noneパディングが適用される', () => {
      const { container } = render(<CardBody padding="none">Body</CardBody>);
      const bodyElement = container.firstChild as HTMLElement;
      
      expect(bodyElement).toHaveClass('p-0');
    });

    it('smパディングが適用される', () => {
      const { container } = render(<CardBody padding="sm">Body</CardBody>);
      const bodyElement = container.firstChild as HTMLElement;
      
      expect(bodyElement).toHaveClass('p-4');
    });

    it('lgパディングが適用される', () => {
      const { container } = render(<CardBody padding="lg">Body</CardBody>);
      const bodyElement = container.firstChild as HTMLElement;
      
      expect(bodyElement).toHaveClass('p-8');
    });
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<CardBody className="custom-body">Body</CardBody>);
    const bodyElement = container.firstChild as HTMLElement;
    
    expect(bodyElement).toHaveClass('custom-body');
    expect(bodyElement).toHaveClass('card-body');
  });

  it('refが正しく転送される', () => {
    const ref = { current: null };
    render(<CardBody ref={ref}>Body</CardBody>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('displayNameが正しく設定される', () => {
    expect(CardBody.displayName).toBe('CardBody');
  });
});

describe('CardFooter', () => {
  it('子要素を正しく表示する', () => {
    render(<CardFooter>Footer Content</CardFooter>);
    
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('デフォルトクラスが適用される', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footerElement = container.firstChild as HTMLElement;
    
    expect(footerElement).toHaveClass('card-footer');
  });

  describe('パディング', () => {
    it('noneパディングが適用される', () => {
      const { container } = render(<CardFooter padding="none">Footer</CardFooter>);
      const footerElement = container.firstChild as HTMLElement;
      
      expect(footerElement).toHaveClass('p-0');
    });

    it('smパディングが適用される', () => {
      const { container } = render(<CardFooter padding="sm">Footer</CardFooter>);
      const footerElement = container.firstChild as HTMLElement;
      
      expect(footerElement).toHaveClass('p-4');
    });

    it('lgパディングが適用される', () => {
      const { container } = render(<CardFooter padding="lg">Footer</CardFooter>);
      const footerElement = container.firstChild as HTMLElement;
      
      expect(footerElement).toHaveClass('p-8');
    });
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
    const footerElement = container.firstChild as HTMLElement;
    
    expect(footerElement).toHaveClass('custom-footer');
    expect(footerElement).toHaveClass('card-footer');
  });

  it('refが正しく転送される', () => {
    const ref = { current: null };
    render(<CardFooter ref={ref}>Footer</CardFooter>);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('displayNameが正しく設定される', () => {
    expect(CardFooter.displayName).toBe('CardFooter');
  });
});

describe('Card Component Integration', () => {
  it('すべてのCardコンポーネントが一緒に動作する', () => {
    render(
      <Card variant="elevated" hoverable padding="lg">
        <CardHeader padding="sm">Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter padding="none">Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('displayNameが正しく設定される', () => {
    expect(Card.displayName).toBe('Card');
  });
});