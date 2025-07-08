import NextAuth from "next-auth";
import Twitter from "next-auth/providers/twitter";
import { ExtendedSession } from "./types";

// Twitter profile data types
interface TwitterProfileData {
  id?: string;
  id_str?: string;
  name?: string;
  username?: string;
  screen_name?: string;
  profile_image_url?: string;
  profile_image_url_https?: string;
  email?: string;
}

interface TwitterProfile {
  data?: TwitterProfileData;
  id?: string;
  name?: string;
  username?: string;
  image?: string;
  email?: string;
}

export const { handlers, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID || "",
      clientSecret: process.env.AUTH_TWITTER_SECRET || "",
      profile(profile: TwitterProfile) {
        // console.log("🔍 Raw Twitter profile data:", profile);
        // データが { data: { ... } } 形式で来ている場合の対応
        const userData: TwitterProfileData = profile.data || profile;
        return {
          id: String(userData.id || userData.id_str || ""),
          name: String(
            userData.name ||
              userData.screen_name ||
              userData.username ||
              "Unknown User",
          ),
          username: String(userData.username || userData.screen_name || ""),
          image: String(
            userData.profile_image_url ||
              userData.profile_image_url_https ||
              "",
          ),
          email: userData.email ? String(userData.email) : null,
        };
      },
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
        // プロフィール関数で処理されたデータをトークンに保存
        const twitterProfile = profile as TwitterProfile;
        const profileData: TwitterProfileData =
          twitterProfile.data || twitterProfile;
        token.twitterId = account.providerAccountId;
        token.name = profileData.name || profileData.username;
        token.username = profileData.username;
        token.image = profileData.profile_image_url || twitterProfile.image;

        // バックエンドにユーザー情報を送信して作成/更新
        try {
          // プロフィール関数で処理されたデータを使用
          const profileData: TwitterProfileData =
            twitterProfile.data || twitterProfile;
          const userName =
            profileData.name ||
            profileData.username ||
            profileData.screen_name ||
            `User_${account.providerAccountId}`;
          const userImage =
            profileData.profile_image_url || twitterProfile.image;

          const userData = {
            twitterId: account.providerAccountId,
            name: userName,
            image: userImage,
          };

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
        session.user.name =
          (token.name as string) ||
          (token.username as string) ||
          session.user.name ||
          "Unknown User";
        session.user.image = (token.image as string) || session.user.image;
        (session as ExtendedSession).accessToken = token;
        (session as ExtendedSession).jwtToken = token;
      }
      return session;
    },
  },
});
