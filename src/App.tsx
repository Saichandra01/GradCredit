import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Portal from './pages/Portal';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeLogin from "./pages/EmployeeLogin";


type View = 'landing' | 'auth' | 'portal' | 'admin' | 'employeeLogin' | 'employee';

const ADMIN_EMAILS = ['admin@pathfindersoverseas.com', 'dev@pathfindersoverseas.com'];

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [loading, setLoading] = useState(true);
  const [pendingEligibility, setPendingEligibility] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const email = data.session.user.email ?? '';
        if (ADMIN_EMAILS.includes(email)) {
          setView('admin');
        } else {
          setView('portal');
          if (pendingEligibility) {
            setPendingEligibility(false);
          }
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session) {
          const email = session.user.email ?? '';
          if (ADMIN_EMAILS.includes(email)) {
            setView('admin');
          } else {
            setView('portal');
          }
        } else {
          setView('landing');
        }
      })();
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If user just logged in and was pending eligibility, Portal will receive initialActive

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-steely text-sm">Loading GradCredit...</span>
        </div>
      </div>
    );
  }

 if (view === 'auth') {
  return (
    <AuthPage
      initialMode={authMode}
      onBack={() => setView('landing')}
      onSuccess={() => {
        // onAuthStateChange will set view to 'portal' or 'admin'
      }}
    />
  );
}

  if (view === 'portal') {
    const initial = pendingEligibility ? ('eligibility' as const) : undefined;
    if (pendingEligibility) {
      // Clear after Portal picks it up
      setTimeout(() => setPendingEligibility(false), 100);
    }
    return (
      <Portal
        onLogout={() => {
          supabase.auth.signOut().then(() => {
            setPendingEligibility(false);
            setView('landing');
          });
        }}
        initialActive={initial}
      />
    );
  }
if (view === 'employeeLogin') {
  return (
    <EmployeeLogin
      onLogin={() => setView('employee')}
      onBack={() => setView('landing')}
    />
  );
}

if (view === 'employee') {
  return <EmployeeDashboard />;
}

if (view === 'admin') {
  return (
    <AdminDashboard
      onBack={() => supabase.auth.signOut().then(() => setView('landing'))}
    />
  );
}

  return (
  <>
    <OfferPopup />

<LandingPage
  onLogin={() => setView('auth')}
  onRegister={() => setView('auth')}
  onEmployeeLogin={() => setView('employeeLogin')}

      onCheckEligibility={() => {
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            const email = data.session.user.email ?? '';

            if (ADMIN_EMAILS.includes(email)) {
              setView('admin');
            } else {
              setPendingEligibility(true);
              setView('portal');
            }
          } else {
            setPendingEligibility(true);
            setView('auth');
          }
        });
      }}
    />
  </>
);
}
