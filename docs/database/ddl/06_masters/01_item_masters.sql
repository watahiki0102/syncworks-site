-- ========================================
-- Table: item_masters
-- Description: 荷物の標準情報マスタ
-- Created: 2025-01-24
-- ========================================

CREATE TABLE item_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 基本情報
  category VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,

  -- デフォルト設定
  default_points INT NOT NULL CHECK (default_points >= 0),
  default_additional_cost INT DEFAULT 0 CHECK (default_additional_cost >= 0),

  -- アイテム属性
  typical_size VARCHAR(10),
  typical_weight INT,
  is_fragile BOOLEAN DEFAULT false,
  requires_disassembly BOOLEAN DEFAULT false,

  -- 表示順・有効フラグ
  display_order INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_item_masters_category ON item_masters(category);
CREATE INDEX idx_item_masters_active ON item_masters(is_active) WHERE is_active = true;

-- コメント
COMMENT ON TABLE item_masters IS '荷物の標準情報マスタ';
COMMENT ON COLUMN item_masters.category IS 'カテゴリ（furniture/appliances/boxes等）';
COMMENT ON COLUMN item_masters.default_points IS 'デフォルトポイント';
COMMENT ON COLUMN item_masters.typical_size IS '標準サイズ: S/M/L/XL';
COMMENT ON COLUMN item_masters.is_fragile IS '壊れやすいか';
COMMENT ON COLUMN item_masters.requires_disassembly IS '分解が必要か';
COMMENT ON COLUMN item_masters.display_order IS '表示順（小さい順）';
