-- ========================================
-- Table: real_estate_agents
-- Description: 不動産仲介業者の情報
-- Created: 2025-01-24
-- ========================================

CREATE TABLE real_estate_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 会社情報
  company_name VARCHAR(150) NOT NULL,
  license_no VARCHAR(50) NOT NULL UNIQUE,
  representative_name VARCHAR(100) NOT NULL,

  -- 担当者情報
  contact_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),

  -- 所在地
  address VARCHAR(255) NOT NULL,
  website_url VARCHAR(255),

  -- 対応エリア
  service_prefectures TEXT[],

  -- 紹介コード
  referral_code VARCHAR(50) NOT NULL UNIQUE,

  -- 登録情報
  registration_mode VARCHAR(20)
    CHECK (registration_mode IN ('self', 'referral')),
  referrer_name VARCHAR(100),

  -- ステータス
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_real_estate_agents_referral_code ON real_estate_agents(referral_code);
CREATE INDEX idx_real_estate_agents_active ON real_estate_agents(is_active) WHERE is_active = true;
CREATE INDEX idx_real_estate_agents_license ON real_estate_agents(license_no);

-- コメント
COMMENT ON TABLE real_estate_agents IS '不動産仲介業者の情報';
COMMENT ON COLUMN real_estate_agents.license_no IS '宅建業免許番号';
COMMENT ON COLUMN real_estate_agents.service_prefectures IS '対応都道府県（配列）';
COMMENT ON COLUMN real_estate_agents.referral_code IS '紹介コード（自動生成: REA-XXXXXX）';
COMMENT ON COLUMN real_estate_agents.registration_mode IS '登録モード: self=自己登録/referral=紹介登録';
