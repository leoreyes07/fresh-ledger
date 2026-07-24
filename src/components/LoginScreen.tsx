import React, { useState, FormEvent } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-main mb-4 shadow-lg">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-3xl font-bold text-main tracking-tight">Mi negocio</h1>
          <p className="text-sm text-[#64748b] mt-1">Kitchen cost management</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-sm border border-[#e8ecf0] p-8">
          <h2 className="text-xl font-semibold text-main mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#374151] mb-1.5"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="chef@restaurant.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d1d5db] text-main text-sm
                           placeholder:text-[#9ca3af] bg-[#f9fafb]
                           focus:outline-none focus:ring-2 focus:ring-[#0b1c30] focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-[#374151] mb-1.5"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d1d5db] text-main text-sm
                           placeholder:text-[#9ca3af] bg-[#f9fafb]
                           focus:outline-none focus:ring-2 focus:ring-[#0b1c30] focus:border-transparent
                           transition-all duration-200"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-main text-white font-semibold text-sm
                         hover:bg-[#1a3a5c] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-sm mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9ca3af] mt-6">
          Mi negocio - Kitchen Management System
        </p>
      </div>
    </div>
  );
}
