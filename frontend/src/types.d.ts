import { type Session } from "next-auth";

export type ExtendedSession = Session & {
  user: {
    id: string | null | undefined;
  };
}