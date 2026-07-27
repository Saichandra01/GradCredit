import { useState, useEffect } from 'react';
import { GraduationCap, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'login' | 'register';

interface AuthPageProps {
  onBack: () => void;
  onSuccess: () => void;
  initialMode?: "login" | "register";
}

export default function AuthPage({
  onBack,
  onSuccess,
  initialMode = "login",
}: AuthPageProps) { 
const [mode, setMode] = useState<Mode>(initialMode as Mode);  
useEffect(() => {
  setMode(initialMode as Mode);
}, [initialMode]);
const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifyStep, setVerifyStep] = useState(false);

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone } },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.fullName,
        phone: form.phone,
      });
      onSuccess();
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    onSuccess();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') handleRegister();
    else handleLogin();
  };

  return (
    <div className="portal-theme min-h-screen bg-pw flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[480px] bg-ob p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        <div className="relative">
          <button onClick={onBack} className="flex items-center gap-2 text-pw/50 hover:text-pw text-sm mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-pw" />
            </div>
            <div>
              <span className="font-bold text-pw text-lg block">GradCredit</span>
              <span className="text-pw/40 text-sm">Bridging Borders. Fueling Futures.</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-pw mb-4">Your gateway to global education</h2>
          <p className="text-pw/50 leading-relaxed mb-12">
            Join 5,000+ students who achieved their dream of studying abroad. 
            Track applications, manage documents, and connect with counselors — all in one place.
          </p>

          <div className="space-y-4">
            {['Complete application tracking', 'Education loan assistance', 'Visa processing support', 'Document management', 'Direct counselor access'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />
                <span className="text-pw/60 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile back */}
          <button onClick={onBack} className="lg:hidden flex items-center gap-2 text-si hover:text-ob text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ob mb-1">
              {mode === 'register' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-si text-sm">
              {mode === 'register'
                ? 'Start your education loan journey today.'
                : 'Sign in to access your student portal.'}
            </p>
          </div>

          {/* Tab */}
          <div className="flex bg-sg/30 rounded-xl p-1 mb-7">
            {(['register', 'login'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === m ? 'bg-white text-ob shadow-sm' : 'text-si hover:text-ob'
                }`}
              >
                {m === 'register' ? 'Register' : 'Sign In'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Full Name <span className="text-error-500">*</span></label>
                <input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Enter your full name" className="input-field" />
              </div>
            )}

            <div>
              <label className="label">Email Address <span className="text-error-500">*</span></label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" className="input-field" />
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">Phone Number</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-field" />
              </div>
            )}

            <div>
              <label className="label">Password <span className="text-error-500">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-field pr-11"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-si hover:text-ob transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">Confirm Password <span className="text-error-500">*</span></label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  placeholder="Repeat password"
                  className="input-field"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-si mt-5">
            {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }} className="font-semibold text-ob hover:underline">
              {mode === 'register' ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
