-- ========================================
-- Supabase Complete Setup - Part 2
-- マスター + 紹介 + 見積もりテーブル
-- ========================================

-- ========================================
-- 3. Master Tables (マスターテーブル)
-- ========================================

-- 3.1 item_masters（荷物品目マスタ）
CREATE TABLE IF NOT EXISTS item_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  default_points INT NOT NULL CHECK (default_points >= 0),
  typical_quantity_per_household INT DEFAULT 1 CHECK (typical_quantity_per_household > 0),
  requires_disassembly BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_item_masters_category ON item_masters(category);
CREATE INDEX IF NOT EXISTS idx_item_masters_is_active ON item_masters(is_active) WHERE is_active = true;

COMMENT ON TABLE item_masters IS '荷物品目マスタ';
COMMENT ON COLUMN item_masters.id IS '品目ID（主キー）';
COMMENT ON COLUMN item_masters.category IS 'カテゴリ（家具/家電/ダンボール/その他）';
COMMENT ON COLUMN item_masters.name IS '品目名';
COMMENT ON COLUMN item_masters.default_points IS 'デフォルトポイント';
COMMENT ON COLUMN item_masters.typical_quantity_per_household IS '標準数量（世帯あたり）';
COMMENT ON COLUMN item_masters.requires_disassembly IS '解体・組立が必要';
COMMENT ON COLUMN item_masters.is_active IS '有効フラグ';
COMMENT ON COLUMN item_masters.created_at IS '登録日時';
COMMENT ON COLUMN item_masters.updated_at IS '更新日時';

-- 3.2 pricing_rules（料金ルール）
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('base_rate', 'distance', 'floor_charge', 'time_charge', 'item_surcharge', 'minimum')),
  description TEXT NOT NULL,
  base_price INT,
  point_unit_price INT,
  distance_rate_per_km INT,
  min_charge INT,
  max_charge INT,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_type ON pricing_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_effective ON pricing_rules(effective_from, effective_to);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_is_active ON pricing_rules(is_active) WHERE is_active = true;

COMMENT ON TABLE pricing_rules IS '料金ルール';
COMMENT ON COLUMN pricing_rules.id IS 'ルールID（主キー）';
COMMENT ON COLUMN pricing_rules.rule_type IS 'ルール種別（base_rate/distance/floor_charge/time_charge/item_surcharge/minimum）';
COMMENT ON COLUMN pricing_rules.description IS 'ルール説明';
COMMENT ON COLUMN pricing_rules.base_price IS '基本料金';
COMMENT ON COLUMN pricing_rules.point_unit_price IS 'ポイント単価（円/ポイント）';
COMMENT ON COLUMN pricing_rules.distance_rate_per_km IS '距離単価（円/km）';
COMMENT ON COLUMN pricing_rules.min_charge IS '最低料金';
COMMENT ON COLUMN pricing_rules.max_charge IS '上限料金';
COMMENT ON COLUMN pricing_rules.effective_from IS '有効開始日';
COMMENT ON COLUMN pricing_rules.effective_to IS '有効終了日';
COMMENT ON COLUMN pricing_rules.is_active IS '有効フラグ';
COMMENT ON COLUMN pricing_rules.priority IS '優先度（高い方が優先）';
COMMENT ON COLUMN pricing_rules.created_at IS '登録日時';
COMMENT ON COLUMN pricing_rules.updated_at IS '更新日時';

-- 3.3 options（オプションサービス）
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('packing', 'protection', 'appliance', 'assembly', 'disposal', 'cleaning', 'insurance', 'storage', 'special')),
  description TEXT,
  base_price INT NOT NULL,
  is_percentage BOOLEAN NOT NULL DEFAULT false,
  percentage_rate DECIMAL(5,4),
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  estimated_time_minutes INT,
  max_quantity INT DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_options_category ON options(category);
CREATE INDEX IF NOT EXISTS idx_options_is_active ON options(is_active) WHERE is_active = true;

COMMENT ON TABLE options IS 'オプションサービス';
COMMENT ON COLUMN options.id IS 'オプションID（主キー）';
COMMENT ON COLUMN options.name IS 'オプション名';
COMMENT ON COLUMN options.category IS 'カテゴリ（packing/protection/appliance/assembly/disposal/cleaning/insurance/storage/special）';
COMMENT ON COLUMN options.description IS '説明';
COMMENT ON COLUMN options.base_price IS '基本料金';
COMMENT ON COLUMN options.is_percentage IS 'パーセント計算フラグ';
COMMENT ON COLUMN options.percentage_rate IS 'パーセント率（0.0-1.0）';
COMMENT ON COLUMN options.requires_approval IS '承認必要フラグ';
COMMENT ON COLUMN options.estimated_time_minutes IS '所要時間（分）';
COMMENT ON COLUMN options.max_quantity IS '最大選択数';
COMMENT ON COLUMN options.is_active IS '有効フラグ';
COMMENT ON COLUMN options.display_order IS '表示順序';
COMMENT ON COLUMN options.created_at IS '登録日時';
COMMENT ON COLUMN options.updated_at IS '更新日時';

-- 3.4 season_rules（繁忙期ルール）
CREATE TABLE IF NOT EXISTS season_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  season_type VARCHAR(20) NOT NULL CHECK (season_type IN ('peak_high', 'peak', 'busy', 'normal', 'off_season', 'weekday', 'weekend')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rate_multiplier DECIMAL(4,2) NOT NULL CHECK (rate_multiplier > 0),
  applies_to_weekdays BOOLEAN NOT NULL DEFAULT true,
  applies_to_weekends BOOLEAN NOT NULL DEFAULT true,
  min_discount_amount INT,
  max_discount_amount INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_season_rules_dates ON season_rules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_season_rules_type ON season_rules(season_type);
CREATE INDEX IF NOT EXISTS idx_season_rules_is_active ON season_rules(is_active) WHERE is_active = true;

COMMENT ON TABLE season_rules IS '繁忙期・閑散期ルール';
COMMENT ON COLUMN season_rules.id IS 'ルールID（主キー）';
COMMENT ON COLUMN season_rules.name IS 'ルール名';
COMMENT ON COLUMN season_rules.season_type IS 'シーズン種別（peak_high/peak/busy/normal/off_season/weekday/weekend）';
COMMENT ON COLUMN season_rules.start_date IS '開始日';
COMMENT ON COLUMN season_rules.end_date IS '終了日';
COMMENT ON COLUMN season_rules.rate_multiplier IS '料金倍率（1.0が基準）';
COMMENT ON COLUMN season_rules.applies_to_weekdays IS '平日適用フラグ';
COMMENT ON COLUMN season_rules.applies_to_weekends IS '土日祝適用フラグ';
COMMENT ON COLUMN season_rules.min_discount_amount IS '最小割引額';
COMMENT ON COLUMN season_rules.max_discount_amount IS '最大割引額';
COMMENT ON COLUMN season_rules.is_active IS '有効フラグ';
COMMENT ON COLUMN season_rules.priority IS '優先度（高い方が優先）';
COMMENT ON COLUMN season_rules.created_at IS '登録日時';
COMMENT ON COLUMN season_rules.updated_at IS '更新日時';

-- ========================================
-- 4. Referral Tables (紹介管理テーブル)
-- ========================================

-- 4.1 real_estate_agents（不動産仲介業者）
CREATE TABLE IF NOT EXISTS real_estate_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  agent_code VARCHAR(50) NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  company_name_kana VARCHAR(255),
  department_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name_kana VARCHAR(100),
  first_name_kana VARCHAR(100),
  postal_code VARCHAR(10),
  prefecture VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address_line TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  fax_number VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1),
  payment_terms TEXT,
  total_referrals INT DEFAULT 0 CHECK (total_referrals >= 0),
  successful_referrals INT DEFAULT 0 CHECK (successful_referrals >= 0),
  rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  total_reviews INT DEFAULT 0 CHECK (total_reviews >= 0),
  bank_name VARCHAR(100),
  branch_name VARCHAR(100),
  account_type VARCHAR(20) CHECK (account_type IN ('ordinary', 'savings', 'current')),
  account_number VARCHAR(20),
  account_holder_name VARCHAR(200),
  contract_start_date DATE NOT NULL,
  contract_end_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_real_estate_agents_user ON real_estate_agents(user_id);
CREATE INDEX IF NOT EXISTS idx_real_estate_agents_status ON real_estate_agents(status);
CREATE INDEX IF NOT EXISTS idx_real_estate_agents_company ON real_estate_agents(company_name);

COMMENT ON TABLE real_estate_agents IS '不動産仲介業者';
COMMENT ON COLUMN real_estate_agents.id IS '業者ID（主キー）';
COMMENT ON COLUMN real_estate_agents.user_id IS 'ユーザーアカウントID（FK: users）';
COMMENT ON COLUMN real_estate_agents.agent_code IS '業者コード';
COMMENT ON COLUMN real_estate_agents.company_name IS '会社名';
COMMENT ON COLUMN real_estate_agents.company_name_kana IS '会社名（カナ）';
COMMENT ON COLUMN real_estate_agents.department_name IS '部署名';
COMMENT ON COLUMN real_estate_agents.last_name IS '担当者姓';
COMMENT ON COLUMN real_estate_agents.first_name IS '担当者名';
COMMENT ON COLUMN real_estate_agents.last_name_kana IS '担当者姓（カナ）';
COMMENT ON COLUMN real_estate_agents.first_name_kana IS '担当者名（カナ）';
COMMENT ON COLUMN real_estate_agents.postal_code IS '郵便番号';
COMMENT ON COLUMN real_estate_agents.prefecture IS '都道府県';
COMMENT ON COLUMN real_estate_agents.city IS '市区町村';
COMMENT ON COLUMN real_estate_agents.address_line IS '住所（番地・建物名）';
COMMENT ON COLUMN real_estate_agents.phone_number IS '電話番号';
COMMENT ON COLUMN real_estate_agents.fax_number IS 'FAX番号';
COMMENT ON COLUMN real_estate_agents.email IS 'メールアドレス';
COMMENT ON COLUMN real_estate_agents.commission_rate IS '紹介手数料率（0.0-1.0）';
COMMENT ON COLUMN real_estate_agents.payment_terms IS '支払条件';
COMMENT ON COLUMN real_estate_agents.total_referrals IS '紹介総数';
COMMENT ON COLUMN real_estate_agents.successful_referrals IS '成約数';
COMMENT ON COLUMN real_estate_agents.rating_average IS '平均評価';
COMMENT ON COLUMN real_estate_agents.total_reviews IS 'レビュー総数';
COMMENT ON COLUMN real_estate_agents.bank_name IS '銀行名';
COMMENT ON COLUMN real_estate_agents.branch_name IS '支店名';
COMMENT ON COLUMN real_estate_agents.account_type IS '口座種別（ordinary/savings/current）';
COMMENT ON COLUMN real_estate_agents.account_number IS '口座番号';
COMMENT ON COLUMN real_estate_agents.account_holder_name IS '口座名義';
COMMENT ON COLUMN real_estate_agents.contract_start_date IS '契約開始日';
COMMENT ON COLUMN real_estate_agents.contract_end_date IS '契約終了日';
COMMENT ON COLUMN real_estate_agents.status IS 'ステータス（active/suspended/inactive）';
COMMENT ON COLUMN real_estate_agents.is_active IS '有効フラグ';
COMMENT ON COLUMN real_estate_agents.created_at IS '登録日時';
COMMENT ON COLUMN real_estate_agents.updated_at IS '更新日時';

-- 4.2 referrers（紹介者）
CREATE TABLE IF NOT EXISTS referrers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_type VARCHAR(20) NOT NULL CHECK (referrer_type IN ('agent', 'individual', 'corporate')),
  agent_id UUID,
  name VARCHAR(255) NOT NULL,
  contact_info JSONB,
  commission_rate DECIMAL(5,4) CHECK (commission_rate >= 0 AND commission_rate <= 1),
  total_referrals INT DEFAULT 0 CHECK (total_referrals >= 0),
  successful_referrals INT DEFAULT 0 CHECK (successful_referrals >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrers_type ON referrers(referrer_type);
CREATE INDEX IF NOT EXISTS idx_referrers_agent ON referrers(agent_id);
CREATE INDEX IF NOT EXISTS idx_referrers_is_active ON referrers(is_active) WHERE is_active = true;

COMMENT ON TABLE referrers IS '紹介者';
COMMENT ON COLUMN referrers.id IS '紹介者ID（主キー）';
COMMENT ON COLUMN referrers.referrer_type IS '紹介者種別（agent/individual/corporate）';
COMMENT ON COLUMN referrers.agent_id IS '不動産業者ID（FK: real_estate_agents）';
COMMENT ON COLUMN referrers.name IS '紹介者名';
COMMENT ON COLUMN referrers.contact_info IS '連絡先情報（JSON）';
COMMENT ON COLUMN referrers.commission_rate IS '紹介手数料率';
COMMENT ON COLUMN referrers.total_referrals IS '紹介総数';
COMMENT ON COLUMN referrers.successful_referrals IS '成約数';
COMMENT ON COLUMN referrers.is_active IS '有効フラグ';
COMMENT ON COLUMN referrers.created_at IS '登録日時';
COMMENT ON COLUMN referrers.updated_at IS '更新日時';

-- 4.3 referral_cases（紹介案件）
CREATE TABLE IF NOT EXISTS referral_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_contact VARCHAR(500) NOT NULL,
  move_date DATE,
  move_from_location TEXT,
  move_to_location TEXT,
  estimated_volume_cbm DECIMAL(10,2),
  special_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'contracted', 'completed', 'cancelled', 'lost')),
  commission_amount INT,
  commission_paid BOOLEAN NOT NULL DEFAULT false,
  commission_paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_cases_referrer ON referral_cases(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_cases_status ON referral_cases(status);
CREATE INDEX IF NOT EXISTS idx_referral_cases_move_date ON referral_cases(move_date);

COMMENT ON TABLE referral_cases IS '紹介案件';
COMMENT ON COLUMN referral_cases.id IS '案件ID（主キー）';
COMMENT ON COLUMN referral_cases.referrer_id IS '紹介者ID（FK: referrers）';
COMMENT ON COLUMN referral_cases.customer_name IS '顧客名';
COMMENT ON COLUMN referral_cases.customer_contact IS '顧客連絡先';
COMMENT ON COLUMN referral_cases.move_date IS '引越予定日';
COMMENT ON COLUMN referral_cases.move_from_location IS '現住所';
COMMENT ON COLUMN referral_cases.move_to_location IS '新住所';
COMMENT ON COLUMN referral_cases.estimated_volume_cbm IS '推定荷物量（㎥）';
COMMENT ON COLUMN referral_cases.special_notes IS '特記事項';
COMMENT ON COLUMN referral_cases.status IS 'ステータス（new/contacted/quoted/contracted/completed/cancelled/lost）';
COMMENT ON COLUMN referral_cases.commission_amount IS '紹介手数料額';
COMMENT ON COLUMN referral_cases.commission_paid IS '手数料支払済みフラグ';
COMMENT ON COLUMN referral_cases.commission_paid_at IS '手数料支払日時';
COMMENT ON COLUMN referral_cases.created_at IS '登録日時';
COMMENT ON COLUMN referral_cases.updated_at IS '更新日時';

-- 続く（Part 3へ）
