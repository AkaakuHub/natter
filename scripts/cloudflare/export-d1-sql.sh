#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" = "--" ]]; then
  shift
fi

database_path="${1:-backend/prisma/dev.db}"
output_path="${2:-cloudflare/import/natter.sql}"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required" >&2
  exit 1
fi

if [[ ! -f "$database_path" ]]; then
  echo "Database file does not exist: $database_path" >&2
  exit 1
fi

if [[ -e "$output_path" ]]; then
  echo "Output file already exists: $output_path" >&2
  exit 1
fi

mkdir -p "$(dirname "$output_path")"

{
  sqlite3 "$database_path" ".schema --nosys"
  for table_name in \
    _prisma_migrations \
    User \
    Settings \
    Character \
    Post \
    Like \
    Follow \
    Notification \
    UrlMetadataCache
  do
    sqlite3 "$database_path" ".dump --data-only --nosys \"$table_name\"" \
      | sed \
        -e "/^PRAGMA foreign_keys=OFF;$/d" \
        -e "/^BEGIN TRANSACTION;$/d" \
        -e "/^COMMIT;$/d"
  done
} > "$output_path"

echo "Exported D1 import SQL: $output_path"
