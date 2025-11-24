-- ========================================
-- Table: reviews
-- Description: 案件完了後の顧客レビュー
-- Created: 2025-01-24
-- ========================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 関連情報
  job_id UUID NOT NULL REFERENCES jobs(id),
  customer_email VARCHAR(255),

  -- 評価
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,

  -- 検証フラグ
  is_verified BOOLEAN DEFAULT false,

  -- 会社からの返信
  company_response TEXT,
  company_response_at TIMESTAMP,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_reviews_job ON reviews(job_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- コメント
COMMENT ON TABLE reviews IS '案件完了後の顧客レビュー';
COMMENT ON COLUMN reviews.rating IS '評価（1-5の整数）';
COMMENT ON COLUMN reviews.is_verified IS '検証済みフラグ（実際の顧客による投稿と確認済み）';
COMMENT ON COLUMN reviews.company_response IS '会社からの返信';
