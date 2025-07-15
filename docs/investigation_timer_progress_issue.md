# タイマー機能とメモリ（プログレス）の進行問題調査結果

## 調査日時
2025-07-14

## 調査対象
タイマー機能とメモリ（プログレス）の進行問題

## 1. タイマー関連ファイルの特定結果

### 主要なタイマー関連ファイル
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/Timer/index.tsx` - メインタイマーコンポーネント
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/views/TimerView.tsx` - タイマービューコンポーネント
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/layout/Header/components/ProfileDropdown.tsx` - プログレス表示部分

### 関連するレイアウト・設定ファイル
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/layout/BaseLayout.tsx` - 基本レイアウト
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/components/layout/HybridBaseLayout.tsx` - ハイブリッドレイアウト
- `/Users/akaaku/dev/AkaakuHub/natter/frontend/src/core/spa/SPARoutes.ts` - SPAルート定義

## 2. 現在のタイマー実装の概要

### Timer コンポーネント (`/Timer/index.tsx`)
- **周期**: 60秒サイクル
- **タイマー機能**: 
  - 開始/停止: `handleStartStop()`
  - リセット: `handleReset()`
  - 高精度更新: 16ms間隔で`setInterval`
- **状態管理**: 
  - `time`: 経過時間（秒）
  - `isRunning`: 動作状態
  - `useRef`を使用した正確な時間管理
- **プログレス表示**: 
  - 円形SVGプログレスバー
  - 周回数による色変更（2色サイクル）
  - 計算式: `(time % CYCLE_DURATION_SECONDS) / CYCLE_DURATION_SECONDS`

### プログレス連携部分
- `ProfileDropdown.tsx`でプログレス値を受け取り、プロフィール画像の透明度に適用
- `progress`プロパティは`Header`コンポーネントから渡される

## 3. プログレス更新が機能しない原因の特定

### 🔴 **主要な問題: プログレス値が固定**
両方のレイアウトコンポーネントで`progress={1}`として固定値が設定されている：

```typescript
// BaseLayout.tsx Line 82
<Header
  profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
  progress={1}  // 固定値
  userId={session?.user?.id}
  scrollContainerRef={scrollContainerRef}
/>

// HybridBaseLayout.tsx Line 96
<Header
  profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
  progress={1}  // 固定値
  userId={session?.user?.id}
  scrollContainerRef={scrollContainerRef}
/>
```

### 🔴 **タイマーとプログレスの連携不足**
- タイマーコンポーネントは内部で独自のプログレス計算を行っている
- レイアウトコンポーネントはタイマーの状態を参照していない
- プログレス値がヘッダーに反映されていない

## 4. 修正すべき箇所の特定

### 4.1 タイマー状態の共有化
**問題**: タイマーの状態がコンポーネント内に閉じ込められている

**修正方法**:
- グローバル状態管理（Zustand/Context）でタイマー状態を管理
- または、タイマーコンポーネントから状態を親に渡すコールバックを実装

### 4.2 レイアウトコンポーネントでのプログレス計算
**問題**: プログレス値が固定値`1`になっている

**修正方法**:
```typescript
// 修正例: BaseLayout.tsx / HybridBaseLayout.tsx
const [timerProgress, setTimerProgress] = useState(0);

// タイマーから状態を受け取る処理が必要
<Header
  profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
  progress={timerProgress}  // 動的な値
  userId={session?.user?.id}
  scrollContainerRef={scrollContainerRef}
/>
```

### 4.3 タイマーコンポーネントの改修
**問題**: タイマーの状態を外部に公開していない

**修正方法**:
```typescript
// 修正例: Timer/index.tsx
interface TimerProps {
  className?: string;
  onProgressChange?: (progress: number) => void;  // 追加
}

// useEffect内でプログレス変更を通知
useEffect(() => {
  if (onProgressChange) {
    const progress = (time % CYCLE_DURATION_SECONDS) / CYCLE_DURATION_SECONDS;
    onProgressChange(progress);
  }
}, [time, onProgressChange]);
```

## 5. 推奨される修正手順

1. **タイマー状態の共有化**
   - グローバル状態管理システムの導入
   - または、プロップドリリングによる状態の受け渡し

2. **レイアウトコンポーネントの修正**
   - `BaseLayout.tsx`と`HybridBaseLayout.tsx`の`progress`プロパティを動的に設定

3. **タイマーコンポーネントの拡張**
   - 外部への状態公開インターフェースの追加

4. **テスト**
   - タイマーの動作確認
   - プログレスバーの連携確認

## 6. 技術的な注意点

- タイマーの16ms間隔更新は高頻度なため、パフォーマンスへの影響を考慮する
- プログレス更新のthrottlingやdebouncingを検討する
- SPAナビゲーション時のタイマー状態維持についても考慮が必要

## 7. 結論

現在のタイマー機能自体は正常に動作しているが、プログレス値がヘッダーに反映されない原因は、レイアウトコンポーネントでプログレス値が固定値`1`として設定されているためです。タイマーとレイアウト間でのプログレス状態の共有メカニズムを実装することで解決できます。