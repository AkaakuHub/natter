import { useState, useEffect } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { User } from "@/api";

interface UsePostReplyResult {
  replyCount: number;
  showReplyModal: boolean;
  setShowReplyModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleReplyClick: (e: React.MouseEvent) => void;
  handleReplySubmit: (content: string, images: File[]) => Promise<void>;
}

export const usePostReply = (
  postId: number,
  initialReplyCount?: number,
  currentUser?: User | null,
): UsePostReplyResult => {
  const { navigateToPost } = useNavigation();
  const { showToast } = useToast();
  const [replyCount, setReplyCount] = useState(0);
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    setReplyCount(initialReplyCount || 0);
  }, [initialReplyCount]);

  const handleReplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (content: string, images: File[]) => {
    if (!currentUser) return;

    const formData = new FormData();
    formData.append("content", content);
    formData.append("authorId", currentUser.id);
    formData.append("replyToId", postId.toString());

    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to create reply");
    }

    const newReply = await response.json();
    setReplyCount((prev) => prev + 1);

    showToast("リプライをしました。", "success", 3000, () => {
      navigateToPost(newReply.id);
    });
  };

  return {
    replyCount,
    showReplyModal,
    setShowReplyModal,
    handleReplyClick,
    handleReplySubmit,
  };
};