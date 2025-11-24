-- ========================================
-- Table: employees
-- Description: 引越し業者の従業員情報
-- Created: 2025-01-24
-- ========================================

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id) ON DELETE CASCADE,

  -- 基本情報
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),

  -- 雇用情報
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('driver', 'staff', 'leader', 'manager')),
  position VARCHAR(50),
  employment_type VARCHAR(30)
    CHECK (employment_type IN ('正社員', 'パート', 'アルバイト', '契約社員')),

  -- 日付情報
  hire_date DATE NOT NULL,
  retire_date DATE,
  birth_date DATE,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended')),
  is_active BOOLEAN GENERATED ALWAYS AS (status = 'active') STORED,

  -- その他情報
  address VARCHAR(255),
  emergency_contact VARCHAR(100),
  qualifications TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_employees_company ON employees(moving_company_id);
CREATE INDEX idx_employees_status ON employees(status) WHERE status = 'active';
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_email ON employees(email);

-- コメント
COMMENT ON TABLE employees IS '引越し業者の従業員情報';
COMMENT ON COLUMN employees.role IS '役割: driver/staff/leader/manager';
COMMENT ON COLUMN employees.employment_type IS '雇用形態: 正社員/パート/アルバイト/契約社員';
COMMENT ON COLUMN employees.status IS 'ステータス: active/inactive/suspended';
COMMENT ON COLUMN employees.is_active IS '有効フラグ（計算カラム）';
COMMENT ON COLUMN employees.qualifications IS '保有資格（運転免許証、フォークリフト等）';
