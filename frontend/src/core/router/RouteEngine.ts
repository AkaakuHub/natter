"use client";

import { EventEmitter } from "events";

interface RouteParams {
  [key: string]: string;
}

export interface ParsedRoute {
  path: string;
  params: RouteParams;
  query: URLSearchParams;
  hash: string;
}

export interface RouteDefinition {
  pattern: string;
  component: () => Promise<{ default: React.ComponentType }>;
  title?: string;
  meta?: Record<string, string>;
  authRequired?: boolean;
}

export class RouteEngine extends EventEmitter {
  private routes: RouteDefinition[] = [];
  private currentRoute: ParsedRoute | null = null;
  private isInitialized = false;

  constructor() {
    super();
    this.handlePopState = this.handlePopState.bind(this);
  }

  /**
   * ルートエンジンを初期化
   */
  initialize(): void {
    if (this.isInitialized) return;

    window.addEventListener("popstate", this.handlePopState);
    this.isInitialized = true;

    // 初期ルートを解析
    this.parseCurrentURL();
  }

  /**
   * ルートエンジンを破棄
   */
  destroy(): void {
    if (!this.isInitialized) return;

    window.removeEventListener("popstate", this.handlePopState);
    this.isInitialized = false;
    this.removeAllListeners();
  }

  /**
   * ルート定義を追加
   */
  addRoute(route: RouteDefinition): void {
    this.routes.push(route);
  }

  /**
   * 複数のルート定義を追加
   */
  addRoutes(routes: RouteDefinition[]): void {
    this.routes.push(...routes);
  }

  /**
   * URLパターンをマッチング
   */
  private matchRoute(
    pathname: string,
  ): { route: RouteDefinition; params: RouteParams } | null {
    for (const route of this.routes) {
      const params = this.extractParams(route.pattern, pathname);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  /**
   * パラメータを抽出
   */
  private extractParams(pattern: string, pathname: string): RouteParams | null {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);

    if (pattern === "/" && pathname === "/") {
      return {};
    }

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(":")) {
        // 動的パラメータ
        const paramName = patternPart.slice(1);
        params[paramName] = decodeURIComponent(pathPart);
      } else if (patternPart !== pathPart) {
        // 静的パスが一致しない
        return null;
      }
    }

    return params;
  }

  /**
   * 現在のURLを解析
   */
  private parseCurrentURL(): ParsedRoute {
    const url = new URL(window.location.href);

    const route: ParsedRoute = {
      path: url.pathname,
      params: {},
      query: url.searchParams,
      hash: url.hash,
    };

    const match = this.matchRoute(url.pathname);
    if (match) {
      route.params = match.params;
    }

    this.currentRoute = route;
    return route;
  }

  /**
   * ナビゲーション実行
   */
  navigate(
    to: string,
    options: { replace?: boolean; state?: unknown } = {},
  ): void {
    const url = new URL(to, window.location.origin);

    if (options.replace) {
      window.history.replaceState(options.state || null, "", url.href);
    } else {
      window.history.pushState(options.state || null, "", url.href);
    }

    this.handleRouteChange();
  }

  /**
   * 戻る
   */
  back(): void {
    window.history.back();
  }

  /**
   * 進む
   */
  forward(): void {
    window.history.forward();
  }

  /**
   * ルート変更をハンドル
   */
  private handleRouteChange(): void {
    const previousRoute = this.currentRoute;
    const newRoute = this.parseCurrentURL();

    // ルート変更イベントを発火
    this.emit("routeChange", {
      from: previousRoute,
      to: newRoute,
    });

    // メタタグ更新
    this.updateMetaTags(newRoute);
  }

  /**
   * popstateイベントハンドラ
   */
  private handlePopState(): void {
    this.handleRouteChange();
  }

  /**
   * メタタグを更新
   */
  private updateMetaTags(route: ParsedRoute): void {
    const match = this.matchRoute(route.path);
    if (!match) return;

    const { route: routeDef } = match;

    // タイトル更新
    if (routeDef.title) {
      document.title = routeDef.title;
    }

    // メタタグ更新
    if (routeDef.meta) {
      Object.entries(routeDef.meta).forEach(([name, content]) => {
        let metaElement = document.querySelector(`meta[name="${name}"]`);
        if (!metaElement) {
          metaElement = document.createElement("meta");
          metaElement.setAttribute("name", name);
          document.head.appendChild(metaElement);
        }
        metaElement.setAttribute("content", content);
      });
    }
  }

  /**
   * 現在のルートを取得
   */
  getCurrentRoute(): ParsedRoute | null {
    return this.currentRoute;
  }

  /**
   * ルート定義を取得
   */
  getRouteDefinition(pathname: string): RouteDefinition | null {
    const match = this.matchRoute(pathname);
    return match?.route || null;
  }

  /**
   * 認証が必要かチェック
   */
  isAuthRequired(pathname: string): boolean {
    const routeDef = this.getRouteDefinition(pathname);
    return routeDef?.authRequired ?? true; // デフォルトは認証必要
  }
}
