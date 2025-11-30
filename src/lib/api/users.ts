/**
 * ユーザーAPI クライアント関数
 */

import { User, UserFromDB, mapUserFromDB, CreateUserInput, UpdateUserInput } from '@/types/user';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

/**
 * ユーザー一覧を取得
 * @param params - クエリパラメータ（role, is_active）
 */
export async function fetchUsers(params?: {
  role?: string;
  is_active?: boolean;
}): Promise<User[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));

    const queryString = searchParams.toString();
    const url = queryString ? `/api/users?${queryString}` : '/api/users';

    const response = await fetch(url);
    const result: ApiResponse<UserFromDB[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users');
    }

    // DBデータをフロントエンド用にマッピング
    const users: User[] = (result.data || []).map((dbUser: UserFromDB) =>
      mapUserFromDB(dbUser)
    );

    return users;
  } catch (error) {
    console.error('[fetchUsers] Error:', error);
    throw error;
  }
}

/**
 * 特定のユーザーを取得
 */
export async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const result: ApiResponse<UserFromDB> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user');
    }

    return mapUserFromDB(result.data!);
  } catch (error) {
    console.error(`[fetchUser] Error:`, error);
    throw error;
  }
}

/**
 * 新規ユーザーを作成
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result: ApiResponse<UserFromDB> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create user');
    }

    return mapUserFromDB(result.data!);
  } catch (error) {
    console.error('[createUser] Error:', error);
    throw error;
  }
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result: ApiResponse<UserFromDB> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update user');
    }

    return mapUserFromDB(result.data!);
  } catch (error) {
    console.error('[updateUser] Error:', error);
    throw error;
  }
}

/**
 * ユーザーを削除（論理削除または物理削除）
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    const result: ApiResponse<void> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user');
    }
  } catch (error) {
    console.error('[deleteUser] Error:', error);
    throw error;
  }
}

