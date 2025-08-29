/**
 * Typography コンポーネントのテスト
 * カバレッジ目標: 95%+
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Typography, { Heading, Text } from '../Typography';

describe('Typography', () => {
  describe('Heading コンポーネント', () => {
    describe('基本機能', () => {
      it('レベル1の見出しがレンダリングされる', () => {
        render(<Heading level={1}>テスト見出し</Heading>);
        
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H1');
        expect(heading).toHaveTextContent('テスト見出し');
      });

      it('レベル2-6の見出しがレンダリングされる', () => {
        [2, 3, 4, 5, 6].forEach(level => {
          render(<Heading level={level as any}>レベル{level}</Heading>);
          
          const heading = screen.getByRole('heading', { level });
          expect(heading.tagName).toBe(`H${level}`);
          expect(heading).toHaveTextContent(`レベル${level}`);
        });
      });
    });

    describe('デフォルトサイズ', () => {
      it('レベル1でデフォルトサイズ4xlが適用される', () => {
        render(<Heading level={1}>H1テスト</Heading>);
        
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('text-4xl');
      });

      it('レベル2でデフォルトサイズ3xlが適用される', () => {
        render(<Heading level={2}>H2テスト</Heading>);
        
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toHaveClass('text-3xl');
      });

      it('レベル3でデフォルトサイズ2xlが適用される', () => {
        render(<Heading level={3}>H3テスト</Heading>);
        
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toHaveClass('text-2xl');
      });

      it('レベル4でデフォルトサイズxlが適用される', () => {
        render(<Heading level={4}>H4テスト</Heading>);
        
        const heading = screen.getByRole('heading', { level: 4 });
        expect(heading).toHaveClass('text-xl');
      });

      it('レベル5でデフォルトサイズlgが適用される', () => {
        render(<Heading level={5}>H5テスト</Heading>);
        
        const heading = screen.getByRole('heading', { level: 5 });
        expect(heading).toHaveClass('text-lg');
      });

      it('レベル6でデフォルトサイズbaseが適用される', () => {
        render(<Heading level={6}>H6テスト</Heading>);
        
        const heading = screen.getByRole('heading', { level: 6 });
        expect(heading).toHaveClass('text-base');
      });
    });

    describe('カスタムサイズ', () => {
      it('カスタムサイズが正しく適用される', () => {
        render(<Heading level={1} size="sm">小さな見出し</Heading>);
        
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveClass('text-sm');
        expect(heading).not.toHaveClass('text-4xl'); // デフォルトサイズは適用されない
      });

      it('すべてのサイズが正しく適用される', () => {
        const sizes = [
          { size: 'xs', class: 'text-xs' },
          { size: 'sm', class: 'text-sm' },
          { size: 'base', class: 'text-base' },
          { size: 'lg', class: 'text-lg' },
          { size: 'xl', class: 'text-xl' },
          { size: '2xl', class: 'text-2xl' },
          { size: '3xl', class: 'text-3xl' },
          { size: '4xl', class: 'text-4xl' },
          { size: '5xl', class: 'text-5xl' },
        ];

        sizes.forEach(({ size, class: expectedClass }) => {
          render(<Heading level={1} size={size as any}>{size}テスト</Heading>);
          
          const heading = screen.getByText(`${size}テスト`);
          expect(heading).toHaveClass(expectedClass);
        });
      });
    });

    describe('重みの設定', () => {
      it('デフォルトでboldが適用される', () => {
        render(<Heading level={1}>デフォルト重み</Heading>);
        
        const heading = screen.getByRole('heading');
        expect(heading).toHaveClass('font-bold');
      });

      it('すべての重みが正しく適用される', () => {
        const weights = [
          { weight: 'normal', class: 'font-normal' },
          { weight: 'medium', class: 'font-medium' },
          { weight: 'semibold', class: 'font-semibold' },
          { weight: 'bold', class: 'font-bold' },
        ];

        weights.forEach(({ weight, class: expectedClass }) => {
          render(<Heading level={1} weight={weight as any}>{weight}テスト</Heading>);
          
          const heading = screen.getByText(`${weight}テスト`);
          expect(heading).toHaveClass(expectedClass);
        });
      });
    });

    describe('色の設定', () => {
      it('デフォルトでdefault色が適用される', () => {
        render(<Heading level={1}>デフォルト色</Heading>);
        
        const heading = screen.getByRole('heading');
        expect(heading).toHaveClass('text-gray-900');
      });

      it('すべての色が正しく適用される', () => {
        const colors = [
          { color: 'default', class: 'text-gray-900' },
          { color: 'muted', class: 'text-gray-600' },
          { color: 'primary', class: 'text-blue-600' },
          { color: 'success', class: 'text-green-600' },
          { color: 'warning', class: 'text-yellow-600' },
          { color: 'error', class: 'text-red-600' },
        ];

        colors.forEach(({ color, class: expectedClass }) => {
          render(<Heading level={1} color={color as any}>{color}テスト</Heading>);
          
          const heading = screen.getByText(`${color}テスト`);
          expect(heading).toHaveClass(expectedClass);
        });
      });
    });

    describe('グラデーション', () => {
      it('グラデーションが正しく適用される', () => {
        render(<Heading level={1} gradient>グラデーション見出し</Heading>);
        
        const heading = screen.getByRole('heading');
        expect(heading).toHaveClass(
          'bg-gradient-to-r',
          'from-blue-600',
          'to-purple-600',
          'bg-clip-text',
          'text-transparent'
        );
        expect(heading).not.toHaveClass('text-gray-900'); // 通常の色は適用されない
      });

      it('グラデーションなしでは通常の色が適用される', () => {
        render(<Heading level={1} gradient={false}>通常見出し</Heading>);
        
        const heading = screen.getByRole('heading');
        expect(heading).toHaveClass('text-gray-900');
        expect(heading).not.toHaveClass('bg-gradient-to-r');
      });
    });

    describe('その他の属性', () => {
      it('カスタムclassNameが適用される', () => {
        render(<Heading level={1} className="custom-class">カスタムクラス</Heading>);
        
        const heading = screen.getByRole('heading');
        expect(heading).toHaveClass('custom-class');
        expect(heading).toHaveClass('leading-tight'); // 基本クラスも適用される
      });

      it('HTML属性が正しく渡される', () => {
        render(<Heading level={1} id="test-id" data-testid="test-heading">属性テスト</Heading>);
        
        const heading = screen.getByTestId('test-heading');
        expect(heading).toHaveAttribute('id', 'test-id');
      });

      it('refが正しく設定される', () => {
        const ref = React.createRef<HTMLHeadingElement>();
        render(<Heading level={1} ref={ref}>Refテスト</Heading>);
        
        expect(ref.current).toBeDefined();
        expect(ref.current?.tagName).toBe('H1');
      });
    });

    it('displayNameが設定される', () => {
      expect(Heading.displayName).toBe('Heading');
    });
  });

  describe('Text コンポーネント', () => {
    describe('基本機能', () => {
      it('基本的なテキストがレンダリングされる', () => {
        render(<Text>テストテキスト</Text>);
        
        const text = screen.getByText('テストテキスト');
        expect(text).toBeInTheDocument();
        expect(text.tagName).toBe('P'); // デフォルトはp要素
      });

      it('asプロパティで要素タイプが変更される', () => {
        render(<Text as="span">Spanテキスト</Text>);
        
        const text = screen.getByText('Spanテキスト');
        expect(text.tagName).toBe('SPAN');
      });

      it('as="div"で正しくレンダリングされる', () => {
        render(<Text as="div">Divテキスト</Text>);
        
        const text = screen.getByText('Divテキスト');
        expect(text.tagName).toBe('DIV');
      });
    });

    describe('バリアント', () => {
      it('デフォルトでbodyバリアントが適用される', () => {
        render(<Text>ボディテキスト</Text>);
        
        const text = screen.getByText('ボディテキスト');
        expect(text).toHaveClass('leading-normal', 'text-base');
      });

      it('leadバリアントが正しく適用される', () => {
        render(<Text variant="lead">リードテキスト</Text>);
        
        const text = screen.getByText('リードテキスト');
        expect(text).toHaveClass('leading-relaxed', 'text-lg');
      });

      it('smallバリアントが正しく適用される', () => {
        render(<Text variant="small">小さなテキスト</Text>);
        
        const text = screen.getByText('小さなテキスト');
        expect(text).toHaveClass('leading-normal', 'text-sm');
      });

      it('mutedバリアントが正しく適用される', () => {
        render(<Text variant="muted">ミュートテキスト</Text>);
        
        const text = screen.getByText('ミュートテキスト');
        expect(text).toHaveClass('text-gray-500', 'leading-normal', 'text-sm');
      });
    });

    describe('カスタムサイズ', () => {
      it('カスタムサイズが正しく適用される', () => {
        render(<Text size="xl">大きなテキスト</Text>);
        
        const text = screen.getByText('大きなテキスト');
        expect(text).toHaveClass('text-xl');
        expect(text).not.toHaveClass('text-base'); // デフォルトサイズは適用されない
      });
    });

    describe('重みの設定', () => {
      it('デフォルトでnormalが適用される', () => {
        render(<Text>デフォルト重み</Text>);
        
        const text = screen.getByText('デフォルト重み');
        expect(text).toHaveClass('font-normal');
      });

      it('すべての重みが正しく適用される', () => {
        const weights = [
          { weight: 'normal', class: 'font-normal' },
          { weight: 'medium', class: 'font-medium' },
          { weight: 'semibold', class: 'font-semibold' },
          { weight: 'bold', class: 'font-bold' },
        ];

        weights.forEach(({ weight, class: expectedClass }) => {
          render(<Text weight={weight as any}>{weight}テキスト</Text>);
          
          const text = screen.getByText(`${weight}テキスト`);
          expect(text).toHaveClass(expectedClass);
        });
      });
    });

    describe('色の設定', () => {
      it('デフォルトでdefault色が適用される', () => {
        render(<Text>デフォルト色</Text>);
        
        const text = screen.getByText('デフォルト色');
        expect(text).toHaveClass('text-gray-900');
      });

      it('mutedバリアントでは色設定が無視される', () => {
        render(<Text variant="muted" color="primary">ミュート優先</Text>);
        
        const text = screen.getByText('ミュート優先');
        expect(text).toHaveClass('text-gray-500');
        expect(text).not.toHaveClass('text-blue-600');
      });

      it('通常のバリアントではcolorが適用される', () => {
        render(<Text variant="body" color="primary">プライマリ色</Text>);
        
        const text = screen.getByText('プライマリ色');
        expect(text).toHaveClass('text-blue-600');
      });
    });

    describe('その他の属性', () => {
      it('カスタムclassNameが適用される', () => {
        render(<Text className="custom-text">カスタムクラス</Text>);
        
        const text = screen.getByText('カスタムクラス');
        expect(text).toHaveClass('custom-text');
      });

      it('HTML属性が正しく渡される', () => {
        render(<Text id="test-text" data-testid="test-text">属性テスト</Text>);
        
        const text = screen.getByTestId('test-text');
        expect(text).toHaveAttribute('id', 'test-text');
      });

      it('refが正しく設定される', () => {
        const ref = React.createRef<HTMLParagraphElement>();
        render(<Text ref={ref}>Refテスト</Text>);
        
        expect(ref.current).toBeDefined();
        expect(ref.current?.tagName).toBe('P');
      });
    });

    it('displayNameが設定される', () => {
      expect(Text.displayName).toBe('Text');
    });
  });

  describe('複合テスト', () => {
    it('HeadingとTextが組み合わせて使用できる', () => {
      render(
        <div>
          <Heading level={1} color="primary">メインタイトル</Heading>
          <Text variant="lead">リード文です。</Text>
          <Text>本文テキストです。</Text>
        </div>
      );
      
      const heading = screen.getByRole('heading');
      const leadText = screen.getByText('リード文です。');
      const bodyText = screen.getByText('本文テキストです。');
      
      expect(heading).toHaveClass('text-blue-600', 'text-4xl');
      expect(leadText).toHaveClass('text-lg', 'leading-relaxed');
      expect(bodyText).toHaveClass('text-base', 'leading-normal');
    });
  });

  describe('エッジケース', () => {
    it('不正なlevelでも動作する', () => {
      // TypeScriptエラーを無視してテスト
      render(<Heading level={0 as any}>不正レベル</Heading>);
      
      const heading = screen.getByText('不正レベル');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-base'); // デフォルトサイズ
    });

    it('不正なsizeでもデフォルトが適用される', () => {
      render(<Heading level={1} size={'invalid' as any}>不正サイズ</Heading>);
      
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-base'); // デフォルトにフォールバック
    });

    it('不正なweightでもデフォルトが適用される', () => {
      render(<Text weight={'invalid' as any}>不正重み</Text>);
      
      const text = screen.getByText('不正重み');
      expect(text).toHaveClass('font-normal'); // デフォルトにフォールバック
    });

    it('クラス結合で空の値がフィルタリングされる', () => {
      render(<Heading level={1} className="">空クラス</Heading>);
      
      const heading = screen.getByRole('heading');
      
      // クラス文字列に余分なスペースがないことを確認
      expect(heading.className).not.toMatch(/\s{2,}/);
      expect(heading.className).not.toMatch(/^\s|\s$/);
    });
  });

  describe('Typography デフォルトエクスポート', () => {
    it('Typography.Headingが使用できる', () => {
      render(<Typography.Heading level={1}>Typography見出し</Typography.Heading>);
      
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Typography見出し');
    });

    it('Typography.Textが使用できる', () => {
      render(<Typography.Text>Typographyテキスト</Typography.Text>);
      
      const text = screen.getByText('Typographyテキスト');
      expect(text).toBeInTheDocument();
    });
  });
});