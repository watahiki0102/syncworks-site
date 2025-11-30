/**
 * ユーザーAPI route.ts のテスト
 */

import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

// Prismaをモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
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

describe('GET /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ユーザー一覧を取得できる', async () => {
    const mockFindMany = prisma.users.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockUser]);

    const request = new MockNextRequest('http://localhost:3000/api/users') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.count).toBe(1);
    expect(mockFindMany).toHaveBeenCalled();
  });

  it('roleでフィルタリングできる', async () => {
    const mockFindMany = prisma.users.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockUser]);

    const request = new MockNextRequest('http://localhost:3000/api/users?role=admin') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.role).toBe('admin');
  });

  it('is_activeでフィルタリングできる', async () => {
    const mockFindMany = prisma.users.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockUser]);

    const request = new MockNextRequest('http://localhost:3000/api/users?is_active=true') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.is_active).toBe(true);
  });

  it('password_hashがレスポンスに含まれない', async () => {
    const mockFindMany = prisma.users.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockUser]);

    const request = new MockNextRequest('http://localhost:3000/api/users') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0]).not.toHaveProperty('password_hash');
    
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.select).toBeDefined();
    expect(callArgs.select.password_hash).toBeUndefined();
  });

  it('エラー時に適切なエラーレスポンスを返す', async () => {
    const mockFindMany = prisma.users.findMany as jest.Mock;
    mockFindMany.mockRejectedValueOnce(new Error('Database error'));

    const request = new MockNextRequest('http://localhost:3000/api/users') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch users');
  });
});

describe('POST /api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('新規ユーザーを作成できる', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockCreate = prisma.users.create as jest.Mock;

    mockFindUnique.mockResolvedValueOnce(null); // 重複なし
    mockCreate.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'admin',
        display_name: 'テストユーザー',
      }),
    }) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.email).toBe('test@example.com');
    expect(mockCreate).toHaveBeenCalled();
  });

  it('必須フィールドが不足している場合エラーを返す', async () => {
    const request = new MockNextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        // password_hashとroleが不足
      }),
    }) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required field');
  });

  it('メールアドレスが重複している場合エラーを返す', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    mockFindUnique.mockResolvedValueOnce(mockUser); // 既存ユーザーが存在

    const request = new MockNextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'admin',
      }),
    }) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email already exists');
  });

  it('password_hashがレスポンスに含まれない', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockCreate = prisma.users.create as jest.Mock;

    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'admin',
      }),
    }) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data).not.toHaveProperty('password_hash');
  });

  it('デフォルト値が正しく設定される', async () => {
    const mockFindUnique = prisma.users.findUnique as jest.Mock;
    const mockCreate = prisma.users.create as jest.Mock;

    mockFindUnique.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(mockUser);

    const request = new MockNextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'admin',
        // is_activeとemail_verifiedを指定しない
      }),
    }) as any;

    await POST(request);

    const createArgs = mockCreate.mock.calls[0][0];
    expect(createArgs.data.is_active).toBe(true);
    expect(createArgs.data.email_verified).toBe(false);
  });
});

