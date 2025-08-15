import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 一時的なIDを生成
    const tempId = `temp_${Date.now()}`;
    
    // 実際の実装では、データベースや一時ストレージに保存
    // ここではローカルストレージに保存することを想定
    
    return NextResponse.json({
      id: tempId,
      message: '一時保存が完了しました',
      data: body
    });
  } catch (error) {
    console.error('一時保存エラー:', error);
    return NextResponse.json(
      { error: '一時保存に失敗しました' },
      { status: 500 }
    );
  }
}
