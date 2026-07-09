import type { Character, Post } from "@/api";
import type { TabType } from "@/components/Profile/TabsComponent";

interface ProfileTabCountInput {
  posts: Post[];
  mediaPosts: Post[];
  likedPosts: Post[];
  characters: Character[];
}

export function profileTabCounts({
  posts,
  mediaPosts,
  likedPosts,
  characters,
}: ProfileTabCountInput): Record<TabType, number> {
  return {
    tweets: posts.length,
    media: mediaPosts.length,
    likes: likedPosts.length,
    characters: characters.length,
  };
}
