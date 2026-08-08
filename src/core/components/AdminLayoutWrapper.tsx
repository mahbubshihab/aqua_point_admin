'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/core/services/firebase';
import Sidebar from '@/core/components/Sidebar';
import Header from '@/core/components/Header';
import { useSidebar } from '@/core/context/SidebarContext';
import { Loader2 } from 'lucide-react';

const ALLOWED_ADMIN_EMAILS = [
  'xlshihab9@gmail.com',
  'aquapointapp@gmail.com',
];

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';
  const { collapsed } = useSidebar();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const userEmail = (user?.email || '').toLowerCase().trim();
      const hasLocalAuth = localStorage.getItem('admin_auth') === 'true';
      
      const isAllowed = user && userEmail && (ALLOWED_ADMIN_EMAILS.includes(userEmail) || hasLocalAuth);

      if (isAllowed) {
        setIsAuthenticated(true);
        if (isLoginPage) {
          router.replace('/');
        }
      } else {
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_auth');
          localStorage.removeItem('admin_email');
        }
        if (!isLoginPage) {
          router.replace('/login');
        }
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [isLoginPage, router]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#141b2d] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00BCE1]" />
      </main>
    );
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#141b2d] flex flex-col justify-center items-center">{children}</main>;
  }

  if (!isAuthenticated) {
    return null;
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
