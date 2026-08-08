'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/core/components/Sidebar';
import Header from '@/core/components/Header';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#141b2d] flex flex-col justify-center items-center">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-[#141b2d]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0 bg-[#141b2d]">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto bg-[#141b2d]">
          {children}
        </main>
      </div>
    </div>
  );
}
