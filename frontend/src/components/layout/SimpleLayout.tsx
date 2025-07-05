"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigation } from "@/hooks/useNavigation";
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import SideBar from "@/components/SideBar";
import Header from "./Header";
import { FooterMenu } from "../FooterMenu";
import Welcome from "../Welcome";

interface SimpleLayoutProps {
  children: React.ReactNode;
}

const SimpleLayout = ({ children }: SimpleLayoutProps) => {
  const { session, userExists, isLoading, createUserAndRefresh } =
    useCurrentUser();
  const { getCurrentPath, navigateToProfile } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const path = getCurrentPath();

  // Swipe gestures for mobile
  const swipeHandlers = useSwipeGestures({
    onSwipeRight: () => setSidebarOpen(true),
    onSwipeLeft: () => setSidebarOpen(false),
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-screen">
        <Header progress={1} />
        <div className="pt-16 pb-16 h-full overflow-y-auto">{children}</div>
        <FooterMenu path={path} />
      </div>
    );
  }

  if (userExists === false && session) {
    return <Welcome session={session} onUserCreated={createUserAndRefresh} />;
  }

  return (
    <div className="w-full h-screen flex" {...swipeHandlers}>
      {/* Desktop Sidebar */}
      <div className="w-64 h-full border-r border-gray-200 hidden md:block">
        <SideBar session={session} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 md:hidden"
            >
              <SideBar session={session} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {path !== "profile" && (
          <Header
            profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
            profileOnClick={() => navigateToProfile()}
            progress={1}
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </div>

        <FooterMenu path={path} />
      </div>
    </div>
  );
};

export default SimpleLayout;
