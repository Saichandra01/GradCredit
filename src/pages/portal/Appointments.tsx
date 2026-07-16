import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Plus, X, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const counselors = ['Dr. Anand Mehta', 'Ms. Preethi Nair', 'Mr. Rohan Kapoor', 'Ms. Divya Sharma', 'Any Available Counselor'];
const TYPES = [
  { value: 'counseling', label: 'University Counseling' },
  { value: 'loan', label: 'Loan Consultation' },
  { value: 'visa', label: 'Visa Guidance' },
  { value: 'document_review', label: 'Document Review' },
  { value: 'interview_prep', label: 'Mock Interview Prep' },
  { value: 'general', label: 'General Query' },
];
const TIMES = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'];

const statusBadge: Record<string, string> = {
  pending: 'bg-sg/40 text-si',
  confirmed: 'bg-success-500/15 text-success-600',
  completed: 'bg-sg/40 text-ob/60',
  cancelled: 'bg-error-500/15 text-error-600',
  rescheduled: 'bg-si/20 text-ob',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ appointment_type: 'general', counselor_name: 'Any Available Counselor', preferred_date: '', preferred_time: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('appointments').select('*').order('preferred_date', { ascending: true });
    setAppointments(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.preferred_date || !form.preferred_time) return;
    setSaving(true);
    await supabase.from('appointments').insert(form);
    setSaving(false);
    setSaved(true);
    setShowForm(false);
    setForm({ appointment_type: 'general', counselor_name: 'Any Available Counselor', preferred_date: '', preferred_time: '', notes: '' });
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  const cancelAppt = async (id: string) => {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    load();
  };

  const upcoming = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const past = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-ob">Appointments</h3>
          <p className="text-si text-sm">{upcoming.length} upcoming appointment{upcoming.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Book Appointment
        </button>
      </div>

      {saved && <div className="flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Appointment booked successfully!</div>}

      {/* Booking modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ob/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-premium w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-ob">Book Appointment</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-sg/30 rounded-lg text-si hover:text-ob transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="label">Appointment Type</label>
                <div className="relative">
                  <select value={form.appointment_type} onChange={e => upd('appointment_type', e.target.value)} className="input-field appearance-none">
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="label">Preferred Counselor</label>
                <div className="relative">
                  <select value={form.counselor_name} onChange={e => upd('counselor_name', e.target.value)} className="input-field appearance-none">
                    {counselors.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si pointer-events-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date <span className="text-error-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si pointer-events-none" />
                    <input type="date" value={form.preferred_date} onChange={e => upd('preferred_date', e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-field pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="label">Time <span className="text-error-500">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si pointer-events-none" />
                    <select value={form.preferred_time} onChange={e => upd('preferred_time', e.target.value)} className="input-field pl-10 appearance-none" required>
                      <option value="">Select</option>
                      {TIMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Notes (Optional)</label>
                <textarea value={form.notes} onChange={e => upd('notes', e.target.value)} rows={2} placeholder="Specific questions or topics to discuss..." className="input-field resize-none text-sm" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
                {saving ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-ob text-sm">Upcoming</h4>
          {upcoming.map(appt => (
            <div key={appt.id} className="card p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-ob rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-pw font-bold text-sm">{new Date(appt.preferred_date).getDate()}</span>
                <span className="text-pw/60 text-xs">{new Date(appt.preferred_date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ob text-sm">{TYPES.find(t => t.value === appt.appointment_type)?.label ?? appt.appointment_type}</div>
                <div className="text-si text-xs mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{appt.counselor_name}</span>
                  <span>•</span>
                  <span>{appt.preferred_time}</span>
                </div>
                {appt.notes && <p className="text-si text-xs mt-1 truncate">{appt.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`badge text-xs ${statusBadge[appt.status] ?? statusBadge.pending}`}>{appt.status}</span>
                {appt.status === 'pending' && (
                  <button onClick={() => cancelAppt(appt.id)} className="text-xs text-error-500 hover:underline">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? null : upcoming.length === 0 && (
        <div className="card p-10 text-center">
          <Calendar className="w-10 h-10 text-sg mx-auto mb-3" />
          <p className="text-si text-sm mb-4">No upcoming appointments.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2.5"><Plus className="w-4 h-4" /> Book Your First Appointment</button>
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-ob/50 text-sm">Past Appointments</h4>
          {past.map(appt => (
            <div key={appt.id} className="card p-4 flex items-center gap-4 opacity-60">
              <div className="w-10 h-10 bg-sg/30 rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-ob/60 font-bold text-xs">{new Date(appt.preferred_date).getDate()}</span>
                <span className="text-si text-xs">{new Date(appt.preferred_date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-ob text-sm">{TYPES.find(t => t.value === appt.appointment_type)?.label ?? appt.appointment_type}</div>
                <div className="text-si text-xs">{appt.preferred_time} • {appt.counselor_name}</div>
              </div>
              <span className={`badge text-xs ${statusBadge[appt.status] ?? ''}`}>{appt.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
