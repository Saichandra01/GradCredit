import { useState, useEffect } from 'react';
import { CheckCircle2, Send, AlertCircle, FileText, Users, GraduationCap, CreditCard, BarChart3, Home, Upload, Sliders } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { NavId } from '../Portal';

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; submitMode?: boolean; }

const ReviewRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <div className="flex items-start justify-between py-2 border-b border-sg/20 last:border-0 gap-4">
    <span className="text-si text-xs shrink-0 w-36">{label}</span>
    <span className="text-ob text-xs font-medium text-right">{value || '—'}</span>
  </div>
);

const Section = ({ title, id, icon: Icon, children, onNavigate }: { title: string; id: NavId; icon: React.ElementType; children: React.ReactNode; onNavigate: (id: NavId) => void }) => (
  <div className="card overflow-hidden">
    <div className="px-5 py-3 border-b border-sg/30 flex items-center justify-between bg-sg/10">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-ob/60" />
        <h3 className="font-semibold text-ob text-sm">{title}</h3>
      </div>
      <button onClick={() => onNavigate(id)} className="text-xs text-si hover:text-ob transition-colors">Edit</button>
    </div>
    <div className="px-5 py-3">{children}</div>
  </div>
);

const sections = [
  { id: 'personal' as NavId, label: 'Personal Information', icon: FileText },
  { id: 'co_applicant' as NavId, label: 'Co-Applicant Details', icon: Users },
  { id: 'education' as NavId, label: 'Educational Information', icon: GraduationCap },
  { id: 'loan_req' as NavId, label: 'Loan Requirement', icon: CreditCard },
  { id: 'income' as NavId, label: 'Income Details', icon: BarChart3 },
  { id: 'financial' as NavId, label: 'Financial Details', icon: BarChart3 },
  { id: 'collateral' as NavId, label: 'Collateral Details', icon: Home },
  { id: 'documents' as NavId, label: 'Document Upload', icon: Upload },
  { id: 'loan_pref' as NavId, label: 'Loan Preferences', icon: Sliders },
];



export default function ReviewApplication({ applicationId, onNavigate, onStepComplete, submitMode }: Props) {
  const [app, setApp] = useState<any>(null);
  const [coApplicants, setCoApplicants] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!applicationId) { setLoading(false); return; }
    Promise.all([
      supabase.from('applications').select('*').eq('id', applicationId).maybeSingle(),
      supabase.from('co_applicants').select('*').eq('application_id', applicationId),
      supabase.from('documents').select('*').eq('application_id', applicationId),
    ]).then(([appRes, coRes, docRes]) => {
      setApp(appRes.data);
      setCoApplicants(coRes.data ?? []);
      setDocuments(docRes.data ?? []);
      setLoading(false);
    });
  }, [applicationId]);

  const handleSubmit = async () => {
    if (!applicationId || !agreed) return;
    setSubmitting(true);
    await supabase.from('applications').update({ status: 'submitted', current_step: 11 }).eq('id', applicationId);
    // Create welcome notification
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from('notifications').insert({
        user_id: userData.user.id,
        title: 'Application Submitted Successfully!',
        message: 'Your education loan application has been received. Our counselor will review it and contact you within 24–48 hours.',
        type: 'success',
        action_url: 'status',
      });
    }
    onStepComplete('submit');
    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) return <div className="text-center py-12 text-si">Loading application data...</div>;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="card p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-success-500/15 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success-600" />
          </div>
          <h3 className="text-xl font-bold text-ob">Application Submitted!</h3>
          <p className="text-si text-sm">Your complete education loan application has been submitted. Reference ID: <strong>{applicationId?.slice(0, 8).toUpperCase()}</strong></p>
          <p className="text-si text-sm">Our team will review your application and co-applicant details and get in touch within 24–48 hours.</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => onNavigate('status')} className="btn-primary text-sm py-2.5">Track Status</button>
            <button onClick={() => onNavigate('dashboard')} className="btn-secondary text-sm py-2.5">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="card p-10 flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-sg" />
          <h3 className="font-bold text-ob">No Application Found</h3>
          <p className="text-si text-sm">Please complete the application sections before reviewing.</p>
          <button onClick={() => onNavigate('personal')} className="btn-primary text-sm py-2.5">Start Application</button>
        </div>
      </div>
    );
  }

  const pi = app.personal_info ?? {};
  const ai = app.academic_info ?? {};

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="p-4 bg-si/20 border border-sg/40 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-ob shrink-0 mt-0.5" />
        <div className="text-sm text-ob">Please review all sections carefully before submitting. You can click <strong>Edit</strong> on any section to make changes.</div>
      </div>

      {/* Application ID */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-si">Application Reference ID</div>
          <div className="font-mono font-bold text-ob text-lg">{applicationId?.slice(0, 8).toUpperCase()}</div>
        </div>
        <span className={`badge text-xs ${app.status === 'submitted' ? 'bg-success-500/15 text-success-600' : 'bg-sg/40 text-si'}`}>
          {app.status?.replace('_', ' ') ?? 'Draft'}
        </span>
      </div>

      <Section title="Personal Information" id="personal" icon={FileText} onNavigate={onNavigate}>
        <ReviewRow label="Full Name" value={`${pi.firstName ?? ''} ${pi.lastName ?? ''}`.trim()} />
        <ReviewRow label="Date of Birth" value={pi.dob} />
        <ReviewRow label="PAN Number" value={pi.pan} />
        <ReviewRow label="Passport Number" value={pi.passportNumber} />
        <ReviewRow label="Mobile" value={pi.phone} />
        <ReviewRow label="City" value={pi.currentCity} />
      </Section>

      <Section title="Co-Applicants" id="co_applicant" icon={FileText} onNavigate={onNavigate}>
        {coApplicants.length === 0 ? (
          <div className="text-si text-sm py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-si" /> No co-applicants added
          </div>
        ) : coApplicants.map((ca, i) => (
          <div key={ca.id} className="mb-3 last:mb-0">
            <div className="text-xs font-semibold text-ob/60 mb-1">Co-Applicant {i + 1}</div>
            <ReviewRow label="Name" value={`${ca.personal_info?.firstName ?? ''} ${ca.personal_info?.lastName ?? ''}`.trim()} />
            <ReviewRow label="Relationship" value={ca.relationship} />
            <ReviewRow label="Employment" value={ca.employment_type?.replace('_', ' ')} />
            <ReviewRow label="Mobile" value={ca.personal_info?.phone} />
            <ReviewRow label="PAN" value={ca.personal_info?.pan} />
          </div>
        ))}
      </Section>

      <Section title="Educational Information" id="education" icon={GraduationCap} onNavigate={onNavigate}>
        <ReviewRow label="10th Score" value={ai.class10Score ? `${ai.class10Score}%` : undefined} />
        <ReviewRow label="12th Score" value={ai.class12Score ? `${ai.class12Score}%` : undefined} />
        <ReviewRow label="Graduation" value={ai.graduationDegree} />
        <ReviewRow label="Grad Score" value={ai.graduationScore} />
        <ReviewRow label="IELTS Score" value={ai.ieltsScore} />
        <ReviewRow label="GRE Score" value={ai.greScore} />
      </Section>

      <Section title="Loan Requirement" id="loan_req" icon={CreditCard} onNavigate={onNavigate}>
        <ReviewRow label="Country" value={app.preferred_country} />
        <ReviewRow label="Course" value={app.preferred_course} />
        <ReviewRow label="University" value={app.preferred_university} />
        <ReviewRow label="Loan Required" value={app.loan_required ? 'Yes' : 'No'} />
        <ReviewRow label="Loan Amount" value={app.loan_amount ? `₹${Number(app.loan_amount).toLocaleString('en-IN')}` : undefined} />
      </Section>

      <Section title="Documents Uploaded" id="documents" icon={Upload} onNavigate={onNavigate}>
        {documents.length === 0 ? (
          <div className="text-si text-sm py-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-si" /> No documents uploaded yet</div>
        ) : documents.map(doc => (
          <ReviewRow key={doc.id} label={doc.document_type} value={doc.file_name} />
        ))}
      </Section>

      {/* Declaration */}
      <div className="card p-5">
        <h3 className="font-semibold text-ob text-sm mb-3">Declaration & Consent</h3>
        <div className="text-xs text-si leading-relaxed mb-4">
          I hereby declare that all the information provided in this application is true, correct, and complete to the best of my knowledge. I understand that any false or misleading information may result in the rejection of my application and possible legal action. I consent to Pathfinders Overseas sharing this information with partner banks and financial institutions for the purpose of processing my education loan application.
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="accent-ob mt-0.5" />
          <span className="text-sm text-ob font-medium">I have read and agree to the declaration above. I confirm that all information is accurate.</span>
        </label>
      </div>

      {submitMode && app.status !== 'submitted' && (
        <div className="card p-5">
          <button
            onClick={handleSubmit}
            disabled={submitting || !agreed}
            className={`btn-primary w-full justify-center py-3.5 text-base ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
          {!agreed && <p className="text-xs text-si text-center mt-2">Please agree to the declaration to submit.</p>}
        </div>
      )}

      {!submitMode && (
        <div className="flex justify-end">
          <button onClick={() => onNavigate('submit')} className="btn-primary text-sm py-2.5">
            Proceed to Submit <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
