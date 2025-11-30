/**
 * PriceDisplay.tsx のテスト
 * カバレッジ目標: 100%
 */

import { render, screen } from '@testing-library/react';
import { PriceDisplay, PriceComparison, PriceRange } from '../PriceDisplay';

describe('PriceDisplay', () => {
  describe('基本機能', () => {
    it('基本的な金額を表示する', () => {
      render(<PriceDisplay amount={1000} />);
      
      expect(screen.getByText('￥1,000')).toBeInTheDocument();
    });

    it('日本円（JPY）が正しくフォーマットされる', () => {
      render(<PriceDisplay amount={123456} currency="JPY" />);
      
      expect(screen.getByText('￥123,456')).toBeInTheDocument();
    });

    it('米ドル（USD）が正しくフォーマットされる', () => {
      render(<PriceDisplay amount={123456} currency="USD" />);
      
      expect(screen.getByText('$123,456')).toBeInTheDocument();
    });

    it('ゼロ金額が正しく表示される', () => {
      render(<PriceDisplay amount={0} />);
      
      expect(screen.getByText('￥0')).toBeInTheDocument();
    });

    it('負の金額が正しく表示される', () => {
      render(<PriceDisplay amount={-1000} />);
      
      expect(screen.getByText('-￥1,000')).toBeInTheDocument();
    });
  });

  describe('税込み表示', () => {
    it('税込み表示がオンの場合、税込み金額を表示する', () => {
      render(<PriceDisplay amount={1000} showTax />);
      
      expect(screen.getByText('￥1,100')).toBeInTheDocument();
      expect(screen.getByText('（税込）')).toBeInTheDocument();
    });

    it('税込み表示がオフ（デフォルト）の場合、税抜き金額を表示する', () => {
      render(<PriceDisplay amount={1000} />);
      
      expect(screen.getByText('￥1,000')).toBeInTheDocument();
      expect(screen.queryByText('（税込）')).not.toBeInTheDocument();
    });

    it('カスタム税率が適用される', () => {
      render(<PriceDisplay amount={1000} showTax taxRate={0.08} />);
      
      expect(screen.getByText('￥1,080')).toBeInTheDocument();
    });

    it('税率0%の場合も正しく計算される', () => {
      render(<PriceDisplay amount={1000} showTax taxRate={0} />);
      
      expect(screen.getByText('￥1,000')).toBeInTheDocument();
    });

    it('高い税率も正しく計算される', () => {
      render(<PriceDisplay amount={1000} showTax taxRate={0.2} />);
      
      expect(screen.getByText('￥1,200')).toBeInTheDocument();
    });
  });

  describe('内訳表示', () => {
    it('内訳表示がオンで税込みの場合、税抜き・消費税を表示する', () => {
      render(<PriceDisplay amount={1000} showTax showBreakdown />);
      
      expect(screen.getByText('税抜: ￥1,000')).toBeInTheDocument();
      expect(screen.getByText('消費税: ￥100')).toBeInTheDocument();
    });

    it('内訳表示がオンでも税込み表示がオフなら内訳を表示しない', () => {
      render(<PriceDisplay amount={1000} showBreakdown />);
      
      expect(screen.queryByText('税抜:')).not.toBeInTheDocument();
      expect(screen.queryByText('消費税:')).not.toBeInTheDocument();
    });

    it('内訳表示でカスタム税率が適用される', () => {
      render(<PriceDisplay amount={1000} showTax showBreakdown taxRate={0.08} />);
      
      expect(screen.getByText('税抜: ￥1,000')).toBeInTheDocument();
      expect(screen.getByText('消費税: ￥80')).toBeInTheDocument();
    });

    it('内訳表示でUSDが正しく表示される', () => {
      render(<PriceDisplay amount={1000} showTax showBreakdown currency="USD" />);
      
      expect(screen.getByText('税抜: $1,000')).toBeInTheDocument();
      expect(screen.getByText('消費税: $100')).toBeInTheDocument();
    });
  });

  describe('サイズ', () => {
    it('デフォルト（md）サイズのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} />);
      
      const priceElement = container.querySelector('.text-lg');
      expect(priceElement).toBeInTheDocument();
    });

    it('smallサイズのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} size="sm" />);
      
      const priceElement = container.querySelector('.text-sm');
      expect(priceElement).toBeInTheDocument();
    });

    it('largeサイズのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} size="lg" />);
      
      const priceElement = container.querySelector('.text-xl');
      expect(priceElement).toBeInTheDocument();
    });

    it('xlサイズのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} size="xl" />);
      
      const priceElement = container.querySelector('.text-2xl');
      expect(priceElement).toBeInTheDocument();
    });
  });

  describe('バリアント（色）', () => {
    it('デフォルトバリアントのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} />);
      
      const priceElement = container.querySelector('.text-gray-900');
      expect(priceElement).toBeInTheDocument();
    });

    it('primaryバリアントのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} variant="primary" />);
      
      const priceElement = container.querySelector('.text-blue-600');
      expect(priceElement).toBeInTheDocument();
    });

    it('successバリアントのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} variant="success" />);
      
      const priceElement = container.querySelector('.text-green-600');
      expect(priceElement).toBeInTheDocument();
    });

    it('warningバリアントのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} variant="warning" />);
      
      const priceElement = container.querySelector('.text-yellow-600');
      expect(priceElement).toBeInTheDocument();
    });

    it('errorバリアントのクラスが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} variant="error" />);
      
      const priceElement = container.querySelector('.text-red-600');
      expect(priceElement).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} className="custom-price" />);
      
      expect(container.firstChild).toHaveClass('custom-price');
    });

    it('空のclassNameが適用される', () => {
      const { container } = render(<PriceDisplay amount={1000} className="" />);
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('複合設定', () => {
    it('すべての設定が同時に適用される', () => {
      const { container } = render(
        <PriceDisplay
          amount={5000}
          currency="USD"
          showTax
          taxRate={0.08}
          size="lg"
          variant="success"
          showBreakdown
          className="custom-complex-price"
        />
      );
      
      expect(screen.getByText('$5,400')).toBeInTheDocument();
      expect(screen.getByText('（税込）')).toBeInTheDocument();
      expect(screen.getByText('税抜: $5,000')).toBeInTheDocument();
      expect(screen.getByText('消費税: $400')).toBeInTheDocument();
      
      const priceElement = container.querySelector('.text-xl.text-green-600');
      expect(priceElement).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('custom-complex-price');
    });
  });

  describe('エッジケース', () => {
    it('非常に大きな金額を正しく処理する', () => {
      render(<PriceDisplay amount={999999999} />);
      
      expect(screen.getByText('￥999,999,999')).toBeInTheDocument();
    });

    it('小数点を含む金額の税計算が正しく丸められる', () => {
      render(<PriceDisplay amount={100.7} showTax />);
      
      expect(screen.getByText('￥111')).toBeInTheDocument();
    });

    it('税額計算で四捨五入が正しく行われる', () => {
      render(<PriceDisplay amount={105} showTax showBreakdown />);
      
      expect(screen.getByText('消費税: ￥11')).toBeInTheDocument();
    });
  });
});

describe('PriceComparison', () => {
  describe('基本機能', () => {
    it('元の価格と割引後価格を表示する', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={800} />);
      
      expect(screen.getByText('￥1,000')).toBeInTheDocument();
      expect(screen.getByText('￥800')).toBeInTheDocument();
    });

    it('元の価格が取り消し線で表示される', () => {
      const { container } = render(<PriceComparison originalPrice={1000} discountedPrice={800} />);
      
      const originalPriceElement = container.querySelector('.line-through');
      expect(originalPriceElement).toBeInTheDocument();
      expect(originalPriceElement).toHaveTextContent('￥1,000');
    });

    it('割引金額と割引率が表示される', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={800} />);
      
      expect(screen.getByText('￥200お得 (20%OFF)')).toBeInTheDocument();
    });
  });

  describe('通貨対応', () => {
    it('USD表示が正しく動作する', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={800} currency="USD" />);
      
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('$800')).toBeInTheDocument();
      expect(screen.getByText('$200お得 (20%OFF)')).toBeInTheDocument();
    });

    it('JPY（デフォルト）表示が正しく動作する', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={800} currency="JPY" />);
      
      expect(screen.getByText('￥1,000')).toBeInTheDocument();
      expect(screen.getByText('￥800')).toBeInTheDocument();
      expect(screen.getByText('￥200お得 (20%OFF)')).toBeInTheDocument();
    });
  });

  describe('サイズ対応', () => {
    it('デフォルト（md）サイズが適用される', () => {
      const { container } = render(<PriceComparison originalPrice={1000} discountedPrice={800} />);
      
      const priceElement = container.querySelector('.text-lg');
      expect(priceElement).toBeInTheDocument();
    });

    it('smallサイズが適用される', () => {
      const { container } = render(<PriceComparison originalPrice={1000} discountedPrice={800} size="sm" />);
      
      const priceElement = container.querySelector('.text-sm');
      expect(priceElement).toBeInTheDocument();
    });

    it('largeサイズが適用される', () => {
      const { container } = render(<PriceComparison originalPrice={1000} discountedPrice={800} size="lg" />);
      
      const priceElement = container.querySelector('.text-xl');
      expect(priceElement).toBeInTheDocument();
    });
  });

  describe('割引率計算', () => {
    it('50%割引が正しく計算される', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={500} />);
      
      expect(screen.getByText('￥500お得 (50%OFF)')).toBeInTheDocument();
    });

    it('10%割引が正しく計算される', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={900} />);
      
      expect(screen.getByText('￥100お得 (10%OFF)')).toBeInTheDocument();
    });

    it('1%未満の割引が0%で表示される', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={999} />);
      
      expect(screen.getByText('￥1お得 (0%OFF)')).toBeInTheDocument();
    });

    it('割引率が四捨五入される', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={834} />);
      
      expect(screen.getByText('￥166お得 (17%OFF)')).toBeInTheDocument();
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <PriceComparison originalPrice={1000} discountedPrice={800} className="custom-comparison" />
      );
      
      expect(container.firstChild).toHaveClass('custom-comparison');
    });
  });

  describe('エッジケース', () => {
    it('割引なし（同じ価格）の場合', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={1000} />);
      
      expect(screen.getByText('￥0お得 (0%OFF)')).toBeInTheDocument();
    });

    it('価格上昇（負の割引）の場合', () => {
      render(<PriceComparison originalPrice={800} discountedPrice={1000} />);
      
      expect(screen.getByText('-￥200お得 (-25%OFF)')).toBeInTheDocument();
    });

    it('非常に大きな割引率', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={10} />);
      
      expect(screen.getByText('￥990お得 (99%OFF)')).toBeInTheDocument();
    });

    it('ゼロ価格への割引', () => {
      render(<PriceComparison originalPrice={1000} discountedPrice={0} />);
      
      expect(screen.getByText('￥1,000お得 (100%OFF)')).toBeInTheDocument();
    });
  });

  describe('複合設定', () => {
    it('すべての設定が同時に適用される', () => {
      const { container } = render(
        <PriceComparison
          originalPrice={5000}
          discountedPrice={3000}
          currency="USD"
          size="lg"
          className="custom-complex-comparison"
        />
      );
      
      expect(screen.getByText('$5,000')).toBeInTheDocument();
      expect(screen.getByText('$3,000')).toBeInTheDocument();
      expect(screen.getByText('$2,000お得 (40%OFF)')).toBeInTheDocument();
      
      const priceElement = container.querySelector('.text-xl');
      expect(priceElement).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('custom-complex-comparison');
    });
  });
});

describe('PriceRange', () => {
  describe('基本機能', () => {
    it('価格範囲を表示する', () => {
      render(<PriceRange minPrice={1000} maxPrice={2000} />);
      
      expect(screen.getByText('￥1,000 〜 ￥2,000')).toBeInTheDocument();
    });

    it('同じ最小・最大価格でも表示される', () => {
      render(<PriceRange minPrice={1000} maxPrice={1000} />);
      
      expect(screen.getByText('￥1,000 〜 ￥1,000')).toBeInTheDocument();
    });
  });

  describe('通貨対応', () => {
    it('JPY（デフォルト）表示が正しく動作する', () => {
      render(<PriceRange minPrice={1000} maxPrice={2000} currency="JPY" />);
      
      expect(screen.getByText('￥1,000 〜 ￥2,000')).toBeInTheDocument();
    });

    it('USD表示が正しく動作する', () => {
      render(<PriceRange minPrice={1000} maxPrice={2000} currency="USD" />);
      
      expect(screen.getByText('$1,000 〜 $2,000')).toBeInTheDocument();
    });
  });

  describe('サイズ対応', () => {
    it('デフォルト（md）サイズのクラスが適用される', () => {
      const { container } = render(<PriceRange minPrice={1000} maxPrice={2000} />);
      
      const rangeElement = container.querySelector('.text-lg');
      expect(rangeElement).toBeInTheDocument();
    });

    it('smallサイズのクラスが適用される', () => {
      const { container } = render(<PriceRange minPrice={1000} maxPrice={2000} size="sm" />);
      
      const rangeElement = container.querySelector('.text-sm');
      expect(rangeElement).toBeInTheDocument();
    });

    it('largeサイズのクラスが適用される', () => {
      const { container } = render(<PriceRange minPrice={1000} maxPrice={2000} size="lg" />);
      
      const rangeElement = container.querySelector('.text-xl');
      expect(rangeElement).toBeInTheDocument();
    });
  });

  describe('スタイル', () => {
    it('基本的なスタイルクラスが適用される', () => {
      const { container } = render(<PriceRange minPrice={1000} maxPrice={2000} />);
      
      const rangeElement = container.firstChild;
      expect(rangeElement).toHaveClass('font-bold', 'text-gray-900');
    });
  });

  describe('カスタムクラス', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <PriceRange minPrice={1000} maxPrice={2000} className="custom-range" />
      );
      
      expect(container.firstChild).toHaveClass('custom-range');
    });

    it('空のclassNameが適用される', () => {
      const { container } = render(<PriceRange minPrice={1000} maxPrice={2000} className="" />);
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('ゼロ価格範囲', () => {
      render(<PriceRange minPrice={0} maxPrice={0} />);
      
      expect(screen.getByText('￥0 〜 ￥0')).toBeInTheDocument();
    });

    it('負の価格範囲', () => {
      render(<PriceRange minPrice={-1000} maxPrice={-500} />);
      
      expect(screen.getByText('-￥1,000 〜 -￥500')).toBeInTheDocument();
    });

    it('非常に大きな価格範囲', () => {
      render(<PriceRange minPrice={1000000} maxPrice={9999999} />);
      
      expect(screen.getByText('￥1,000,000 〜 ￥9,999,999')).toBeInTheDocument();
    });

    it('逆転した価格範囲（最小 > 最大）', () => {
      render(<PriceRange minPrice={2000} maxPrice={1000} />);
      
      expect(screen.getByText('￥2,000 〜 ￥1,000')).toBeInTheDocument();
    });
  });

  describe('複合設定', () => {
    it('すべての設定が同時に適用される', () => {
      const { container } = render(
        <PriceRange
          minPrice={10000}
          maxPrice={50000}
          currency="USD"
          size="lg"
          className="custom-complex-range"
        />
      );
      
      expect(screen.getByText('$10,000 〜 $50,000')).toBeInTheDocument();
      
      const rangeElement = container.firstChild;
      expect(rangeElement).toHaveClass('text-xl', 'font-bold', 'text-gray-900', 'custom-complex-range');
    });
  });
});