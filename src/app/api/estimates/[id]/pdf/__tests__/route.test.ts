/**
 * /api/estimates/[id]/pdf/route.ts のテスト
 * カバレッジ目標: 100%
 */

// Next.js環境をモック
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data: any, init?: any) => ({
      status: init?.status || 200,
      headers: init?.headers || {},
      json: () => Promise.resolve(data),
    })),
  },
}));

// PDFkitをモック  
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    end: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
  }));
});

import { GET } from '../route';

describe('PDF見積書生成API', () => {
  it('正常にPDF生成処理を呼び出せる', async () => {
    const mockRequest = {} as any;
    const params = Promise.resolve({ id: 'test-id' });
    
    const response = await GET(mockRequest, { params });
    
    expect(response).toBeDefined();
  });
});