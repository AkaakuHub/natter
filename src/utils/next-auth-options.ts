import TwitterProvider from "next-auth/providers/twitter";

import type { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface User {
      role?: string;
  }

  interface JWT {
      role?: string;
      accessToken?: string;
  }
}

export const nextAuthOptions: NextAuthOptions = {
  debug: true,
  session: { strategy: "jwt" },
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.user = user;
        const u = user;
        token.role = u.role;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
};
