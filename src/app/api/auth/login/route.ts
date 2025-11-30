import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordManager } from '@/lib/security';

/**
 * POST /api/auth/login
 * ユーザーログイン認証
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 必須フィールドの検証
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // ユーザーを取得（password_hashも含める）
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        role: true,
        display_name: true,
        phone_number: true,
        is_active: true,
        email_verified: true,
        email_verified_at: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
      },
    });

    // ユーザーが存在しない、または無効な場合
    if (!user || !user.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // パスワード検証
    const isPasswordValid = await PasswordManager.verify(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // ログイン成功: last_login_atを更新
    await prisma.users.update({
      where: { id: user.id },
      data: {
        last_login_at: new Date(),
      },
    });

    // レスポンス（password_hashは含めない）
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        ...userWithoutPassword,
        last_login_at: new Date().toISOString(),
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

