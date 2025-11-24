-- ========================================
-- Supabase Setup Script - Part 2
-- 見積もり・案件・システムテーブル
-- ========================================
--
-- Part 1 実行後にこのスクリプトを実行してください
--
-- ========================================

-- ========================================
-- 4. Referral Tables
-- ========================================

-- real_estate_agents テーブル
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

COMMENT ON TABLE real_estate_agents IS '不動産業者';

-- referrers テーブル
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

-- referral_cases テーブル
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

-- ========================================
-- 5. Quote Tables
-- ========================================

-- quote_requests テーブル
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_last_name VARCHAR(100) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name_kana VARCHAR(100),
  customer_first_name_kana VARCHAR(100),
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  from_postal_code VARCHAR(10),
  from_prefecture VARCHAR(50) NOT NULL,
  from_city VARCHAR(100) NOT NULL,
  from_address_line TEXT NOT NULL,
  from_building_type VARCHAR(20) CHECK (from_building_type IN ('house', 'apartment', 'mansion', 'office', 'other')),
  from_floor INT,
  from_has_elevator BOOLEAN,
  to_postal_code VARCHAR(10),
  to_prefecture VARCHAR(50) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  to_address_line TEXT NOT NULL,
  to_building_type VARCHAR(20) CHECK (to_building_type IN ('house', 'apartment', 'mansion', 'office', 'other')),
  to_floor INT,
  to_has_elevator BOOLEAN,
  preferred_date_1 DATE,
  preferred_time_slot_1 VARCHAR(20) CHECK (preferred_time_slot_1 IN ('morning', 'afternoon', 'evening', 'flexible')),
  preferred_date_2 DATE,
  preferred_time_slot_2 VARCHAR(20) CHECK (preferred_time_slot_2 IN ('morning', 'afternoon', 'evening', 'flexible')),
  preferred_date_3 DATE,
  preferred_time_slot_3 VARCHAR(20) CHECK (preferred_time_slot_3 IN ('morning', 'afternoon', 'evening', 'flexible')),
  household_size VARCHAR(20) CHECK (household_size IN ('single', 'couple', 'family_3', 'family_4', 'family_5_plus', 'office')),
  estimated_volume_cbm DECIMAL(10,2),
  packing_required BOOLEAN NOT NULL DEFAULT false,
  has_fragile_items BOOLEAN NOT NULL DEFAULT false,
  has_large_furniture BOOLEAN NOT NULL DEFAULT false,
  special_requirements TEXT,
  access_restrictions TEXT,
  distance_km DECIMAL(10,2),
  estimated_duration_hours INT,
  request_source VARCHAR(20) NOT NULL CHECK (request_source IN ('web', 'phone', 'agent', 'direct')),
  referrer_agent_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'expired', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_date ON quote_requests(preferred_date_1);
CREATE INDEX IF NOT EXISTS idx_quote_requests_referrer ON quote_requests(referrer_agent_id);

COMMENT ON TABLE quote_requests IS '見積もり依頼';

-- moving_items テーブル
CREATE TABLE IF NOT EXISTS moving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL,
  item_master_id UUID,
  custom_item_name VARCHAR(200),
  quantity INT NOT NULL CHECK (quantity > 0),
  points_per_unit INT NOT NULL CHECK (points_per_unit >= 0),
  total_points INT GENERATED ALWAYS AS (quantity * points_per_unit) STORED,
  requires_disassembly BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moving_items_request ON moving_items(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_moving_items_master ON moving_items(item_master_id);

COMMENT ON TABLE moving_items IS '引越し荷物明細';

-- quotes テーブル
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL,
  company_id UUID NOT NULL,
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  total_points INT NOT NULL CHECK (total_points >= 0),
  base_price INT NOT NULL CHECK (base_price >= 0),
  distance_price INT NOT NULL CHECK (distance_price >= 0),
  option_price INT NOT NULL CHECK (option_price >= 0),
  season_adjustment_price INT DEFAULT 0,
  tax_amount INT NOT NULL CHECK (tax_amount >= 0),
  total_price INT NOT NULL CHECK (total_price >= 0),
  breakdown_base_price INT,
  breakdown_distance_price INT,
  breakdown_option_price INT,
  breakdown_total_points INT,
  valid_until DATE NOT NULL,
  proposed_date DATE,
  proposed_time_slot VARCHAR(20) CHECK (proposed_time_slot IN ('morning', 'afternoon', 'evening', 'flexible')),
  estimated_duration_hours INT,
  assigned_truck_ids UUID[],
  assigned_employee_ids UUID[],
  terms_and_conditions TEXT,
  internal_notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'cancelled')),
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotes_request ON quotes(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_valid_until ON quotes(valid_until);

COMMENT ON TABLE quotes IS '見積もり';

-- quote_options テーブル
CREATE TABLE IF NOT EXISTS quote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  option_id UUID NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  total_price INT GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quote_options_quote ON quote_options(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_options_option ON quote_options(option_id);

COMMENT ON TABLE quote_options IS '見積もりオプション';

-- 続く（Part 3で案件・レビュー・通知テーブル）
