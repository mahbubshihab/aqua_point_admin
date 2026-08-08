'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/core/services/firebase';
import { ShieldCheck, AlertCircle, Sparkles, Droplet, Lock } from 'lucide-react';

const ALLOWED_ADMIN_EMAILS = [
  'xlshihab9@gmail.com',
  'aquapointapp@gmail.com',
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = (user.email || '').toLowerCase().trim();

      if (ALLOWED_ADMIN_EMAILS.includes(userEmail)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_auth', 'true');
        }
        router.push('/');
      } else {
        await signOut(auth);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_auth');
        }
        setError('Access Denied: You do not have permission to access Admin Console.');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by browser. Please allow popups.');
      } else {
        setError('Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0A0E1A]">
      {/* Ambient Water & Liquid Animation Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Aqua Gradient Glow Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00BCE1]/20 rounded-full blur-[120px] animate-liquid-glow" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-[#3e4396]/30 rounded-full blur-[140px] animate-liquid-glow [animation-delay:2s]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#00BCE1]/15 rounded-full blur-[120px] animate-liquid-glow [animation-delay:4s]" />

        {/* Caustic Shimmer Light Texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00BCE1] via-transparent to-transparent animate-caustic" />

        {/* Floating Water Bubbles */}
        <div className="absolute inset-0">
          {[
            { size: 'w-6 h-6', left: '10%', duration: '14s', delay: '0s' },
            { size: 'w-10 h-10', left: '25%', duration: '18s', delay: '3s' },
            { size: 'w-4 h-4', left: '40%', duration: '12s', delay: '1s' },
            { size: 'w-8 h-8', left: '55%', duration: '16s', delay: '5s' },
            { size: 'w-12 h-12', left: '70%', duration: '20s', delay: '2s' },
            { size: 'w-5 h-5', left: '85%', duration: '13s', delay: '4s' },
            { size: 'w-7 h-7', left: '92%', duration: '15s', delay: '6s' },
          ].map((bubble, i) => (
            <div
              key={i}
              className={`absolute bottom-0 rounded-full bg-gradient-to-t from-[#00BCE1]/40 to-white/20 border border-[#00BCE1]/40 backdrop-blur-sm shadow-[0_0_15px_rgba(0,188,225,0.3)] animate-floating-bubble ${bubble.size}`}
              style={{
                left: bubble.left,
                animationDuration: bubble.duration,
                animationDelay: bubble.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-md bg-[#131B2E]/80 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8 sm:p-10 transition-all duration-300">
        {/* Aqua Glowing Top Wave Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#00BCE1] to-transparent shadow-[0_0_12px_#00BCE1]" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo Badge with Aqua Cyan Glow Outline */}
          <div className="relative mb-5 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00BCE1] to-[#3e4396] rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-[#0d1322] border border-[#00BCE1]/60 p-1 flex items-center justify-center shadow-[0_0_30px_rgba(0,188,225,0.35)]">
              <img
                src="/app_logo.png"
                alt="AQUA POINT Logo"
                className="w-12 h-12 object-contain filter drop-shadow-[0_0_8px_rgba(0,188,225,0.6)]"
              />
            </div>
            {/* Water Drop Badge Icon */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00BCE1] text-[#0A0E1A] flex items-center justify-center shadow-lg">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white tracking-wider uppercase font-sans">
            AQUA<span className="text-[#00BCE1] drop-shadow-[0_0_10px_rgba(0,188,225,0.5)]"> POINT</span>
          </h1>
          
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#00BCE1]/10 border border-[#00BCE1]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#00BCE1]" />
            <span className="text-xs font-semibold tracking-wide text-[#00BCE1]">
              ADMIN CONSOLE
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-3 max-w-xs leading-relaxed">
            Secure Web Access Portal for Authorized Aqua Point Administrators
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 backdrop-blur-md flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-200 font-medium leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {/* Action Form / Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_30px_rgba(0,188,225,0.3)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center gap-3 text-slate-700">
                <svg className="animate-spin h-5 w-5 text-[#00BCE1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying Admin Authorization...</span>
              </div>
            ) : (
              <>
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="tracking-wide">Sign In with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#00BCE1]" />
          <span>Protected by Firebase Cloud Auth & Whitelist Enforcement</span>
        </div>
      </div>
    </div>
  );
}
