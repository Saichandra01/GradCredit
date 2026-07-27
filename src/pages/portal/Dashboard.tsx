import { useState, useEffect } from 'react';
import { FileText, Upload, CreditCard, TrendingUp, ArrowRight, AlertCircle, CheckCircle2, Calendar, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

const APP_STEPS: { id: NavId; label: string; icon: typeof FileText }[] = [
  { id: 'personal', label: 'Personal Info', icon: FileText },
  { id: 'co_applicant', label: 'Co-Applicant', icon: Users },
  { id: 'education', label: 'Education', icon: FileText },
  { id: 'loan_req', label: 'Loan Req.', icon: CreditCard },
  { id: 'income', label: 'Income', icon: TrendingUp },
  { id: 'financial', label: 'Financials', icon: TrendingUp },
  { id: 'collateral', label: 'Collateral', icon: FileText },
  { id: 'non_collateral', label: 'Non-Collateral', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Upload },
  { id: 'loan_pref', label: 'Loan Prefs', icon: CreditCard },
  { id: 'review', label: 'Review', icon: FileText },
  { id: 'submit', label: 'Submit', icon: FileText },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-sg/40 text-ob/60',
  submitted: 'bg-si/20 text-ob',
  under_review: 'bg-sg/40 text-si',
  offer_received: 'bg-success-500/15 text-success-600',
  visa_applied: 'bg-si/15 text-ob',
  visa_approved: 'bg-success-500/20 text-success-700',
  enrolled: 'bg-ob text-pw',
};

function UsersIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

interface Props {
  onNavigate: (id: NavId) => void;
  applicationId: string | null;
  completedSteps: Set<NavId>;
  userId?: string;
  loanType?: 'collateral' | 'non_collateral';
}

export default function Dashboard({ onNavigate, applicationId, completedSteps, userId, loanType = 'collateral' }: Props) {
  const [app, setApp] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [coApplicants, setCoApplicants] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      supabase.from('applications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('documents').select('id, status').eq('user_id', userId),
      supabase.from('co_applicants').select('id, relationship, verification_status').eq('user_id', userId),
      supabase.from('appointments').select('*').eq('user_id', userId).in('status', ['pending', 'confirmed']).order('preferred_date').limit(3),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false),
    ]).then(([appRes, docsRes, coRes, apptRes, notifRes]) => {
      setApp(appRes.data);
      setDocuments(docsRes.data ?? []);
      setCoApplicants(coRes.data ?? []);
      setAppointments(apptRes.data ?? []);
      setUnread((notifRes as any).count ?? 0);
      setLoading(false);
    });
  }, [userId]);

  // Only show the relevant loan-type step
  const activeSteps = APP_STEPS.filter(s => {
    if (s.id === 'collateral') return loanType === 'collateral';
    if (s.id === 'non_collateral') return loanType === 'non_collateral';
    return true;
  });
  const progressPct = Math.round((completedSteps.size / activeSteps.length) * 100);
  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const nextStep = APP_STEPS.find(s => !completedSteps.has(s.id) && (s.id !== 'collateral' || loanType === 'collateral') && (s.id !== 'non_collateral' || loanType === 'non_collateral'));

  // Missing documents (core required docs not yet uploaded)
  const CORE_DOC_TYPES = ['Passport (Front & Back)', 'Aadhaar Card (Student)', 'PAN Card (Student)', '10th Marksheet', '12th Marksheet', 'Offer Letter / Admission Confirmation'];
  const uploadedDocTypes = new Set(documents.map(d => d.document_type));
  const missingDocs = CORE_DOC_TYPES.filter(d => !uploadedDocTypes.has(d));

  // Eligibility summary from non-collateral details
  const eligibility = app?.non_collateral_details;
  const hasEligibility = eligibility && (eligibility.eligibilityRating || eligibility.eligibilityScore !== undefined);

  // Pending actions list
  const pendingActions: { label: string; action: NavId; severity: 'high' | 'medium' | 'low' }[] = [];
  if (!completedSteps.has('personal')) pendingActions.push({ label: 'Complete Personal Information', action: 'personal', severity: 'high' });
  if (coApplicants.length === 0) pendingActions.push({ label: 'Add a Co-Applicant', action: 'co_applicant', severity: 'high' });
  if (!completedSteps.has('education')) pendingActions.push({ label: 'Fill Educational Information', action: 'education', severity: 'high' });
  if (!completedSteps.has('loan_req')) pendingActions.push({ label: 'Select Loan Type & Requirement', action: 'loan_req', severity: 'high' });
  if (loanType === 'non_collateral' && !completedSteps.has('non_collateral')) pendingActions.push({ label: 'Complete Non-Collateral Loan Details', action: 'non_collateral', severity: 'medium' });
  if (loanType === 'collateral' && !completedSteps.has('collateral')) pendingActions.push({ label: 'Complete Collateral Details', action: 'collateral', severity: 'medium' });
  if (missingDocs.length > 0) pendingActions.push({ label: `Upload ${missingDocs.length} missing document${missingDocs.length > 1 ? 's' : ''}`, action: 'documents', severity: 'medium' });
  if (pendingDocs > 0) pendingActions.push({ label: `${pendingDocs} document${pendingDocs > 1 ? 's' : ''} pending review`, action: 'documents', severity: 'low' });
  if (!completedSteps.has('review')) pendingActions.push({ label: 'Review your application', action: 'review', severity: 'low' });

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Welcome Banner */}
      <div className="bg-ob rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-56 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }} />
        <div className="relative grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-pw mb-1">Good to see you!</h2>
            <p className="text-pw/50 text-sm mb-4">Your overseas education journey is in progress. Keep going!</p>
            <div className="flex flex-wrap gap-2">
              {nextStep && (
                <button onClick={() => onNavigate(nextStep.id)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-pw text-ob text-sm font-semibold rounded-xl hover:bg-white transition-colors">
                  Continue: {nextStep.label} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onNavigate('appointments')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-pw text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors">
                <Calendar className="w-3.5 h-3.5" /> Book Appointment
              </button>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-pw/60 text-xs">Application Progress</span>
              <span className="font-bold text-pw text-lg">{progressPct}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-3">
              <div className="bg-pw h-2 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-pw/40">
              <span>{completedSteps.size} of {activeSteps.length} sections completed</span>
              <div className="flex items-center gap-2 flex-wrap">
                {app?.status && <span className={`badge text-xs ${STATUS_COLORS[app.status] ?? ''}`}>{app.status.replace('_', ' ')}</span>}
                <span className={`badge text-xs ${loanType === 'non_collateral' ? 'bg-si/20 text-ob' : 'bg-sg/40 text-ob/60'}`}>
                  {loanType === 'non_collateral' ? 'Non-Collateral' : 'Collateral'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'App. Progress', value: `${progressPct}%`, sub: `${completedSteps.size}/${activeSteps.length} sections`, icon: FileText, color: 'bg-si/20 text-ob', onClick: () => onNavigate('review') },
          { label: 'Documents', value: documents.length, sub: `${approvedDocs} approved · ${pendingDocs} pending`, icon: Upload, color: 'bg-si/15 text-ob', onClick: () => onNavigate('documents') },
          { label: 'Co-Applicants', value: coApplicants.length, sub: coApplicants.length === 0 ? 'None added yet' : `${coApplicants.filter(c => c.verification_status === 'verified').length} verified`, icon: UsersIcon, color: 'bg-success-500/15 text-success-600', onClick: () => onNavigate('co_applicant') },
          { label: 'Notifications', value: unread, sub: unread === 0 ? 'All read' : `${unread} unread`, icon: AlertCircle, color: 'bg-sg/40 text-si', onClick: () => onNavigate('notifications') },
        ].map(({ label, value, sub, icon: Icon, color, onClick }) => (
          <button key={label} onClick={onClick} className="card p-5 text-left hover:shadow-card-hover transition-all">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-ob mb-0.5">{value}</div>
            <div className="text-sm font-medium text-ob/70">{label}</div>
            <div className="text-xs text-si mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      {/* Application step checklist */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-sg/30 flex items-center justify-between">
          <h3 className="font-semibold text-ob">Application Checklist</h3>
          <button onClick={() => onNavigate('review')} className="text-sm text-si hover:text-ob transition-colors flex items-center gap-1">
            View Full <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activeSteps.map(({ id, label }) => {
              const done = completedSteps.has(id);
              return (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-sm transition-all hover:bg-sg/20 text-left ${done ? 'text-ob' : 'text-si'}`}
                >
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-success-500 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-sg shrink-0" />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Upcoming appointments */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-sg/30 flex items-center justify-between">
            <h3 className="font-semibold text-ob">Upcoming Appointments</h3>
            <button onClick={() => onNavigate('appointments')} className="text-xs text-si hover:text-ob transition-colors">View All</button>
          </div>
          {appointments.length === 0 ? (
            <div className="p-6 text-center">
              <Calendar className="w-8 h-8 text-sg mx-auto mb-2" />
              <p className="text-si text-xs mb-3">No upcoming appointments</p>
              <button onClick={() => onNavigate('appointments')} className="btn-primary text-xs py-1.5 px-3">Book Now</button>
            </div>
          ) : (
            <div className="divide-y divide-sg/30">
              {appointments.map(a => (
                <div key={a.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-ob rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-pw font-bold text-xs">{new Date(a.preferred_date).getDate()}</span>
                    <span className="text-pw/60 text-xs">{new Date(a.preferred_date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ob capitalize">{a.appointment_type.replace('_', ' ')}</div>
                    <div className="text-xs text-si">{a.preferred_time} · {a.counselor_name}</div>
                  </div>
                  <span className={`badge text-xs ${a.status === 'confirmed' ? 'bg-success-500/15 text-success-600' : 'bg-sg/40 text-si'}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application status */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-sg/30 flex items-center justify-between">
            <h3 className="font-semibold text-ob">Application Status</h3>
            <button onClick={() => onNavigate('status')} className="text-xs text-si hover:text-ob transition-colors">Full Timeline</button>
          </div>
          {!app ? (
            <div className="p-6 text-center">
              <FileText className="w-8 h-8 text-sg mx-auto mb-2" />
              <p className="text-si text-xs mb-3">No application started yet</p>
              <button onClick={() => onNavigate('personal')} className="btn-primary text-xs py-1.5 px-3">Start Now</button>
            </div>
          ) : (
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ob/70">Status</span>
                <span className={`badge text-xs ${STATUS_COLORS[app.status] ?? ''}`}>{app.status?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ob/70">Destination</span>
                <span className="text-sm font-medium text-ob">{app.preferred_country || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ob/70">Course</span>
                <span className="text-sm font-medium text-ob truncate ml-4">{app.preferred_course || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ob/70">Loan Required</span>
                <span className="text-sm font-medium text-ob">{app.loan_required ? `₹${Number(app.loan_amount || 0).toLocaleString('en-IN')}` : 'No'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert: add co-applicant */}
      {coApplicants.length === 0 && completedSteps.has('personal') && (
        <div className="flex items-start gap-3 p-4 bg-sg/40 border border-sg/40 rounded-xl">
          <AlertCircle className="w-5 h-5 text-si shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-si text-sm">Co-Applicant Required</div>
            <div className="text-si text-sm">Education loans require a co-applicant. Please add your parent or guardian details.</div>
          </div>
          <button onClick={() => onNavigate('co_applicant')} className="btn-primary text-xs py-2 px-3 shrink-0">Add Now</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Eligibility Summary */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-ob/60" />
            <h3 className="font-semibold text-ob">Eligibility Summary</h3>
          </div>
          {!hasEligibility ? (
            <div className="text-center py-6">
              <TrendingUp className="w-8 h-8 text-sg mx-auto mb-2" />
              <p className="text-si text-xs mb-3">
                {loanType === 'non_collateral' ? 'Complete Non-Collateral Loan Details to see your eligibility assessment.' : 'Eligibility assessment is available for Non-Collateral loans.'}
              </p>
              {loanType === 'non_collateral' && (
                <button onClick={() => onNavigate('non_collateral')} className="btn-primary text-xs py-1.5 px-3">Assess Now</button>
              )}
            </div>
          ) : (
            <div>
              <div className={`rounded-xl border p-4 mb-3 ${eligibility.eligibilityRating === 'Excellent' ? 'bg-success-500/15 border-success-500/30' : eligibility.eligibilityRating === 'Good' ? 'bg-si/20 border-sg/50' : eligibility.eligibilityRating === 'Fair' ? 'bg-sg/40 border-sg/50' : 'bg-error-500/15 border-error-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-bold ${eligibility.eligibilityRating === 'Excellent' ? 'text-success-600' : eligibility.eligibilityRating === 'Good' ? 'text-ob' : eligibility.eligibilityRating === 'Fair' ? 'text-si' : 'text-error-600'}`}>
                      {eligibility.eligibilityScore ?? 0}%
                    </div>
                    <div className="text-xs text-si mt-0.5">{eligibility.eligibilityRating ?? '—'}</div>
                  </div>
                  <TrendingUp className={`w-8 h-8 ${eligibility.eligibilityRating === 'Excellent' ? 'text-success-500' : eligibility.eligibilityRating === 'Good' ? 'text-ob' : eligibility.eligibilityRating === 'Fair' ? 'text-si' : 'text-error-500'}`} />
                </div>
              </div>
              <button onClick={() => onNavigate('non_collateral')} className="text-xs text-ob/60 hover:text-ob transition-colors">View details →</button>
            </div>
          )}
        </div>

        {/* Missing Documents */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-ob/60" />
            <h3 className="font-semibold text-ob">Documents</h3>
          </div>
          {missingDocs.length === 0 && pendingDocs === 0 ? (
            <div className="flex items-center gap-2 p-3 bg-success-500/15 rounded-xl text-success-600 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> All core documents uploaded
            </div>
          ) : (
            <div className="space-y-2">
              {missingDocs.length > 0 && (
                <div className="p-3 bg-sg/40 border border-sg/40 rounded-xl">
                  <div className="font-medium text-si text-xs mb-1.5">{missingDocs.length} missing document{missingDocs.length > 1 ? 's' : ''}</div>
                  <div className="flex flex-wrap gap-1">
                    {missingDocs.slice(0, 4).map(d => <span key={d} className="badge bg-sg/30 text-si text-xs">{d.split(' (')[0]}</span>)}
                    {missingDocs.length > 4 && <span className="badge bg-sg/30 text-si text-xs">+{missingDocs.length - 4} more</span>}
                  </div>
                </div>
              )}
              {pendingDocs > 0 && (
                <div className="p-3 bg-si/20 border border-sg/40 rounded-xl text-ob text-xs flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 shrink-0" /> {pendingDocs} document{pendingDocs > 1 ? 's' : ''} pending review
                </div>
              )}
              <button onClick={() => onNavigate('documents')} className="text-xs text-ob/60 hover:text-ob transition-colors">Manage documents →</button>
            </div>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-sg/30">
            <h3 className="font-semibold text-ob">Pending Actions</h3>
            <p className="text-si text-xs mt-0.5">{pendingActions.length} item{pendingActions.length > 1 ? 's' : ''} need your attention</p>
          </div>
          <div className="divide-y divide-sg/20">
            {pendingActions.map((action, i) => (
              <button key={i} onClick={() => onNavigate(action.action)} className="w-full px-5 py-3 flex items-center gap-3 hover:bg-sg/10 transition-colors text-left">
                <div className={`w-2 h-2 rounded-full shrink-0 ${action.severity === 'high' ? 'bg-error-500' : action.severity === 'medium' ? 'bg-sg/60' : 'bg-sg'}`} />
                <span className="flex-1 text-sm text-ob">{action.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-sg shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
