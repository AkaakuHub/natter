import type { Session as NextAuthSession } from "next-auth";

// next-authのSession型を拡張して、ユーザーIDを追加
export interface ExtendedSession extends NextAuthSession {
  user: {
    id?: string;
  } & NextAuthSession["user"];
}