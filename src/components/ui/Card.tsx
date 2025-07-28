/**
 * 統一されたカードコンポーネント
 * - 複数のバリアント（default, minimal, elevated）
 * - ヘッダー、ボディ、フッター対応
 * - ホバー効果オプション
 */
import React, { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'minimal' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className = '',
    variant = 'default',
    hoverable = false,
    padding = 'default',
    children,
    ...props
  }, ref) => {
    const getVariantClasses = (variant: CardVariant): string => {
      switch (variant) {
        case 'minimal':
          return 'card-minimal';
        case 'elevated':
          return 'card-elevated';
        default:
          return 'card';
      }
    };

    const getPaddingClasses = (padding: string): string => {
      switch (padding) {
        case 'none':
          return 'p-0';
        case 'sm':
          return 'p-4';
        case 'lg':
          return 'p-8';
        default:
          return '';
      }
    };

    const classes = [
      getVariantClasses(variant),
      getPaddingClasses(padding),
      hoverable && 'cursor-pointer',
      !hoverable && variant === 'default' && 'hover:transform-none',
      className
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({
    className = '',
    padding = 'default',
    children,
    ...props
  }, ref) => {
    const getPaddingClasses = (padding: string): string => {
      switch (padding) {
        case 'none':
          return 'p-0';
        case 'sm':
          return 'p-4';
        case 'lg':
          return 'p-8';
        default:
          return '';
      }
    };

    const classes = [
      'card-header',
      getPaddingClasses(padding),
      className
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({
    className = '',
    padding = 'default',
    children,
    ...props
  }, ref) => {
    const getPaddingClasses = (padding: string): string => {
      switch (padding) {
        case 'none':
          return 'p-0';
        case 'sm':
          return 'p-4';
        case 'lg':
          return 'p-8';
        default:
          return '';
      }
    };

    const classes = [
      'card-body',
      getPaddingClasses(padding),
      className
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({
    className = '',
    padding = 'default',
    children,
    ...props
  }, ref) => {
    const getPaddingClasses = (padding: string): string => {
      switch (padding) {
        case 'none':
          return 'p-0';
        case 'sm':
          return 'p-4';
        case 'lg':
          return 'p-8';
        default:
          return '';
      }
    };

    const classes = [
      'card-footer',
      getPaddingClasses(padding),
      className
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
export default Card; 