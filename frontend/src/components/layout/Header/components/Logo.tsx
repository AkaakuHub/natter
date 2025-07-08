import React from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface LogoProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const Logo = ({ scrollContainerRef }: LogoProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    // ホームページにいる場合はスクロールトップ
    if (pathname === "/") {
      if (scrollContainerRef?.current) {
        scrollContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } else {
      // 他のページからはホームに遷移
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleLogoClick}
      className="absolute left-1/2 transform -translate-x-1/2 transition-opacity hover:opacity-80"
      aria-label="ホームに戻る"
    >
      <Image
        src="/web-app-manifest-192x192.png"
        alt="logo"
        width={32}
        height={32}
      />
    </button>
  );
};

export default Logo;
