'use client';

import { ChatContainer } from '@/components/chat/ChatContainer';
import { Header } from '@/components/chat/Header';
import { Sidebar } from '@/components/chat/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isLoading, setCurrentUser, initializeUser } =
    useUserStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={currentUser}
          onUserChange={setCurrentUser}
        />
        <div className="flex-1 overflow-hidden">
          <ChatContainer user={currentUser} />
        </div>
      </div>
    </div>
  );
}
