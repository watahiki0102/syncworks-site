-- ========================================
-- Table: referrers
-- Description: 不動産業者以外の紹介者（個人・法人）
-- Created: 2025-01-24
-- ========================================

CREATE TABLE referrers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 紹介者種別
  referrer_type VARCHAR(20) NOT NULL
    CHECK (referrer_type IN ('company', 'individual')),

  -- 基本情報
  display_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address VARCHAR(255),

  -- 会社情報（referrer_type='company'の場合）
  company_name VARCHAR(150),
  department VARCHAR(100),
  billing_company_name VARCHAR(150),
  billing_address VARCHAR(255),
  billing_phone VARCHAR(20),
  billing_email VARCHAR(255),

  -- 個人情報（referrer_type='individual'の場合）
  full_name VARCHAR(100),
  full_name_kana VARCHAR(100),
  birth_date DATE,
  tax_category VARCHAR(30)
    CHECK (tax_category IN ('個人事業主', '給与所得者', '年金所得者', 'その他')),
  withholding_tax BOOLEAN DEFAULT false,

  -- 振込先情報
  bank_code VARCHAR(10),
  branch_name VARCHAR(100),
  account_number VARCHAR(20),
  account_holder VARCHAR(100),

  -- 規約同意
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_accepted_at TIMESTAMP,

  -- 管理フラグ
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_referrers_type ON referrers(referrer_type);
CREATE INDEX idx_referrers_email ON referrers(email);
CREATE INDEX idx_referrers_active ON referrers(is_active) WHERE is_active = true;

-- コメント
COMMENT ON TABLE referrers IS '不動産業者以外の紹介者（個人・法人）';
COMMENT ON COLUMN referrers.referrer_type IS '紹介者種別: company=法人/individual=個人';
COMMENT ON COLUMN referrers.tax_category IS '税務区分（個人の場合）';
COMMENT ON COLUMN referrers.withholding_tax IS '源泉徴収フラグ';
COMMENT ON COLUMN referrers.terms_accepted IS '規約同意フラグ';
