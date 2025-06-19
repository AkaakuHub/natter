# データベーススキーマ設計

## 概要

Natterアプリケーションで使用されているPrisma ORMによるデータベーススキーマの設計と変遷です。

## 実装日
2025年6月19日

## 現在のスキーマ

### Prisma Schema
**ファイル**: `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  tel       String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
  likes     Like[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String?
  content   String?
  images    String? // JSON string of image URLs array
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
  likes     Like[]
}

model Like {
  id     Int  @id @default(autoincrement())
  user   User @relation(fields: [userId], references: [id])
  userId Int
  post   Post @relation(fields: [postId], references: [id])
  postId Int
  createdAt DateTime @default(now())

  @@unique([userId, postId])
}
```

## モデル詳細

### User モデル

#### フィールド
| フィールド | 型 | 制約 | 説明 |
|-----------|----|----|------|
| id | Int | @id, autoincrement | 主キー |
| email | String | @unique | ユーザーのメールアドレス |
| name | String | required | ユーザー名 |
| tel | String? | optional | 電話番号 |
| image | String? | optional | プロフィール画像URL |
| createdAt | DateTime | @default(now()) | 作成日時 |
| updatedAt | DateTime | @updatedAt | 更新日時 |

#### リレーション
- `posts: Post[]` - ユーザーが作成した投稿（1対多）
- `likes: Like[]` - ユーザーのいいね履歴（1対多）

### Post モデル

#### フィールド
| フィールド | 型 | 制約 | 説明 |
|-----------|----|----|------|
| id | Int | @id, autoincrement | 主キー |
| title | String? | optional | 投稿タイトル |
| content | String? | optional | 投稿内容 |
| images | String? | optional | 画像URLのJSON配列 |
| published | Boolean | @default(true) | 公開状態 |
| createdAt | DateTime | @default(now()) | 作成日時 |
| updatedAt | DateTime | @updatedAt | 更新日時 |
| authorId | Int? | optional, foreign key | 投稿者ID |

#### リレーション
- `author: User?` - 投稿者（多対1）
- `likes: Like[]` - 投稿へのいいね（1対多）

#### 画像の保存方式
```typescript
// 画像URLの配列をJSON文字列として保存
const imageUrls = ['url1.jpg', 'url2.jpg'];
const imagesJson = JSON.stringify(imageUrls); // '"[\"url1.jpg\",\"url2.jpg\"]"'

// 取得時の変換
const images = post.images ? JSON.parse(post.images) : [];
```

### Like モデル

#### フィールド
| フィールド | 型 | 制約 | 説明 |
|-----------|----|----|------|
| id | Int | @id, autoincrement | 主キー |
| userId | Int | foreign key | いいねしたユーザーID |
| postId | Int | foreign key | いいねされた投稿ID |
| createdAt | DateTime | @default(now()) | いいね日時 |

#### リレーション
- `user: User` - いいねしたユーザー（多対1）
- `post: Post` - いいねされた投稿（多対1）

#### 制約
- `@@unique([userId, postId])` - 同じユーザーが同じ投稿に複数回いいねできない

## データベース操作

### マイグレーション

#### 初期マイグレーション
```bash
# スキーマの初期作成
pnpm prisma migrate dev --name "init"
```

#### ソーシャルメディア機能追加
```bash
# User, Post, Likeモデルの拡張
pnpm prisma migrate dev --name "add-social-media-features"
```

#### マイグレーションファイル例
**ファイル**: `backend/prisma/migrations/[timestamp]_add_social_media_features/migration.sql`

```sql
-- CreateTable
CREATE TABLE "Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "images" TEXT;
ALTER TABLE "Post" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Post" ADD COLUMN "updatedAt" DATETIME NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "image" TEXT;
ALTER TABLE "User" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN "updatedAt" DATETIME NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");
```

### シードデータ

#### サンプルデータ作成
**ファイル**: `backend/prisma/seed.ts`

```typescript
async function main() {
  // ユーザー作成
  const alice = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
    }
  });

  // 投稿作成
  const post1 = await prisma.post.create({
    data: {
      content: 'Just had an amazing breakfast! 🍳',
      images: JSON.stringify(['https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop']),
      authorId: alice.id
    }
  });

  // いいね作成
  await prisma.like.create({
    data: {
      userId: bob.id,
      postId: post1.id
    }
  });
}
```

#### シード実行
```bash
pnpm prisma db seed
```

## クエリ例

### 複雑なクエリ

#### 投稿一覧（作成者といいね情報含む）
```typescript
const posts = await prisma.post.findMany({
  include: {
    author: true,
    likes: {
      include: {
        user: true,
      },
    },
    _count: {
      select: {
        likes: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

#### 特定ユーザーの投稿
```typescript
const userPosts = await prisma.post.findMany({
  where: { authorId: userId },
  include: {
    author: true,
    likes: true,
    _count: {
      select: {
        likes: true,
      },
    },
  },
});
```

#### いいねした投稿一覧
```typescript
const likedPosts = await prisma.like.findMany({
  where: { userId },
  include: {
    post: {
      include: {
        author: true,
        likes: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    },
  },
});
```

#### 画像付き投稿のみ
```typescript
const mediaPosts = await prisma.post.findMany({
  where: {
    images: {
      not: null,
    },
  },
  // 追加のフィルタリング（JavaScript側）
});

// JavaScript側でのフィルタリング
const filteredPosts = posts.filter(post => 
  post.images && JSON.parse(post.images).length > 0
);
```

## パフォーマンス最適化

### インデックス

#### 現在のインデックス
- `User.email` - UNIQUE制約によるインデックス
- `Like.(userId, postId)` - UNIQUE制約によるコンポジットインデックス

#### 追加推奨インデックス
```sql
-- 投稿の作成日時順でのソート用
CREATE INDEX "idx_post_created_at" ON "Post"("createdAt" DESC);

-- 特定ユーザーの投稿検索用
CREATE INDEX "idx_post_author_id" ON "Post"("authorId");

-- いいね数集計用
CREATE INDEX "idx_like_post_id" ON "Like"("postId");
```

### クエリ最適化

#### N+1問題の回避
```typescript
// BAD: N+1 問題が発生
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// GOOD: includeで一度に取得
const posts = await prisma.post.findMany({
  include: { author: true }
});
```

#### ページネーション
```typescript
// カーソルベースページネーション
const posts = await prisma.post.findMany({
  take: 10,
  skip: page * 10,
  cursor: lastPostId ? { id: lastPostId } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

## 制約と課題

### 現在の制約

#### 1. 画像保存方式
**問題**: SQLiteの制限により配列型が使用できない
**現在の解決策**: JSON文字列として保存
**将来の改善案**:
```typescript
// 別テーブルでの管理
model PostImage {
  id     Int    @id @default(autoincrement())
  url    String
  post   Post   @relation(fields: [postId], references: [id])
  postId Int
  order  Int    @default(0)
}
```

#### 2. 全文検索
**問題**: SQLiteでは全文検索機能が限定的
**将来の改善案**:
```sql
-- PostgreSQLでの全文検索
CREATE INDEX idx_post_content_fulltext ON "Post" 
USING gin(to_tsvector('english', content));
```

#### 3. パフォーマンス
**問題**: 大量データでの集計処理が重い
**改善案**:
```typescript
// いいね数のキャッシュ
model Post {
  likesCount Int @default(0) // キャッシュフィールド
}

// トリガーまたはアプリケーション側で更新
```

### 将来の拡張案

#### 1. コメント機能
```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  Int?
  replies   Comment[] @relation("CommentReplies")
}
```

#### 2. フォロー機能
```prisma
model Follow {
  id          Int  @id @default(autoincrement())
  follower    User @relation("UserFollows", fields: [followerId], references: [id])
  followerId  Int
  following   User @relation("UserFollowed", fields: [followingId], references: [id])
  followingId Int
  createdAt   DateTime @default(now())

  @@unique([followerId, followingId])
}
```

#### 3. ハッシュタグ機能
```prisma
model Hashtag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

model PostHashtag {
  post      Post    @relation(fields: [postId], references: [id])
  postId    Int
  hashtag   Hashtag @relation(fields: [hashtagId], references: [id])
  hashtagId Int

  @@id([postId, hashtagId])
}
```

## データベース管理

### バックアップ
```bash
# SQLiteファイルのバックアップ
cp backend/prisma/dev.db backend/prisma/backup_$(date +%Y%m%d_%H%M%S).db

# データのエクスポート
sqlite3 backend/prisma/dev.db .dump > backup.sql
```

### 開発環境のリセット
```bash
# データベースリセット
pnpm prisma migrate reset --force

# 再シード
pnpm prisma db seed
```

### 本番環境での注意点
```bash
# 本番環境では --force オプションを使用しない
pnpm prisma migrate deploy

# データ損失を避けるため、必ずバックアップを取る
```

## 結論

現在のスキーマ設計は、基本的なソーシャルメディア機能（投稿、いいね、ユーザー管理）を適切にサポートしています。SQLiteの制約内で効率的にデータを管理し、将来の機能拡張にも対応できる設計となっています。

今後の成長に応じて、PostgreSQLやMySQLなどのより高機能なデータベースへの移行や、追加機能に対応したスキーマの拡張を段階的に実施できる基盤が整っています。