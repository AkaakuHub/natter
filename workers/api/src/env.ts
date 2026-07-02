export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  JWT_SECRET: string;
  INTERNAL_API_SECRET: string;
  FRONTEND_URLS?: string;
}
