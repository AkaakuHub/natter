import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  trustHost: true,
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID!,
      clientSecret: process.env.AUTH_TWITTER_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      console.log("--- JWT User ---", user);
      console.log("--- Twitter Account ---", account);
      console.log("--- Twitter Profile ---", profile);
      // 最初のサインイン時
      if (account) {
        token.twitterId = account.providerAccountId;
      }
      console.log("--- JWT Token ---", token);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // twitterIdがあればそれを、なければsubをフォールバックとして使用
        session.user.id = (token.twitterId || token.sub) as string;
        // JWTトークンもセッションに含める
        (session as any).accessToken = token;
      }
      return session;
    },
  },
});