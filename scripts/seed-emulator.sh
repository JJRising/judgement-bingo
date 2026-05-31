#!/usr/bin/env bash
#
# seed-emulator.sh — Create an admin user in the Firebase Auth + Firestore emulators.
#
# Usage: ./scripts/seed-emulator.sh
#
# Prerequisites: Firebase emulators must be running (firebase emulators:start).
# Safe to re-run — it upserts the user and doc each time.

set -euo pipefail

AUTH_HOST="http://127.0.0.1:9099"
FIRESTORE_HOST="http://127.0.0.1:8080"
PROJECT_ID="judgement-bingo"

# --- Configurable defaults (override via env vars) ---
EMAIL="${SEED_EMAIL:-admin@example.com}"
PASSWORD="${SEED_PASSWORD:-password1234}"
DISPLAY_NAME="${SEED_DISPLAY_NAME:-Admin}"

echo "→ Seeding emulator for project: $PROJECT_ID"
echo "  Email: $EMAIL  |  Display name: $DISPLAY_NAME"

# 1. Create or look up the Auth user via the emulator admin REST API.
#    Uses the project-scoped accounts:create endpoint with "Bearer owner" which
#    bypasses blocking functions — needed because on a fresh emulator no member
#    doc exists yet, so the public signUp endpoint would be rejected by
#    beforeUserCreated.
AUTH_RESPONSE=$(curl -s -X POST \
  "${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=any" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer owner' \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"${PASSWORD}\",
    \"displayName\": \"${DISPLAY_NAME}\",
    \"emailVerified\": true
  }")

USER_ID=$(echo "$AUTH_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('localId',''))")

if [ -z "$USER_ID" ]; then
  # Account may already exist — look it up by email
  LOOKUP_RESPONSE=$(curl -s -X POST \
    "${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=any" \
    -H 'Content-Type: application/json' \
    -d "{
      \"email\": \"${EMAIL}\",
      \"password\": \"${PASSWORD}\",
      \"returnSecureToken\": true
    }")

  USER_ID=$(echo "$LOOKUP_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('localId',''))")
  AUTH_RESPONSE="$LOOKUP_RESPONSE"
fi

if [ -z "$USER_ID" ]; then
  echo "✘ Failed to create or find Auth user. Last response:"
  echo "$AUTH_RESPONSE"
  exit 1
fi

echo "✓ Auth user created: uid=$USER_ID  email=$EMAIL"

# 2. Set custom claims {role: "admin"} on the Auth user via the emulator REST API
#    The project-scoped endpoint with "Bearer owner" auth is required to set customAttributes.
CLAIMS_RESPONSE=$(curl -s -X POST \
  "${AUTH_HOST}/identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:update?key=any" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer owner' \
  -d "{
    \"localId\": \"${USER_ID}\",
    \"customAttributes\": \"{\\\"role\\\":\\\"admin\\\"}\"
  }")

CLAIMS_ERROR=$(echo "$CLAIMS_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',{}).get('message',''))" 2>/dev/null || echo "")
if [ -n "$CLAIMS_ERROR" ]; then
  echo "✘ Failed to set custom claims: $CLAIMS_ERROR"
  exit 1
fi

echo "✓ Custom claims set: {\"role\": \"admin\"}"

# 3. Write the member doc to Firestore emulator REST API
NOW=$(python3 -c "import datetime; print(datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%S.000000000Z'))")

MEMBER_RESPONSE=$(curl -s -X PATCH \
  "${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/members/${USER_ID}?updateMask.fieldPaths=email&updateMask.fieldPaths=displayName&updateMask.fieldPaths=role&updateMask.fieldPaths=status&updateMask.fieldPaths=invitedBy&updateMask.fieldPaths=invitedAt" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer owner' \
  -d "{
    \"fields\": {
      \"email\":        {\"stringValue\": \"${EMAIL}\"},
      \"displayName\":  {\"stringValue\": \"${DISPLAY_NAME}\"},
      \"role\":         {\"stringValue\": \"admin\"},
      \"status\":       {\"stringValue\": \"active\"},
      \"invitedBy\":    {\"nullValue\": null},
      \"invitedAt\":    {\"timestampValue\": \"${NOW}\"}
    }
  }")

echo "✓ Member doc written: members/${USER_ID}"
echo ""
echo "Done! You can now sign in as:"
echo "  Email:    $EMAIL"
echo "  Password: $PASSWORD"
