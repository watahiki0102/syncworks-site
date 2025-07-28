/**
 * レイアウトコンポーネントのエクスポート
 */

export { Header } from './Header';
export type { HeaderProps, NavigationItem } from './Header';

export { Footer } from './Footer';
export type { FooterProps, FooterSection, FooterLink, ContactInfo } from './Footer';

export { Layout } from './Layout';
export type { LayoutProps } from './Layout';

// デフォルトエクスポート
export { default as HeaderComponent } from './Header';
export { default as FooterComponent } from './Footer';
export { default as LayoutComponent } from './Layout'; 