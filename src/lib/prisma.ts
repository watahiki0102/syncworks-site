import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // 開発時はエラーのみログ出力（クエリログを減らして接続負荷を軽減）
  log: ['error', 'warn'],
  // datasources: 接続プールはDATABASE_URLのパラメータで制御
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
