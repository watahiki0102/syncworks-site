/**
 * シーズンルール シードスクリプト
 * 実行方法: node scripts/seed-season-rules.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SEASON_RULES = [
  // 期間指定パターン
  {
    name: "年末年始繁忙期",
    start_date: new Date("2024-12-25"),
    end_date: new Date("2025-01-05"),
    price_type: "percentage",
    price: 25,
    description: "年末年始の繁忙期（最も需要が高い期間）",
    is_recurring: true,
    recurring_type: "yearly",
    recurring_pattern: null,
    priority: 10,
  },
  {
    name: "春の引越しシーズン",
    start_date: new Date("2024-03-01"),
    end_date: new Date("2024-04-30"),
    price_type: "percentage",
    price: 20,
    description: "春の引越しシーズン（新生活スタート時期）",
    is_recurring: true,
    recurring_type: "yearly",
    recurring_pattern: null,
    priority: 20,
  },
  {
    name: "夏の引越しシーズン",
    start_date: new Date("2024-07-01"),
    end_date: new Date("2024-08-31"),
    price_type: "percentage",
    price: 15,
    description: "夏の引越しシーズン（暑い時期の作業加算）",
    is_recurring: true,
    recurring_type: "yearly",
    recurring_pattern: null,
    priority: 30,
  },
  {
    name: "ゴールデンウィーク",
    start_date: new Date("2024-04-29"),
    end_date: new Date("2024-05-05"),
    price_type: "percentage",
    price: 30,
    description: "ゴールデンウィーク期間（連休中の特別料金）",
    is_recurring: true,
    recurring_type: "yearly",
    recurring_pattern: null,
    priority: 5,
  },
  {
    name: "夏季特別料金",
    start_date: new Date("2024-07-15"),
    end_date: new Date("2024-08-15"),
    price_type: "fixed",
    price: 8000,
    description: "真夏の暑い時期の特別料金（熱中症対策等）",
    is_recurring: true,
    recurring_type: "yearly",
    recurring_pattern: null,
    priority: 25,
  },
  {
    name: "閑散期割引",
    start_date: new Date("2024-09-01"),
    end_date: new Date("2024-11-30"),
    price_type: "percentage",
    price: -10,
    description: "秋の閑散期割引（需要が少ない時期の割引）",
    is_recurring: true,
    recurring_type: "yearly",
    recurring_pattern: null,
    priority: 50,
  },
  // 繰り返しパターン - 週単位
  {
    name: "週末割増",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2025-12-31"),
    price_type: "percentage",
    price: 15,
    description: "毎週土日の週末割増料金",
    is_recurring: true,
    recurring_type: "weekly",
    recurring_pattern: { weekdays: [0, 6] },
    priority: 100,
  },
  {
    name: "金曜割増",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2025-12-31"),
    price_type: "percentage",
    price: 10,
    description: "毎週金曜日の割増料金",
    is_recurring: true,
    recurring_type: "weekly",
    recurring_pattern: { weekdays: [5] },
    priority: 110,
  },
  // 繰り返しパターン - 月単位
  {
    name: "月末割増",
    start_date: new Date("2024-01-25"),
    end_date: new Date("2025-12-31"),
    price_type: "fixed",
    price: 3000,
    description: "毎月25日の月末割増",
    is_recurring: true,
    recurring_type: "monthly",
    recurring_pattern: { monthlyPattern: 'date' },
    priority: 120,
  },
  // 特定日付パターン
  {
    name: "特定イベント日",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2025-12-31"),
    price_type: "percentage",
    price: 20,
    description: "地域イベント開催日の特別料金",
    is_recurring: true,
    recurring_type: "specific",
    recurring_pattern: {
      specificDates: [
        "2024-02-14",
        "2024-03-03",
        "2024-05-15",
        "2024-07-07",
        "2024-08-11",
        "2024-10-31",
        "2024-11-23",
        "2025-02-14",
        "2025-03-03"
      ]
    },
    priority: 130,
  },
  {
    name: "年度末集中日",
    start_date: new Date("2024-01-01"),
    end_date: new Date("2025-12-31"),
    price_type: "percentage",
    price: 25,
    description: "年度末・年度始めの集中する日",
    is_recurring: true,
    recurring_type: "specific",
    recurring_pattern: {
      specificDates: [
        "2024-03-25",
        "2024-03-28",
        "2024-03-29",
        "2024-03-31",
        "2024-04-01",
        "2024-04-02",
        "2025-03-25",
        "2025-03-28",
        "2025-03-29",
        "2025-03-31",
        "2025-04-01",
        "2025-04-02"
      ]
    },
    priority: 135,
  },
];

async function seedSeasonRules() {
  console.log('🌸 シーズンルールのシード開始...');

  try {
    // 既存のデータを確認（season_typeの有効な値を取得）
    const existingRules = await prisma.season_rules.findMany({ take: 1 });
    console.log('既存データ:', existingRules);

    const existingCount = await prisma.season_rules.count();
    console.log(`既存のシーズンルール数: ${existingCount}`);

    // 既存データがある場合は削除するか確認
    if (existingCount > 0) {
      console.log('既存のシーズンルールを削除します...');
      await prisma.season_rules.deleteMany({});
    }

    // シーズンルールを登録 (season_typeは'peak', 'off_peak', 'regular'などの値)
    for (const rule of DEFAULT_SEASON_RULES) {
      const rateMultiplier = rule.price_type === 'percentage'
        ? 1 + rule.price / 100
        : 1;

      // season_typeは'peak'のみ使用（チェック制約対応）
      const seasonType = 'peak';

      await prisma.season_rules.create({
        data: {
          name: rule.name,
          season_type: seasonType,
          start_date: rule.start_date,
          end_date: rule.end_date,
          rate_multiplier: rateMultiplier,
          price_type: rule.price_type,
          price: rule.price,
          description: rule.description,
          is_recurring: rule.is_recurring,
          recurring_type: rule.recurring_type,
          recurring_pattern: rule.recurring_pattern,
          priority: rule.priority,
        },
      });
      console.log(`  ✅ ${rule.name}`);
    }

    const finalCount = await prisma.season_rules.count();
    console.log(`\n🎉 シーズンルールのシード完了: ${finalCount}件登録しました`);

  } catch (error) {
    console.error('❌ シードエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSeasonRules().catch(console.error);
