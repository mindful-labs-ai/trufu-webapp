'use client';

import { ChatContainer } from '@/components/chat/ChatContainer';
import { Header } from '@/components/chat/Header';
import { Sidebar } from '@/components/chat/Sidebar';
import { useUser } from '@/hooks/useUser';
import { useState } from 'react';

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, changeUser } = useUser();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onUserChange={changeUser}
        />
        <ChatContainer user={user} />
      </div>
    </div>
  );
}
