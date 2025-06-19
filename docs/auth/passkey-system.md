# PASSKEY認証システム

## 概要

NatterアプリケーションのAPI保護に使用されている簡易認証システムの仕様と実装です。

## 認証方式

### PASSKEY認証
- **方式**: 固定文字列による簡易認証
- **用途**: 開発環境でのAPI保護
- **スコープ**: 投稿作成、更新、削除、いいね機能

## 設定

### 環境変数

#### バックエンド (.env)
```env
PASSKEY=1234
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL="file:./dev.db"
PORT=8000
```

#### フロントエンド (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PASSKEY=1234
```

### 重要な注意点
- フロントエンドとバックエンドでPASSKEY値を統一する必要がある
- Next.jsでは環境変数変更後にフロントエンドの再起動が必要

## 実装詳細

### バックエンド実装

#### AuthGuard
**ファイル**: `backend/src/auth/auth.guard.ts`

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { key } = request.body;
    
    const expectedKey = this.configService.get<string>('PASSKEY');
    
    if (!key || key !== expectedKey) {
      throw new UnauthorizedException('Invalid key');
    }
    
    return true;
  }
}
```

#### 保護されたエンドポイント
```typescript
@Controller('posts')
export class PostsController {
  @Post()
  @UseGuards(AuthGuard) // PASSKEY認証が必要
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }
  
  @Post(':id/like')
  @UseGuards(AuthGuard) // PASSKEY認証が必要
  likePost(@Param('id') postId: number, @Body() body: any) {
    return this.postsService.likePost(postId, body.userId);
  }
}
```

### フロントエンド実装

#### API Client
**ファイル**: `frontend/src/api/posts.ts`

```typescript
export class PostsApi {
  static async createPost(data: CreatePostDto): Promise<Post> {
    const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
    return ApiClient.post<Post>('/posts', {
      ...data,
      key: passkey, // PASSKEY を含める
    });
  }
  
  static async likePost(postId: number, userId: number): Promise<LikeResponse> {
    const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
    return ApiClient.post<LikeResponse>(`/posts/${postId}/like`, {
      userId,
      key: passkey, // PASSKEY を含める
    });
  }
}
```

#### フォールバック機能
```typescript
// 環境変数が設定されていない場合のフォールバック
const passkey = process.env.NEXT_PUBLIC_PASSKEY || '1234';
```

## 認証フロー

### 1. 投稿作成時
```
1. ユーザーが投稿フォームを送信
2. フロントエンドがリクエストボディにPASSKEYを追加
3. バックエンドのAuthGuardがPASSKEYを検証
4. 検証成功時に投稿作成処理を実行
```

### 2. いいね操作時
```
1. ユーザーがいいねボタンをクリック
2. フロントエンドがリクエストボディにPASSKEYを追加
3. バックエンドのAuthGuardがPASSKEYを検証
4. 検証成功時にいいね処理を実行
```

## エラーレスポンス

### 認証失敗時
```json
{
  "statusCode": 401,
  "message": "Invalid key",
  "error": "Unauthorized"
}
```

### PASSKEY未送信時
```json
{
  "statusCode": 401,
  "message": "Invalid key",
  "error": "Unauthorized"
}
```

## トラブルシューティング

### よくある問題

#### 1. 401 Unauthorized エラー
**原因**:
- PASSKEY値の不一致
- 環境変数の設定ミス
- リクエストボディにキーが含まれていない

**解決方法**:
```bash
# 1. 環境変数を確認
echo $PASSKEY  # バックエンド
echo $NEXT_PUBLIC_PASSKEY  # フロントエンド

# 2. 値を統一
# backend/.env
PASSKEY=1234

# frontend/.env.local
NEXT_PUBLIC_PASSKEY=1234

# 3. フロントエンドを再起動
npm run dev
```

#### 2. 環境変数が読み込まれない
**原因**: Next.jsでは環境変数変更後の再起動が必要

**解決方法**:
```bash
# フロントエンドを停止して再起動
Ctrl+C
npm run dev
```

#### 3. CORS エラー
**原因**: フロントエンドURLがバックエンドのCORS設定に含まれていない

**解決方法**:
```env
# backend/.env
FRONTEND_URLS=http://localhost:3000,http://127.0.0.1:3000
```

## セキュリティ考慮事項

### 現在の制限
1. **平文保存**: PASSKEYが環境変数に平文で保存されている
2. **固定値**: 全ユーザーが同じPASSKEYを使用
3. **有効期限なし**: PASSKEYに有効期限がない
4. **ローテーションなし**: PASSKEYの定期変更機能がない

### 本格運用での改善案

#### 1. JWT認証システム
```typescript
// JWTベースの認証
interface JwtPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
```

#### 2. OAuth 2.0統合
```typescript
// TwitterOAuthとの統合
@Controller('auth')
export class AuthController {
  @Get('twitter')
  @UseGuards(TwitterOAuthGuard)
  twitterLogin() {}
  
  @Get('twitter/callback')
  @UseGuards(TwitterOAuthGuard)
  twitterCallback(@Req() req) {
    // JWTトークンを生成して返す
    return this.authService.login(req.user);
  }
}
```

#### 3. API キー管理
```typescript
// API キーの動的生成と管理
@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  key: string;
  
  @Column()
  userId: number;
  
  @Column()
  expiresAt: Date;
  
  @Column({ default: true })
  isActive: boolean;
}
```

## 開発環境での使用

### 1. 開発サーバー起動
```bash
# バックエンド
cd backend
npm run start:dev

# フロントエンド
cd frontend
npm run dev
```

### 2. 認証テスト
```bash
# curlでの認証テスト
curl -X POST "http://localhost:8000/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "テスト投稿",
    "authorId": 1,
    "key": "1234"
  }'
```

### 3. 認証エラーのテスト
```bash
# 間違ったPASSKEYでのテスト
curl -X POST "http://localhost:8000/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "テスト投稿",
    "authorId": 1,
    "key": "wrong_key"
  }'
# 期待結果: 401 Unauthorized
```

## 今後の拡張案

### 1. 段階的認証強化
```typescript
// Phase 1: API Key + User ID
interface AuthRequest {
  apiKey: string;
  userId: number;
  timestamp: number;
}

// Phase 2: JWT + Refresh Token
interface JwtAuthSystem {
  accessToken: string;  // 短期間有効
  refreshToken: string; // 長期間有効
}

// Phase 3: OAuth 2.0 + PKCE
interface OAuth2Flow {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
}
```

### 2. ログとモニタリング
```typescript
// 認証ログの記録
@Injectable()
export class AuthLogger {
  logAuthAttempt(ip: string, userAgent: string, success: boolean) {
    this.logger.log({
      event: 'auth_attempt',
      ip,
      userAgent,
      success,
      timestamp: new Date(),
    });
  }
}
```

### 3. レート制限
```typescript
// レート制限の実装
@Injectable()
export class RateLimitGuard implements CanActivate {
  private attempts = new Map<string, number[]>();
  
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    
    if (this.isRateLimited(ip)) {
      throw new TooManyRequestsException();
    }
    
    return true;
  }
}
```

## 結論

現在のPASSKEY認証システムは開発環境での使用に適した簡易的な認証方式です。本格的な運用環境では、JWT認証やOAuth 2.0などのより堅牢な認証システムへの移行を検討する必要があります。

開発段階では、この簡易認証システムにより十分な API 保護を提供し、アプリケーションの主要機能の開発に集中できる環境を提供しています。