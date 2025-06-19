# Natter ドキュメント

Natterアプリケーションの包括的なドキュメントです。

## 📁 ドキュメント構成

### 🔌 API関連
- **[API概要](api/overview.md)** - APIの基本情報と設計原則
- **[APIリファレンス](api/reference.md)** - 全エンドポイントの詳細仕様
- **[API実装記録](api/implementation.md)** - バックエンドAPI実装の詳細記録

### 🖥️ UI関連
- **[ポスト作成機能](ui/post-creation.md)** - 投稿作成コンポーネントの仕様と実装
- **[いいねシステム](ui/like-system.md)** - いいね機能とバグ修正の記録

### 🔐 認証関連
- **[PASSKEY認証システム](auth/passkey-system.md)** - 現在の認証方式の仕様と実装

### 🗄️ データベース関連
- **[スキーマ設計](database/schema-design.md)** - データベース設計と変遷記録

### 🔧 トラブルシューティング
- **[APIエラー対応](troubleshooting/api-errors.md)** - 発生したAPIエラーと解決方法

### 📜 レガシードキュメント
- **[NestJS移行分析](NESTJS_MIGRATION_ANALYSIS.md)** - 初期のフレームワーク選定分析
- **[リファクタリング分析](REFACTORING_ANALYSIS.md)** - コード改善の分析記録

## 🚀 クイックスタート

### 開発環境の構築
```bash
# リポジトリクローン
git clone [repository-url]
cd natter

# 依存関係インストール
pnpm install

# データベースセットアップ
cd backend
pnpm prisma migrate dev
pnpm prisma db seed

# 開発サーバー起動
pnpm run dev  # 両方のサーバーを起動
```

### 環境変数設定
```bash
# backend/.env
PASSKEY=1234
DATABASE_URL="file:./dev.db"
PORT=8000

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PASSKEY=1234
```

## 🏗️ アーキテクチャ概要

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **認証**: NextAuth.js (Twitter OAuth)
- **UI**: Tailwind CSS + shadcn/ui
- **状態管理**: Zustand

### バックエンド
- **フレームワーク**: NestJS 11.x
- **言語**: TypeScript
- **データベース**: SQLite + Prisma ORM
- **認証**: PASSKEY認証システム
- **API**: RESTful

### 主要機能
- ✅ ユーザー管理
- ✅ 投稿作成・表示
- ✅ いいね機能
- ✅ プロフィールページ
- ✅ タイムライン表示
- ✅ 画像添付（URL）

## 📊 開発の進捗

### 完了済み機能
- [x] バックエンドAPI実装
- [x] フロントエンドとの接続
- [x] ポスト作成機能
- [x] いいね機能
- [x] データベース設計
- [x] 認証システム
- [x] エラーハンドリング

### 今後の開発予定
- [ ] ファイルアップロード機能
- [ ] リアルタイム更新
- [ ] コメント機能
- [ ] フォロー機能
- [ ] ハッシュタグ機能
- [ ] 通知システム

## 🛠️ 技術スタック

| 分野 | 技術 | バージョン |
|-----|------|----------|
| Frontend Framework | Next.js | 15.x |
| Backend Framework | NestJS | 11.x |
| Database | SQLite | - |
| ORM | Prisma | 6.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Authentication | NextAuth.js | 4.x |
| State Management | Zustand | 4.x |

## 📈 パフォーマンス指標

### API レスポンス時間
- 投稿一覧取得: ~50ms
- 投稿作成: ~100ms
- いいね操作: ~30ms

### フロントエンド
- First Contentful Paint: ~800ms
- Largest Contentful Paint: ~1.2s
- Total Blocking Time: ~100ms

## 🤝 コントリビューション

### 開発ガイドライン
1. **コード品質**: ESLintとPrettierの設定に従う
2. **テスト**: 新機能には必ずテストを追加
3. **ドキュメント**: 実装と同時にドキュメントを更新
4. **型安全性**: TypeScriptの型定義を適切に使用

### ブランチ戦略
- `main`: 本番環境用
- `develop`: 開発統合用
- `feature/*`: 機能開発用
- `fix/*`: バグ修正用

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: その他の変更
```

## 🐛 既知の問題

### 制限事項
1. **画像アップロード**: 現在はURL入力のみ対応
2. **認証**: 開発用の簡易認証システム
3. **スケーラビリティ**: SQLiteの制限

### 修正済みの問題
- ✅ いいね数の増殖バグ
- ✅ API認証エラー
- ✅ CORS設定問題
- ✅ 環境変数の不整合

## 📞 サポート

### よくある質問
1. **Q**: 開発サーバーが起動しない
   **A**: [トラブルシューティング](troubleshooting/api-errors.md)を参照

2. **Q**: 401認証エラーが発生する
   **A**: PASSKEY環境変数を確認し、フロントエンドを再起動

3. **Q**: 投稿が表示されない
   **A**: バックエンドサーバーの起動状態とAPI接続を確認

### お問い合わせ
- 技術的な質問: [Issues](../../issues)
- 機能要望: [Discussions](../../discussions)

## 📝 ライセンス

このプロジェクトは[MIT License](../../LICENSE)の下で公開されています。

---

最終更新: 2025年6月19日