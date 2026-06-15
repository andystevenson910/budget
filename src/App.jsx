import { useState, useEffect } from 'react';
import { SpendingProvider } from './context/SpendingContext';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import DailyLog from './components/DailyLog';
import DailySummary from './components/DailySummary';
import MonthlyHistory from './components/MonthlyHistory';
import BudgetSetup from './components/BudgetSetup';
import LoginPage from './components/LoginPage';
import { supabase, isSupabaseEnabled } from './lib/supabase';

function AppShell({ userId, userEmail, onSignOut }) {
  const [view, setView] = useState('dashboard');

  const views = {
    'dashboard':       <Dashboard />,
    'daily-log':       <DailyLog />,
    'daily-summary':   <DailySummary />,
    'monthly-history': <MonthlyHistory />,
    'budget-setup':    <BudgetSetup />,
  };

  return (
    <SpendingProvider userId={userId}>
      <div className="min-h-screen bg-gray-50">
        <Nav active={view} onNavigate={setView} userEmail={userEmail} onSignOut={onSignOut} />
        <main className="pb-12">{views[view]}</main>
      </div>
    </SpendingProvider>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseEnabled);
  const [localMode, setLocalMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseEnabled) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    if (isSupabaseEnabled && session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setLocalMode(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💰</div>
          <p className="text-gray-500">Checking session…</p>
        </div>
      </div>
    );
  }

  if (isSupabaseEnabled && !session && !localMode) {
    return <LoginPage onSkip={() => setLocalMode(true)} />;
  }

  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email ?? null;

  return (
    <AppShell
      userId={userId}
      userEmail={userEmail}
      onSignOut={handleSignOut}
    />
  );
}
