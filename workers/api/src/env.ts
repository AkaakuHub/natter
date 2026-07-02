export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  ACCOUNT_URL: string;
  APP_ID: string;
  APP_SESSION_HMAC_SECRET: string;
  SESSION_KID: string;
  FRONTEND_URLS?: string;
}
