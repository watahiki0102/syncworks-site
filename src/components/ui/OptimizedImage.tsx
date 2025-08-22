/**
 * 最適化された画像コンポーネント
 * Next.js Imageを拡張し、よく使われるパターンを簡単に利用できるようにする
 */
'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad' | 'placeholder'> {
  /** フォールバック画像のURL */
  fallbackSrc?: string;
  /** ローディング中に表示するプレースホルダー */
  placeholder?: 'blur' | 'empty' | 'skeleton';
  /** スケルトンローダーの色 */
  skeletonColor?: string;
  /** エラー時のコールバック */
  onError?: (error: Error) => void;
  /** ロード完了時のコールバック */
  onLoad?: () => void;
  /** 追加のCSS クラス */
  className?: string;
  /** 画像の説明（アクセシビリティ用） */
  alt: string;
}

/**
 * スケルトンローダーコンポーネント
 */
const SkeletonLoader: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
  color?: string;
}> = ({ width, height, className = '', color = '#e5e7eb' }) => (
  <div
    className={`animate-pulse bg-gray-200 ${className}`}
    style={{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      backgroundColor: color
    }}
  />
);

/**
 * 最適化された画像コンポーネント
 * エラーハンドリング、ローディング状態、フォールバック画像などの機能を提供
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  fallbackSrc = '/images/placeholder.png',
  placeholder = 'skeleton',
  skeletonColor,
  onError,
  onLoad,
  className = '',
  alt,
  width,
  height,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false); // フォールバック画像でリトライ
    } else {
      setHasError(true);
    }
    setIsLoading(false);
    
    if (onError) {
      onError(new Error(`Failed to load image: ${src}`));
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    
    if (onLoad) {
      onLoad();
    }
  };

  // エラー時の表示
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height
        }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* ローディング中のプレースホルダー */}
      {isLoading && placeholder === 'skeleton' && (
        <SkeletonLoader
          width={width}
          height={height}
          className="absolute inset-0 z-10"
          color={skeletonColor}
        />
      )}
      
      {/* 実際の画像 */}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}
        {...props}
      />
    </div>
  );
};

/**
 * アバター画像コンポーネント
 * ユーザーアバターなどに特化した画像表示
 */
export const AvatarImage: React.FC<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackInitials?: string;
  className?: string;
}> = ({
  src,
  alt,
  size = 'md',
  fallbackInitials,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };

  const sizeValues = {
    sm: 32,
    md: 40,
    lg: 64,
    xl: 96
  };

  const currentSizeClass = sizeClasses[size];
  const currentSizeValue = sizeValues[size];

  if (!src) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-full bg-gray-300 text-gray-600 font-medium
          ${currentSizeClass} ${className}
        `}
      >
        {fallbackInitials || '?'}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={currentSizeValue}
      height={currentSizeValue}
      className={`rounded-full object-cover ${currentSizeClass} ${className}`}
      fallbackSrc="/images/default-avatar.png"
    />
  );
};

/**
 * カード画像コンポーネント
 * カードレイアウト内で使用する画像に特化
 */
export const CardImage: React.FC<{
  src: string;
  alt: string;
  aspectRatio?: 'square' | '4:3' | '16:9' | '3:2';
  className?: string;
}> = ({
  src,
  alt,
  aspectRatio = '16:9',
  className = ''
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-[16/9]',
    '3:2': 'aspect-[3/2]'
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

export default OptimizedImage;