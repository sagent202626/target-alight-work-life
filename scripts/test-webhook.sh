#!/usr/bin/env bash
# Simple test script for the universal webhook handler
# Usage: ./scripts/test-webhook.sh [local|deploy] 
# Default: local (http://localhost:3000)

BASE_URL="${1:-local}"
if [ "$BASE_URL" = "local" ]; then
  ORIGIN="http://localhost:3000"
else
  ORIGIN="$BASE_URL"
fi

# 1) Telegram-style callback_query simulation
echo "\n== Telegram-style callback_query test =="
curl -s -X POST "$ORIGIN/api/telegram/webhook" \
  -H 'Content-Type: application/json' \
  -d '{"callback_query":{"id":"test-cq-id","data":"approve:TESTTOKEN"}}' | jq || true

# 2) Generic approval payload
echo "\n== Generic approval payload test =="
curl -s -X POST "$ORIGIN/api/telegram/webhook" \
  -H 'Content-Type: application/json' \
  -d '{"token":"TESTTOKEN","decision":"approve","provider":"local"}' | jq || true

# 3) Register webhook (GET) — this triggers setWebhook using the request origin
echo "\n== Register webhook (GET) =="
curl -s -X GET "$ORIGIN/api/telegram/webhook" | jq || true

