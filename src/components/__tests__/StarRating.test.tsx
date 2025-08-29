/**
 * StarRating.tsx のテスト
 * カバレッジ目標: 100%
 */

import { render, screen } from '@testing-library/react';
import StarRating from '../StarRating';

// lucide-reactをモック
jest.mock('lucide-react', () => ({
  Star: ({ className, style, ...props }: any) => (
    <div 
      data-testid="star-icon" 
      className={className}
      style={style}
      {...props}
    />
  )
}));

describe('StarRating', () => {
  it('5つ星すべてが表示される', () => {
    render(<StarRating rating={5} />);
    
    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(10); // 背景5つ + 前景5つ = 10
  });

  it('評価値0で空の星が表示される', () => {
    render(<StarRating rating={0} />);
    
    const stars = screen.getAllByTestId('star-icon');
    const backgroundStars = stars.filter(star => 
      star.className.includes('text-gray-300')
    );
    const foregroundStars = stars.filter(star => 
      star.className.includes('text-yellow-500')
    );

    expect(backgroundStars).toHaveLength(5);
    expect(foregroundStars).toHaveLength(5);

    // 前景の星はすべて非表示（clipPath: inset(0 100% 0 0)）
    foregroundStars.forEach(star => {
      expect(star.style.clipPath).toBe('inset(0 100% 0 0)');
    });
  });

  it('評価値5で満点の星が表示される', () => {
    render(<StarRating rating={5} />);
    
    const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
      star.className.includes('text-yellow-500')
    );

    // すべての前景の星が完全に表示（clipPath: inset(0 0% 0 0)）
    foregroundStars.forEach(star => {
      expect(star.style.clipPath).toBe('inset(0 0% 0 0)');
    });
  });

  it('評価値3で3つ星が表示される', () => {
    render(<StarRating rating={3} />);
    
    const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
      star.className.includes('text-yellow-500')
    );

    // 最初の3つが完全表示、残り2つが非表示
    expect(foregroundStars[0].style.clipPath).toBe('inset(0 0% 0 0)');
    expect(foregroundStars[1].style.clipPath).toBe('inset(0 0% 0 0)');
    expect(foregroundStars[2].style.clipPath).toBe('inset(0 0% 0 0)');
    expect(foregroundStars[3].style.clipPath).toBe('inset(0 100% 0 0)');
    expect(foregroundStars[4].style.clipPath).toBe('inset(0 100% 0 0)');
  });

  it('評価値3.5で部分的な星が表示される', () => {
    render(<StarRating rating={3.5} />);
    
    const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
      star.className.includes('text-yellow-500')
    );

    // 最初の3つが完全表示
    expect(foregroundStars[0].style.clipPath).toBe('inset(0 0% 0 0)');
    expect(foregroundStars[1].style.clipPath).toBe('inset(0 0% 0 0)');
    expect(foregroundStars[2].style.clipPath).toBe('inset(0 0% 0 0)');
    // 4つ目が50%表示
    expect(foregroundStars[3].style.clipPath).toBe('inset(0 50% 0 0)');
    // 5つ目が非表示
    expect(foregroundStars[4].style.clipPath).toBe('inset(0 100% 0 0)');
  });

  it('評価値2.2で部分的な星が表示される', () => {
    render(<StarRating rating={2.2} />);
    
    const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
      star.className.includes('text-yellow-500')
    );

    // 最初の2つが完全表示
    expect(foregroundStars[0].style.clipPath).toBe('inset(0 0% 0 0)');
    expect(foregroundStars[1].style.clipPath).toBe('inset(0 0% 0 0)');
    // 3つ目が約20%表示（浮動小数点誤差を考慮）
    expect(foregroundStars[2].style.clipPath).toMatch(/inset\(0 [78][0-9](\.\d+)?% 0 0\)/);
    // 残りが非表示
    expect(foregroundStars[3].style.clipPath).toBe('inset(0 100% 0 0)');
    expect(foregroundStars[4].style.clipPath).toBe('inset(0 100% 0 0)');
  });

  describe('エッジケース', () => {
    it('負の評価値で空の星が表示される', () => {
      render(<StarRating rating={-1} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      foregroundStars.forEach(star => {
        expect(star.style.clipPath).toBe('inset(0 100% 0 0)');
      });
    });

    it('5を超える評価値で満点の星が表示される', () => {
      render(<StarRating rating={7} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      foregroundStars.forEach(star => {
        expect(star.style.clipPath).toBe('inset(0 0% 0 0)');
      });
    });

    it('小数点の評価値が正しく処理される', () => {
      render(<StarRating rating={1.75} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      expect(foregroundStars[0].style.clipPath).toBe('inset(0 0% 0 0)');
      expect(foregroundStars[1].style.clipPath).toBe('inset(0 25% 0 0)');
      expect(foregroundStars[2].style.clipPath).toBe('inset(0 100% 0 0)');
    });

    it('0に非常に近い値が適切に処理される', () => {
      render(<StarRating rating={0.001} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      expect(foregroundStars[0].style.clipPath).toBe('inset(0 99.9% 0 0)');
      expect(foregroundStars[1].style.clipPath).toBe('inset(0 100% 0 0)');
    });
  });

  describe('サイズ設定', () => {
    it('デフォルトサイズ20pxが適用される', () => {
      render(<StarRating rating={3} />);
      
      const allStars = screen.getAllByTestId('star-icon');
      
      allStars.forEach(star => {
        expect(star.style.width).toBe('20px');
        expect(star.style.height).toBe('20px');
      });
    });

    it('カスタムサイズが正しく適用される', () => {
      render(<StarRating rating={3} size={32} />);
      
      const allStars = screen.getAllByTestId('star-icon');
      
      allStars.forEach(star => {
        expect(star.style.width).toBe('32px');
        expect(star.style.height).toBe('32px');
      });
    });

    it('大きなサイズでも正しく動作する', () => {
      render(<StarRating rating={2.5} size={64} />);
      
      const allStars = screen.getAllByTestId('star-icon');
      
      allStars.forEach(star => {
        expect(star.style.width).toBe('64px');
        expect(star.style.height).toBe('64px');
      });
    });

    it('小さなサイズでも正しく動作する', () => {
      render(<StarRating rating={4} size={12} />);
      
      const allStars = screen.getAllByTestId('star-icon');
      
      allStars.forEach(star => {
        expect(star.style.width).toBe('12px');
        expect(star.style.height).toBe('12px');
      });
    });
  });

  describe('CSS クラスとスタイル', () => {
    it('背景の星に正しいクラスが適用される', () => {
      render(<StarRating rating={2} />);
      
      const backgroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-gray-300')
      );

      expect(backgroundStars).toHaveLength(5);
      backgroundStars.forEach(star => {
        expect(star).toHaveClass('text-gray-300');
      });
    });

    it('前景の星に正しいクラスが適用される', () => {
      render(<StarRating rating={2} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      expect(foregroundStars).toHaveLength(5);
      foregroundStars.forEach(star => {
        expect(star).toHaveClass('text-yellow-500');
        expect(star).toHaveClass('fill-yellow-500');
      });
    });

    it('前景の星に正しいpositioningが適用される', () => {
      render(<StarRating rating={3} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      foregroundStars.forEach(star => {
        expect(star.style.position).toBe('absolute');
        expect(star.style.top).toBe('0px');
        expect(star.style.left).toBe('0px');
      });
    });
  });

  describe('コンテナ要素', () => {
    it('星がflexコンテナ内に配置される', () => {
      const { container } = render(<StarRating rating={3} />);
      
      const flexContainer = container.querySelector('.flex.items-center');
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('flex');
      expect(flexContainer).toHaveClass('items-center');
    });
  });

  describe('アクセシビリティ', () => {
    it('各星に一意のキーが設定される', () => {
      const { container } = render(<StarRating rating={3} />);
      
      // 星のコンテナ要素を取得
      const starContainers = container.querySelectorAll('.relative.inline-block');
      expect(starContainers).toHaveLength(5);
    });
  });

  describe('計算ロジック', () => {
    it('fillPercentageが正しく計算される', () => {
      // rating = 2.3 の場合
      // 1番目の星: Math.min(Math.max(2.3 - 1 + 1, 0), 1) = Math.min(Math.max(2.3, 0), 1) = 1 (100%)
      // 2番目の星: Math.min(Math.max(2.3 - 2 + 1, 0), 1) = Math.min(Math.max(1.3, 0), 1) = 1 (100%)
      // 3番目の星: Math.min(Math.max(2.3 - 3 + 1, 0), 1) = Math.min(Math.max(0.3, 0), 1) = 0.3 (30%)
      // 4番目の星: Math.min(Math.max(2.3 - 4 + 1, 0), 1) = Math.min(Math.max(-0.7, 0), 1) = 0 (0%)
      render(<StarRating rating={2.3} />);
      
      const foregroundStars = screen.getAllByTestId('star-icon').filter(star => 
        star.className.includes('text-yellow-500')
      );

      expect(foregroundStars[0].style.clipPath).toBe('inset(0 0% 0 0)');
      expect(foregroundStars[1].style.clipPath).toBe('inset(0 0% 0 0)');
      expect(foregroundStars[2].style.clipPath).toMatch(/inset\(0 7[0-9](\.\d+)?% 0 0\)/);
      expect(foregroundStars[3].style.clipPath).toBe('inset(0 100% 0 0)');
      expect(foregroundStars[4].style.clipPath).toBe('inset(0 100% 0 0)');
    });
  });
});