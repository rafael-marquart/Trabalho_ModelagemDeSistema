#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must point to the CI PostgreSQL database}"
# Prisma adds `schema=public`, which libpq/psql does not accept as a URI parameter.
PSQL_DATABASE_URL="${DATABASE_URL%%\?*}"

# The preceding SQL smoke test creates this company and recruiter.
# Competing inserts use distinct link IDs but the same recruiter, so the
# partial unique index must allow exactly one active link.
psql "$PSQL_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  'DELETE FROM "RecruiterLink" WHERE "id" IN ('"'"'ci-concurrent-link-a'"'"', '"'"'ci-concurrent-link-b'"'"');'

set +e
psql "$PSQL_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  'INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId") VALUES ('"'"'\''ci-concurrent-link-a'\'', '\''ci-company'\'', '\''ci-recruiter-user'\'');' >/tmp/link-a.log 2>&1 &
pid_a=$!
psql "$PSQL_DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  'INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId") VALUES ('"'"'\''ci-concurrent-link-b'\'', '\''ci-company'\'', '\''ci-recruiter-user'\'');' >/tmp/link-b.log 2>&1 &
pid_b=$!
wait "$pid_a"
status_a=$?
wait "$pid_b"
status_b=$?
set -e

successes=0
[[ "$status_a" -eq 0 ]] && successes=$((successes + 1))
[[ "$status_b" -eq 0 ]] && successes=$((successes + 1))

if [[ "$successes" -ne 1 ]]; then
  cat /tmp/link-a.log /tmp/link-b.log
  echo "Expected exactly one concurrent active-link insert to succeed; got $successes" >&2
  exit 1
fi

echo "Concurrent active-link inserts correctly allowed exactly one winner."
