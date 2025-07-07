import type { DefaultSession, Session } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID. */
      id?: string;
    } & DefaultSession["user"];
  }
}

// ExtendedSession type for components
export interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } & DefaultSession["user"];
  accessToken?: unknown;
  jwtToken?: unknown;
}
