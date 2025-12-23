'use client';

import { useSession } from 'next-auth/react';
import { useSidebar } from '@/components/layout/SidebarContext';

export default function MainContent({ children }) {
  const { data: session } = useSession();
  const { isSidebarOpen } = useSidebar();
  
  const showSidebar = session?.user?.role === 'ADMIN' || session?.user?.role === 'FUNCIONARIO';
  
  const marginClass = showSidebar 
    ? (isSidebarOpen ? 'md:ml-64' : 'md:ml-16')
    : 'w-full';
  
  return (
    <main 
      className={`
        flex-1 ${marginClass} transition-all duration-500 ease-out min-h-screen
      `}
    >
      {children}
    </main>
  );
}