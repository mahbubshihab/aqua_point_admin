'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/core/services/firebase';

const ALLOWED_ADMIN_EMAILS = [
  'xlshihab9@gmail.com',
  'aquapointapp@gmail.com',
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Rain animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const drops: { x: number; y: number; length: number; speed: number; opacity: number }[] = [];
    const splashes: { x: number; y: number; radius: number; opacity: number; maxRadius: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize rain drops
    for (let i = 0; i < 180; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 25 + 10,
        speed: Math.random() * 6 + 4,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw rain drops
      drops.forEach((drop) => {
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(drop.x, drop.y, drop.x, drop.y + drop.length);
        gradient.addColorStop(0, `rgba(0, 188, 225, 0)`);
        gradient.addColorStop(1, `rgba(0, 188, 225, ${drop.opacity})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 1, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x += 0.5; // slight wind

        if (drop.y > canvas.height) {
          // Create splash
          splashes.push({
            x: drop.x,
            y: canvas.height - 2,
            radius: 0,
            opacity: 0.4,
            maxRadius: Math.random() * 6 + 3,
          });
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });

      // Draw splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const splash = splashes[i];
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI, true);
        ctx.strokeStyle = `rgba(0, 188, 225, ${splash.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        splash.radius += 0.3;
        splash.opacity -= 0.015;
        if (splash.opacity <= 0 || splash.radius > splash.maxRadius) {
          splashes.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

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
        setError('Access Denied. Unauthorized account.');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups.');
      } else {
        setError('Authentication failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-ocean-scene">
      {/* Rain Canvas */}
      <canvas ref={canvasRef} className="rain-canvas" />

      {/* Ocean Waves Layer */}
      <div className="ocean">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
        <div className="wave wave-3" />
        <div className="wave wave-4" />
      </div>

      {/* Ambient light orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Lightning flash effect */}
      <div className="lightning" />

      {/* Login Card */}
      <div className="login-card">
        {/* Glowing top edge */}
        <div className="card-glow-edge" />

        {/* Logo */}
        <div className="logo-container">
          <div className="logo-ring" />
          <div className="logo-inner">
            <img
              src="/app_logo.png"
              alt="AQUA POINT"
              className="logo-image"
            />
          </div>
          <div className="logo-ripple" />
        </div>

        {/* Brand */}
        <h1 className="brand-title">
          AQUA<span className="brand-accent"> POINT</span>
        </h1>

        {/* Error */}
        {error && (
          <div className="error-box">
            <span className="error-dot" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Button - Dark themed, no white */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="signin-btn"
        >
          {loading ? (
            <div className="signin-loading">
              <svg className="spin-icon" viewBox="0 0 24 24" fill="none">
                <circle className="spin-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="spin-arc" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Verifying...</span>
            </div>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .login-ocean-scene {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(180deg, #020810 0%, #041220 30%, #061828 50%, #0a1e30 70%, #0d2a3e 100%);
        }

        /* Rain */
        .rain-canvas {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        /* Lightning */
        .lightning {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          animation: lightning-flash 8s infinite;
          background: radial-gradient(ellipse at 50% 20%, rgba(0, 188, 225, 0.05) 0%, transparent 70%);
        }

        @keyframes lightning-flash {
          0%, 100% { opacity: 0; }
          92% { opacity: 0; }
          93% { opacity: 0.6; }
          94% { opacity: 0; }
          95% { opacity: 0.3; }
          96% { opacity: 0; }
        }

        /* Ambient Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 1;
          pointer-events: none;
        }
        .orb-1 {
          width: 400px;
          height: 400px;
          background: rgba(0, 188, 225, 0.08);
          top: -100px;
          left: -100px;
          animation: orb-drift 12s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 300px;
          height: 300px;
          background: rgba(62, 67, 150, 0.12);
          top: 40%;
          right: -80px;
          animation: orb-drift 15s ease-in-out infinite alternate-reverse;
        }
        .orb-3 {
          width: 350px;
          height: 350px;
          background: rgba(0, 100, 180, 0.06);
          bottom: -80px;
          left: 30%;
          animation: orb-drift 10s ease-in-out infinite alternate;
        }

        @keyframes orb-drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.15); }
        }

        /* Ocean Waves */
        .ocean {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 45%;
          z-index: 3;
          pointer-events: none;
          overflow: hidden;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: -5%;
          width: 110%;
          background-repeat: repeat-x;
          background-size: 1200px 200px;
        }

        .wave-1 {
          height: 160px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath d='M0,120 C150,180 350,80 600,120 C850,160 1050,60 1200,120 L1200,200 L0,200 Z' fill='rgba(0,30,50,0.85)'/%3E%3C/svg%3E");
          animation: wave-roll 6s ease-in-out infinite alternate;
          z-index: 4;
        }
        .wave-2 {
          height: 180px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath d='M0,100 C200,160 400,60 600,100 C800,140 1000,80 1200,100 L1200,200 L0,200 Z' fill='rgba(0,50,80,0.5)'/%3E%3C/svg%3E");
          animation: wave-roll 8s ease-in-out infinite alternate-reverse;
          z-index: 3;
        }
        .wave-3 {
          height: 200px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath d='M0,140 C300,100 500,180 700,140 C900,100 1100,160 1200,140 L1200,200 L0,200 Z' fill='rgba(0,80,120,0.3)'/%3E%3C/svg%3E");
          animation: wave-roll 10s ease-in-out infinite alternate;
          z-index: 2;
        }
        .wave-4 {
          height: 200px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath d='M0,160 C200,120 400,180 600,150 C800,120 1000,170 1200,140 L1200,200 L0,200 Z' fill='rgba(0,188,225,0.06)'/%3E%3C/svg%3E");
          animation: wave-roll 12s ease-in-out infinite alternate-reverse;
          z-index: 1;
        }

        @keyframes wave-roll {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-30px) translateY(-8px); }
          100% { transform: translateX(30px) translateY(4px); }
        }

        /* Login Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 380px;
          padding: 48px 36px 40px;
          background: rgba(8, 18, 35, 0.75);
          backdrop-filter: blur(40px) saturate(1.5);
          -webkit-backdrop-filter: blur(40px) saturate(1.5);
          border: 1px solid rgba(0, 188, 225, 0.12);
          border-radius: 28px;
          box-shadow:
            0 40px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(0, 188, 225, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .card-glow-edge {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00BCE1, transparent);
          box-shadow: 0 0 20px rgba(0, 188, 225, 0.5);
          border-radius: 2px;
        }

        /* Logo */
        .logo-container {
          position: relative;
          margin-bottom: 28px;
        }

        .logo-ring {
          position: absolute;
          inset: -6px;
          border-radius: 24px;
          border: 1.5px solid rgba(0, 188, 225, 0.25);
          animation: ring-pulse 3s ease-in-out infinite;
        }

        .logo-ripple {
          position: absolute;
          inset: -12px;
          border-radius: 28px;
          border: 1px solid rgba(0, 188, 225, 0.1);
          animation: ring-pulse 3s ease-in-out infinite 1.5s;
        }

        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }

        .logo-inner {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0a1628, #0d2035);
          border: 1px solid rgba(0, 188, 225, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(0, 188, 225, 0.15);
        }

        .logo-image {
          width: 44px;
          height: 44px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(0, 188, 225, 0.4));
        }

        /* Brand */
        .brand-title {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #ffffff;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .brand-accent {
          color: #00BCE1;
          text-shadow: 0 0 20px rgba(0, 188, 225, 0.4);
        }

        /* Error */
        .error-box {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 20px;
          border-radius: 14px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.25);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #fca5a5;
          animation: shake 0.4s ease-in-out;
        }

        .error-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Sign In Button - Dark, no white */
        .signin-btn {
          width: 100%;
          padding: 16px 24px;
          border-radius: 16px;
          border: 1px solid rgba(0, 188, 225, 0.2);
          background: linear-gradient(135deg, rgba(0, 188, 225, 0.12), rgba(62, 67, 150, 0.15));
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .signin-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0, 188, 225, 0.08), transparent);
          opacity: 0;
          transition: opacity 0.35s;
        }

        .signin-btn:hover:not(:disabled) {
          border-color: rgba(0, 188, 225, 0.45);
          background: linear-gradient(135deg, rgba(0, 188, 225, 0.18), rgba(62, 67, 150, 0.22));
          box-shadow: 0 12px 32px rgba(0, 188, 225, 0.15), 0 0 40px rgba(0, 188, 225, 0.08);
          transform: translateY(-2px);
        }

        .signin-btn:hover::before {
          opacity: 1;
        }

        .signin-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .signin-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .google-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .signin-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
        }

        .spin-icon {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          color: #00BCE1;
        }

        .spin-track { opacity: 0.2; }
        .spin-arc { opacity: 0.8; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            margin: 16px;
            padding: 36px 24px 32px;
          }
          .brand-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
