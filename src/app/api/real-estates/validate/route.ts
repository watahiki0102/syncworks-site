/**
 * 不動産登録重複チェックAPI
 * - 免許番号とメールアドレスの重複チェック
 * - ダミー実装（疑似重複チェック）
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { field, value } = await request.json();
    
    // ログ出力
    console.log('重複チェック:', { field, value, timestamp: new Date().toISOString() });
    
    // ダミーの重複チェック（本番ではDB検索）
    let isValid = true;
    let message = '';
    
    if (field === 'licenseNo') {
      // 免許番号の重複チェック（ダミー）
      // 特定の値で重複と判定（テスト用）
      if (value === '1234567890' || value === 'test-license') {
        isValid = false;
        message = 'この免許番号は既に登録されています';
      }
    } else if (field === 'email') {
      // メールアドレスの重複チェック（ダミー）
      // 特定のドメインで重複と判定（テスト用）
      if (value === 'test@example.com' || value.includes('duplicate')) {
        isValid = false;
        message = 'このメールアドレスは既に登録されています';
      }
    }
    
    // レスポンス
    return NextResponse.json({
      isValid,
      message: isValid ? '' : message
    }, { status: 200 });

  } catch (error) {
    console.error('重複チェックエラー:', error);
    
    return NextResponse.json({
      isValid: false,
      message: '重複チェック中にエラーが発生しました'
    }, { status: 500 });
  }
}
