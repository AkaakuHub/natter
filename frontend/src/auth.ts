import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { ExtendedSession } from "./types";

export const { handlers, auth } = NextAuth({
  debug: true,
  trustHost: true,
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 最初のサインイン時
      if (account) {
        token.twitterId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // twitterIdがあればそれを、なければsubをフォールバックとして使用
        session.user.id = (token.twitterId || token.sub) as string;
        // JWTトークンもセッションに含める
        (session as ExtendedSession).accessToken = token;
      }
      return session;
    },
  },
});
