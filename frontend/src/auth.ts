import NextAuth from "next-auth"
import Twitter from "next-auth/providers/twitter"

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  session: { strategy: "jwt" },
  providers: [
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      console.log('JWT callback:', { token, user, account });
      if (user) {
        token.user = user;
        token.role = (user as { role?: string }).role;
      }
      if (account) {
        token.accessToken = account.access_token;
        console.log('Access token received:', account.access_token);
      }
      return token;
    },
    session: ({ session, token }) => {
      console.log('Session callback:', { session, token });
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role as string,
          id: token.sub,
        },
      };
    },
    signIn: async ({ user, account, profile }) => {
      console.log('Sign in callback:', { user, account, profile });
      if (account?.provider === "twitter") {
        console.log('Twitter sign in successful');
        return true;
      }
      return true;
    },
    redirect: async ({ url, baseUrl }) => {
      console.log('Redirect callback:', { url, baseUrl });
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      console.log('Sign in event:', { user, account, profile });
    },
    signOut: async (message) => {
      console.log('Sign out event:', message);
    },
    createUser: async ({ user }) => {
      console.log('Create user event:', { user });
    },
    linkAccount: async ({ user, account, profile }) => {
      console.log('Link account event:', { user, account, profile });
    },
    session: async (message) => {
      console.log('Session event:', message);
    },
  },
})