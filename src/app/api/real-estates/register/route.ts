/**
 * 不動産登録API
 * - 自社登録と紹介登録の両方に対応
 * - ダミー実装（ログ出力）
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json();

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      message: '登録を受け付けました',
      registrationId: `RE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }, { status: 200 });

  } catch (error) {
    console.error('不動産登録エラー:', error);
    
    return NextResponse.json({
      success: false,
      message: '登録処理中にエラーが発生しました'
    }, { status: 500 });
  }
}
