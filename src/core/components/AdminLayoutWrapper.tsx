'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/core/components/Sidebar';
import Header from '@/core/components/Header';
import { useSidebar } from '@/core/context/SidebarContext';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const { collapsed } = useSidebar();

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#141b2d] flex flex-col justify-center items-center">{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#141b2d] relative">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#141b2d] transition-all duration-300 ${
          collapsed ? 'md:ml-20 ml-0' : 'md:ml-64 ml-0'
        }`}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#141b2d]">
          {children}
        </main>
      </div>
    </div>
  );
}
