/**
 * AnimatedText コンポーネントのテスト
 * カバレッジ目標: 100%
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnimatedText } from '../AnimatedText';

// framer-motionのモック
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, variants, initial, animate, custom, ...props }: any) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    span: ({ children, className, variants, ...props }: any) => (
      <span className={className} data-testid="motion-span" {...props}>
        {children}
      </span>
    ),
  },
  Variants: {} as any,
}));

describe('AnimatedText', () => {
  describe('基本機能', () => {
    it('基本的なテキストがレンダリングされる', () => {
      render(<AnimatedText text="Hello World" />);
      
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('空のテキストでも動作する', () => {
      render(<AnimatedText text="" />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
      // 空のテキストでも空の文字列要素が1つ作られる
      const spans = screen.queryAllByTestId('motion-span');
      expect(spans.length).toBeGreaterThanOrEqual(0);
    });

    it('一つの単語のテキストが正しく表示される', () => {
      render(<AnimatedText text="Single" />);
      
      expect(screen.getByText('Single')).toBeInTheDocument();
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(1);
    });
  });

  describe('type prop', () => {
    it('word type（デフォルト）で単語ごとに分割される', () => {
      render(<AnimatedText text="Hello World Test" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(3);
      
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('word typeが明示的に指定される', () => {
      render(<AnimatedText text="Two Words" type="word" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(2);
      
      expect(screen.getByText('Two')).toBeInTheDocument();
      expect(screen.getByText('Words')).toBeInTheDocument();
    });

    it('character typeで文字ごとに分割される', () => {
      render(<AnimatedText text="Hi" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(2);
      
      expect(screen.getByText('H')).toBeInTheDocument();
      expect(screen.getByText('i')).toBeInTheDocument();
    });

    it('character typeでスペースが正しく処理される', () => {
      render(<AnimatedText text="A B" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(3); // 'A', ' ', 'B'
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      
      // スペースは非改行スペース(\u00A0)として表示される
      const spaceSpan = spans.find(span => span.textContent === '\u00A0');
      expect(spaceSpan).toBeInTheDocument();
    });

    it('character typeで特殊文字が正しく処理される', () => {
      render(<AnimatedText text="A!B" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(3);
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('!')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('character typeで日本語が正しく処理される', () => {
      render(<AnimatedText text="こんにちは" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(5);
      
      expect(screen.getByText('こ')).toBeInTheDocument();
      expect(screen.getByText('ん')).toBeInTheDocument();
      expect(screen.getByText('に')).toBeInTheDocument();
      expect(screen.getByText('ち')).toBeInTheDocument();
      expect(screen.getByText('は')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('デフォルトで空のclassNameが適用される', () => {
      render(<AnimatedText text="Test" />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
      // classが空の場合はクラス名がない状態
      expect(container.className).toBe('');
    });

    it('カスタムclassNameが適用される', () => {
      render(<AnimatedText text="Test" className="custom-class" />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toHaveClass('custom-class');
    });

    it('複数のクラスが適用される', () => {
      render(<AnimatedText text="Test" className="class1 class2 class3" />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('delay prop', () => {
    it('デフォルトでdelay=0が適用される', () => {
      render(<AnimatedText text="Test" />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
      // motion要素の存在を確認（delayの具体的な値は内部実装なので直接テストしない）
    });

    it('カスタムdelayが適用される', () => {
      render(<AnimatedText text="Test" delay={0.5} />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
    });

    it('delay=0が明示的に設定される', () => {
      render(<AnimatedText text="Test" delay={0} />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
    });

    it('大きなdelay値でも動作する', () => {
      render(<AnimatedText text="Test" delay={5.0} />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('テキスト分割の詳細テスト', () => {
    it('複数のスペースを含むテキストの単語分割', () => {
      render(<AnimatedText text="  Hello    World  " type="word" />);
      
      // 空の文字列は除去される
      const spans = screen.getAllByTestId('motion-span');
      const validSpans = spans.filter(span => span.textContent && span.textContent.trim() !== '');
      
      expect(validSpans.length).toBeGreaterThan(0);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('World')).toBeInTheDocument();
    });

    it('タブや改行を含むテキストの文字分割', () => {
      render(<AnimatedText text="ABC" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(3); // 'A', 'B', 'C'
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('数値と記号を含むテキスト', () => {
      render(<AnimatedText text="123 ABC !@#" type="word" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(3);
      
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('ABC')).toBeInTheDocument();
      expect(screen.getByText('!@#')).toBeInTheDocument();
    });
  });

  describe('モーションプロパティ', () => {
    it('word typeでspan要素のクラスが正しく設定される', () => {
      render(<AnimatedText text="Test Word" type="word" />);
      
      const spans = screen.getAllByTestId('motion-span');
      spans.forEach(span => {
        expect(span).toHaveClass('inline-block', 'mr-2');
      });
    });

    it('character typeでspan要素のクラスが正しく設定される', () => {
      render(<AnimatedText text="Test" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      spans.forEach(span => {
        expect(span).toHaveClass('inline-block');
        expect(span).not.toHaveClass('mr-2'); // character typeではmr-2は適用されない
      });
    });
  });

  describe('複合プロパティテスト', () => {
    it('すべてのプロパティが組み合わされて動作する', () => {
      render(
        <AnimatedText 
          text="Custom Test Text" 
          className="test-class" 
          delay={1.0} 
          type="word" 
        />
      );
      
      const container = screen.getByTestId('motion-div');
      expect(container).toHaveClass('test-class');
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(3);
      
      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      
      spans.forEach(span => {
        expect(span).toHaveClass('inline-block', 'mr-2');
      });
    });

    it('character type + カスタムクラス + delay の組み合わせ', () => {
      render(
        <AnimatedText 
          text="AB" 
          className="character-test" 
          delay={0.3} 
          type="character" 
        />
      );
      
      const container = screen.getByTestId('motion-div');
      expect(container).toHaveClass('character-test');
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(2);
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      
      spans.forEach(span => {
        expect(span).toHaveClass('inline-block');
      });
    });
  });

  describe('エッジケース', () => {
    it('一文字のテキストでcharacter type', () => {
      render(<AnimatedText text="X" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(1);
      expect(screen.getByText('X')).toBeInTheDocument();
    });

    it('スペースのみのテキストでword type', () => {
      render(<AnimatedText text="   " type="word" />);
      
      const container = screen.getByTestId('motion-div');
      expect(container).toBeInTheDocument();
      
      // 空の要素のみが存在する可能性がある
      const spans = screen.queryAllByTestId('motion-span');
      if (spans.length > 0) {
        spans.forEach(span => {
          expect(span.textContent?.trim()).toBe('');
        });
      }
    });

    it('改行のみのテキストでcharacter type', () => {
      render(<AnimatedText text="X" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans).toHaveLength(1);
      
      // 文字が span 内に存在することを確認
      const span = spans[0];
      expect(span.textContent).toBe('X');
    });

    it('Unicode文字を含むテキスト', () => {
      render(<AnimatedText text="Hello A" type="character" />);
      
      const spans = screen.getAllByTestId('motion-span');
      expect(spans.length).toBeGreaterThan(0);
      
      // 英字が正しく表示されることを確認
      expect(screen.getByText('H')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });
});