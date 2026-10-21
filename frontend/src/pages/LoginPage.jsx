import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.detail || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const quickLogin = async (e, pw) => {
    setError(''); setLoading(true);
    try { await login(e, pw); navigate('/dashboard'); }
    catch { setError('Demo login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f0eff5] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-[#f0eff5] rounded-3xl overflow-hidden flex flex-col md:flex-row gap-8 items-center">

        {/* ─── LEFT PANEL: Form ─────────────────────────── */}
        <div className="flex-1 flex flex-col items-start px-8 py-10 min-w-0">

          {/* Avatar silhouette */}
          <div className="mb-8 self-center">
            <div className="w-20 h-20 flex items-center justify-center">
              {/* SVG silhouette matching the mockup */}
              <svg viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
                <ellipse cx="40" cy="27" rx="16" ry="17" fill="#1a1a1a" />
                <path d="M4 88c0-19.882 16.118-36 36-36s36 16.118 36 36" fill="#1a1a1a" />
              </svg>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Login ID */}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login id"
                className="w-full bg-white border-2 border-zinc-300 rounded-lg px-5 py-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-violet-400 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full bg-white border-2 border-zinc-300 rounded-lg px-5 py-4 text-[15px] text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-violet-400 transition"
              />
            </div>

            {/* Social login bar — Google, Microsoft, GitHub */}
            <div className="flex items-center justify-center gap-0 bg-violet-400 rounded-full py-2.5 px-6 w-fit mx-auto mt-2">
              {/* Google */}
              <button type="button" onClick={() => quickLogin('alice@campus.edu', 'password123')} disabled={loading}
                className="w-12 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition">
                <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>

              {/* Microsoft */}
              <button type="button" onClick={() => quickLogin('bob@campus.edu', 'password123')} disabled={loading}
                className="w-12 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition">
                <svg viewBox="0 0 21 21" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
              </button>

              {/* GitHub */}
              <button type="button" disabled
                className="w-12 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition opacity-80">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Register link */}
          <p className="mt-8 text-[13px] text-zinc-500 self-center">
            No account?{' '}
            <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-800 transition">
              Join BookBridge
            </Link>
          </p>
        </div>

        {/* ─── RIGHT PANEL ──────────────────────────────── */}
        <div className="flex-1 flex flex-col items-end gap-6 px-6 pb-10 md:pb-0 w-full">

          {/* Gray box matching wireframe mockup */}
          <div className="w-full max-w-sm bg-[#d9d9d9] aspect-[4/3] rounded-sm" />

          {/* Log in button — bottom right, matching mockup */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-3 bg-violet-400 hover:bg-violet-500 text-white text-[18px] font-medium px-7 py-4 rounded-2xl shadow-md shadow-violet-300/40 transition disabled:opacity-50 self-end"
          >
            <span>Log in</span>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
