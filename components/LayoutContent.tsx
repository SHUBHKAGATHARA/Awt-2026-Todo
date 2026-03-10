'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';
  const showSidebar = status === 'authenticated' && !isLoginPage;

  if (isLoginPage || status === 'unauthenticated') {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {showSidebar && <Sidebar />}
      <div style={{
        marginLeft: showSidebar ? '268px' : '0',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: showSidebar ? 'calc(100vw - 268px)' : '100vw',
        transition: 'margin-left 0.3s ease, max-width 0.3s ease'
      }}>
        {showSidebar && <TopBar />}
        <main style={{
          flex: 1,
          position: 'relative'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
