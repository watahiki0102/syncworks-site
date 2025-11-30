/**
 * シフトAPI route.ts のテスト
 * 特に日付フィルタリングのタイムゾーン問題を検証
 */

import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

// Prismaをモック
jest.mock('@/lib/prisma', () => ({
  prisma: {
    shifts: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    employees: {
      findUnique: jest.fn(),
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
const mockEmployee = {
  id: 'employee-1',
  last_name: '山田',
  first_name: '太郎',
  employee_number: 'EMP001',
};

const mockShift = {
  id: 'shift-1',
  employee_id: 'employee-1',
  shift_date: new Date('2024-01-15T12:00:00Z'),
  shift_type: 'regular',
  start_time: new Date('1970-01-01T09:00:00Z'),
  end_time: new Date('1970-01-01T18:00:00Z'),
  break_minutes: 60,
  status: 'scheduled',
  notes: null,
  created_at: new Date(),
  updated_at: new Date(),
  employees: mockEmployee,
};

describe('GET /api/shifts - 日付フィルタリング', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('日付フィルタリングでparseDateStringを使用する（タイムゾーン問題を回避）', async () => {
    const mockFindMany = prisma.shifts.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockShift]);

    // 今日の日付（2024-01-15）でフィルタリング
    const request = new MockNextRequest('http://localhost:3000/api/shifts?start_date=2024-01-15&end_date=2024-01-15') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockFindMany).toHaveBeenCalled();

    // 呼び出し引数を確認
    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where).toBeDefined();
    expect(callArgs.where.shift_date).toBeDefined();

    // parseDateStringが使用されていることを確認（UTC正午で作成される）
    const startDate = callArgs.where.shift_date.gte;
    const endDate = callArgs.where.shift_date.lte;

    // UTC正午で作成されていることを確認
    expect(startDate.getUTCHours()).toBe(12);
    expect(startDate.getUTCMinutes()).toBe(0);
    expect(endDate.getUTCHours()).toBe(12);
    expect(endDate.getUTCMinutes()).toBe(0);
  });

  it('月末の日付（11/30）でフィルタリングしても翌月にならない', async () => {
    const mockFindMany = prisma.shifts.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockShift]);

    // 11月30日でフィルタリング
    const request = new MockNextRequest('http://localhost:3000/api/shifts?start_date=2024-11-30&end_date=2024-11-30') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const callArgs = mockFindMany.mock.calls[0][0];
    const startDate = callArgs.where.shift_date.gte;
    
    // 11月30日のままであることを確認
    expect(startDate.getUTCMonth()).toBe(10); // 0ベースなので10が11月
    expect(startDate.getUTCDate()).toBe(30);
  });

  it('月初の日付（12/1）でフィルタリングしても前月にならない', async () => {
    const mockFindMany = prisma.shifts.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockShift]);

    // 12月1日でフィルタリング
    const request = new MockNextRequest('http://localhost:3000/api/shifts?start_date=2024-12-01&end_date=2024-12-01') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const callArgs = mockFindMany.mock.calls[0][0];
    const startDate = callArgs.where.shift_date.gte;
    
    // 12月1日のままであることを確認
    expect(startDate.getUTCMonth()).toBe(11); // 0ベースなので11が12月
    expect(startDate.getUTCDate()).toBe(1);
  });

  it('年末年始（12/31, 1/1）でフィルタリングしても年がずれない', async () => {
    const mockFindMany = prisma.shifts.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockShift]);

    // 12月31日から1月1日でフィルタリング
    const request = new MockNextRequest('http://localhost:3000/api/shifts?start_date=2024-12-31&end_date=2025-01-01') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const callArgs = mockFindMany.mock.calls[0][0];
    const startDate = callArgs.where.shift_date.gte;
    const endDate = callArgs.where.shift_date.lte;
    
    // 12月31日が2024年のままであることを確認
    expect(startDate.getUTCFullYear()).toBe(2024);
    expect(startDate.getUTCMonth()).toBe(11); // 12月
    expect(startDate.getUTCDate()).toBe(31);

    // 1月1日が2025年のままであることを確認
    expect(endDate.getUTCFullYear()).toBe(2025);
    expect(endDate.getUTCMonth()).toBe(0); // 1月
    expect(endDate.getUTCDate()).toBe(1);
  });

  it('従業員IDでフィルタリングできる', async () => {
    const mockFindMany = prisma.shifts.findMany as jest.Mock;
    mockFindMany.mockResolvedValueOnce([mockShift]);

    const request = new MockNextRequest('http://localhost:3000/api/shifts?employee_id=employee-1') as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const callArgs = mockFindMany.mock.calls[0][0];
    expect(callArgs.where.employee_id).toBe('employee-1');
  });
});

describe('POST /api/shifts - 日付処理', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('今日の日付でシフトを作成しても日付が1日ずれない', async () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD形式

    const mockFindUnique = prisma.employees.findUnique as jest.Mock;
    const mockFindFirst = prisma.shifts.findFirst as jest.Mock;
    const mockCreate = prisma.shifts.create as jest.Mock;

    mockFindUnique.mockResolvedValueOnce(mockEmployee);
    mockFindFirst.mockResolvedValueOnce(null); // 重複なし
    mockCreate.mockResolvedValueOnce({
      ...mockShift,
      shift_date: new Date(`${todayString}T12:00:00Z`),
    });

    const request = new MockNextRequest('http://localhost:3000/api/shifts', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: 'employee-1',
        shift_date: todayString,
        start_time: '09:00',
        end_time: '18:00',
        status: 'scheduled',
      }),
    }) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);

    // parseDateStringが使用されていることを確認
    const createArgs = mockCreate.mock.calls[0][0];
    const savedDate = createArgs.data.shift_date;

    // UTC正午で作成されていることを確認
    expect(savedDate.getUTCHours()).toBe(12);
    expect(savedDate.getUTCMinutes()).toBe(0);
  });
});

