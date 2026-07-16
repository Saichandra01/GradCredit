import { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProfileSettings({ user }: { user: { email: string; full_name?: string } | null }) {
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', country: '', date_of_birth: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle().then(({ data: profile }) => {
          if (profile) {
            setForm({
              full_name: profile.full_name ?? '',
              phone: profile.phone ?? '',
              city: profile.city ?? '',
              country: profile.country ?? '',
              date_of_birth: profile.date_of_birth ?? '',
              address: profile.address ?? '',
            });
          }
        });
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSaved(false);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setError('Not authenticated.'); setLoading(false); return; }
    const { error: err } = await supabase.from('profiles').upsert({
      id: userData.user.id,
      email: userData.user.email ?? '',
      ...form,
    });
    setLoading(false);
    if (err) { setError('Save failed. Please try again.'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6 md:p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-sg/30">
          <div className="w-16 h-16 bg-ob rounded-full flex items-center justify-center">
            <span className="text-pw font-bold text-2xl">
              {(form.full_name || user?.email || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-bold text-ob text-lg">{form.full_name || 'Your Name'}</div>
            <div className="text-si text-sm">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Full Name</label>
            <input value={form.full_name} onChange={e => upd('full_name', e.target.value)} placeholder="Your full name" className="input-field" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-field" />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" value={form.date_of_birth} onChange={e => upd('date_of_birth', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">City</label>
            <input value={form.city} onChange={e => upd('city', e.target.value)} placeholder="Your city" className="input-field" />
          </div>
          <div>
            <label className="label">Country</label>
            <input value={form.country} onChange={e => upd('country', e.target.value)} placeholder="India" className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email ?? ''} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <textarea value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Full address" rows={3} className="input-field resize-none" />
          </div>

          {error && (
            <div className="sm:col-span-2 p-3 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm">{error}</div>
          )}

          {saved && (
            <div className="sm:col-span-2 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile saved successfully!
            </div>
          )}

          <div className="sm:col-span-2">
            <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
