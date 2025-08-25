/**
 * 管理者ログインページコンポーネント
 * - 事業者アカウントのログイン機能
 * - デモ用認証（admin@example.com / password123）
 * - 新規登録ページへの誘導
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // ページ読み込み時に自動ログイン状態をチェック
    useEffect(() => {
        const rememberMe = localStorage.getItem('adminRememberMe');
        const autoLoginExpiry = localStorage.getItem('adminAutoLoginExpiry');
        
        if (rememberMe === 'true' && autoLoginExpiry) {
            const expiryDate = new Date(autoLoginExpiry);
            const now = new Date();
            
            if (now < expiryDate) {
                // 有効期限内の場合、自動ログインを有効にする
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', 'admin@example.com'); // デモ用
                router.push('/admin/dashboard');
            } else {
                // 有効期限切れの場合、自動ログイン情報を削除
                localStorage.removeItem('adminAutoLoginExpiry');
                localStorage.removeItem('adminRememberMe');
            }
        }
    }, [router]);

    /**
     * ログインフォーム送信時の処理
     * @param e - フォームイベント
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            // デモ用認証
            if (email === 'admin@example.com' && password === 'password123') {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
                
                // 自動ログイン機能
                if (rememberMe) {
                    const oneWeekFromNow = new Date();
                    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
                    localStorage.setItem('adminAutoLoginExpiry', oneWeekFromNow.toISOString());
                    localStorage.setItem('adminRememberMe', 'true');
                } else {
                    // 自動ログインを無効にする
                    localStorage.removeItem('adminAutoLoginExpiry');
                    localStorage.removeItem('adminRememberMe');
                }
                
                router.push('/admin/dashboard');
            } else {
                setError('メールアドレスまたはパスワードが正しくありません');
            }
        } catch (err) {
            setError('ログインに失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * パスワード表示/非表示を切り替え
     */
    const togglePasswordVisibility = () => {
        setShowPassword(v => !v);
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
            <div className="w-full max-w-md space-y-8">
                {/* 既存アカウント用 */}
                <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center mb-6">
                    {/* サービス名 */}
                    <div className="flex space-x-2 mb-4">
                        <span className="text-xl font-bold text-blue-700">事業者管理画面</span>
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2">事業者アカウントをお持ちの方</h2>
                    <p className="text-sm text-gray-800 mb-6 text-center">アカウントをお持ちの方はログインしてください。</p>
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">メールアドレス</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">パスワード</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                                    placeholder="パスワードを入力"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-2 flex items-center text-xl text-gray-500 focus:outline-none min-w-[44px] min-h-[44px]"
                                    aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                                >
                                    {showPassword ? '👁️' : ' 🙈'}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                ログイン情報保持（1週間）
                            </label>
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'ログイン中...' : 'ログイン'}
                        </button>
                        <div className="text-xs text-gray-700 text-center mt-2">サンプル: admin@example.com / password123</div>
                    </form>
                </div>
                {/* 新規登録用 */}
                <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 mb-2">アカウントをお持ちでない方</h2>
                    <p className="text-sm text-gray-800 mb-6 text-center">ご利用にはアカウント登録が必要です。お持ちでない方は新規登録（無料）をしてください。</p>
                    <button
                        className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-orange-700 transition text-lg"
                        onClick={() => router.push('/admin/register')}
                    >
                        新規会員登録
                    </button>
                </div>
                <div className="mt-15 flex justify-center">
                    <button
                        className="text-center w-1/2 bg-gray-500 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-600 transition text-lg"
                        onClick={() => router.push('/')}
                    >
                        戻る
                    </button>
                </div>
            </div>
        </main>
    );
} 