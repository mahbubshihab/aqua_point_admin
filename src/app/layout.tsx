import type { Metadata } from 'next';
import './globals.css';
import { SearchProvider } from '@/core/context/SearchContext';
import AdminLayoutWrapper from '@/core/components/AdminLayoutWrapper';

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
          <AdminLayoutWrapper>
            {children}
          </AdminLayoutWrapper>
        </SearchProvider>
      </body>
    </html>
  );
}
