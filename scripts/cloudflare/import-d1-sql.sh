#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" = "--" ]]; then
  shift
fi

d1_database_name="${1:-natter}"
sql_path="${2:-cloudflare/import/natter.sql}"
wrangler_config="${3:-}"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "wrangler is required" >&2
  exit 1
fi

if [[ ! -f "$sql_path" ]]; then
  echo "SQL file does not exist: $sql_path" >&2
  exit 1
fi

args=("d1" "execute" "$d1_database_name" "--remote" "--file" "$sql_path")

if [[ -n "$wrangler_config" ]]; then
  if [[ ! -f "$wrangler_config" ]]; then
    echo "Wrangler config does not exist: $wrangler_config" >&2
    exit 1
  fi
  args+=("--config" "$wrangler_config")
fi

wrangler "${args[@]}"
