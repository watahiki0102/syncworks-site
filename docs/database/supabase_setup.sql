-- ========================================
-- Supabase Setup Script
-- 統合DDL実行用スクリプト
-- ========================================
--
-- 実行方法:
-- 1. Supabaseダッシュボード > SQL Editor
-- 2. このスクリプト全体をコピー＆ペースト
-- 3. "Run"をクリック
--
-- ========================================

-- マイグレーション管理テーブル
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  description TEXT NOT NULL,
  executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at ON schema_migrations(executed_at DESC);

COMMENT ON TABLE schema_migrations IS 'マイグレーション履歴管理テーブル';

-- 初回レコード挿入
INSERT INTO schema_migrations (version, description)
VALUES ('000', 'Initialize schema_migrations table')
ON CONFLICT (version) DO NOTHING;

-- ========================================
-- 1. Core Tables
-- ========================================

-- users テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'business_owner', 'employee', 'admin', 'agent')),
  display_name VARCHAR(100),
  phone_number VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = true;

COMMENT ON TABLE users IS 'ユーザーアカウント';

-- moving_companies テーブル
CREATE TABLE IF NOT EXISTS moving_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_name_kana VARCHAR(255),
  postal_code VARCHAR(10),
  prefecture VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address_line TEXT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  business_hours TEXT,
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  max_distance_km INT,
  min_job_price INT,
  provides_packing BOOLEAN NOT NULL DEFAULT false,
  provides_storage BOOLEAN NOT NULL DEFAULT false,
  storage_capacity_cbm DECIMAL(10,2),
  has_insurance BOOLEAN NOT NULL DEFAULT false,
  insurance_max_coverage INT,
  insurance_company_name VARCHAR(255),
  licenses TEXT[],
  certifications TEXT[],
  rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  total_reviews INT DEFAULT 0 CHECK (total_reviews >= 0),
  total_jobs_completed INT DEFAULT 0 CHECK (total_jobs_completed >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moving_companies_owner ON moving_companies(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_moving_companies_status ON moving_companies(status);
CREATE INDEX IF NOT EXISTS idx_moving_companies_prefecture ON moving_companies(prefecture);
CREATE INDEX IF NOT EXISTS idx_moving_companies_rating ON moving_companies(rating_average DESC);

COMMENT ON TABLE moving_companies IS '引越し業者';

-- ========================================
-- 2. Resource Tables
-- ========================================

-- employees テーブル
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID,
  employee_number VARCHAR(50) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name_kana VARCHAR(100),
  first_name_kana VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'worker' CHECK (role IN ('driver', 'worker', 'leader', 'manager', 'admin')),
  employment_type VARCHAR(20) NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'temporary')),
  qualifications TEXT[],
  hire_date DATE NOT NULL,
  termination_date DATE,
  birth_date DATE,
  postal_code VARCHAR(10),
  prefecture VARCHAR(50),
  city VARCHAR(100),
  address_line TEXT,
  phone_number VARCHAR(20) NOT NULL,
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  hourly_rate INT,
  max_work_hours_per_day INT DEFAULT 8,
  max_work_days_per_month INT DEFAULT 25,
  points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_company_number ON employees(company_id, employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active) WHERE is_active = true;

COMMENT ON TABLE employees IS '従業員';

-- trucks テーブル
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  truck_number VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  truck_type VARCHAR(20) NOT NULL CHECK (truck_type IN ('2t', '3t', '4t', '10t', 'light')),
  capacity_cbm DECIMAL(10,2) NOT NULL CHECK (capacity_cbm > 0),
  max_load_kg INT NOT NULL CHECK (max_load_kg > 0),
  has_lift_gate BOOLEAN NOT NULL DEFAULT false,
  has_air_conditioning BOOLEAN NOT NULL DEFAULT false,
  manufacture_year INT,
  manufacturer VARCHAR(100),
  model_name VARCHAR(100),
  last_inspection_date DATE,
  next_inspection_date DATE NOT NULL,
  fuel_type VARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
  fuel_efficiency_kmpl DECIMAL(5,2),
  insurance_expiry_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trucks_company_number ON trucks(company_id, truck_number);
CREATE INDEX IF NOT EXISTS idx_trucks_company ON trucks(company_id);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status);
CREATE INDEX IF NOT EXISTS idx_trucks_type ON trucks(truck_type);

COMMENT ON TABLE trucks IS 'トラック';

-- shifts テーブル
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  shift_type VARCHAR(20) NOT NULL DEFAULT 'regular' CHECK (shift_type IN ('regular', 'overtime', 'night', 'holiday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INT DEFAULT 60 CHECK (break_minutes >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'absent')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_employee_date ON shifts(employee_id, shift_date);

COMMENT ON TABLE shifts IS '従業員シフト';

-- ========================================
-- 3. Master Tables
-- ========================================

-- item_masters テーブル
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

-- pricing_rules テーブル
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

-- options テーブル
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

-- season_rules テーブル
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

-- 続く（次のメッセージで残りのテーブルを提供）
