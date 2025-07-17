/**
 * 星評価コンポーネント
 * - 5段階評価の視覚的表示
 * - 部分的な星の塗りつぶし対応
 */
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;  // 評価値（0-5）
  size?: number;   // 星のサイズ（デフォルト: 20px）
}

export default function StarRating({ rating, size = 20 }: StarRatingProps) {
  const stars = [];
  
  /**
   * 5つの星を生成し、評価値に応じて塗りつぶし率を計算
   */
  for (let i = 1; i <= 5; i++) {
    const fillPercentage = Math.min(Math.max(rating - i + 1, 0), 1) * 100;
    stars.push(
      <div key={i} className="relative inline-block" style={{ width: size, height: size }}>
        {/* 背景（空の星） */}
        <Star style={{ width: size, height: size }} className="text-gray-300" />
        {/* 前景（黄色の星） */}
        <Star
          style={{
            width: size,
            height: size,
            position: 'absolute',
            top: 0,
            left: 0,
            clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
          }}
          className="text-yellow-500 fill-yellow-500"
        />
      </div>
    );
  }
  
  return <div className="flex items-center">{stars}</div>;
}
