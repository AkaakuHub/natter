#!/bin/bash

# 本番環境での安全なマイグレーションスクリプト

echo "Starting safe migration for admin features..."

# バックアップ作成
echo "Creating backup..."
cp prisma/prod.db prisma/prod.db.backup-$(date +%Y%m%d-%H%M%S)

# isAdminカラムの確認と追加
echo "Checking isAdmin column..."
if ! sqlite3 prisma/prod.db "PRAGMA table_info(User);" | grep -q isAdmin; then
    echo "Adding isAdmin column..."
    sqlite3 prisma/prod.db "ALTER TABLE User ADD COLUMN isAdmin BOOLEAN NOT NULL DEFAULT false;"
else
    echo "isAdmin column already exists"
fi

# Settingsテーブルの確認と作成
echo "Checking Settings table..."
if ! sqlite3 prisma/prod.db ".tables" | grep -q Settings; then
    echo "Creating Settings table..."
    sqlite3 prisma/prod.db "CREATE TABLE Settings (
        id INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
        isRevealedSecrets BOOLEAN NOT NULL DEFAULT false,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL
    );"
else
    echo "Settings table already exists"
fi

# デフォルト設定の挿入
echo "Inserting default settings..."
sqlite3 prisma/prod.db "INSERT OR IGNORE INTO Settings (id, isRevealedSecrets, createdAt, updatedAt) 
VALUES (1, 0, datetime('now'), datetime('now'));"

# 結果の確認
echo "Migration completed. Current state:"
echo "Settings:"
sqlite3 prisma/prod.db "SELECT * FROM Settings;"
echo "Admin users:"
sqlite3 prisma/prod.db "SELECT id, name, isAdmin FROM User WHERE isAdmin = 1;"

echo "Done!"