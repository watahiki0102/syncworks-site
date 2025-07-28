/**
 * 統一されたタイポグラフィコンポーネント
 * - 見出し（H1-H6）
 * - テキスト（本文、リード、小さなテキスト）
 * - 一貫したスタイリング
 */
import React, { HTMLAttributes } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type TextVariant = 'body' | 'lead' | 'small' | 'muted';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  size?: TextSize;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
  gradient?: boolean;
}

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  size?: TextSize;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';
  as?: 'p' | 'span' | 'div';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({
    level,
    size,
    weight = 'bold',
    color = 'default',
    gradient = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    const getDefaultSize = (level: HeadingLevel): TextSize => {
      switch (level) {
        case 1: return '4xl';
        case 2: return '3xl';
        case 3: return '2xl';
        case 4: return 'xl';
        case 5: return 'lg';
        case 6: return 'base';
        default: return 'base';
      }
    };

    const getSizeClasses = (size: TextSize): string => {
      switch (size) {
        case 'xs': return 'text-xs';
        case 'sm': return 'text-sm';
        case 'base': return 'text-base';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case '3xl': return 'text-3xl';
        case '4xl': return 'text-4xl';
        case '5xl': return 'text-5xl';
        default: return 'text-base';
      }
    };

    const getWeightClasses = (weight: string): string => {
      switch (weight) {
        case 'normal': return 'font-normal';
        case 'medium': return 'font-medium';
        case 'semibold': return 'font-semibold';
        case 'bold': return 'font-bold';
        default: return 'font-normal';
      }
    };

    const getColorClasses = (color: string): string => {
      switch (color) {
        case 'muted': return 'text-gray-600';
        case 'primary': return 'text-blue-600';
        case 'success': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-gray-900';
      }
    };

    const classes = [
      getSizeClasses(size || getDefaultSize(level)),
      getWeightClasses(weight),
      gradient ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : getColorClasses(color),
      'leading-tight',
      className
    ].filter(Boolean).join(' ');

    return React.createElement(
      Tag,
      {
        ref: ref as React.Ref<HTMLHeadingElement>,
        className: classes,
        ...props
      },
      children
    );
  }
);

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({
    variant = 'body',
    size,
    weight = 'normal',
    color = 'default',
    as = 'p',
    className = '',
    children,
    ...props
  }, ref) => {
    const getDefaultSize = (variant: TextVariant): TextSize => {
      switch (variant) {
        case 'lead': return 'lg';
        case 'small': return 'sm';
        case 'muted': return 'sm';
        default: return 'base';
      }
    };

    const getVariantClasses = (variant: TextVariant): string => {
      switch (variant) {
        case 'lead':
          return 'leading-relaxed';
        case 'small':
          return 'leading-normal';
        case 'muted':
          return 'text-gray-500 leading-normal';
        default:
          return 'leading-normal';
      }
    };

    const getSizeClasses = (size: TextSize): string => {
      switch (size) {
        case 'xs': return 'text-xs';
        case 'sm': return 'text-sm';
        case 'base': return 'text-base';
        case 'lg': return 'text-lg';
        case 'xl': return 'text-xl';
        case '2xl': return 'text-2xl';
        case '3xl': return 'text-3xl';
        case '4xl': return 'text-4xl';
        case '5xl': return 'text-5xl';
        default: return 'text-base';
      }
    };

    const getWeightClasses = (weight: string): string => {
      switch (weight) {
        case 'normal': return 'font-normal';
        case 'medium': return 'font-medium';
        case 'semibold': return 'font-semibold';
        case 'bold': return 'font-bold';
        default: return 'font-normal';
      }
    };

    const getColorClasses = (color: string): string => {
      if (variant === 'muted') return '';
      
      switch (color) {
        case 'muted': return 'text-gray-600';
        case 'primary': return 'text-blue-600';
        case 'success': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-gray-900';
      }
    };

    const classes = [
      getSizeClasses(size || getDefaultSize(variant)),
      getWeightClasses(weight),
      getColorClasses(color),
      getVariantClasses(variant),
      className
    ].filter(Boolean).join(' ');

    return React.createElement(
      as,
      {
        ref,
        className: classes,
        ...props
      },
      children
    );
  }
);

Heading.displayName = 'Heading';
Text.displayName = 'Text';

export { Heading, Text };
export type { HeadingProps, TextProps };
export default { Heading, Text }; 