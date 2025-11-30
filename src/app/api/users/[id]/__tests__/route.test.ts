/**
 * ユーザーAPI [id]/route.ts のテスト
 */

import { GET, PUT, DELETE } from '../route';
import { prisma } from '@/lib/prisma';

// Prismaをモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// NextRequestのモック
class MockNextRequest {
  url: string;
  method: string;
  body: string | null = null;

  constructor(url: string, init?: { method?: string; body?: string }) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.body = init?.body || null;
  }

  async json() {
    return this.body ? JSON.parse(this.body) : {};
  }
}

// モックデータ
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'admin',
  display_name: 'テストユーザー',
  phone_number: '090-1234-5678',
  is_active: true,
  email_verified: true,
  email_verified_at: new Date('2024-01-01T00:00:00Z'),
  last_login_at: new Date('2024-01-15T00:00:00Z'),
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-15T00:00:00Z'),
};

const mockParams = { id: 'user-1' };

describe('GET /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('特定のユーザーを取得できる', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    mockFindUnique.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1') as any;
    const response = await GET(request, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('user-1');
    expect(data.data.email).toBe('test@example.com');
  });

  it('ユーザーが存在しない場合404を返す', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    mockFindUnique.mockResolvedValueOnce(null);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-999') as any;
    const response = await GET(request, { params: Promise.resolve({ id: 'user-999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User not found');
  });

  it('password_hashがレスポンスに含まれない', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    mockFindUnique.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1') as any;
    const response = await GET(request, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).not.toHaveProperty('password_hash');
  });
});

describe('PUT /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザー情報を更新できる', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockUpdate = prisma.users.update as jest.Mock;

    mockFindUnique
      .mockResolvedValueOnce(mockUser) // 存在確認
      .mockResolvedValueOnce(null); // メール重複チェック（重複なし）
    mockUpdate.mockResolvedValueOnce({
      ...mockUser,
      display_name: '更新された名前',
    });

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1', {
      method: 'PUT',
      body: JSON.stringify({
        display_name: '更新された名前',
      }),
    }) as any;

    const response = await PUT(request, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.display_name).toBe('更新された名前');
  });

  it('ユーザーが存在しない場合404を返す', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    mockFindUnique.mockResolvedValueOnce(null);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-999', {
      method: 'PUT',
      body: JSON.stringify({
        display_name: '更新された名前',
      }),
    }) as any;

    const response = await PUT(request, { params: Promise.resolve({ id: 'user-999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User not found');
  });

  it('メールアドレスが重複している場合409を返す', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const duplicateUser = { ...mockUser, id: 'user-2' };

    mockFindUnique
      .mockResolvedValueOnce(mockUser) // 存在確認
      .mockResolvedValueOnce(duplicateUser); // メール重複チェック（重複あり）

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1', {
      method: 'PUT',
      body: JSON.stringify({
        email: 'duplicate@example.com',
      }),
    }) as any;

    const response = await PUT(request, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email already exists');
  });

  it('日付フィールドを正しく変換する', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockUpdate = prisma.users.update as jest.Mock;

    mockFindUnique
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(null);
    mockUpdate.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1', {
      method: 'PUT',
      body: JSON.stringify({
        email_verified_at: '2024-01-01T00:00:00Z',
        last_login_at: '2024-01-15T00:00:00Z',
      }),
    }) as any;

    await PUT(request, { params: Promise.resolve(mockParams) });

    const updateArgs = mockUpdate.mock.calls[0][0];
    expect(updateArgs.data.email_verified_at).toBeInstanceOf(Date);
    expect(updateArgs.data.last_login_at).toBeInstanceOf(Date);
  });
});

describe('DELETE /api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザーを削除できる（物理削除成功）', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockUpdate = prisma.users.update as jest.Mock;
    const mockDelete = prisma.users.delete as jest.Mock;

    mockFindUnique.mockResolvedValueOnce(mockUser);
    mockUpdate.mockResolvedValueOnce({ ...mockUser, is_active: false });
    mockDelete.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1', {
      method: 'DELETE',
    }) as any;

    const response = await DELETE(request, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('User deleted successfully');
  });

  it('外部キー制約により物理削除できない場合は論理削除', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockUpdate = prisma.users.update as jest.Mock;
    const mockDelete = prisma.users.delete as jest.Mock;

    mockFindUnique.mockResolvedValueOnce(mockUser);
    mockUpdate.mockResolvedValueOnce({ ...mockUser, is_active: false });
    // 外部キー制約エラーをシミュレート
    mockDelete.mockRejectedValueOnce(new Error('Foreign key constraint'));

    const request = new MockNextRequest('http://localhost:3000/api/users/user-1', {
      method: 'DELETE',
    }) as any;

    const response = await DELETE(request, { params: Promise.resolve(mockParams) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('deactivated');
    expect(data.data.is_active).toBe(false);
  });

  it('ユーザーが存在しない場合404を返す', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    mockFindUnique.mockResolvedValueOnce(null);

    const request = new MockNextRequest('http://localhost:3000/api/users/user-999', {
      method: 'DELETE',
    }) as any;

    const response = await DELETE(request, { params: Promise.resolve({ id: 'user-999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('User not found');
  });
});

