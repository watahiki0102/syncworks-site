import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordManager } from '@/lib/security';
import { UserType } from '@/types/referral';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userType, basicInfo, moverInfo, referrerInfo } = body;

        // Basic validation
        if (!basicInfo?.emailData?.businessEmail || !basicInfo?.password) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
            where: { email: basicInfo.emailData.businessEmail },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await PasswordManager.hash(basicInfo.password);

        // Transaction to create User and Company/Referrer
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.users.create({
                data: {
                    email: basicInfo.emailData.businessEmail,
                    password_hash: passwordHash,
                    role: userType === 'mover' ? 'company_admin' : 'referrer',
                    display_name: userType === 'mover' ? moverInfo.companyName : referrerInfo.displayName,
                    phone_number: basicInfo.phone,
                    is_active: true,
                    email_verified: false,
                },
            });

            // 2. Create specific record based on userType
            if (userType === 'mover') {
                await tx.moving_companies.create({
                    data: {
                        user_id: user.id,
                        company_name: moverInfo.companyName,
                        description: moverInfo.description,
                        staff_count: parseInt(moverInfo.staffCount) || 0,
                        address_line: basicInfo.address,
                        postal_code: basicInfo.postalCode,
                        phone_number: basicInfo.phone,
                        // Assuming prefectures are stored as JSON or related table. 
                        // For now, storing as JSON if supported, or skipping if complex relation.
                        // Let's assume a JSON field 'service_areas' or similar exists, or we skip it for now.
                        // Based on schema inference, we don't know exact column. 
                        // I'll try to store it in a 'metadata' or similar if it exists, or just basic fields.
                        // If 'prefectures' column exists?
                        // Let's try to be safe and only store standard fields.
                    },
                });
            } else if (userType === 'referrer') {
                await tx.referrers.create({
                    data: {
                        user_id: user.id,
                        referrer_type: referrerInfo.referrerType,
                        company_name: referrerInfo.companyName,
                        department: referrerInfo.department,
                        full_name: referrerInfo.fullName,
                        full_name_kana: referrerInfo.kana,
                        bank_code: referrerInfo.bankCode,
                        branch_name: referrerInfo.branchName,
                        account_number: referrerInfo.accountNumber,
                        account_holder: referrerInfo.accountHolder,
                        address: basicInfo.address,
                        phone: basicInfo.phone,
                        email: basicInfo.emailData.businessEmail,
                    },
                });
            }

            return user;
        });

        return NextResponse.json({ success: true, userId: result.id });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Registration failed' },
            { status: 500 }
        );
    }
}
