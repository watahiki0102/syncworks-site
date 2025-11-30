import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/companies/[id]
 * 特定の会社情報を取得
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const company = await prisma.moving_companies.findUnique({
            where: { id },
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
        });

        if (!company) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: company,
        });
    } catch (error) {
        console.error('[GET /api/companies/:id] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch company' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/companies/[id]
 * 会社情報を更新
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        // 会社が存在するか確認
        const existingCompany = await prisma.moving_companies.findUnique({
            where: { id },
            include: { users: true },
        });

        if (!existingCompany) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            );
        }

        // トランザクションで更新
        const result = await prisma.$transaction(async (tx) => {
            // 1. 会社情報を更新
            const updatedCompany = await tx.moving_companies.update({
                where: { id },
                data: {
                    company_name: body.companyName,
                    description: body.description,
                    staff_count: body.staffCount ? parseInt(body.staffCount) : existingCompany.staff_count,
                    phone_number: body.phone,
                    address_line: body.address,
                    postal_code: body.postalCode,
                    // オプションや対応エリアなど、追加フィールドがあれば更新
                    // service_areas: body.selectedPrefectures, // カラムが存在する場合
                },
            });

            // 2. 関連するユーザー情報も更新（メールアドレスなど）
            if (existingCompany.user_id && body.emailData) {
                await tx.users.update({
                    where: { id: existingCompany.user_id },
                    data: {
                        email: body.emailData.businessEmail || undefined,
                        phone_number: body.phone || undefined,
                        display_name: body.companyName || undefined,
                    },
                });
            }

            return updatedCompany;
        });

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Company updated successfully',
        });
    } catch (error) {
        console.error('[PUT /api/companies/:id] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update company' },
            { status: 500 }
        );
    }
}
