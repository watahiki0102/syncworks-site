-- ========================================
-- Supabase Complete Setup - Part 4 (Final)
-- 案件・レビュー・通知・外部キー・トリガー
-- ========================================

-- ========================================
-- 6. Job Tables (案件管理テーブル)
-- ========================================

-- 6.1 jobs（引越し案件）
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  company_id UUID NOT NULL,
  job_number VARCHAR(50) NOT NULL UNIQUE,
  customer_last_name VARCHAR(100) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot VARCHAR(20) NOT NULL CHECK (scheduled_time_slot IN ('morning', 'afternoon', 'evening', 'flexible')),
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  assigned_truck_ids UUID[],
  total_price INT NOT NULL CHECK (total_price >= 0),
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'invoice')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded', 'cancelled')),
  paid_amount INT DEFAULT 0 CHECK (paid_amount >= 0),
  paid_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP,
  special_instructions TEXT,
  internal_notes TEXT,
  completion_notes TEXT,
  customer_signature_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_number ON jobs(job_number);
CREATE INDEX IF NOT EXISTS idx_jobs_quote ON jobs(quote_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_last_name, customer_first_name);

COMMENT ON TABLE jobs IS '引越し案件';
COMMENT ON COLUMN jobs.id IS '案件ID（主キー）';
COMMENT ON COLUMN jobs.quote_id IS '見積もりID（FK: quotes）';
COMMENT ON COLUMN jobs.company_id IS '業者ID（FK: moving_companies）';
COMMENT ON COLUMN jobs.job_number IS '案件番号';
COMMENT ON COLUMN jobs.customer_last_name IS '顧客姓';
COMMENT ON COLUMN jobs.customer_first_name IS '顧客名';
COMMENT ON COLUMN jobs.customer_phone IS '顧客電話番号';
COMMENT ON COLUMN jobs.customer_email IS '顧客メールアドレス';
COMMENT ON COLUMN jobs.from_address IS '旧住所';
COMMENT ON COLUMN jobs.to_address IS '新住所';
COMMENT ON COLUMN jobs.scheduled_date IS '予定日';
COMMENT ON COLUMN jobs.scheduled_time_slot IS '予定時間帯（morning/afternoon/evening/flexible）';
COMMENT ON COLUMN jobs.actual_start_time IS '実際の開始時刻';
COMMENT ON COLUMN jobs.actual_end_time IS '実際の終了時刻';
COMMENT ON COLUMN jobs.assigned_truck_ids IS 'アサインされたトラックID（配列）';
COMMENT ON COLUMN jobs.total_price IS '合計金額';
COMMENT ON COLUMN jobs.payment_method IS '支払方法（cash/card/bank_transfer/invoice）';
COMMENT ON COLUMN jobs.payment_status IS '支払状況（pending/partial/paid/refunded/cancelled）';
COMMENT ON COLUMN jobs.paid_amount IS '支払済み金額';
COMMENT ON COLUMN jobs.paid_at IS '支払日時';
COMMENT ON COLUMN jobs.status IS 'ステータス（scheduled/confirmed/in_progress/completed/cancelled/rescheduled）';
COMMENT ON COLUMN jobs.cancellation_reason IS 'キャンセル理由';
COMMENT ON COLUMN jobs.cancelled_at IS 'キャンセル日時';
COMMENT ON COLUMN jobs.special_instructions IS '特別指示';
COMMENT ON COLUMN jobs.internal_notes IS '社内メモ';
COMMENT ON COLUMN jobs.completion_notes IS '完了メモ';
COMMENT ON COLUMN jobs.customer_signature_url IS '顧客サインURL';
COMMENT ON COLUMN jobs.created_at IS '作成日時';
COMMENT ON COLUMN jobs.updated_at IS '更新日時';

-- 6.2 job_assignments（案件担当割当）
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('driver', 'worker', 'leader', 'supervisor')),
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  worked_hours DECIMAL(5,2),
  points_earned INT DEFAULT 0 CHECK (points_earned >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'checked_in', 'completed', 'cancelled', 'absent')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_employee ON job_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_status ON job_assignments(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_assignments_unique ON job_assignments(job_id, employee_id);

COMMENT ON TABLE job_assignments IS '案件担当割当';
COMMENT ON COLUMN job_assignments.id IS '割当ID（主キー）';
COMMENT ON COLUMN job_assignments.job_id IS '案件ID（FK: jobs）';
COMMENT ON COLUMN job_assignments.employee_id IS '従業員ID（FK: employees）';
COMMENT ON COLUMN job_assignments.role IS '担当役割（driver/worker/leader/supervisor）';
COMMENT ON COLUMN job_assignments.assigned_at IS 'アサイン日時';
COMMENT ON COLUMN job_assignments.confirmed_at IS '確認日時';
COMMENT ON COLUMN job_assignments.check_in_time IS 'チェックイン日時';
COMMENT ON COLUMN job_assignments.check_out_time IS 'チェックアウト日時';
COMMENT ON COLUMN job_assignments.worked_hours IS '実労働時間';
COMMENT ON COLUMN job_assignments.points_earned IS '獲得ポイント';
COMMENT ON COLUMN job_assignments.status IS 'ステータス（assigned/confirmed/checked_in/completed/cancelled/absent）';
COMMENT ON COLUMN job_assignments.notes IS '備考';
COMMENT ON COLUMN job_assignments.created_at IS '作成日時';
COMMENT ON COLUMN job_assignments.updated_at IS '更新日時';

-- 6.3 reviews（レビュー・評価）
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  reviewer_name VARCHAR(200) NOT NULL,
  reviewer_email VARCHAR(255),
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  service_quality_rating INT CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5),
  professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  comment TEXT,
  would_recommend BOOLEAN,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  response_from_company TEXT,
  responded_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_job ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_visible ON reviews(is_visible) WHERE is_visible = true;

COMMENT ON TABLE reviews IS 'レビュー・評価';
COMMENT ON COLUMN reviews.id IS 'レビューID（主キー）';
COMMENT ON COLUMN reviews.job_id IS '案件ID（FK: jobs）';
COMMENT ON COLUMN reviews.reviewer_name IS 'レビュアー名';
COMMENT ON COLUMN reviews.reviewer_email IS 'レビュアーメールアドレス';
COMMENT ON COLUMN reviews.overall_rating IS '総合評価（1-5）';
COMMENT ON COLUMN reviews.punctuality_rating IS '時間厳守評価（1-5）';
COMMENT ON COLUMN reviews.service_quality_rating IS 'サービス品質評価（1-5）';
COMMENT ON COLUMN reviews.professionalism_rating IS 'プロ意識評価（1-5）';
COMMENT ON COLUMN reviews.value_rating IS 'コスパ評価（1-5）';
COMMENT ON COLUMN reviews.comment IS 'コメント';
COMMENT ON COLUMN reviews.would_recommend IS '推薦意向';
COMMENT ON COLUMN reviews.is_verified IS '検証済みフラグ';
COMMENT ON COLUMN reviews.is_visible IS '公開フラグ';
COMMENT ON COLUMN reviews.response_from_company IS '業者からの返信';
COMMENT ON COLUMN reviews.responded_at IS '返信日時';
COMMENT ON COLUMN reviews.created_at IS '投稿日時';
COMMENT ON COLUMN reviews.updated_at IS '更新日時';

-- ========================================
-- 7. System Tables (システムテーブル)
-- ========================================

-- 7.1 notifications（通知）
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('quote_request', 'quote_received', 'quote_accepted', 'job_assigned', 'job_reminder', 'job_completed', 'payment_received', 'review_received', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS '通知';
COMMENT ON COLUMN notifications.id IS '通知ID（主キー）';
COMMENT ON COLUMN notifications.user_id IS 'ユーザーID（FK: users）';
COMMENT ON COLUMN notifications.notification_type IS '通知種別（quote_request/quote_received/quote_accepted/job_assigned/job_reminder/job_completed/payment_received/review_received/system）';
COMMENT ON COLUMN notifications.title IS 'タイトル';
COMMENT ON COLUMN notifications.message IS 'メッセージ本文';
COMMENT ON COLUMN notifications.related_entity_type IS '関連エンティティ種別';
COMMENT ON COLUMN notifications.related_entity_id IS '関連エンティティID';
COMMENT ON COLUMN notifications.action_url IS 'アクションURL';
COMMENT ON COLUMN notifications.is_read IS '既読フラグ';
COMMENT ON COLUMN notifications.read_at IS '既読日時';
COMMENT ON COLUMN notifications.priority IS '優先度（low/normal/high/urgent）';
COMMENT ON COLUMN notifications.expires_at IS '有効期限';
COMMENT ON COLUMN notifications.created_at IS '作成日時';

-- ========================================
-- 8. Foreign Keys (外部キー制約)
-- ========================================

-- users関連
ALTER TABLE moving_companies DROP CONSTRAINT IF EXISTS fk_moving_companies_owner;
ALTER TABLE moving_companies ADD CONSTRAINT fk_moving_companies_owner
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_company;
ALTER TABLE employees ADD CONSTRAINT fk_employees_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_user;
ALTER TABLE employees ADD CONSTRAINT fk_employees_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE real_estate_agents DROP CONSTRAINT IF EXISTS fk_real_estate_agents_user;
ALTER TABLE real_estate_agents ADD CONSTRAINT fk_real_estate_agents_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_user;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- trucks, shifts
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS fk_trucks_company;
ALTER TABLE trucks ADD CONSTRAINT fk_trucks_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE shifts DROP CONSTRAINT IF EXISTS fk_shifts_employee;
ALTER TABLE shifts ADD CONSTRAINT fk_shifts_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- referrals
ALTER TABLE referrers DROP CONSTRAINT IF EXISTS fk_referrers_agent;
ALTER TABLE referrers ADD CONSTRAINT fk_referrers_agent
  FOREIGN KEY (agent_id) REFERENCES real_estate_agents(id) ON DELETE SET NULL;

ALTER TABLE referral_cases DROP CONSTRAINT IF EXISTS fk_referral_cases_referrer;
ALTER TABLE referral_cases ADD CONSTRAINT fk_referral_cases_referrer
  FOREIGN KEY (referrer_id) REFERENCES referrers(id) ON DELETE CASCADE;

-- quotes
ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS fk_quote_requests_referrer_agent;
ALTER TABLE quote_requests ADD CONSTRAINT fk_quote_requests_referrer_agent
  FOREIGN KEY (referrer_agent_id) REFERENCES real_estate_agents(id) ON DELETE SET NULL;

ALTER TABLE moving_items DROP CONSTRAINT IF EXISTS fk_moving_items_request;
ALTER TABLE moving_items ADD CONSTRAINT fk_moving_items_request
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE;

ALTER TABLE moving_items DROP CONSTRAINT IF EXISTS fk_moving_items_master;
ALTER TABLE moving_items ADD CONSTRAINT fk_moving_items_master
  FOREIGN KEY (item_master_id) REFERENCES item_masters(id) ON DELETE SET NULL;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS fk_quotes_request;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_request
  FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE;

ALTER TABLE quotes DROP CONSTRAINT IF EXISTS fk_quotes_company;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE quote_options DROP CONSTRAINT IF EXISTS fk_quote_options_quote;
ALTER TABLE quote_options ADD CONSTRAINT fk_quote_options_quote
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

ALTER TABLE quote_options DROP CONSTRAINT IF EXISTS fk_quote_options_option;
ALTER TABLE quote_options ADD CONSTRAINT fk_quote_options_option
  FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE;

-- jobs
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS fk_jobs_quote;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_quote
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

ALTER TABLE jobs DROP CONSTRAINT IF EXISTS fk_jobs_company;
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_company
  FOREIGN KEY (company_id) REFERENCES moving_companies(id) ON DELETE CASCADE;

ALTER TABLE job_assignments DROP CONSTRAINT IF EXISTS fk_job_assignments_job;
ALTER TABLE job_assignments ADD CONSTRAINT fk_job_assignments_job
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE job_assignments DROP CONSTRAINT IF EXISTS fk_job_assignments_employee;
ALTER TABLE job_assignments ADD CONSTRAINT fk_job_assignments_employee
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS fk_reviews_job;
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_job
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- ========================================
-- 9. Triggers (トリガー)
-- ========================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_moving_companies_updated_at ON moving_companies;
CREATE TRIGGER update_moving_companies_updated_at BEFORE UPDATE ON moving_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_trucks_updated_at ON trucks;
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON shifts;
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_real_estate_agents_updated_at ON real_estate_agents;
CREATE TRIGGER update_real_estate_agents_updated_at BEFORE UPDATE ON real_estate_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrers_updated_at ON referrers;
CREATE TRIGGER update_referrers_updated_at BEFORE UPDATE ON referrers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referral_cases_updated_at ON referral_cases;
CREATE TRIGGER update_referral_cases_updated_at BEFORE UPDATE ON referral_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON quote_requests;
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_assignments_updated_at ON job_assignments;
CREATE TRIGGER update_job_assignments_updated_at BEFORE UPDATE ON job_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_item_masters_updated_at ON item_masters;
CREATE TRIGGER update_item_masters_updated_at BEFORE UPDATE ON item_masters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_rules_updated_at ON pricing_rules;
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_options_updated_at ON options;
CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_season_rules_updated_at ON season_rules;
CREATE TRIGGER update_season_rules_updated_at BEFORE UPDATE ON season_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- マイグレーション記録
-- ========================================

INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Initial schema creation - All 19 tables with full comments, foreign keys, and triggers')
ON CONFLICT (version) DO NOTHING;

-- ========================================
-- 完了メッセージ
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 19 tables + 1 migration table';
  RAISE NOTICE '  - All foreign key constraints';
  RAISE NOTICE '  - All update triggers';
  RAISE NOTICE '  - All indexes';
  RAISE NOTICE '  - All COMMENT (Japanese logical names)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run seed data (optional): npx prisma db seed';
  RAISE NOTICE '  2. Generate Prisma Client: npx prisma generate';
  RAISE NOTICE '  3. Test connection: npx prisma db pull';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
