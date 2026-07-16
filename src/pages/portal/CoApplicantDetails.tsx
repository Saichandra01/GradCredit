import { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, Trash2, Save, CheckCircle2, User, Edit2, X, AlertCircle, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

const RELATIONSHIPS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Legal Guardian', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other Eligible Blood Relative'];
const EMP_TYPES = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'government', label: 'Government Employee' },
  { value: 'retired', label: 'Retired' },
  { value: 'professional', label: 'Professional (Doctor / CA / Lawyer)' },
  { value: 'other', label: 'Other' },
];

interface CoApplicant {
  id?: string;
  relationship: string;
  personal_info: Record<string, any>;
  employment_type: string;
  employment_info: Record<string, any>;
  financial_info: Record<string, any>;
  verification_status: string;
}

const defaultCoApp = (): CoApplicant => ({
  relationship: '',
  personal_info: { firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '', aadhaar: '', pan: '', passport: '', nationality: 'Indian', maritalStatus: '', currentAddress: '', permanentAddress: '' },
  employment_type: 'salaried',
  employment_info: {},
  financial_info: { cibilScore: '', existingLoans: [], monthlyEMI: '', householdExpenses: '', savings: '', fixedDeposits: '', investments: '', otherAssets: '', otherLiabilities: '' },
  verification_status: 'pending',
});

const Sel = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] | string[]; placeholder: string }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field appearance-none">
      <option value="">{placeholder}</option>
      {options.map((o: any) => <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>{typeof o === 'string' ? o : o.label}</option>)}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si pointer-events-none" />
  </div>
);

const F = ({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

function SalariedForm({ info, onChange }: { info: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const f = (k: string) => info[k] ?? '';
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <F label="Company Name" req><input value={f('companyName')} onChange={e => onChange('companyName', e.target.value)} placeholder="Employer name" className="input-field" /></F>
      <F label="Employee ID"><input value={f('employeeId')} onChange={e => onChange('employeeId', e.target.value)} className="input-field" /></F>
      <F label="Designation"><input value={f('designation')} onChange={e => onChange('designation', e.target.value)} className="input-field" /></F>
      <F label="Department"><input value={f('department')} onChange={e => onChange('department', e.target.value)} className="input-field" /></F>
      <F label="Date of Joining"><input type="date" value={f('dateOfJoining')} onChange={e => onChange('dateOfJoining', e.target.value)} className="input-field" /></F>
      <F label="Monthly Gross Salary (₹)" req><input type="number" value={f('monthlyGross')} onChange={e => onChange('monthlyGross', e.target.value)} placeholder="e.g. 80000" className="input-field" /></F>
      <F label="Monthly Net Salary (₹)"><input type="number" value={f('monthlyNet')} onChange={e => onChange('monthlyNet', e.target.value)} placeholder="e.g. 65000" className="input-field" /></F>
      <F label="Annual Income (₹)" req><input type="number" value={f('annualIncome')} onChange={e => onChange('annualIncome', e.target.value)} placeholder="e.g. 960000" className="input-field" /></F>
      <F label="Employer Address" span><textarea value={f('employerAddress')} onChange={e => onChange('employerAddress', e.target.value)} rows={2} className="input-field resize-none" /></F>
    </div>
  );
}

function BusinessForm({ info, onChange }: { info: Record<string, any>; onChange: (k: string, v: any) => void }) {
  const f = (k: string) => info[k] ?? '';
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <F label="Business Name" req><input value={f('businessName')} onChange={e => onChange('businessName', e.target.value)} className="input-field" /></F>
      <F label="Business Type"><input value={f('businessType')} onChange={e => onChange('businessType', e.target.value)} placeholder="Proprietorship / Partnership / Pvt Ltd" className="input-field" /></F>
      <F label="Business Registration No."><input value={f('registrationNo')} onChange={e => onChange('registrationNo', e.target.value)} className="input-field" /></F>
      <F label="GST Number"><input value={f('gstNumber')} onChange={e => onChange('gstNumber', e.target.value)} placeholder="15-digit GST" className="input-field" /></F>
      <F label="Business PAN"><input value={f('businessPan')} onChange={e => onChange('businessPan', e.target.value)} placeholder="ABCDE1234F" className="input-field" /></F>
      <F label="Nature of Business"><input value={f('natureOfBusiness')} onChange={e => onChange('natureOfBusiness', e.target.value)} className="input-field" /></F>
      <F label="Years in Business"><input type="number" value={f('yearsInBusiness')} onChange={e => onChange('yearsInBusiness', e.target.value)} placeholder="e.g. 8" className="input-field" /></F>
      <F label="Annual Turnover (₹)"><input type="number" value={f('annualTurnover')} onChange={e => onChange('annualTurnover', e.target.value)} className="input-field" /></F>
      <F label="Annual Profit (₹)"><input type="number" value={f('annualProfit')} onChange={e => onChange('annualProfit', e.target.value)} className="input-field" /></F>
      <F label="Annual Income (₹)" req><input type="number" value={f('annualIncome')} onChange={e => onChange('annualIncome', e.target.value)} className="input-field" /></F>
      <F label="Business Address" span><textarea value={f('businessAddress')} onChange={e => onChange('businessAddress', e.target.value)} rows={2} className="input-field resize-none" /></F>
    </div>
  );
}

function CoApplicantForm({ coApp, onChange, onSave, saving }: { coApp: CoApplicant; onChange: (updated: CoApplicant) => void; onSave: () => void; saving: boolean }) {
  const pi = coApp.personal_info;
  const updPI = (k: string, v: any) => onChange({ ...coApp, personal_info: { ...pi, [k]: v } });
  const updEmp = (k: string, v: any) => onChange({ ...coApp, employment_info: { ...coApp.employment_info, [k]: v } });
  const updFin = (k: string, v: any) => onChange({ ...coApp, financial_info: { ...coApp.financial_info, [k]: v } });

  return (
    <div className="space-y-8">
      {/* Relationship */}
      <div>
        <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Relationship & Basic Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Relationship with Student" req>
            <Sel value={coApp.relationship} onChange={v => onChange({ ...coApp, relationship: v })} options={RELATIONSHIPS} placeholder="Select relationship" />
          </F>
          <div />
          <F label="First Name" req><input value={pi.firstName ?? ''} onChange={e => updPI('firstName', e.target.value)} placeholder="As on Aadhaar" className="input-field" /></F>
          <F label="Last Name" req><input value={pi.lastName ?? ''} onChange={e => updPI('lastName', e.target.value)} placeholder="As on Aadhaar" className="input-field" /></F>
          <F label="Date of Birth"><input type="date" value={pi.dob ?? ''} onChange={e => updPI('dob', e.target.value)} className="input-field" /></F>
          <F label="Gender"><Sel value={pi.gender ?? ''} onChange={v => updPI('gender', v)} options={['Male', 'Female', 'Other']} placeholder="Select" /></F>
          <F label="Mobile Number" req><input value={pi.phone ?? ''} onChange={e => updPI('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-field" /></F>
          <F label="Email Address"><input type="email" value={pi.email ?? ''} onChange={e => updPI('email', e.target.value)} className="input-field" /></F>
          <F label="Nationality"><input value={pi.nationality ?? 'Indian'} onChange={e => updPI('nationality', e.target.value)} className="input-field" /></F>
          <F label="Marital Status"><Sel value={pi.maritalStatus ?? ''} onChange={v => updPI('maritalStatus', v)} options={['Single', 'Married', 'Divorced', 'Widowed']} placeholder="Select" /></F>
        </div>
      </div>

      {/* ID Documents */}
      <div>
        <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Identity Documents</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Aadhaar Number"><input value={pi.aadhaar ?? ''} onChange={e => updPI('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="XXXX XXXX XXXX" className="input-field" /></F>
          <F label="PAN Number"><input value={pi.pan ?? ''} onChange={e => updPI('pan', e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" className="input-field" /></F>
          <F label="Passport Number (Optional)"><input value={pi.passport ?? ''} onChange={e => updPI('passport', e.target.value.toUpperCase())} className="input-field" /></F>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Address</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="Current Address" span><textarea value={pi.currentAddress ?? ''} onChange={e => updPI('currentAddress', e.target.value)} rows={2} className="input-field resize-none" /></F>
          <F label="Permanent Address" span><textarea value={pi.permanentAddress ?? ''} onChange={e => updPI('permanentAddress', e.target.value)} rows={2} className="input-field resize-none" /></F>
        </div>
      </div>

      {/* Employment */}
      <div>
        <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Employment Details</h3>
        <div className="mb-4">
          <F label="Employment Type" req>
            <Sel value={coApp.employment_type} onChange={v => onChange({ ...coApp, employment_type: v, employment_info: {} })} options={EMP_TYPES} placeholder="Select type" />
          </F>
        </div>
        {(coApp.employment_type === 'salaried' || coApp.employment_type === 'government' || coApp.employment_type === 'professional') && (
          <SalariedForm info={coApp.employment_info} onChange={updEmp} />
        )}
        {(coApp.employment_type === 'self_employed' || coApp.employment_type === 'business_owner') && (
          <BusinessForm info={coApp.employment_info} onChange={updEmp} />
        )}
        {coApp.employment_type === 'retired' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Previous Employer"><input value={coApp.employment_info.previousEmployer ?? ''} onChange={e => updEmp('previousEmployer', e.target.value)} className="input-field" /></F>
            <F label="Monthly Pension (₹)"><input type="number" value={coApp.employment_info.monthlyPension ?? ''} onChange={e => updEmp('monthlyPension', e.target.value)} className="input-field" /></F>
            <F label="Annual Income (₹)"><input type="number" value={coApp.employment_info.annualIncome ?? ''} onChange={e => updEmp('annualIncome', e.target.value)} className="input-field" /></F>
          </div>
        )}
        {coApp.employment_type === 'other' && (
          <div><F label="Describe Employment"><textarea value={coApp.employment_info.description ?? ''} onChange={e => updEmp('description', e.target.value)} rows={3} className="input-field resize-none" /></F></div>
        )}
      </div>

      {/* Financial Profile */}
      <div>
        <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Financial Profile</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F label="CIBIL / Credit Score">
            <input type="number" min={300} max={900} value={coApp.financial_info.cibilScore ?? ''} onChange={e => updFin('cibilScore', e.target.value)} placeholder="300–900" className="input-field" />
          </F>
          <F label="Total Monthly EMI (₹)"><input type="number" value={coApp.financial_info.monthlyEMI ?? ''} onChange={e => updFin('monthlyEMI', e.target.value)} placeholder="All existing EMIs" className="input-field" /></F>
          <F label="Monthly Household Expenses (₹)"><input type="number" value={coApp.financial_info.householdExpenses ?? ''} onChange={e => updFin('householdExpenses', e.target.value)} className="input-field" /></F>
          <F label="Savings (₹)"><input type="number" value={coApp.financial_info.savings ?? ''} onChange={e => updFin('savings', e.target.value)} className="input-field" /></F>
          <F label="Fixed Deposits (₹)"><input type="number" value={coApp.financial_info.fixedDeposits ?? ''} onChange={e => updFin('fixedDeposits', e.target.value)} className="input-field" /></F>
          <F label="Investments (₹)"><input type="number" value={coApp.financial_info.investments ?? ''} onChange={e => updFin('investments', e.target.value)} className="input-field" /></F>
          <F label="Other Assets (₹)"><input type="number" value={coApp.financial_info.otherAssets ?? ''} onChange={e => updFin('otherAssets', e.target.value)} className="input-field" /></F>
          <F label="Other Liabilities"><input value={coApp.financial_info.otherLiabilities ?? ''} onChange={e => updFin('otherLiabilities', e.target.value)} placeholder="Describe if any" className="input-field" /></F>
        </div>
      </div>

      <button onClick={onSave} disabled={saving} className="btn-primary w-full justify-center py-3">
        <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Co-Applicant'}
      </button>
    </div>
  );
}

export default function CoApplicantDetails({ applicationId, onNavigate, onStepComplete }: Props) {
  const [coApplicants, setCoApplicants] = useState<CoApplicant[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase.from('co_applicants').select('*').eq('user_id', userData.user.id).order('created_at');
    setCoApplicants(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addNew = () => {
    const newApp = defaultCoApp();
    setCoApplicants(p => [...p, newApp]);
    setActiveIdx(coApplicants.length);
  };

  const updateCoApp = (idx: number, updated: CoApplicant) => {
    setCoApplicants(p => p.map((c, i) => i === idx ? updated : c));
  };

  const saveCoApp = async (idx: number) => {
    const app = coApplicants[idx];
    if (!app.relationship || !app.personal_info.firstName || !app.personal_info.phone) {
      setError('Relationship, first name and mobile are required.');
      return;
    }
    setSaving(true); setError('');
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { setSaving(false); return; }

    if (app.id) {
      await supabase.from('co_applicants').update({
        relationship: app.relationship,
        personal_info: app.personal_info,
        employment_type: app.employment_type,
        employment_info: app.employment_info,
        financial_info: app.financial_info,
      }).eq('id', app.id);
    } else {
      const { data: inserted } = await supabase.from('co_applicants').insert({
        user_id: userId,
        application_id: applicationId,
        relationship: app.relationship,
        personal_info: app.personal_info,
        employment_type: app.employment_type,
        employment_info: app.employment_info,
        financial_info: app.financial_info,
        verification_status: 'pending',
      }).select('id').maybeSingle();
      if (inserted?.id) {
        setCoApplicants(p => p.map((c, i) => i === idx ? { ...c, id: inserted.id } : c));
      }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onStepComplete('co_applicant');
    setActiveIdx(null);
    load();
  };

  const removeCoApp = async (idx: number) => {
    const app = coApplicants[idx];
    if (app.id) await supabase.from('co_applicants').delete().eq('id', app.id);
    setCoApplicants(p => p.filter((_, i) => i !== idx));
    if (activeIdx === idx) setActiveIdx(null);
  };

  if (loading) return <div className="text-center py-12 text-si">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header info */}
      <div className="p-4 bg-sg/40 border border-sg/40 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-si shrink-0 mt-0.5" />
        <div className="text-sm text-si">
          <strong>Co-Applicant is Mandatory for Education Loans.</strong> Education loans require a co-applicant (parent/guardian/spouse) as a guarantor. Their income and credit profile are the primary factors in loan approval and interest rate determination.
        </div>
      </div>

      {/* Co-applicant list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-sg/30 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ob">Co-Applicants</h3>
            <p className="text-si text-xs mt-0.5">{coApplicants.filter(c => c.id).length} saved</p>
          </div>
          <button onClick={addNew} className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Co-Applicant
          </button>
        </div>

        {coApplicants.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-sg mx-auto mb-3" />
            <p className="text-si text-sm mb-4">No co-applicants added yet.</p>
            <button onClick={addNew} className="btn-primary text-sm py-2.5">
              <Plus className="w-4 h-4" /> Add First Co-Applicant
            </button>
          </div>
        ) : (
          <div className="divide-y divide-sg/30">
            {coApplicants.map((app, idx) => (
              <div key={idx}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-sg/30 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-ob/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ob text-sm">
                      {app.personal_info.firstName ? `${app.personal_info.firstName} ${app.personal_info.lastName ?? ''}`.trim() : 'New Co-Applicant'}
                    </div>
                    <div className="text-xs text-si mt-0.5">
                      {app.relationship || 'Relationship not set'} •{' '}
                      {EMP_TYPES.find(e => e.value === app.employment_type)?.label ?? app.employment_type}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${app.id ? 'bg-success-500/15 text-success-600' : 'bg-sg/40 text-si'}`}>
                      {app.id ? 'Saved' : 'Unsaved'}
                    </span>
                    <button onClick={() => setActiveIdx(activeIdx === idx ? null : idx)} className="p-1.5 rounded-lg hover:bg-sg/30 text-si hover:text-ob transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeCoApp(idx)} className="p-1.5 rounded-lg hover:bg-error-50 text-sg hover:text-error-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {activeIdx === idx && (
                  <div className="px-5 pb-6 border-t border-sg/30 pt-4">
                    {error && <div className="mb-4 p-3 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm">{error}</div>}
                    <CoApplicantForm
                      coApp={app}
                      onChange={updated => updateCoApp(idx, updated)}
                      onSave={() => saveCoApp(idx)}
                      saving={saving}
                    />
                    {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Co-applicant saved successfully!</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {coApplicants.some(c => c.id) && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const saved = coApplicants.filter(c => c.id);
              downloadSectionPdf(
                saved.map((c, i) => ({
                  title: `Co-Applicant ${i + 1}`,
                  fields: [
                    { label: 'Name', value: `${c.personal_info?.firstName ?? ''} ${c.personal_info?.lastName ?? ''}` },
                    { label: 'Relationship', value: c.relationship },
                    { label: 'Employment Type', value: c.employment_type },
                    { label: 'Phone', value: c.personal_info?.phone },
                    { label: 'Email', value: c.personal_info?.email },
                    { label: 'CIBIL Score', value: c.financial_info?.cibilScore },
                    { label: 'Monthly EMI', value: c.financial_info?.monthlyEMI },
                    { label: 'Savings', value: c.financial_info?.savings },
                    { label: 'Investments', value: c.financial_info?.investments },
                  ],
                })),
                'Co-Applicant Details',
              );
            }}
            className="btn-secondary text-sm py-2.5 flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={() => onNavigate('education')} className="btn-primary text-sm py-2.5">
            Continue to Educational Information <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
