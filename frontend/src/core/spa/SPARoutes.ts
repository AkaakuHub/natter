// SPA Routes Configuration - 一元管理
// 新しいルートを追加する場合はここに追加するだけで全体に反映される

interface SPARouteConfig {
  path: string;
  label: string;
  icon: string; // Tabler icon name
  authRequired?: boolean;
  component: () => Promise<{ default: React.ComponentType }>;
  title: string;
  description: string;
}

// メインナビゲーション用のルート定義
export const MAIN_NAVIGATION_ROUTES: SPARouteConfig[] = [
  {
    path: "/",
    label: "ホーム",
    icon: "IconHome",
    authRequired: true,
    component: () => import("@/components/views/HomeView"),
    title: "Natter - Home",
    description: "Natter social media timeline",
  },
  {
    path: "/search",
    label: "検索",
    icon: "IconSearch",
    authRequired: true,
    component: () => import("@/components/views/SearchView"),
    title: "Natter - Search",
    description: "Search posts and users on Natter",
  },
  {
    path: "/notification",
    label: "通知",
    icon: "IconBell",
    authRequired: true,
    component: () => import("@/components/views/NotificationView"),
    title: "Natter - Notifications",
    description: "Your notifications on Natter",
  },
  {
    path: "/timer",
    label: "タイマー",
    icon: "IconClock",
    authRequired: false,
    component: () => import("@/components/views/TimerView"),
    title: "Natter - Timer",
    description: "Timer functionality on Natter",
  },
  {
    path: "/set-list",
    label: "セトリ",
    icon: "IconVinyl",
    authRequired: true,
    component: () => import("@/components/views/SetListView"),
    title: "Natter - Characters",
    description: "Your characters on Natter",
  },
];

// その他のルート定義
const OTHER_ROUTES: SPARouteConfig[] = [
  {
    path: "/admin",
    label: "管理者",
    icon: "IconSettings",
    authRequired: true,
    component: () => import("@/components/views/AdminView"),
    title: "Natter - Admin",
    description: "Admin settings on Natter",
  },
  {
    path: "/login",
    label: "ログイン",
    icon: "IconLogin",
    authRequired: false,
    component: () => import("@/components/views/LoginView"),
    title: "Natter - Login",
    description: "Login to Natter",
  },
  {
    path: "/post/:id",
    label: "投稿詳細",
    icon: "IconFileText",
    authRequired: false,
    component: () => import("@/components/views/PostView"),
    title: "Natter - Post",
    description: "View post on Natter",
  },
  {
    path: "/profile",
    label: "プロフィール",
    icon: "IconUser",
    authRequired: false,
    component: () => import("@/components/views/ProfileView"),
    title: "Natter - My Profile",
    description: "Your profile on Natter",
  },
  {
    path: "/profile/:id",
    label: "ユーザープロフィール",
    icon: "IconUser",
    authRequired: false,
    component: () => import("@/components/views/ProfileView"),
    title: "Natter - Profile",
    description: "User profile on Natter",
  },
  {
    path: "/profile/:id/following",
    label: "フォロー中",
    icon: "IconUsers",
    authRequired: true,
    component: () => import("@/components/views/FollowingView"),
    title: "Natter - Following",
    description: "People this user follows on Natter",
  },
  {
    path: "/profile/:id/followers",
    label: "フォロワー",
    icon: "IconUsers",
    authRequired: true,
    component: () => import("@/components/views/FollowersView"),
    title: "Natter - Followers",
    description: "This user's followers on Natter",
  },
];

// 全てのルート定義を統合
export const ALL_ROUTES = [...MAIN_NAVIGATION_ROUTES, ...OTHER_ROUTES];

// middleware用のパスリストを取得
export const getMiddlewarePaths = (): string[] => {
  return ALL_ROUTES.map((route) => route.path).filter(
    (path) => !path.includes(":"),
  );
};
