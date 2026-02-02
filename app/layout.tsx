import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "TaskFlow - Premium Task Management",
  description: "Professional task management application with Kanban boards, real-time updates, and comprehensive project tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-tertiary)' }}>
            <Sidebar />
            <div style={{
              marginLeft: '260px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              maxWidth: 'calc(100vw - 260px)'
            }}>
              <TopBar />
              <main style={{
                flex: 1,
                position: 'relative'
              }}>
                {children}
              </main>
            </div>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 20px 0 rgba(16, 185, 129, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
