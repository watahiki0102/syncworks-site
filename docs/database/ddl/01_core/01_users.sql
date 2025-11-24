-- ========================================
-- Table: users
-- Description: システム全体のユーザー認証基盤
-- Created: 2025-01-24
-- ========================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 認証情報
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  -- ユーザー情報
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('customer', 'business_owner', 'employee', 'admin', 'agent')),

  -- 関連ID
  moving_company_id UUID,
  employee_id UUID,
  real_estate_agent_id UUID,

  -- アカウント状態
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMP,

  -- セキュリティ
  last_login_at TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMP,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_company ON users(moving_company_id);

-- コメント
COMMENT ON TABLE users IS 'システム全体のユーザー認証基盤';
COMMENT ON COLUMN users.email IS 'メールアドレス（ログインID）';
COMMENT ON COLUMN users.password_hash IS 'パスワードハッシュ（bcrypt等）';
COMMENT ON COLUMN users.role IS '役割: customer/business_owner/employee/admin/agent';
COMMENT ON COLUMN users.is_active IS '有効フラグ';
COMMENT ON COLUMN users.email_verified IS 'メール認証済みフラグ';
