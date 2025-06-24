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
      authorization: {
        url: "https://api.twitter.com/oauth/authenticate",
        params: {
          scope: "read",
        }
      }
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on error
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      console.log('JWT callback:', { token, user, account });
      if (user) {
        token.user = user;
        const u = user;
        token.role = u.role;
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
          role: token.role,
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
      // Always redirect to home page after successful sign in
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  events: {
    signIn: async ({ user, account, profile }) => {
      console.log('Sign in event:', { user, account, profile });
    },
    signOut: async ({ session, token }) => {
      console.log('Sign out event:', { session, token });
    },
    createUser: async ({ user }) => {
      console.log('Create user event:', { user });
    },
    linkAccount: async ({ user, account, profile }) => {
      console.log('Link account event:', { user, account, profile });
    },
    session: async ({ session, token }) => {
      console.log('Session event:', { session, token });
    },
  },
};
