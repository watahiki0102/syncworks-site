import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/companies/by-email?email=xxx
 * メールアドレスから会社情報を取得（localStorage auth用）
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        // ユーザーを検索
        const user = await prisma.users.findUnique({
            where: { email },
            include: {
                moving_companies: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                email: true,
                                display_name: true,
                                phone_number: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // ユーザーに紐付く会社を取得
        const company = user.moving_companies;

        if (!company || company.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No company found for this user' },
                { status: 404 }
            );
        }

        // 複数会社がある場合は最初の1つを返す
        return NextResponse.json({
            success: true,
            data: company[0],
        });
    } catch (error) {
        console.error('[GET /api/companies/by-email] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch company' },
            { status: 500 }
        );
    }
}
