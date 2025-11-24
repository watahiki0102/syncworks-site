-- ========================================
-- Seed: Test Real Estate Agents (テストデータ)
-- Description: テスト不動産業者
-- Created: 2025-01-24
-- WARNING: 開発環境専用（本番では実行しないこと）
-- ========================================

-- 不動産業者
INSERT INTO real_estate_agents (
  id, user_id, agent_code,
  company_name, company_name_kana, department_name,
  last_name, first_name, last_name_kana, first_name_kana,
  postal_code, prefecture, city, address_line,
  phone_number, fax_number, email,
  commission_rate, payment_terms,
  total_referrals, successful_referrals,
  rating_average, total_reviews,
  bank_name, branch_name, account_type, account_number, account_holder_name,
  contract_start_date, contract_end_date,
  status, is_active
) VALUES
-- 不動産業者1: 東京不動産
(
  '99999999-9999-9999-9999-999999999901',
  '55555555-5555-5555-5555-555555555508',
  'AG-001',
  '東京不動産株式会社', 'トウキョウフドウサン', '営業1課',
  '伊藤', '美咲', 'イトウ', 'ミサキ',
  '160-0001', '東京都', '新宿区', '西新宿1-1-1',
  '03-9999-0001', '03-9999-0011', 'agent1@realestate.jp',
  0.05, '月末締め翌月末払い',
  45, 38,
  4.3, 35,
  'みずほ銀行', '新宿支店', 'ordinary', '1234567', 'トウキョウフドウサン(カ',
  '2024-01-01', '2025-12-31',
  'active', true
),
-- 不動産業者2: 横浜住宅センター
(
  '99999999-9999-9999-9999-999999999902',
  '55555555-5555-5555-5555-555555555509',
  'AG-002',
  '横浜住宅センター', 'ヨコハマジュウタクセンター', '賃貸部',
  '中村', '裕子', 'ナカムラ', 'ユウコ',
  '220-0001', '神奈川県', '横浜市西区', 'みなとみらい3-1-1',
  '045-9999-0002', '045-9999-0012', 'agent2@realestate.jp',
  0.05, '月末締め翌月末払い',
  28, 24,
  4.5, 22,
  '三菱UFJ銀行', '横浜支店', 'ordinary', '7654321', 'ヨコハマジュウタクセンター',
  '2024-04-01', '2026-03-31',
  'active', true
);

-- 合計: 2不動産業者
