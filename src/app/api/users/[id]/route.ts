import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users/[id]
 * 特定のユーザーを取得
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.users.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('[GET /api/users/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * ユーザー情報を更新
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // ユーザーの存在確認
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（自分以外）
    if (body.email && body.email !== existingUser.email) {
      const duplicateUser = await prisma.users.findUnique({
        where: { email: body.email },
      });

      if (duplicateUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already exists',
          },
          { status: 409 }
        );
      }
    }

    // 更新データの準備
    const updateData: Record<string, unknown> = {};

    // 更新可能なフィールド
    const allowedFields = [
      'email',
      'password_hash',
      'role',
      'display_name',
      'phone_number',
      'is_active',
      'email_verified',
      'email_verified_at',
      'last_login_at',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'email_verified_at' || field === 'last_login_at') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // ユーザー情報を更新
    const user = await prisma.users.update({
      where: { id },
      data: updateData,
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
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('[PUT /api/users/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * ユーザーを削除（論理削除: is_active = false）
 * 注意: 物理削除は外部キー制約により制限される可能性があるため、
 * 通常はis_activeをfalseに設定することを推奨
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ユーザーの存在確認
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // 外部キー制約を考慮して、まずis_activeをfalseに設定
    // 物理削除が必要な場合は、関連データを先に削除する必要がある
    await prisma.users.update({
      where: { id },
      data: {
        is_active: false,
      },
    });

    // 物理削除を試行（外部キー制約により失敗する可能性がある）
    try {
      await prisma.users.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (deleteError) {
      // 外部キー制約により削除できない場合は、論理削除のみ実行
      console.warn('[DELETE /api/users/[id]] Physical delete failed, user is deactivated:', deleteError);
      return NextResponse.json({
        success: true,
        message: 'User deactivated successfully (cannot delete due to foreign key constraints)',
        data: { id, is_active: false },
      });
    }
  } catch (error) {
    console.error('[DELETE /api/users/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

