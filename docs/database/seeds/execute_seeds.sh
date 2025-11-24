#!/bin/bash
# ========================================
# シードデータ一括実行スクリプト（Linux/Mac）
# Created: 2025-01-24
# ========================================

set -e  # エラー時に停止

echo "========================================"
echo "SyncWorks Database Seed Script"
echo "========================================"
echo ""

# 環境変数の確認
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo "Please set: export DATABASE_URL=postgresql://user:password@localhost:5432/syncworks_db"
    exit 1
fi

echo "Database URL: $DATABASE_URL"
echo ""

# 実行モードの選択
echo "Select execution mode:"
echo "[1] Required master data only (recommended for production)"
echo "[2] Required + Development test data (for development)"
echo ""
read -p "Enter mode (1 or 2): " MODE

if [ "$MODE" = "1" ]; then
    echo ""
    echo "========================================"
    echo "Executing REQUIRED master data only"
    echo "========================================"
    echo ""

    echo "[1/4] Inserting item masters..."
    psql "$DATABASE_URL" -f 01_required/01_item_masters.sql

    echo "[2/4] Inserting pricing rules..."
    psql "$DATABASE_URL" -f 01_required/02_pricing_rules.sql

    echo "[3/4] Inserting options..."
    psql "$DATABASE_URL" -f 01_required/03_options.sql

    echo "[4/4] Inserting season rules..."
    psql "$DATABASE_URL" -f 01_required/04_season_rules.sql

    echo ""
    echo "========================================"
    echo "SUCCESS: All seed data inserted!"
    echo "========================================"
    echo ""
    echo "Summary:"
    echo "- Item Masters: 37 items"
    echo "- Pricing Rules: 11 rules"
    echo "- Options: 27 options"
    echo "- Season Rules: 19 rules"

elif [ "$MODE" = "2" ]; then
    echo ""
    echo "========================================"
    echo "Executing FULL seed (Required + Test)"
    echo "WARNING: Includes test data for dev only!"
    echo "========================================"
    echo ""

    echo "[1/10] Inserting item masters..."
    psql "$DATABASE_URL" -f 01_required/01_item_masters.sql

    echo "[2/10] Inserting pricing rules..."
    psql "$DATABASE_URL" -f 01_required/02_pricing_rules.sql

    echo "[3/10] Inserting options..."
    psql "$DATABASE_URL" -f 01_required/03_options.sql

    echo "[4/10] Inserting season rules..."
    psql "$DATABASE_URL" -f 01_required/04_season_rules.sql

    echo "[5/10] Inserting test users..."
    psql "$DATABASE_URL" -f 02_development/01_test_users.sql

    echo "[6/10] Inserting test companies..."
    psql "$DATABASE_URL" -f 02_development/02_test_companies.sql

    echo "[7/10] Inserting test employees..."
    psql "$DATABASE_URL" -f 02_development/03_test_employees.sql

    echo "[8/10] Inserting test trucks..."
    psql "$DATABASE_URL" -f 02_development/04_test_trucks.sql

    echo "[9/10] Inserting test agents..."
    psql "$DATABASE_URL" -f 02_development/05_test_agents.sql

    echo "[10/10] Inserting test quote requests..."
    psql "$DATABASE_URL" -f 02_development/06_test_quote_requests.sql

    echo ""
    echo "========================================"
    echo "SUCCESS: All seed data inserted!"
    echo "========================================"
    echo ""
    echo "Summary:"
    echo "- Item Masters: 37 items"
    echo "- Pricing Rules: 11 rules"
    echo "- Options: 27 options"
    echo "- Season Rules: 19 rules"
    echo "- Test Users: 12 users"
    echo "- Test Companies: 2 companies"
    echo "- Test Employees: 4 employees"
    echo "- Test Trucks: 5 trucks"
    echo "- Test Agents: 2 agents"
    echo "- Test Quote Requests: 3 requests"

else
    echo "Invalid selection"
    exit 1
fi

echo ""
