import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function MyProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ログイン済みの場合は自分のIDを使って強制リダイレクト
  redirect(`/profile/${session.user.id}`);
}
