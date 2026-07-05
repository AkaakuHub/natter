export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  REALTIME: DurableObjectNamespace;
  ACCOUNT_URL: string;
  APP_ID: string;
  APP_SESSION_HMAC_SECRET: string;
  SESSION_KID: string;
  FRONTEND_URLS?: string;
  AUTH_MODE: "link-auth" | "local-header";
}
