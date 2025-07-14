// SPA関連の全てをエクスポート - 一元管理のエントリーポイント

// Routes
export * from "./SPARoutes";

// Navigation
export * from "./SPANavigation";

// Helpers
export * from "./SPAHelpers";

// 使用方法のドキュメント
/**
 * SPA関連の一元管理システム
 *
 * ## 新しいルートを追加する場合
 * 1. SPARoutes.ts の MAIN_NAVIGATION_ROUTES または OTHER_ROUTES に追加
 * 2. 必要に応じて SPAHelpers.ts にアイコンマッピングを追加
 * 3. これだけで自動的に以下に反映される：
 *    - middleware.ts のルートリスト
 *    - HybridSPA.tsx のルート定義
 *    - ViewRenderer.tsx のコンポーネントマップ
 *    - FooterMenu のアイテム
 *    - Navigation hooks
 *
 * ## 使用例
 * ```typescript
 * import { useSPANavigation, getFooterMenuItems } from "@/core/spa";
 *
 * const { navigateToTimer, navigateToPath } = useSPANavigation();
 * const footerItems = getFooterMenuItems();
 * ```
 */
