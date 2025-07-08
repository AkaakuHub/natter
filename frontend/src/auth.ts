import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { ExtendedSession } from "./types";

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID || "",
      clientSecret: process.env.AUTH_TWITTER_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // 最初のサインイン時
      if (account && profile) {
        console.log("🔍 Twitter OAuth profile received:", profile);
        console.log("🔍 Twitter OAuth account received:", account);
        
        token.twitterId = account.providerAccountId;
        token.name = profile.name;
        token.image = profile.image;

        // バックエンドにユーザー情報を送信して作成/更新
        try {
          const userData = {
            twitterId: account.providerAccountId,
            name: 
              profile.name || 
              profile.username || 
              profile.login || 
              (profile as Record<string, unknown>).screen_name as string ||
              (profile as Record<string, unknown>).display_name as string ||
              ((profile as Record<string, unknown>).data as Record<string, unknown>)?.name as string ||
              ((profile as Record<string, unknown>).data as Record<string, unknown>)?.username as string ||
              `User_${account.providerAccountId}`,
            image: profile.image || (profile as Record<string, unknown>).picture as string || 
              ((profile as Record<string, unknown>).data as Record<string, unknown>)?.profile_image_url as string,
          };
          
          console.log("🔍 Sending user data to backend:", userData);
          
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            },
          );

          if (response.ok) {
            const userData = await response.json();
            token.userId = userData.id;
          }
        } catch (error) {
          console.error("Failed to create/update user in backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.twitterId || token.sub) as string;
        (session as ExtendedSession).accessToken = token;
        (session as ExtendedSession).jwtToken = token;
      }
      return session;
    },
  },
});
