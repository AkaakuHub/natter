"use client";

import React from 'react';
import { animated } from '@react-spring/web';
import { useNavigationStack } from '@/hooks/useNavigationStack';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import SideBar from '@/components/SideBar';
import Header from './Header';
import { FooterMenu } from '../FooterMenu';
import Welcome from '../Welcome';
import TimeLine from '../TimeLine';
import ProfileComponent from '../Profile';
import DetailedPostComponent from '../DetailedPost';
import { ExtendedSession } from '@/types';

interface TwitterLikeLayoutProps {
  children?: React.ReactNode;
}

const TwitterLikeLayout = ({ children }: TwitterLikeLayoutProps) => {
  const { currentUser, session, userExists, isLoading, createUserAndRefresh } = useCurrentUser();
  const {
    stack,
    currentPage,
    canGoBack,
    isAtRoot,
    popPage,
    showSidebar,
    navigateToProfile,
  } = useNavigationStack();

  const {
    mainDragBind,
    sidebarDragBind,
    springStyles,
    closeSidebar,
    openSidebar,
  } = useSwipeNavigation({
    onSwipeBack: canGoBack ? popPage : undefined,
    onSwipeToSidebar: isAtRoot ? showSidebar : undefined,
    canSwipeBack: canGoBack,
    canSwipeToSidebar: isAtRoot,
  });

  // ページコンポーネントをレンダリング
  const renderCurrentPage = () => {
    if (!currentPage) return null;

    switch (currentPage.component) {
      case 'TimeLine':
        return <TimeLine currentUser={currentUser} />;
      case 'Profile':
        return (
          <ProfileComponent 
            session={session as ExtendedSession} 
            userId={currentPage.props && typeof currentPage.props === 'object' && 'userId' in currentPage.props ? currentPage.props.userId as string : undefined} 
          />
        );
      case 'DetailedPost':
        return (
          <DetailedPostComponent 
            postId={currentPage.props && typeof currentPage.props === 'object' && 'postId' in currentPage.props ? currentPage.props.postId as string : ''} 
            currentUser={currentUser} 
          />
        );
      default:
        return children;
    }
  };

  // 前のページをレンダリング（スワイプ時に表示）
  const renderPreviousPage = () => {
    if (!canGoBack || stack.currentIndex === 0) return null;
    
    const prevPage = stack.pages[stack.currentIndex - 1];
    if (!prevPage) return null;

    switch (prevPage.component) {
      case 'TimeLine':
        return <TimeLine currentUser={currentUser} />;
      case 'Profile':
        return (
          <ProfileComponent 
            session={session as ExtendedSession} 
            userId={prevPage.props && typeof prevPage.props === 'object' && 'userId' in prevPage.props ? prevPage.props.userId as string : undefined} 
          />
        );
      case 'DetailedPost':
        return (
          <DetailedPostComponent 
            postId={prevPage.props && typeof prevPage.props === 'object' && 'postId' in prevPage.props ? prevPage.props.postId as string : ''} 
            currentUser={currentUser} 
          />
        );
      default:
        return null;
    }
  };

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
        <div className="pt-16 pb-16 h-full overflow-y-auto">
          {children}
        </div>
        <FooterMenu path={currentPage?.component.toLowerCase() || ''} />
      </div>
    );
  }

  if (userExists === false && session) {
    return (
      <Welcome 
        session={session} 
        onUserCreated={createUserAndRefresh} 
      />
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {/* サイドバー */}
      <animated.div
        {...sidebarDragBind()}
        style={{
          transform: springStyles.sidebarX.to(x => `translateX(${x}px)`),
        }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg z-50"
      >
        <SideBar session={session} />
      </animated.div>

      {/* サイドバーオーバーレイ */}
      <animated.div
        style={{
          opacity: springStyles.sidebarX.to(x => (x + 300) / 300),
          pointerEvents: springStyles.sidebarX.to(x => x > -250 ? 'auto' : 'none'),
        }}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeSidebar}
      />

      {/* 前のページ（スワイプ時に表示） */}
      {canGoBack && (
        <div className="absolute inset-0 z-10">
          <div className="w-full h-full bg-white">
            {currentPage?.component !== 'Profile' && (
              <Header
                profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
                profileOnClick={() => navigateToProfile()}
                progress={1}
                onMenuClick={isAtRoot ? openSidebar : undefined}
              />
            )}
            <div className="overflow-y-auto h-[calc(100vh-64px-60px)] w-full">
              {renderPreviousPage()}
            </div>
            <FooterMenu path={stack.pages[stack.currentIndex - 1]?.component.toLowerCase() || ''} />
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <animated.div
        {...mainDragBind()}
        style={{
          transform: springStyles.x.to(x => `translateX(${x}px)`),
        }}
        className="w-full h-full bg-white relative z-20"
      >
        {currentPage?.component !== 'Profile' && (
          <Header
            profileImage={session?.user?.image || "no_avatar_image_128x128.png"}
            profileOnClick={() => navigateToProfile()}
            progress={1}
            onMenuClick={isAtRoot ? openSidebar : undefined}
          />
        )}
        
        <div className="overflow-y-auto h-[calc(100vh-64px-60px)] w-full">
          {renderCurrentPage()}
        </div>

        <FooterMenu path={currentPage?.component.toLowerCase() || ''} />
      </animated.div>
    </div>
  );
};

export default TwitterLikeLayout;