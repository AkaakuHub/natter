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
    async jwt({ token, profile }) {
      console.log("--- Twitter Profile ---", profile);
      if (profile) {
        token.twitterId = profile.id;
      }
      console.log("--- JWT Token ---", token);
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.twitterId as string;
      }
      return session;
    },
  },
});