-- ========================================
-- Table: notifications
-- Description: システム通知
-- Created: 2025-01-24
-- ========================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 宛先
  recipient_email VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(20) NOT NULL
    CHECK (recipient_type IN ('customer', 'company', 'employee', 'agent')),

  -- 通知内容
  notification_type VARCHAR(30) NOT NULL
    CHECK (notification_type IN ('quote_received', 'quote_accepted', 'quote_rejected',
                                 'job_scheduled', 'job_completed', 'payment_due',
                                 'review_received', 'system_maintenance')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,

  -- 優先度
  priority VARCHAR(20) NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- 状態
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,

  -- 有効期限
  expires_at TIMESTAMP,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_notifications_recipient ON notifications(recipient_email, is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- コメント
COMMENT ON TABLE notifications IS 'システム通知';
COMMENT ON COLUMN notifications.recipient_type IS '宛先タイプ: customer/company/employee/agent';
COMMENT ON COLUMN notifications.notification_type IS '通知タイプ';
COMMENT ON COLUMN notifications.data IS '通知関連データ（JSONB）';
COMMENT ON COLUMN notifications.priority IS '優先度: low/normal/high/urgent';
COMMENT ON COLUMN notifications.expires_at IS '有効期限（通常は作成日+30日）';
