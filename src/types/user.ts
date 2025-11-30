/**
 * ユーザー型定義
 */

/**
 * フロントエンド用のユーザー型
 */
export interface User {
  id: string;
  email: string;
  role: string;
  displayName?: string;
  phoneNumber?: string;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * データベースから取得するユーザーデータの型（Prismaから）
 * 注意: password_hashはセキュリティのため含まれない
 */
export interface UserFromDB {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  email_verified: boolean;
  email_verified_at: Date | string | null;
  last_login_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * ユーザー作成用の入力型
 */
export interface CreateUserInput {
  email: string;
  password_hash: string;
  role: string;
  display_name?: string;
  phone_number?: string;
  is_active?: boolean;
  email_verified?: boolean;
  email_verified_at?: string;
}

/**
 * ユーザー更新用の入力型
 */
export interface UpdateUserInput {
  email?: string;
  password_hash?: string;
  role?: string;
  display_name?: string;
  phone_number?: string;
  is_active?: boolean;
  email_verified?: boolean;
  email_verified_at?: string;
  last_login_at?: string;
}

/**
 * DBデータをフロントエンド用に変換
 */
export function mapUserFromDB(dbUser: UserFromDB): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    displayName: dbUser.display_name || undefined,
    phoneNumber: dbUser.phone_number || undefined,
    isActive: dbUser.is_active,
    emailVerified: dbUser.email_verified,
    emailVerifiedAt: dbUser.email_verified_at
      ? typeof dbUser.email_verified_at === 'string'
        ? dbUser.email_verified_at
        : dbUser.email_verified_at.toISOString()
      : undefined,
    lastLoginAt: dbUser.last_login_at
      ? typeof dbUser.last_login_at === 'string'
        ? dbUser.last_login_at
        : dbUser.last_login_at.toISOString()
      : undefined,
    createdAt:
      typeof dbUser.created_at === 'string'
        ? dbUser.created_at
        : dbUser.created_at.toISOString(),
    updatedAt:
      typeof dbUser.updated_at === 'string'
        ? dbUser.updated_at
        : dbUser.updated_at.toISOString(),
  };
}

/**
 * フロントエンドデータをDB用に変換
 */
export function mapUserToDB(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Omit<CreateUserInput, 'password_hash'> {
  return {
    email: user.email,
    role: user.role,
    display_name: user.displayName,
    phone_number: user.phoneNumber,
    is_active: user.isActive,
    email_verified: user.emailVerified,
    email_verified_at: user.emailVerifiedAt,
  };
}

