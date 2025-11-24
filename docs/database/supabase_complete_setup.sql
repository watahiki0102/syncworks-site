-- ========================================
-- Supabase Complete Setup Script
-- 全テーブル作成 + 論理名(COMMENT)設定
-- ========================================
--
-- 実行方法:
-- 1. Supabaseダッシュボード > SQL Editor
-- 2. このスクリプト全体をコピー＆ペースト
-- 3. "Run"をクリック
--
-- 作成内容:
-- - 19テーブル + マイグレーション管理テーブル
-- - すべての外部キー制約
-- - すべてのインデックス
-- - すべての論理名(COMMENT)
-- - updated_atトリガー
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
COMMENT ON COLUMN schema_migrations.version IS 'マイグレーションバージョン（例: 001, 002）';
COMMENT ON COLUMN schema_migrations.description IS 'マイグレーションの説明';
COMMENT ON COLUMN schema_migrations.executed_at IS '実行日時';
COMMENT ON COLUMN schema_migrations.execution_time_ms IS '実行時間（ミリ秒）';
COMMENT ON COLUMN schema_migrations.success IS '成功フラグ';
COMMENT ON COLUMN schema_migrations.error_message IS 'エラーメッセージ（失敗時）';

-- 初回レコード挿入
INSERT INTO schema_migrations (version, description)
VALUES ('000', 'Initialize schema_migrations table')
ON CONFLICT (version) DO NOTHING;

-- ========================================
-- 1. Core Tables (コアテーブル)
-- ========================================

-- 1.1 users（ユーザー）
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
COMMENT ON COLUMN users.id IS 'ユーザーID（主キー）';
COMMENT ON COLUMN users.email IS 'メールアドレス（ログインID）';
COMMENT ON COLUMN users.password_hash IS 'パスワードハッシュ（bcrypt等）';
COMMENT ON COLUMN users.role IS '役割（customer/business_owner/employee/admin/agent）';
COMMENT ON COLUMN users.display_name IS '表示名';
COMMENT ON COLUMN users.phone_number IS '電話番号';
COMMENT ON COLUMN users.is_active IS 'アカウント有効フラグ';
COMMENT ON COLUMN users.email_verified IS 'メール認証済みフラグ';
COMMENT ON COLUMN users.email_verified_at IS 'メール認証日時';
COMMENT ON COLUMN users.last_login_at IS '最終ログイン日時';
COMMENT ON COLUMN users.created_at IS '作成日時';
COMMENT ON COLUMN users.updated_at IS '更新日時';

-- 1.2 moving_companies（引越し業者）
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
COMMENT ON COLUMN moving_companies.id IS '業者ID（主キー）';
COMMENT ON COLUMN moving_companies.owner_user_id IS 'オーナーユーザーID（FK: users）';
COMMENT ON COLUMN moving_companies.company_name IS '会社名';
COMMENT ON COLUMN moving_companies.company_name_kana IS '会社名（カナ）';
COMMENT ON COLUMN moving_companies.postal_code IS '郵便番号';
COMMENT ON COLUMN moving_companies.prefecture IS '都道府県';
COMMENT ON COLUMN moving_companies.city IS '市区町村';
COMMENT ON COLUMN moving_companies.address_line IS '住所（番地・建物名）';
COMMENT ON COLUMN moving_companies.phone_number IS '電話番号';
COMMENT ON COLUMN moving_companies.email IS 'メールアドレス';
COMMENT ON COLUMN moving_companies.business_hours IS '営業時間';
COMMENT ON COLUMN moving_companies.service_areas IS '対応エリア（配列）';
COMMENT ON COLUMN moving_companies.max_distance_km IS '最大対応距離（km）';
COMMENT ON COLUMN moving_companies.min_job_price IS '最低受注金額';
COMMENT ON COLUMN moving_companies.provides_packing IS '梱包サービス提供フラグ';
COMMENT ON COLUMN moving_companies.provides_storage IS '保管サービス提供フラグ';
COMMENT ON COLUMN moving_companies.storage_capacity_cbm IS '保管容量（㎥）';
COMMENT ON COLUMN moving_companies.has_insurance IS '保険加入フラグ';
COMMENT ON COLUMN moving_companies.insurance_max_coverage IS '保険最大補償額';
COMMENT ON COLUMN moving_companies.insurance_company_name IS '保険会社名';
COMMENT ON COLUMN moving_companies.licenses IS '許認可情報（配列）';
COMMENT ON COLUMN moving_companies.certifications IS '認定・資格（配列）';
COMMENT ON COLUMN moving_companies.rating_average IS '平均評価（0.00-5.00）';
COMMENT ON COLUMN moving_companies.total_reviews IS 'レビュー総数';
COMMENT ON COLUMN moving_companies.total_jobs_completed IS '完了案件数';
COMMENT ON COLUMN moving_companies.status IS 'ステータス（pending/active/suspended/inactive）';
COMMENT ON COLUMN moving_companies.is_verified IS '認証済みフラグ';
COMMENT ON COLUMN moving_companies.verified_at IS '認証日時';
COMMENT ON COLUMN moving_companies.created_at IS '登録日時';
COMMENT ON COLUMN moving_companies.updated_at IS '更新日時';

-- ========================================
-- 2. Resource Tables (リソーステーブル)
-- ========================================

-- 2.1 employees（従業員）
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
COMMENT ON COLUMN employees.id IS '従業員ID（主キー）';
COMMENT ON COLUMN employees.company_id IS '所属会社ID（FK: moving_companies）';
COMMENT ON COLUMN employees.user_id IS 'ユーザーアカウントID（FK: users）';
COMMENT ON COLUMN employees.employee_number IS '従業員番号';
COMMENT ON COLUMN employees.last_name IS '姓';
COMMENT ON COLUMN employees.first_name IS '名';
COMMENT ON COLUMN employees.last_name_kana IS '姓（カナ）';
COMMENT ON COLUMN employees.first_name_kana IS '名（カナ）';
COMMENT ON COLUMN employees.role IS '役割（driver/worker/leader/manager/admin）';
COMMENT ON COLUMN employees.employment_type IS '雇用形態（full_time/part_time/contract/temporary）';
COMMENT ON COLUMN employees.qualifications IS '資格・免許（配列）';
COMMENT ON COLUMN employees.hire_date IS '入社日';
COMMENT ON COLUMN employees.termination_date IS '退職日';
COMMENT ON COLUMN employees.birth_date IS '生年月日';
COMMENT ON COLUMN employees.postal_code IS '郵便番号';
COMMENT ON COLUMN employees.prefecture IS '都道府県';
COMMENT ON COLUMN employees.city IS '市区町村';
COMMENT ON COLUMN employees.address_line IS '住所（番地・建物名）';
COMMENT ON COLUMN employees.phone_number IS '電話番号';
COMMENT ON COLUMN employees.emergency_contact_name IS '緊急連絡先氏名';
COMMENT ON COLUMN employees.emergency_contact_phone IS '緊急連絡先電話番号';
COMMENT ON COLUMN employees.hourly_rate IS '時給（円）';
COMMENT ON COLUMN employees.max_work_hours_per_day IS '1日最大勤務時間';
COMMENT ON COLUMN employees.max_work_days_per_month IS '月最大勤務日数';
COMMENT ON COLUMN employees.points_balance IS 'ポイント残高';
COMMENT ON COLUMN employees.is_active IS '在籍フラグ';
COMMENT ON COLUMN employees.created_at IS '登録日時';
COMMENT ON COLUMN employees.updated_at IS '更新日時';

-- 2.2 trucks（トラック）
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
COMMENT ON COLUMN trucks.id IS 'トラックID（主キー）';
COMMENT ON COLUMN trucks.company_id IS '所属会社ID（FK: moving_companies）';
COMMENT ON COLUMN trucks.truck_number IS '車両管理番号';
COMMENT ON COLUMN trucks.license_plate IS 'ナンバープレート';
COMMENT ON COLUMN trucks.truck_type IS 'トラック種別（2t/3t/4t/10t/light）';
COMMENT ON COLUMN trucks.capacity_cbm IS '積載容量（㎥）';
COMMENT ON COLUMN trucks.max_load_kg IS '最大積載量（kg）';
COMMENT ON COLUMN trucks.has_lift_gate IS 'パワーゲート有無';
COMMENT ON COLUMN trucks.has_air_conditioning IS 'エアコン有無';
COMMENT ON COLUMN trucks.manufacture_year IS '製造年';
COMMENT ON COLUMN trucks.manufacturer IS 'メーカー';
COMMENT ON COLUMN trucks.model_name IS '型式・モデル名';
COMMENT ON COLUMN trucks.last_inspection_date IS '前回車検日';
COMMENT ON COLUMN trucks.next_inspection_date IS '次回車検日';
COMMENT ON COLUMN trucks.fuel_type IS '燃料種別（gasoline/diesel/electric/hybrid）';
COMMENT ON COLUMN trucks.fuel_efficiency_kmpl IS '燃費（km/L）';
COMMENT ON COLUMN trucks.insurance_expiry_date IS '保険有効期限';
COMMENT ON COLUMN trucks.status IS 'ステータス（available/in_use/maintenance/retired）';
COMMENT ON COLUMN trucks.created_at IS '登録日時';
COMMENT ON COLUMN trucks.updated_at IS '更新日時';

-- 2.3 shifts（シフト）
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
COMMENT ON COLUMN shifts.id IS 'シフトID（主キー）';
COMMENT ON COLUMN shifts.employee_id IS '従業員ID（FK: employees）';
COMMENT ON COLUMN shifts.shift_date IS 'シフト日';
COMMENT ON COLUMN shifts.shift_type IS 'シフト種別（regular/overtime/night/holiday）';
COMMENT ON COLUMN shifts.start_time IS '開始時刻';
COMMENT ON COLUMN shifts.end_time IS '終了時刻';
COMMENT ON COLUMN shifts.break_minutes IS '休憩時間（分）';
COMMENT ON COLUMN shifts.status IS 'ステータス（scheduled/confirmed/completed/cancelled/absent）';
COMMENT ON COLUMN shifts.notes IS '備考';
COMMENT ON COLUMN shifts.created_at IS '登録日時';
COMMENT ON COLUMN shifts.updated_at IS '更新日時';

-- 続く（Part 2へ）
