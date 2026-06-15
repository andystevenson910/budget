import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginPage({ onSkip }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else { setSignedUp(true); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
    }

    setLoading(false);
  }

  if (signedUp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 text-center">
          <div className="text-5xl mb-3">📬</div>
          <h2 className="text-xl font-bold text-navy mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back and sign in.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            (Or disable email confirmation in Supabase → Auth → Email settings for personal use)
          </p>
          <button onClick={() => { setSignedUp(false); setMode('signin'); }}
            className="mt-6 text-sm text-subheader underline underline-offset-2">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">💰</div>
          <h1 className="text-2xl font-bold text-navy">Budget Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'signin' ? 'Sign in to sync your data' : 'Create an account to get started'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email" required value={email} autoComplete="email"
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password" required value={password} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-subheader"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-xs text-warning-red bg-red-bg border border-warning-red/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-subheader text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="text-subheader font-medium hover:underline"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="mt-6 pt-6 border-t text-center">
          <button onClick={onSkip}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
            Continue without an account
          </button>
          <p className="text-xs text-gray-400 mt-1">Data saved locally in this browser only</p>
        </div>
      </div>
    </div>
  );
}
