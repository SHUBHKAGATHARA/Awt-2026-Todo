import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import LayoutContent from '@/components/LayoutContent';
import CustomToaster from '@/components/CustomToaster';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "TaskFlow - Ultra Premium Project Management",
  description: "Professional project management dashboard with Kanban boards, real-time updates, and comprehensive team tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
          {/* Custom premium notification system — replaces default react-hot-toast */}
          <CustomToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
