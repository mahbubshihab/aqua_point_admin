import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/core/components/Sidebar';
import Header from '@/core/components/Header';
import { SearchProvider } from '@/core/context/SearchContext';

export const metadata: Metadata = {
  title: 'Aqua Point | Web Admin Panel',
  description: 'Ultra-Premium Obsidian & Cyan Glassmorphic Admin Dashboard for Aqua Point',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/app_logo.png',
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
      <body className="bg-[#141b2d] text-white antialiased selection:bg-[#3e4396] selection:text-white">
        <SearchProvider>
          <div className="flex min-h-screen bg-[#141b2d]">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-w-0 bg-[#141b2d]">
              <Header />
              <main className="flex-1 p-8 overflow-y-auto bg-[#141b2d]">
                {children}
              </main>
            </div>
          </div>
        </SearchProvider>
      </body>
    </html>
  );
}
