# キャラクター作成時の400エラー調査結果

## 調査実施日
2025-07-23

## 調査概要
キャラクター作成時に発生する400エラーの原因を調査し、エラーハンドリングを改善しました。

## 調査結果

### 1. バックエンドのバリデーション制限

#### DTOファイル (`/Users/akaaku/dev/AkaakuHub/natter/backend/src/characters/dto/create-character.dto.ts`)
```typescript
export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)  // ← 50文字制限
  name: string;
}
```

#### データベーススキーマ (`/Users/akaaku/dev/AkaakuHub/natter/backend/prisma/schema.prisma`)
```prisma
model Character {
  id         Int      @id @default(autoincrement())
  name       String   // データベースレベルでの文字数制限なし
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  posts      Post[]
  postsCount Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, name]) // ← ユーザーごとにキャラクター名は一意
}
```

#### ValidationPipe設定 (`/Users/akaaku/dev/AkaakuHub/natter/backend/src/main.ts`)
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,  // ← 不正なフィールドで400エラー
    transform: true,
  }),
);
```

### 2. キャラクター作成エンドポイント

#### コントローラー (`/Users/akaaku/dev/AkaakuHub/natter/backend/src/characters/characters.controller.ts`)
```typescript
@Post()
@UseGuards(JwtAuthGuard)
async create(
  @Body(ValidationPipe) createCharacterDto: CreateCharacterDto,
  @Request() req: ExpressRequest,
) {
  return this.charactersService.create(
    createCharacterDto,
    req.user?.id || '',
  );
}
```

#### サービス (`/Users/akaaku/dev/AkaakuHub/natter/backend/src/characters/characters.service.ts`)
```typescript
async create(createCharacterDto: CreateCharacterDto, userId: string) {
  try {
    const character = await this.prisma.character.create({
      data: {
        ...createCharacterDto,
        userId,
      },
      // ...
    });
    return character;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Character name already exists');
    }
    throw error;
  }
}
```

### 3. フロントエンドの実装

#### APIクライアント (`/Users/akaaku/dev/AkaakuHub/natter/frontend/src/api/characters.ts`)
```typescript
async createCharacter(data: CreateCharacterDto): Promise<Character> {
  return ApiClient.post<Character>("/characters", data);
}
```

#### キャラクター作成UI (`/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/CharacterTagSelector/index.tsx`)
- `CharacterTagSelector`コンポーネント内で新規キャラクター作成が実装されている
- `useCreateCharacter`フックを使用してAPI呼び出しを行う

### 4. 特定されたエラーの原因

#### 主な400エラーの原因
1. **文字数制限違反**: `@MaxLength(50)`を超える文字数でキャラクター名を作成しようとした場合
2. **必須フィールド不足**: `@IsNotEmpty()`バリデーションに引っかかる空の文字列
3. **不正なフィールド**: `forbidNonWhitelisted: true`により、DTOに定義されていないフィールドが含まれた場合
4. **重複制約違反**: 同じユーザー内で同じ名前のキャラクターを作成しようとした場合（ただしこれは409 Conflictエラーとして処理される）

### 5. 改善実施内容

#### APIクライアントのエラーハンドリング改善
`/Users/akaaku/dev/AkaakuHub/natter/frontend/src/api/client.ts`に以下の改善を実施：

1. **通常のAPIリクエスト用**（`request`メソッド）
2. **FormDataリクエスト用**（`postFormData`、`patchFormData`メソッド）

```typescript
// 400エラー（バリデーションエラー等）の詳細メッセージを取得
if (response.status === 400) {
  try {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    
    // NestJSのValidationエラー形式を処理
    if (errorData.message && Array.isArray(errorData.message)) {
      throw new Error(errorData.message.join(", "));
    } else if (errorData.message) {
      throw new Error(errorData.message);
    } else {
      throw new Error(`Validation error: ${errorText}`);
    }
  } catch (parseError) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
```

## まとめ

### バリデーション制限値
- **キャラクター名の最大文字数**: 50文字
- **必須フィールド**: name（空文字列不可）
- **一意制約**: 同じユーザー内でキャラクター名は重複不可

### エラーハンドリング改善
- 400エラー時に詳細なバリデーションメッセージが表示されるようになりました
- NestJSのValidationPipeから返される配列形式のエラーメッセージも適切に処理されます
- フロントエンド側でより分かりやすいエラーメッセージが表示されるようになりました

### 対象ファイル
- `/Users/akaaku/dev/AkaakuHub/natter/backend/src/characters/dto/create-character.dto.ts`
- `/Users/akaaku/dev/AkaakuHub/natter/backend/src/characters/characters.controller.ts`
- `/Users/akaaku/dev/AkaakuHub/natter/backend/src/characters/characters.service.ts`
- `/Users/akaaku/dev/AkaakuHub/natter/backend/prisma/schema.prisma`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/api/client.ts`
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/CharacterTagSelector/index.tsx`