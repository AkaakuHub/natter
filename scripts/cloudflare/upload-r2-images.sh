#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" = "--" ]]; then
  shift
fi

r2_bucket_name="${1:-natter-assets}"
source_dir="${2:-backend/uploads}"

if ! command -v wrangler >/dev/null 2>&1; then
  echo "wrangler is required" >&2
  exit 1
fi

if [[ ! -d "$source_dir" ]]; then
  echo "Source directory does not exist: $source_dir" >&2
  exit 1
fi

file_count="$(find "$source_dir" -maxdepth 1 -type f | wc -l | tr -d " ")"

if [[ "$file_count" = "0" ]]; then
  echo "No image files found in $source_dir" >&2
  exit 1
fi

find "$source_dir" -maxdepth 1 -type f -print0 | while IFS= read -r -d "" file_path; do
  object_key="$(basename "$file_path")"
  wrangler r2 object put "${r2_bucket_name}/${object_key}" --file "$file_path" --remote
done

echo "Uploaded $file_count image files to R2 bucket: $r2_bucket_name"
