import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 20 }: StarRatingProps) {
  const stars = [];
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
