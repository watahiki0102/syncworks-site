import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/check
 * 認証状態をチェック
 * ヘッダーからユーザーIDまたはメールアドレスを取得して認証状態を確認
 */
export async function GET(request: Request) {
  try {
    // リクエストヘッダーから認証情報を取得
    const authHeader = request.headers.get('authorization');
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    // 認証情報がない場合
    if (!authHeader && !userId && !userEmail) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: 'No authentication information provided',
        },
        { status: 401 }
      );
    }

    // ユーザーIDまたはメールアドレスでユーザーを検索
    let user = null;
    if (userId) {
      user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          display_name: true,
          is_active: true,
          email_verified: true,
        },
      });
    } else if (userEmail) {
      user = await prisma.users.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          email: true,
          role: true,
          display_name: true,
          is_active: true,
          email_verified: true,
        },
      });
    }

    // ユーザーが存在しない、または無効な場合
    if (!user || !user.is_active) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: 'User not found or inactive',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: user,
    });
  } catch (error) {
    console.error('[GET /api/auth/check] Error:', error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: 'Authentication check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

