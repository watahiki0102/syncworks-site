-- ========================================
-- Table: options
-- Description: オプションサービスマスタ
-- Created: 2025-01-24
-- ========================================

CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 基本情報
  name VARCHAR(100) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  description TEXT,

  -- 料金設定
  option_type VARCHAR(20) NOT NULL
    CHECK (option_type IN ('free', 'paid', 'individual', 'nonSupported')),
  price INT CHECK (price >= 0),
  unit VARCHAR(20),

  -- 適用条件
  min_point INT,
  max_point INT,

  -- 表示設定
  is_default BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- 備考
  remarks TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_options_active ON options(is_active) WHERE is_active = true;
CREATE INDEX idx_options_type ON options(option_type);

-- コメント
COMMENT ON TABLE options IS 'オプションサービスマスタ';
COMMENT ON COLUMN options.option_type IS 'タイプ: free=無料/paid=有料/individual=個別見積/nonSupported=非対応';
COMMENT ON COLUMN options.price IS '料金（option_type=paidの場合必須）';
COMMENT ON COLUMN options.unit IS '単位（個/台/式等）';
COMMENT ON COLUMN options.min_point IS '適用最小ポイント';
COMMENT ON COLUMN options.max_point IS '適用最大ポイント';
COMMENT ON COLUMN options.is_default IS 'デフォルト選択フラグ';
