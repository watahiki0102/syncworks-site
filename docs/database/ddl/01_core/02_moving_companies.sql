-- ========================================
-- Table: moving_companies
-- Description: 引越し業者の基本情報
-- Created: 2025-01-24
-- ========================================

CREATE TABLE moving_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 基本情報
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address VARCHAR(255),

  -- ステータス
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_moving_companies_active ON moving_companies(is_active) WHERE is_active = true;
CREATE INDEX idx_moving_companies_name ON moving_companies(name);

-- コメント
COMMENT ON TABLE moving_companies IS '引越し業者の基本情報';
COMMENT ON COLUMN moving_companies.name IS '業者名';
COMMENT ON COLUMN moving_companies.is_active IS '有効フラグ（論理削除用）';
