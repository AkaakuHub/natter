#!/bin/bash

echo "🧹 Clearing Next.js cache thoroughly..."

# プロセスを停止
echo "Stopping any running Next.js processes..."
pkill -f "next dev" || true
sleep 2

# すべてのキャッシュを削除
echo "Removing cache directories..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .tailwindcss-cache
rm -rf .swc

# pnpmキャッシュもクリア
echo "Clearing pnpm cache..."
pnpm store prune

echo "✅ All caches cleared. Please run 'pnpm dev' manually to restart."