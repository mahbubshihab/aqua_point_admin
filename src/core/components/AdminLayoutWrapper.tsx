'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/core/services/firebase';
import Sidebar from '@/core/components/Sidebar';
import Header from '@/core/components/Header';
import { useSidebar } from '@/core/context/SidebarContext';
import LoginView from '@/features/auth/presentation/LoginView';

const ALLOWED_ADMIN_EMAILS = [
  'xlshihab9@gmail.com',
  'aquapointapp@gmail.com',
];

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const email = (currentUser.email || '').toLowerCase().trim();
        if (ALLOWED_ADMIN_EMAILS.includes(email)) {
          setUser(currentUser);
          setIsAuthenticated(true);
          localStorage.setItem('admin_auth', 'true');
          localStorage.setItem('admin_email', email);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('admin_auth');
          localStorage.removeItem('admin_email');
        }
      } else {
        // Fallback check for offline/persisted storage state
        const localAuth = typeof window !== 'undefined' ? localStorage.getItem('admin_auth') === 'true' : false;
        setUser(null);
        setIsAuthenticated(localAuth);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show cyan loading screen during initial authentication check
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020810] flex flex-col justify-center items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#0d2035] border border-[#00BCE1]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,188,225,0.2)]">
            <img src="/app_logo.png" alt="Aqua Point" className="w-10 h-10 object-contain animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00BCE1] animate-ping" />
          <span className="text-xs font-mono font-semibold text-[#00BCE1] tracking-widest uppercase">
            AQUA POINT Admin Verification
          </span>
        </div>
      </div>
    );
  }

  // If user is NOT authenticated, show the Login UI directly on screen
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // If authenticated, render Admin Layout Interface
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
