import React from "react";

import SideBar from "@/components/SideBar";
import { type Session } from "next-auth";


const BaseLayout = ({ session }: { session: Session }) => {
  return (
    <>
    <SideBar session={session} />
          ここが認証後の場所になる。
          ここTL、フッター
    </>
  );
}
  
export default BaseLayout;