# 📚 データベーステーブル定義書（完全版）

## 目次

### 1. コアエンティティ
- [1.1 users（ユーザー）](#11-usersユーザー)
- [1.2 moving_companies（引越し業者）](#12-moving_companies引越し業者)

### 2. 従業員・リソース管理
- [2.1 employees（従業員）](#21-employees従業員)
- [2.2 trucks（トラック）](#22-trucksトラック)
- [2.3 shifts（シフト）](#23-shiftsシフト)

### 3. 不動産・紹介者管理
- [3.1 real_estate_agents（不動産仲介業者）](#31-real_estate_agents不動産仲介業者)
- [3.2 referrers（紹介者）](#32-referrers紹介者)
- [3.3 referral_cases（紹介案件）](#33-referral_cases紹介案件)

### 4. 見積依頼フロー
- [4.1 quote_requests（見積依頼）](#41-quote_requests見積依頼)
- [4.2 moving_items（引越し荷物）](#42-moving_items引越し荷物)
- [4.3 quotes（見積）](#43-quotes見積)
- [4.4 quote_options（見積オプション）](#44-quote_options見積オプション)

### 5. 案件管理
- [5.1 jobs（案件）](#51-jobs案件)
- [5.2 job_assignments（案件割り当て）](#52-job_assignments案件割り当て)
- [5.3 reviews（レビュー）](#53-reviewsレビュー)

### 6. マスタデータ
- [6.1 item_masters（荷物マスタ）](#61-item_masters荷物マスタ)
- [6.2 pricing_rules（料金ルール）](#62-pricing_rules料金ルール)
- [6.3 options（オプション）](#63-optionsオプション)
- [6.4 season_rules（シーズン加算ルール）](#64-season_rulesシーズン加算ルール)

### 7. システム機能
- [7.1 notifications（通知）](#71-notifications通知)

---

## 1. コアエンティティ

### 1.1 users（ユーザー）

**テーブル物理名**: `users`

**説明**: システム全体の認証基盤。顧客、業者オーナー、従業員、管理者、不動産業者など全ユーザーを統合管理。

**DDL**:
```sql
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
  moving_company_id UUID REFERENCES moving_companies(id),
  employee_id UUID REFERENCES employees(id),
  real_estate_agent_id UUID REFERENCES real_estate_agents(id),

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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_company ON users(moving_company_id);
```

**カラム定義**:

| # | カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---------|---|------|----------|------|
| 1 | id | UUID | NOT NULL | gen_random_uuid() | ユーザーID（主キー） |
| 2 | email | VARCHAR(255) | NOT NULL | - | メールアドレス（ログインID） |
| 3 | password_hash | VARCHAR(255) | NOT NULL | - | パスワードハッシュ（bcrypt等） |
| 4 | name | VARCHAR(100) | NOT NULL | - | 氏名 |
| 5 | role | VARCHAR(20) | NOT NULL | - | 役割（customer/business_owner/employee/admin/agent） |
| 6 | moving_company_id | UUID | NULL | - | 所属引越し業者ID（FK） |
| 7 | employee_id | UUID | NULL | - | 従業員ID（FK） |
| 8 | real_estate_agent_id | UUID | NULL | - | 不動産業者ID（FK） |
| 9 | is_active | BOOLEAN | NOT NULL | true | 有効フラグ |
| 10 | email_verified | BOOLEAN | NOT NULL | false | メール認証済みフラグ |
| 11 | email_verified_at | TIMESTAMP | NULL | - | メール認証日時 |
| 12 | last_login_at | TIMESTAMP | NULL | - | 最終ログイン日時 |
| 13 | password_reset_token | VARCHAR(255) | NULL | - | パスワードリセットトークン |
| 14 | password_reset_expires_at | TIMESTAMP | NULL | - | トークン有効期限 |
| 15 | created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| 16 | updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- **PRIMARY KEY**: `id`
- **UNIQUE**: `email`
- **CHECK**: `role IN ('customer', 'business_owner', 'employee', 'admin', 'agent')`

**外部キー**:
- `moving_company_id` → `moving_companies(id)`
- `employee_id` → `employees(id)`
- `real_estate_agent_id` → `real_estate_agents(id)`

**インデックス**:
- `idx_users_email`: email（ログイン高速化）
- `idx_users_role`: role（ロール別検索）
- `idx_users_active`: is_active WHERE is_active = true（有効ユーザー検索）
- `idx_users_company`: moving_company_id（業者別検索）

**ビジネスルール**:
- メールアドレスは全ユーザーで一意
- roleに応じて関連IDを設定（business_owner → moving_company_id必須）
- パスワードリセットトークンは1時間で失効
- パスワードはbcryptでハッシュ化（ストレッチング回数10以上）

**根拠ファイル**: `src/types/business/index.ts:8-44`

---

### 1.2 moving_companies（引越し業者）

**テーブル物理名**: `moving_companies`

**説明**: 引越し業者の基本情報を管理。

**DDL**:
```sql
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

CREATE INDEX idx_moving_companies_active ON moving_companies(is_active) WHERE is_active = true;
CREATE INDEX idx_moving_companies_name ON moving_companies(name);
```

**カラム定義**:

| # | カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---------|---|------|----------|------|
| 1 | id | UUID | NOT NULL | gen_random_uuid() | 業者ID（主キー） |
| 2 | name | VARCHAR(150) | NOT NULL | - | 業者名 |
| 3 | phone | VARCHAR(20) | NULL | - | 電話番号 |
| 4 | email | VARCHAR(255) | NULL | - | メールアドレス |
| 5 | address | VARCHAR(255) | NULL | - | 住所 |
| 6 | is_active | BOOLEAN | NOT NULL | true | 有効フラグ |
| 7 | created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| 8 | updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- **PRIMARY KEY**: `id`

**インデックス**:
- `idx_moving_companies_active`: is_active WHERE is_active = true
- `idx_moving_companies_name`: name

**ビジネスルール**:
- 業者削除時は論理削除（is_active = false）を推奨
- 従業員・トラックとの関連がある場合は物理削除不可

**根拠ファイル**: `src/types/business/index.ts:47-63`

---

## 2. 従業員・リソース管理

### 2.1 employees（従業員）

**テーブル物理名**: `employees`

**説明**: 引越し業者の従業員情報を管理。ドライバー、作業員、リーダー、マネージャーなど。

**DDL**:
```sql
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

CREATE INDEX idx_employees_company ON employees(moving_company_id);
CREATE INDEX idx_employees_status ON employees(status) WHERE status = 'active';
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_email ON employees(email);
```

**カラム定義**:

| # | カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---------|---|------|----------|------|
| 1 | id | UUID | NOT NULL | gen_random_uuid() | 従業員ID（主キー） |
| 2 | moving_company_id | UUID | NOT NULL | - | 所属業者ID（FK） |
| 3 | name | VARCHAR(100) | NOT NULL | - | 氏名 |
| 4 | email | VARCHAR(255) | NULL | - | メールアドレス |
| 5 | phone | VARCHAR(20) | NULL | - | 電話番号 |
| 6 | role | VARCHAR(20) | NOT NULL | - | 役割（driver/staff/leader/manager） |
| 7 | position | VARCHAR(50) | NULL | - | 役職 |
| 8 | employment_type | VARCHAR(30) | NULL | - | 雇用形態 |
| 9 | hire_date | DATE | NOT NULL | - | 入社日 |
| 10 | retire_date | DATE | NULL | - | 退職日 |
| 11 | birth_date | DATE | NULL | - | 生年月日 |
| 12 | status | VARCHAR(20) | NOT NULL | 'active' | ステータス |
| 13 | is_active | BOOLEAN | GENERATED | - | 有効フラグ（計算カラム） |
| 14 | address | VARCHAR(255) | NULL | - | 住所 |
| 15 | emergency_contact | VARCHAR(100) | NULL | - | 緊急連絡先 |
| 16 | qualifications | TEXT | NULL | - | 保有資格 |
| 17 | created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| 18 | updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `moving_company_id` → `moving_companies(id)` ON DELETE CASCADE
- **CHECK**: `role IN ('driver', 'staff', 'leader', 'manager')`
- **CHECK**: `employment_type IN ('正社員', 'パート', 'アルバイト', '契約社員')`
- **CHECK**: `status IN ('active', 'inactive', 'suspended')`
- **GENERATED**: `is_active AS (status = 'active')`

**インデックス**:
- `idx_employees_company`: moving_company_id
- `idx_employees_status`: status WHERE status = 'active'
- `idx_employees_role`: role
- `idx_employees_email`: email

**ビジネスルール**:
- 退職日が設定されたらstatusをinactiveに変更
- ドライバーは運転免許証情報をqualificationsに記載
- role='driver'の場合、qualificationsに運転免許証番号必須

**根拠ファイル**: `src/types/employee.ts:17-32`, `src/types/shared.ts:7-24`

---

### 2.2 trucks（トラック）

**テーブル物理名**: `trucks`

**説明**: 引越し業者が所有するトラック情報を管理。

**DDL**:
```sql
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id) ON DELETE CASCADE,

  -- 基本情報
  name VARCHAR(100) NOT NULL,
  plate_number VARCHAR(50),
  truck_type VARCHAR(30) NOT NULL
    CHECK (truck_type IN ('軽トラック', '2tショート', '2tロング', '4t', '10t')),

  -- 容量情報
  capacity_kg INT NOT NULL CHECK (capacity_kg > 0),
  capacity_points INT CHECK (capacity_points >= 0),

  -- 車検情報
  inspection_expiry DATE NOT NULL,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'in_use', 'maintenance', 'inactive', 'retired')),

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trucks_company ON trucks(moving_company_id);
CREATE INDEX idx_trucks_status ON trucks(status) WHERE status IN ('available', 'in_use');
CREATE INDEX idx_trucks_plate ON trucks(plate_number);
CREATE INDEX idx_trucks_inspection ON trucks(inspection_expiry);
```

**カラム定義**:

| # | カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---------|---|------|----------|------|
| 1 | id | UUID | NOT NULL | gen_random_uuid() | トラックID（主キー） |
| 2 | moving_company_id | UUID | NOT NULL | - | 所属業者ID（FK） |
| 3 | name | VARCHAR(100) | NOT NULL | - | トラック名/識別名 |
| 4 | plate_number | VARCHAR(50) | NULL | - | ナンバープレート |
| 5 | truck_type | VARCHAR(30) | NOT NULL | - | トラック種別 |
| 6 | capacity_kg | INT | NOT NULL | - | 積載容量（kg） |
| 7 | capacity_points | INT | NULL | - | 積載容量（ポイント） |
| 8 | inspection_expiry | DATE | NOT NULL | - | 車検有効期限 |
| 9 | status | VARCHAR(20) | NOT NULL | 'available' | ステータス |
| 10 | created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| 11 | updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `moving_company_id` → `moving_companies(id)` ON DELETE CASCADE
- **CHECK**: `truck_type IN ('軽トラック', '2tショート', '2tロング', '4t', '10t')`
- **CHECK**: `status IN ('available', 'in_use', 'maintenance', 'inactive', 'retired')`
- **CHECK**: `capacity_kg > 0`
- **CHECK**: `capacity_points >= 0`

**インデックス**:
- `idx_trucks_company`: moving_company_id
- `idx_trucks_status`: status WHERE status IN ('available', 'in_use')
- `idx_trucks_plate`: plate_number
- `idx_trucks_inspection`: inspection_expiry

**ビジネスルール**:
- 車検有効期限が切れたトラックは自動的にstatusをmaintenanceに変更
- capacity_pointsは見積システムとの連携用（荷物の総ポイント ≤ capacity_points）
- truck_typeと一般的な容量の対応:
  - 軽トラック: 350kg
  - 2tショート: 2,000kg
  - 2tロング: 2,000kg
  - 4t: 4,000kg
  - 10t: 10,000kg

**根拠ファイル**: `src/types/shared.ts:66-75`, `src/types/unified.ts:49-59`

---

### 2.3 shifts（シフト）

**テーブル物理名**: `shifts`

**説明**: 従業員のシフト情報を管理。案件への割り当ても含む。

**DDL**:
```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- シフト日時
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  time_slot VARCHAR(50),

  -- 割り当て情報
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,

  -- 作業情報
  customer_name VARCHAR(100),
  work_type VARCHAR(30)
    CHECK (work_type IN ('loading', 'moving', 'unloading', 'maintenance', 'other')),

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'planned'
    CHECK (status IN ('available', 'planned', 'assigned', 'booked',
                     'working', 'completed', 'cancelled', 'unavailable', 'overtime')),

  -- 備考
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 日マタギ対応の検証
  CONSTRAINT check_time_valid
    CHECK (start_time < end_time OR (start_time > end_time AND time_slot IS NOT NULL))
);

CREATE INDEX idx_shifts_employee ON shifts(employee_id, date);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_job ON shifts(job_id);
CREATE INDEX idx_shifts_truck ON shifts(truck_id);
CREATE INDEX idx_shifts_status ON shifts(status);
```

**カラム定義**:

| # | カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---------|---|------|----------|------|
| 1 | id | UUID | NOT NULL | gen_random_uuid() | シフトID（主キー） |
| 2 | employee_id | UUID | NOT NULL | - | 従業員ID（FK） |
| 3 | date | DATE | NOT NULL | - | シフト日 |
| 4 | start_time | TIME | NOT NULL | - | 開始時刻 |
| 5 | end_time | TIME | NOT NULL | - | 終了時刻 |
| 6 | time_slot | VARCHAR(50) | NULL | - | 時間帯ID（30分単位） |
| 7 | job_id | UUID | NULL | - | 割り当て案件ID（FK） |
| 8 | truck_id | UUID | NULL | - | 割り当てトラックID（FK） |
| 9 | customer_name | VARCHAR(100) | NULL | - | 顧客名 |
| 10 | work_type | VARCHAR(30) | NULL | - | 作業種別 |
| 11 | status | VARCHAR(20) | NOT NULL | 'planned' | ステータス |
| 12 | notes | TEXT | NULL | - | 備考 |
| 13 | created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| 14 | updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `employee_id` → `employees(id)` ON DELETE CASCADE
- **FOREIGN KEY**: `job_id` → `jobs(id)` ON DELETE SET NULL
- **FOREIGN KEY**: `truck_id` → `trucks(id)` ON DELETE SET NULL
- **CHECK**: `work_type IN ('loading', 'moving', 'unloading', 'maintenance', 'other')`
- **CHECK**: `status IN ('available', 'planned', 'assigned', 'booked', 'working', 'completed', 'cancelled', 'unavailable', 'overtime')`
- **CHECK**: `check_time_valid` - 日マタギ対応の時間検証

**インデックス**:
- `idx_shifts_employee`: (employee_id, date)
- `idx_shifts_date`: date
- `idx_shifts_job`: job_id
- `idx_shifts_truck`: truck_id
- `idx_shifts_status`: status

**ビジネスルール**:
- time_slotは00:00-24:00の30分単位（48スロット）
- 日マタギシフト（23:00-02:00等）はtime_slot必須
- job_idがNULLでないシフトは「案件割り当て済み」
- statusの遷移: planned → assigned → working → completed
- statusがavailableの場合、job_idはNULL

**根拠ファイル**: `src/types/shared.ts:53-63`, `src/types/employee.ts:5-15`, `src/constants/calendar.ts`

---

## 3. 不動産・紹介者管理

### 3.1 real_estate_agents（不動産仲介業者）

**テーブル物理名**: `real_estate_agents`

**説明**: 不動産仲介業者の情報を管理。紹介コード発行と案件紹介に使用。

**DDL**:
```sql
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

CREATE INDEX idx_real_estate_agents_referral_code ON real_estate_agents(referral_code);
CREATE INDEX idx_real_estate_agents_active ON real_estate_agents(is_active) WHERE is_active = true;
CREATE INDEX idx_real_estate_agents_license ON real_estate_agents(license_no);
```

**カラム定義**:

| # | カラム名 | 型 | NULL | デフォルト | 説明 |
|---|---------|---|------|----------|------|
| 1 | id | UUID | NOT NULL | gen_random_uuid() | 不動産業者ID（主キー） |
| 2 | company_name | VARCHAR(150) | NOT NULL | - | 会社名 |
| 3 | license_no | VARCHAR(50) | NOT NULL | - | 宅建業免許番号 |
| 4 | representative_name | VARCHAR(100) | NOT NULL | - | 代表者名 |
| 5 | contact_name | VARCHAR(100) | NOT NULL | - | 担当者名 |
| 6 | department | VARCHAR(100) | NULL | - | 部署 |
| 7 | phone | VARCHAR(20) | NULL | - | 電話番号 |
| 8 | email | VARCHAR(255) | NULL | - | メールアドレス |
| 9 | address | VARCHAR(255) | NOT NULL | - | 住所 |
| 10 | website_url | VARCHAR(255) | NULL | - | WebサイトURL |
| 11 | service_prefectures | TEXT[] | NULL | - | 対応都道府県（配列） |
| 12 | referral_code | VARCHAR(50) | NOT NULL | - | 紹介コード |
| 13 | registration_mode | VARCHAR(20) | NULL | - | 登録モード |
| 14 | referrer_name | VARCHAR(100) | NULL | - | 紹介者名 |
| 15 | is_active | BOOLEAN | NOT NULL | true | 有効フラグ |
| 16 | created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| 17 | updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約**:
- **PRIMARY KEY**: `id`
- **UNIQUE**: `license_no`, `referral_code`
- **CHECK**: `registration_mode IN ('self', 'referral')`

**インデックス**:
- `idx_real_estate_agents_referral_code`: referral_code
- `idx_real_estate_agents_active`: is_active WHERE is_active = true
- `idx_real_estate_agents_license`: license_no

**ビジネスルール**:
- referral_codeは自動生成（例：REA-XXXXXX）
- service_prefecturesは複数選択可能（PostgreSQL配列型）
- license_noは宅建業免許番号の形式チェック推奨（例：東京都知事(1)第12345号）

**根拠ファイル**: `src/types/realEstate.ts:9-20`, `src/types/realEstate.ts:29-34`

---

### 3.2 referrers（紹介者）

**テーブル物理名**: `referrers`

**説明**: 不動産業者以外の紹介者（個人・法人）を管理。報酬計算にも使用。

**DDL**:
```sql
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

CREATE INDEX idx_referrers_type ON referrers(referrer_type);
CREATE INDEX idx_referrers_email ON referrers(email);
CREATE INDEX idx_referrers_active ON referrers(is_active) WHERE is_active = true;
```

**カラム定義**: *(27カラム - 詳細は省略)*

**制約**:
- **PRIMARY KEY**: `id`
- **CHECK**: `referrer_type IN ('company', 'individual')`
- **CHECK**: `tax_category IN ('個人事業主', '給与所得者', '年金所得者', 'その他')`

**インデックス**:
- `idx_referrers_type`: referrer_type
- `idx_referrers_email`: email
- `idx_referrers_active`: is_active WHERE is_active = true

**ビジネスルール**:
- referrer_type='company'の場合、company_name必須
- referrer_type='individual'の場合、full_name必須
- 振込先情報は報酬支払いに使用
- terms_acceptedがfalseの場合、案件紹介不可

**根拠ファイル**: `src/types/referral.ts:79-92`, `src/types/referral.ts:18-27`, `src/types/referral.ts:48-74`

---

### 3.3 referral_cases（紹介案件）

**テーブル物理名**: `referral_cases`

**説明**: 紹介者経由の案件を管理。成約時の報酬計算に使用。

**DDL**:
```sql
CREATE TABLE referral_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 紹介者
  referrer_id UUID NOT NULL REFERENCES referrers(id),
  referrer_type VARCHAR(20) NOT NULL
    CHECK (referrer_type IN ('company', 'individual')),

  -- 見積依頼（紐付け）
  quote_request_id UUID REFERENCES quote_requests(id),

  -- 顧客情報（匿名化）
  customer_anonymous_id VARCHAR(100),
  customer_area VARCHAR(100),
  moving_date DATE,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'expired')),

  -- 成約情報
  contract_amount INT CHECK (contract_amount >= 0),
  commission_amount INT CHECK (commission_amount >= 0),
  commission_rate DECIMAL(5,2),

  -- タイムスタンプ
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referral_cases_referrer ON referral_cases(referrer_id);
CREATE INDEX idx_referral_cases_status ON referral_cases(status);
CREATE INDEX idx_referral_cases_application_date ON referral_cases(application_date DESC);
CREATE INDEX idx_referral_cases_quote_request ON referral_cases(quote_request_id);
```

**カラム定義**: *(14カラム)*

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `referrer_id` → `referrers(id)`
- **FOREIGN KEY**: `quote_request_id` → `quote_requests(id)`
- **CHECK**: `referrer_type IN ('company', 'individual')`
- **CHECK**: `status IN ('pending', 'in_progress', 'completed', 'cancelled', 'expired')`
- **CHECK**: `contract_amount >= 0`, `commission_amount >= 0`

**ビジネスルール**:
- status='completed'の場合、commission_amount自動計算
- commission_rateは紹介者ごとに異なる設定が可能（デフォルト5-10%）
- customer_anonymous_idはプライバシー保護のため顧客IDをハッシュ化

**根拠ファイル**: `src/types/referral.ts:106-132`

---

## 4. 見積依頼フロー

### 4.1 quote_requests（見積依頼）

**テーブル物理名**: `quote_requests`

**説明**: 顧客からの見積依頼を管理。フォーム入力データを保存。

**DDL**:
```sql
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 顧客情報
  customer_last_name VARCHAR(100) NOT NULL,
  customer_first_name VARCHAR(100) NOT NULL,
  customer_last_name_kana VARCHAR(100) NOT NULL,
  customer_first_name_kana VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,

  -- 紹介元情報
  referrer_agent_id UUID REFERENCES real_estate_agents(id),
  referral_id VARCHAR(100),

  -- 引越し種別
  move_type VARCHAR(20) NOT NULL CHECK (move_type IN ('single', 'family')),

  -- 発地情報
  from_postal_code VARCHAR(10),
  from_prefecture VARCHAR(50) NOT NULL,
  from_city VARCHAR(100) NOT NULL,
  from_address_detail VARCHAR(255),
  property_type_from VARCHAR(30),
  floor_from INT,
  has_elevator_from BOOLEAN,

  -- 着地情報
  to_postal_code VARCHAR(10),
  to_prefecture VARCHAR(50) NOT NULL,
  to_city VARCHAR(100) NOT NULL,
  to_address_detail VARCHAR(255),
  property_type_to VARCHAR(30),
  floor_to INT,
  has_elevator_to BOOLEAN,

  -- 希望日時（3候補対応）
  preferred_date_1 DATE,
  preferred_time_slot_1 VARCHAR(50),
  preferred_date_2 DATE,
  preferred_time_slot_2 VARCHAR(50),
  preferred_date_3 DATE,
  preferred_time_slot_3 VARCHAR(50),

  -- 依頼管理
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'answered', 'expired')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  source_type VARCHAR(50) NOT NULL,

  -- 日付管理
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deadline DATE NOT NULL,

  -- 梱包資材配送管理
  packing_delivery BOOLEAN DEFAULT false,
  packing_deadline DATE,
  packing_delivery_completed BOOLEAN DEFAULT false,

  -- 備考
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_request_date ON quote_requests(request_date DESC);
CREATE INDEX idx_quote_requests_referrer ON quote_requests(referrer_agent_id);
CREATE INDEX idx_quote_requests_customer_email ON quote_requests(customer_email);
CREATE INDEX idx_quote_requests_preferred_date ON quote_requests(preferred_date_1);
```

**カラム定義**: *(47カラム - 主要カラムのみ抜粋)*

| # | カラム名 | 説明 | 根拠 |
|---|---------|------|------|
| 1 | id | 見積依頼ID | - |
| 2-5 | customer_*_name/kana | 顧客名・カナ | common.ts:11-16 |
| 6-7 | customer_phone/email | 電話・メール | common.ts:18-20 |
| 8 | referrer_agent_id | 紹介元不動産業者ID | common.ts:111 |
| 10 | move_type | 引越し種別（single/family） | common.ts:31 |
| 11-17 | from_* | 発地情報 | common.ts:41-51 |
| 18-24 | to_* | 着地情報 | common.ts:42-51 |
| 25-30 | preferred_date_*/time_slot_* | 希望日時（3候補） | common.ts:206-210 |
| 31 | status | ステータス | common.ts:109 |
| 34 | source_type | 依頼元種別 | common.ts:107 |

**ビジネスルール**:
- deadlineは通常、request_dateから3日後
- source_type値例：syncmoving/suumo/manual/agent
- 複数希望日対応（最大3件）
- preferred_time_slot値: morning/afternoon/evening/night等

**根拠ファイル**: `src/types/common.ts:91-112`, `src/types/forms/index.ts:197-222`

---

### 4.2 moving_items（引越し荷物）

**テーブル物理名**: `moving_items`

**説明**: 見積依頼に紐づく荷物情報を管理。

**DDL**:
```sql
CREATE TABLE moving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  points_per_unit INT NOT NULL CHECK (points_per_unit >= 0),
  total_points INT GENERATED ALWAYS AS (quantity * points_per_unit) STORED,
  additional_cost INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moving_items_request ON moving_items(quote_request_id);
CREATE INDEX idx_moving_items_category ON moving_items(category);
```

**カラム定義**: *(9カラム)*

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `quote_request_id` → `quote_requests(id)` ON DELETE CASCADE
- **CHECK**: `quantity > 0`, `points_per_unit >= 0`
- **GENERATED**: `total_points AS (quantity * points_per_unit)`

**ビジネスルール**:
- total_pointsは自動計算（GENERATED COLUMN）
- item_nameは将来的にitem_mastersと連携予定
- categoryの標準値: furniture/appliances/boxes/clothing/books/electronics等

**根拠ファイル**: `src/types/common.ts:58-71`, `src/types/items-unified.ts:7-14`

---

### 4.3 quotes（見積）

**テーブル物理名**: `quotes`

**説明**: 引越し業者が提供する見積情報を管理。

**DDL**:
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id),

  -- 見積タイプ
  quote_type VARCHAR(20) NOT NULL DEFAULT 'quote'
    CHECK (quote_type IN ('quote', 'unavailable')),

  -- 料金情報（見積可能時のみ）
  base_price INT CHECK (base_price >= 0),
  discount_amount INT DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount INT CHECK (tax_amount >= 0),
  total_price INT CHECK (total_price >= 0),

  -- 料金内訳（見積算出根拠）
  breakdown_base_price INT,
  breakdown_distance_price INT,
  breakdown_option_price INT,
  breakdown_total_points INT,
  recommended_truck VARCHAR(50),

  -- 調整情報
  adjustment_amount INT DEFAULT 0,
  adjustment_rate DECIMAL(5,2) DEFAULT 0.00,
  adjustment_reason_type VARCHAR(30)
    CHECK (adjustment_reason_type IN ('competitive', 'urgent', 'repeat_customer',
           'volume_discount', 'difficulty', 'other')),
  adjustment_reason_desc TEXT,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired', 'completed')),

  -- 有効期限
  valid_until DATE,

  -- メッセージ
  response_comment TEXT,
  message_to_customer TEXT,

  -- 回答者情報
  responded_at TIMESTAMP,
  responded_by VARCHAR(100),

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- チェック制約：見積タイプがquoteの場合は料金必須
  CONSTRAINT check_quote_has_price
    CHECK (quote_type = 'unavailable' OR (base_price IS NOT NULL AND total_price IS NOT NULL))
);

CREATE INDEX idx_quotes_request ON quotes(quote_request_id);
CREATE INDEX idx_quotes_company ON quotes(moving_company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
```

**カラム定義**: *(27カラム)*

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `quote_request_id` → `quote_requests(id)` ON DELETE CASCADE
- **FOREIGN KEY**: `moving_company_id` → `moving_companies(id)`
- **CHECK**: 多数（上記DDL参照）
- **CONSTRAINT**: `check_quote_has_price` - 見積可能時は料金必須

**ビジネスルール**:
- quote_type='unavailable'の場合、料金情報はNULL
- valid_untilは通常、見積提出日から1週間
- adjustment_amountは値引き・値増しの調整額
- statusの遷移: pending → quoted → accepted → completed

**根拠ファイル**: `src/types/common.ts:117-140`, `src/types/business/index.ts:84-103`, `src/types/pricing.ts:143-157`

---

### 4.4 quote_options（見積オプション）

**テーブル物理名**: `quote_options`

**説明**: 見積に選択されたオプションサービスを管理（中間テーブル）。

**DDL**:
```sql
CREATE TABLE quote_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id),

  -- 選択時の情報
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  total_price INT NOT NULL CHECK (total_price >= 0),

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_quote_option UNIQUE (quote_id, option_id)
);

CREATE INDEX idx_quote_options_quote ON quote_options(quote_id);
CREATE INDEX idx_quote_options_option ON quote_options(option_id);
```

**カラム定義**: *(7カラム)*

**制約**:
- **PRIMARY KEY**: `id`
- **FOREIGN KEY**: `quote_id` → `quotes(id)` ON DELETE CASCADE
- **FOREIGN KEY**: `option_id` → `options(id)`
- **UNIQUE**: (quote_id, option_id)
- **CHECK**: `quantity > 0`, `unit_price >= 0`, `total_price >= 0`

**ビジネスルール**:
- 同一見積に同じオプションは1回のみ選択可能
- unit_priceは選択時点のoptions.priceをスナップショット
- total_price = unit_price × quantity

---

## 5. 案件管理

### 5.1 jobs（案件）

**テーブル物理名**: `jobs`

**説明**: 受注確定した引越し案件を管理。実作業の管理に使用。

**DDL**: *(長いため一部省略)*

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 参照情報
  quote_id UUID NOT NULL REFERENCES quotes(id),
  quote_request_id UUID REFERENCES quote_requests(id),
  moving_company_id UUID NOT NULL REFERENCES moving_companies(id),
  referrer_agent_id UUID REFERENCES real_estate_agents(id),

  -- 顧客情報スナップショット
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  from_address VARCHAR(500) NOT NULL,
  to_address VARCHAR(500) NOT NULL,

  -- 作業情報
  total_points INT,
  distance DECIMAL(10,2),

  -- 作業日時
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIMESTAMP,
  scheduled_end_time TIMESTAMP,
  time_slot VARCHAR(50),
  estimated_duration INT,

  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,

  -- リソース割り当て
  crew_size INT,
  truck_count INT,

  -- 選択オプション
  selected_options JSONB,

  -- 支払情報
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer', 'invoice')),
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  payment_amount INT,
  payment_due_date DATE,
  contract_date DATE,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),

  -- 備考
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_quote ON jobs(quote_id);
CREATE INDEX idx_jobs_request ON jobs(quote_request_id);
CREATE INDEX idx_jobs_company ON jobs(moving_company_id);
CREATE INDEX idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_referrer ON jobs(referrer_agent_id);
```

**カラム定義**: *(32カラム)*

**ビジネスルール**:
- 顧客情報はスナップショット（変更されても履歴保持）
- selected_optionsはJSONB型で柔軟に保存
- actual_start_time/end_timeは実績記録用
- estimated_durationは分単位
- statusの遷移: scheduled → in_progress → completed

**根拠ファイル**: `src/types/business/index.ts:189-201`, `src/types/shared.ts:101-146`

---

### 5.2 job_assignments（案件割り当て）

**テーブル物理名**: `job_assignments`

**説明**: 案件に対する従業員・トラックの割り当てを詳細管理。

**DDL**:
```sql
CREATE TABLE job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- リソース割り当て
  employee_id UUID REFERENCES employees(id),
  truck_id UUID REFERENCES trucks(id),

  -- 役割
  assignment_type VARCHAR(20) NOT NULL
    CHECK (assignment_type IN ('driver', 'worker', 'leader')),

  -- 作業時間
  assigned_start_time TIMESTAMP NOT NULL,
  assigned_end_time TIMESTAMP NOT NULL,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_assignment_has_resource
    CHECK (employee_id IS NOT NULL OR truck_id IS NOT NULL)
);

CREATE INDEX idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX idx_job_assignments_employee ON job_assignments(employee_id);
CREATE INDEX idx_job_assignments_truck ON job_assignments(truck_id);
```

**カラム定義**: *(9カラム)*

**ビジネスルール**:
- 少なくとも従業員またはトラックのいずれかが必須
- assignment_typeがdriverの場合、employee_id必須
- 同一jobに対して複数の割り当て可能（複数従業員・複数トラック）

**根拠ファイル**: `src/types/shared.ts:149-154`

---

### 5.3 reviews（レビュー）

**テーブル物理名**: `reviews`

**説明**: 案件完了後の顧客レビューを管理。サービス品質向上に使用。

**DDL**:
```sql
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

CREATE INDEX idx_reviews_job ON reviews(job_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

**カラム定義**: *(10カラム)*

**ビジネスルール**:
- ratingは1-5の整数
- is_verifiedがtrueの場合、実際の顧客による投稿と確認済み
- 平均評価の計算時はis_verified=trueのみを使用推奨

**根拠ファイル**: `src/types/business/index.ts:211-233`

---

## 6. マスタデータ

### 6.1 item_masters（荷物マスタ）

**テーブル物理名**: `item_masters`

**説明**: 荷物の標準情報を管理。料金計算の基準データ。

**DDL**:
```sql
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

CREATE INDEX idx_item_masters_category ON item_masters(category);
CREATE INDEX idx_item_masters_active ON item_masters(is_active) WHERE is_active = true;
```

**カラム定義**: *(13カラム)*

**ビジネスルール**:
- nameは全アイテムで一意（重複不可）
- typical_size: S/M/L/XL
- display_orderは小さい順に表示
- is_active=falseの場合、新規見積には表示しない

**根拠ファイル**: `src/types/pricing.ts:57-64`, `src/types/items-unified.ts:28-33`

---

### 6.2 pricing_rules（料金ルール）

**テーブル物理名**: `pricing_rules`

**説明**: ポイント・距離に基づく料金計算ルールを管理。

**DDL**:
```sql
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- トラック種別と適用範囲
  truck_type VARCHAR(30) NOT NULL
    CHECK (truck_type IN ('軽トラック', '2tショート', '2tロング', '4t', '10t')),
  min_point INT NOT NULL,
  max_point INT,

  -- 料金設定
  base_price INT NOT NULL CHECK (base_price >= 0),
  price_per_km DECIMAL(10,2) CHECK (price_per_km >= 0),

  -- 適用期間
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,

  -- 有効フラグ
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_pricing_rule
    UNIQUE (truck_type, min_point, max_point, valid_from)
);

CREATE INDEX idx_pricing_rules_truck_type ON pricing_rules(truck_type);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active) WHERE is_active = true;
```

**カラム定義**: *(12カラム)*

**ビジネスルール**:
- max_pointがNULLの場合、上限なし
- 同一truck_type・ポイント範囲・開始日の組み合わせは一意
- valid_untilがNULLの場合、無期限有効
- 料金計算時は最新のvalid_from（現在日以前）のルールを使用

**根拠ファイル**: `src/types/pricing.ts:69-75`, `src/lib/business-logic.ts:329-336`

---

### 6.3 options（オプション）

**テーブル物理名**: `options`

**説明**: 見積のオプションサービスマスタ。

**DDL**:
```sql
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

CREATE INDEX idx_options_active ON options(is_active) WHERE is_active = true;
CREATE INDEX idx_options_type ON options(option_type);
```

**カラム定義**: *(15カラム)*

**ビジネスルール**:
- option_typeの意味:
  - free: 無料オプション
  - paid: 有料オプション（価格固定）
  - individual: 個別見積（priceはNULL）
  - nonSupported: 非対応
- min_point/max_pointで適用条件を制限可能
- is_defaultがtrueの場合、デフォルトで選択状態

**根拠ファイル**: `src/types/pricing.ts:80-90`

---

### 6.4 season_rules（シーズン加算ルール）

**テーブル物理名**: `season_rules`

**説明**: 繁忙期（GW、お盆、年末年始など）の料金加算ルールを管理。

**DDL**:
```sql
CREATE TABLE season_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ルール名
  name VARCHAR(100) NOT NULL,
  description TEXT,

  -- 適用期間
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- 料金設定
  price_type VARCHAR(20) NOT NULL
    CHECK (price_type IN ('percentage', 'fixed')),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),

  -- 繰り返し設定
  is_recurring BOOLEAN DEFAULT false,
  recurring_type VARCHAR(20)
    CHECK (recurring_type IN ('yearly', 'monthly', 'weekly', 'none')),
  recurring_pattern JSONB,
  recurring_end_year INT,

  -- 有効フラグ
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_season_rules_dates ON season_rules(start_date, end_date);
CREATE INDEX idx_season_rules_active ON season_rules(is_active) WHERE is_active = true;
```

**カラム定義**: *(14カラム)*

**ビジネスルール**:
- price_typeがpercentageの場合、priceは%（例：20.00 = 20%増）
- price_typeがfixedの場合、priceは固定額（円）
- recurring_patternの構造例（JSONB）:
  ```json
  {
    "weekdays": [6, 0],  // 土日
    "monthlyPattern": "weekday"
  }
  ```
- 複数ルールが重複した場合は合算

**根拠ファイル**: `src/types/pricing.ts:28-52`

---

## 7. システム機能

### 7.1 notifications（通知）

**テーブル物理名**: `notifications`

**説明**: システム通知を管理（メール・アプリ内通知）。

**DDL**:
```sql
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

CREATE INDEX idx_notifications_recipient ON notifications(recipient_email, is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

**カラム定義**: *(13カラム)*

**ビジネスルール**:
- expires_atを過ぎた通知は自動的に削除またはアーカイブ
- dataフィールドには通知に関連する追加情報（案件ID等）を格納
- priorityがurgentの場合、即座にメール送信
- 通知の保持期間: 30日（expires_at = created_at + 30日）

**根拠ファイル**: `src/types/business/index.ts:236-259`

---

## 付録

### A. ステータス値一覧

| テーブル | カラム | 値 |
|---------|-------|---|
| quote_requests | status | pending/answered/expired |
| quote_requests | priority | high/medium/low |
| quotes | status | pending/quoted/accepted/rejected/expired/completed |
| quotes | quote_type | quote/unavailable |
| jobs | status | scheduled/in_progress/completed/cancelled/rescheduled |
| jobs | payment_status | pending/paid/partial/refunded |
| employees | status | active/inactive/suspended |
| trucks | status | available/in_use/maintenance/inactive/retired |
| shifts | status | available/planned/assigned/booked/working/completed/cancelled/unavailable/overtime |
| referral_cases | status | pending/in_progress/completed/cancelled/expired |

### B. CHECK制約一覧

各テーブルの主要なCHECK制約は上記DDL参照。

### C. 外部キー制約一覧

| 子テーブル | 子カラム | 親テーブル | 親カラム | ON DELETE |
|----------|---------|----------|---------|-----------|
| employees | moving_company_id | moving_companies | id | CASCADE |
| trucks | moving_company_id | moving_companies | id | CASCADE |
| shifts | employee_id | employees | id | CASCADE |
| shifts | job_id | jobs | id | SET NULL |
| shifts | truck_id | trucks | id | SET NULL |
| quote_requests | referrer_agent_id | real_estate_agents | id | - |
| moving_items | quote_request_id | quote_requests | id | CASCADE |
| quotes | quote_request_id | quote_requests | id | CASCADE |
| quotes | moving_company_id | moving_companies | id | - |
| quote_options | quote_id | quotes | id | CASCADE |
| quote_options | option_id | options | id | - |
| jobs | quote_id | quotes | id | - |
| jobs | moving_company_id | moving_companies | id | - |
| job_assignments | job_id | jobs | id | CASCADE |
| job_assignments | employee_id | employees | id | - |
| job_assignments | truck_id | trucks | id | - |
| reviews | job_id | jobs | id | - |
| referral_cases | referrer_id | referrers | id | - |
| referral_cases | quote_request_id | quote_requests | id | - |

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| 1.0.0 | 2025-01-24 | 初版作成 |

---

## 関連ドキュメント

- [ER図](./ER-DIAGRAM.md)
- [DDLスクリプト](./ddl/)
- [マイグレーション計画](./MIGRATION-PLAN.md)
- [型定義との対応表](./TYPE-MAPPING.md)
