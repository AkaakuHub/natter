import React from "react";

import SideBar from "@/components/SideBar";
import { type Session } from "next-auth";
import { FooterMenu } from "./FooterMenu";
import { usePathname } from "next/navigation";

const BaseLayout = ({ session, children }: { session: Session; children: React.ReactNode }) => {
  let path: string = usePathname();
  path = path.split("/")[1];

  return (
    <>
      <SideBar session={session} />
      {children}
      <FooterMenu path={path} />
    </>
  );
}

export default BaseLayout;