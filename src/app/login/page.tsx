'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login redirect back to dashboard
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl bg-[#1f2940] border border-[#2c3754] shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3e4396] to-[#00BCE1] p-0.5 shadow-xl shadow-[#00BCE1]/20 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-[#141b2d] rounded-[14px] flex items-center justify-center">
            <img src="/app_logo.png" alt="Aqua Point" className="w-8 h-8 object-contain" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-wide uppercase">
          AQUA<span className="text-[#00BCE1]"> POINT</span>
        </h1>
        <p className="text-xs text-[#A0AEC0] mt-1 font-medium">
          Admin Portal Authentication
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">
            Admin Email
          </label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="admin@aquapoint.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141b2d] border border-[#2c3754] text-white text-xs placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1] transition-all"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#A0AEC0] uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141b2d] border border-[#2c3754] text-white text-xs placeholder-[#A0AEC0]/50 focus:outline-none focus:border-[#00BCE1] focus:ring-1 focus:ring-[#00BCE1] transition-all"
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3e4396] to-[#00BCE1] hover:from-[#4b51b5] hover:to-[#17cbef] text-white text-xs font-bold shadow-lg shadow-[#00BCE1]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-4 border-t border-[#2c3754]/50 flex items-center justify-center gap-2 text-[11px] text-[#A0AEC0]">
        <ShieldCheck className="w-4 h-4 text-[#00BCE1]" />
        <span>Protected by Firebase Secure Cloud Auth</span>
      </div>
    </div>
  );
}
