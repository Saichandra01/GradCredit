import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Circle, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MILESTONES = [
  { step: 1, label: 'Application Registered', desc: 'Student account created and application started.' },
  { step: 2, label: 'Personal Information Submitted', desc: 'All personal and identity details provided.' },
  { step: 3, label: 'Co-Applicant Added', desc: 'Co-applicant profile complete with income and financial details.' },
  { step: 4, label: 'Academic Details Filled', desc: 'Educational background and test scores submitted.' },
  { step: 5, label: 'Loan Requirement Confirmed', desc: 'Loan amount, course, and destination finalised.' },
  { step: 6, label: 'Documents Uploaded', desc: 'All required documents submitted for verification.' },
  { step: 7, label: 'Application Under Review', desc: 'Counselor is reviewing your complete application.' },
  { step: 8, label: 'Bank Shortlisted', desc: 'Best-fit bank identified based on your profile.' },
  { step: 9, label: 'Loan Application Filed', desc: 'Application sent to the bank for processing.' },
  { step: 10, label: 'Loan Approved', desc: 'Education loan sanctioned by the bank.' },
  { step: 11, label: 'University Offer Received', desc: 'Admission offer letter received and accepted.' },
  { step: 12, label: 'Visa Applied', desc: 'Student visa application submitted to the embassy.' },
  { step: 13, label: 'Visa Approved', desc: 'Student visa has been approved.' },
  { step: 14, label: 'Pre-Departure Complete', desc: 'Documents organised, accommodation confirmed, ready to travel.' },
  { step: 15, label: 'Enrolled Abroad', desc: 'Successfully enrolled at the university!' },
];

const STATUS_STEP: Record<string, number> = {
  draft: 1, submitted: 6, under_review: 7, offer_received: 11,
  visa_applied: 12, visa_approved: 13, enrolled: 15,
};

const statusBadge: Record<string, string> = {
  draft: 'bg-sg/40 text-ob/60',
  submitted: 'bg-si/20 text-ob',
  under_review: 'bg-sg/40 text-si',
  offer_received: 'bg-success-500/15 text-success-600',
  visa_applied: 'bg-si/15 text-ob',
  visa_approved: 'bg-success-500/20 text-success-700',
  enrolled: 'bg-ob text-pw',
};

export default function ApplicationStatus({ applicationId }: { applicationId: string | null }) {
  const [apps, setApps] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [coApplicants, setCoApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('applications').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setApps(data ?? []);
      const app = data?.[0] ?? null;
      setSelected(app);
      if (app) loadCoApplicants(app.id);
      setLoading(false);
    });
  }, []);

  const loadCoApplicants = async (appId: string) => {
    const { data } = await supabase.from('co_applicants').select('id, relationship, personal_info, employment_type, verification_status').eq('application_id', appId);
    setCoApplicants(data ?? []);
  };

  const selectApp = (id: string) => {
    const app = apps.find(a => a.id === id);
    setSelected(app ?? null);
    if (app) loadCoApplicants(app.id);
  };

  if (loading) return <div className="text-center py-12 text-si">Loading...</div>;
  if (apps.length === 0) return (
    <div className="max-w-lg mx-auto py-12 text-center card p-10">
      <p className="text-si">No applications yet.</p>
    </div>
  );

  const currentStep = selected ? (STATUS_STEP[selected.status] ?? 1) : 1;
  const pct = Math.round((currentStep / MILESTONES.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Selector */}
      {apps.length > 1 && (
        <div className="card p-4">
          <label className="label">Select Application</label>
          <div className="relative">
            <select className="input-field appearance-none" value={selected?.id ?? ''} onChange={e => selectApp(e.target.value)}>
              {apps.map(a => <option key={a.id} value={a.id}>{a.preferred_university || a.preferred_country || 'Application'} — {new Date(a.created_at).toLocaleDateString('en-IN')}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si pointer-events-none" />
          </div>
        </div>
      )}

      {selected && (
        <>
          {/* Summary card */}
          <div className="card p-5 bg-ob text-pw relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {[
                { label: 'Ref ID', value: selected.id.slice(0, 8).toUpperCase() },
                { label: 'Destination', value: selected.preferred_country || '—' },
                { label: 'Course', value: selected.preferred_course || '—' },
                { label: 'Status', value: selected.status?.replace(/_/g, ' ') },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-pw/40 text-xs mb-0.5">{label}</div>
                  <div className="font-semibold text-pw text-sm capitalize">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-ob text-sm">Overall Progress</span>
              <span className="font-bold text-ob">{pct}% Complete</span>
            </div>
            <div className="w-full bg-sg/30 rounded-full h-2.5">
              <div className="bg-ob h-2.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-si">
              <span>Step {currentStep} of {MILESTONES.length}</span>
              <span className={`badge text-xs ${statusBadge[selected.status] ?? ''}`}>{selected.status?.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Co-applicant status */}
          {coApplicants.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-ob text-sm mb-3">Co-Applicant Verification</h3>
              <div className="space-y-2">
                {coApplicants.map((ca, i) => (
                  <div key={ca.id} className="flex items-center gap-3 p-3 bg-sg/10 rounded-xl">
                    <div className="w-8 h-8 bg-ob/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-ob/60">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ob truncate">
                        {`${ca.personal_info?.firstName ?? ''} ${ca.personal_info?.lastName ?? ''}`.trim() || 'Co-Applicant'}
                      </div>
                      <div className="text-xs text-si">{ca.relationship} • {ca.employment_type?.replace('_', ' ')}</div>
                    </div>
                    <span className={`badge text-xs ${ca.verification_status === 'verified' ? 'bg-success-500/15 text-success-600' : ca.verification_status === 'rejected' ? 'bg-error-500/15 text-error-600' : 'bg-sg/40 text-si'}`}>
                      {ca.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-sg/30">
              <h3 className="font-semibold text-ob">Application Timeline</h3>
            </div>
            <div className="p-5">
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-0 w-0.5 bg-sg/30" />
                <div className="space-y-0">
                  {MILESTONES.map((m, i) => {
                    const done = m.step < currentStep;
                    const current = m.step === currentStep;
                    const upcoming = m.step > currentStep;
                    return (
                      <div key={m.step} className="flex items-start gap-4 pb-5 last:pb-0">
                        <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${done ? 'bg-success-500 border-success-500' : current ? 'bg-ob border-ob animate-pulse-slow' : 'bg-white border-sg'}`}>
                          {done ? <CheckCircle2 className="w-4 h-4 text-white" />
                            : current ? <Clock className="w-3.5 h-3.5 text-white" />
                              : <span className="text-xs font-medium text-sg">{m.step}</span>}
                        </div>
                        <div className={`flex-1 pt-2 ${upcoming ? 'opacity-35' : ''}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium text-sm ${upcoming ? 'text-si' : 'text-ob'}`}>{m.label}</span>
                            {current && <span className="badge bg-ob text-pw text-xs">In Progress</span>}
                          </div>
                          <div className="text-xs text-si mt-0.5">{m.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
