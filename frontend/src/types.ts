import type { AuthSession } from "@/auth";

export interface ExtendedSession extends AuthSession {
  user: AuthSession["user"] & {
    email?: string | null;
  };
}
