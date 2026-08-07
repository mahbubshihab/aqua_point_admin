import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Aqua Point | Web Admin Panel',
  description: 'Ultra-Premium Obsidian & Cyan Glassmorphic Admin Dashboard for Aqua Point',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/app_logo.png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/app_logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0D16] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-64 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
