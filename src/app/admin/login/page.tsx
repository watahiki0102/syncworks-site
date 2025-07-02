'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // デモ用認証
            if (email === 'admin@example.com' && password === 'password123') {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
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

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
            <div className="w-full max-w-md space-y-8">
                {/* 既存アカウント用 */}
                <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center mb-6">
                    {/* サービス名 */}
                    <div className="flex space-x-2 mb-4">
                        <span className="text-xl font-bold text-blue-700">事業者管理画面</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">事業者アカウントをお持ちの方</h2>
                    <p className="text-sm text-gray-600 mb-6 text-center">アカウントをお持ちの方はログインしてください。</p>
                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
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
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">パスワード</label>
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
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute inset-y-0 right-2 flex items-center text-xl text-gray-500 focus:outline-none"
                                    aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                                >
                                    {showPassword ? '🔓' : '🔒'}
                                </button>
                            </div>
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'ログイン中...' : 'ログイン'}
                        </button>
                        <div className="text-xs text-gray-400 text-center mt-2">サンプル: admin@example.com / password123</div>
                    </form>
                </div>
                {/* 新規登録用 */}
                <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">アカウントをお持ちでない方</h2>
                    <p className="text-sm text-gray-600 mb-6 text-center">ご利用にはアカウント登録が必要です。お持ちでない方は新規登録（無料）をしてください。</p>
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