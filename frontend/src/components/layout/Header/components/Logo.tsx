import React from "react";
import Image from "next/image";

const Logo = () => {
  return (
    <Image
      src="/web-app-manifest-192x192.png"
      alt="logo"
      width={32}
      height={32}
      className="absolute left-1/2 transform -translate-x-1/2"
    />
  );
};

export default Logo;
