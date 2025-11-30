import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users
 * ユーザー一覧を取得
 * クエリパラメータ:
 *   - role: 特定のロールのユーザーのみ取得
 *   - is_active: アクティブユーザーのみ取得（true/false）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('is_active');

    // フィルタ条件を構築
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== null) {
      where.is_active = isActive === 'true';
    }

    const users = await prisma.users.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
      // セキュリティ: password_hashは返さない
      select: {
        id: true,
        email: true,
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

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * 新規ユーザーを作成
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 必須フィールドの検証
    const requiredFields = ['email', 'password_hash', 'role'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.users.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already exists',
        },
        { status: 409 }
      );
    }

    // ユーザーを作成
    const user = await prisma.users.create({
      data: {
        email: body.email,
        password_hash: body.password_hash,
        role: body.role,
        display_name: body.display_name || null,
        phone_number: body.phone_number || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        email_verified: body.email_verified !== undefined ? body.email_verified : false,
        email_verified_at: body.email_verified_at ? new Date(body.email_verified_at) : null,
      },
      // セキュリティ: password_hashは返さない
      select: {
        id: true,
        email: true,
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

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/users] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

