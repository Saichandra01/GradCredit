import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, CreditCard, Home, Info, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

interface Props {
  applicationId: string | null;
  onNavigate: (id: NavId) => void;
  onStepComplete: (id: NavId) => void;
  onLoanTypeChange?: (type: 'collateral' | 'non_collateral') => void;
}

const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'Ireland', 'New Zealand', 'France', 'Dubai / UAE', 'Singapore'];
const courses = ['Engineering / Technology', 'Business / MBA', 'Data Science / AI', 'Medicine', 'Law', 'Finance', 'Arts & Design', 'Pharmacy', 'Nursing', 'Architecture', 'Other'];
const intakes = ['January 2025', 'May 2025', 'September 2025', 'January 2026', 'May 2026', 'September 2026'];
const durations = ['1 Year', '1.5 Years', '2 Years', '3 Years', '4 Years', '5 Years'];

const F = ({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

const Sel = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className="input-field appearance-none">
    <option value="">{placeholder}</option>
    {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function LoanRequirement({ applicationId, onNavigate, onStepComplete, onLoanTypeChange }: Props) {
  const [form, setForm] = useState({
    loanType: 'collateral' as 'collateral' | 'non_collateral',
    preferredCountry: '', preferredCourse: '', preferredUniversity: '', intake: '',
    courseDuration: '', studyLevel: 'Masters',
    loanRequired: true, loanAmount: '', selfFundedAmount: '',
    tuitionFee: '', livingExpenses: '', travelExpenses: '', otherExpenses: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!applicationId) return;
    supabase
      .from('applications')
      .select('preferred_country, preferred_course, preferred_university, loan_required, loan_amount, loan_type, work_experience')
      .eq('id', applicationId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm(p => ({
            ...p,
            loanType: (data.loan_type as 'collateral' | 'non_collateral') ?? 'collateral',
            preferredCountry: data.preferred_country ?? '',
            preferredCourse: data.preferred_course ?? '',
            preferredUniversity: data.preferred_university ?? '',
            loanRequired: data.loan_required ?? true,
            loanAmount: data.loan_amount?.toString() ?? '',
            ...(data.work_experience ?? {}),
          }));
        }
      });
  }, [applicationId]);

  const upd = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v }));
    if (k === 'loanType') onLoanTypeChange?.(v);
  };

  const totalExpenses = [form.tuitionFee, form.livingExpenses, form.travelExpenses, form.otherExpenses]
    .map(v => parseFloat(v) || 0).reduce((a, b) => a + b, 0);

  const handleSave = async (andContinue = false) => {
    if (!form.preferredCountry || !form.preferredCourse) { setError('Country and course are required.'); return; }
    if (form.loanRequired && !form.loanAmount) { setError('Please enter the required loan amount.'); return; }
    setLoading(true); setError('');
    if (applicationId) {
      await supabase.from('applications').update({
        preferred_country: form.preferredCountry,
        preferred_course: form.preferredCourse,
        preferred_university: form.preferredUniversity,
        loan_required: form.loanRequired,
        loan_amount: form.loanAmount ? +form.loanAmount : null,
        loan_type: form.loanType,
        current_step: 4,
        work_experience: form,
      }).eq('id', applicationId);
    }
    setLoading(false);
    onStepComplete('loan_req');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('income');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
  type="button"
  onClick={() => onNavigate("dashboard")}
  className="flex items-center gap-2 text-gray-600 hover:text-black font-medium mb-4"
>
  <ArrowLeft className="w-5 h-5" />
  Back
</button>

      {/* Loan Type Selector — prominent at the top */}
      <div className="card p-6">
        <h2 className="font-bold text-ob text-base mb-1">Select Loan Type</h2>
        <p className="text-si text-sm mb-5">
          Choose the type of education loan you wish to apply for. This determines which sections of the application are required.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Collateral */}
          <label className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            form.loanType === 'collateral'
              ? 'border-ob bg-ob/5 shadow-card'
              : 'border-sg hover:border-ob/30 bg-white'
          }`}>
            <input
              type="radio" name="loanType" value="collateral"
              checked={form.loanType === 'collateral'}
              onChange={() => upd('loanType', 'collateral')}
              className="sr-only"
            />
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${form.loanType === 'collateral' ? 'bg-ob' : 'bg-sg/30'}`}>
                <Home className={`w-5 h-5 ${form.loanType === 'collateral' ? 'text-pw' : 'text-ob/50'}`} />
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${form.loanType === 'collateral' ? 'border-ob' : 'border-sg'}`}>
                {form.loanType === 'collateral' && <div className="w-2.5 h-2.5 bg-ob rounded-full" />}
              </div>
            </div>
            <div>
              <div className="font-bold text-ob text-sm">Collateral Loan</div>
              <div className="text-si text-xs mt-1 leading-relaxed">
                Secured against property, FD, or LIC policy. Higher loan amounts (up to ₹1.5 Cr), lower interest rates.
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['Up to ₹1.5 Cr', 'Lower rate', 'Requires asset'].map(t => (
                <span key={t} className={`badge text-xs ${form.loanType === 'collateral' ? 'bg-ob/8 text-ob/70' : 'bg-sg/40 text-ob/50'}`}>{t}</span>
              ))}
            </div>
          </label>

          {/* Non-Collateral */}
          <label className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
            form.loanType === 'non_collateral'
              ? 'border-ob bg-ob/5 shadow-card'
              : 'border-sg hover:border-ob/30 bg-white'
          }`}>
            <input
              type="radio" name="loanType" value="non_collateral"
              checked={form.loanType === 'non_collateral'}
              onChange={() => upd('loanType', 'non_collateral')}
              className="sr-only"
            />
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${form.loanType === 'non_collateral' ? 'bg-ob' : 'bg-sg/30'}`}>
                <CreditCard className={`w-5 h-5 ${form.loanType === 'non_collateral' ? 'text-pw' : 'text-ob/50'}`} />
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${form.loanType === 'non_collateral' ? 'border-ob' : 'border-sg'}`}>
                {form.loanType === 'non_collateral' && <div className="w-2.5 h-2.5 bg-ob rounded-full" />}
              </div>
            </div>
            <div>
              <div className="font-bold text-ob text-sm">Non-Collateral Loan</div>
              <div className="text-si text-xs mt-1 leading-relaxed">
                Unsecured loan — no property required. Assessed on academic profile and co-applicant's financial strength.
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {['Up to ₹75 L', 'No asset needed', 'Profile-based'].map(t => (
                <span key={t} className={`badge text-xs ${form.loanType === 'non_collateral' ? 'bg-ob/8 text-ob/70' : 'bg-sg/40 text-ob/50'}`}>{t}</span>
              ))}
            </div>
          </label>
        </div>

        {form.loanType === 'non_collateral' && (
          <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-si/20 border border-sg/40 rounded-xl">
            <Info className="w-4 h-4 text-ob shrink-0 mt-0.5" />
            <p className="text-ob text-xs leading-relaxed">
              After completing this section, you will need to fill in the <strong>Non-Collateral Loan Details</strong> section in the sidebar. The Collateral Details section will not be required.
            </p>
          </div>
        )}
        {form.loanType === 'collateral' && (
          <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-si/20 border border-sg/40 rounded-xl">
            <Info className="w-4 h-4 text-ob shrink-0 mt-0.5" />
            <p className="text-ob text-xs leading-relaxed">
              After completing this section, you will need to fill in the <strong>Collateral Details</strong> section. The Non-Collateral Loan Details section will not be required.
            </p>
          </div>
        )}
      </div>

      {/* Study Preferences & Expenses */}
      <div className="card p-6">
        <h2 className="font-bold text-ob text-base mb-1">Study Preferences & Expenses</h2>
        <p className="text-si text-sm mb-6">Tell us where you want to study and how much funding you need.</p>

        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Study Preferences</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Preferred Country" req><Sel value={form.preferredCountry} onChange={(v: string) => upd('preferredCountry', v)} options={countries} placeholder="Select country" /></F>
              <F label="Study Level">
                <select value={form.studyLevel} onChange={e => upd('studyLevel', e.target.value)} className="input-field appearance-none">
                  {["Bachelor's", 'Masters', 'MBA', 'PhD', 'Diploma', 'Certificate'].map(o => <option key={o}>{o}</option>)}
                </select>
              </F>
              <F label="Preferred Course" req><Sel value={form.preferredCourse} onChange={(v: string) => upd('preferredCourse', v)} options={courses} placeholder="Select course" /></F>
              <F label="Course Duration"><Sel value={form.courseDuration} onChange={(v: string) => upd('courseDuration', v)} options={durations} placeholder="Select duration" /></F>
              <F label="Preferred University" span><input value={form.preferredUniversity} onChange={e => upd('preferredUniversity', e.target.value)} placeholder="e.g. University of Toronto" className="input-field" /></F>
              <F label="Preferred Intake"><Sel value={form.intake} onChange={(v: string) => upd('intake', v)} options={intakes} placeholder="Select intake" /></F>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Expense Breakdown (₹)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Annual Tuition Fee"><input type="number" value={form.tuitionFee} onChange={e => upd('tuitionFee', e.target.value)} placeholder="e.g. 2500000" className="input-field" /></F>
              <F label="Living Expenses (Annual)"><input type="number" value={form.livingExpenses} onChange={e => upd('livingExpenses', e.target.value)} placeholder="e.g. 1200000" className="input-field" /></F>
              <F label="Travel Expenses"><input type="number" value={form.travelExpenses} onChange={e => upd('travelExpenses', e.target.value)} placeholder="e.g. 150000" className="input-field" /></F>
              <F label="Other Expenses"><input type="number" value={form.otherExpenses} onChange={e => upd('otherExpenses', e.target.value)} placeholder="e.g. 200000" className="input-field" /></F>
            </div>
            {totalExpenses > 0 && (
              <div className="mt-3 p-3 bg-sg/20 rounded-xl flex items-center justify-between">
                <span className="text-sm text-ob/70">Estimated Total Expenses</span>
                <span className="font-bold text-ob">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Funding Plan</h3>
            <div className="flex items-start gap-3 p-4 border border-sg rounded-xl mb-4">
              <input type="checkbox" id="loanReq" checked={form.loanRequired} onChange={e => upd('loanRequired', e.target.checked)} className="accent-ob mt-0.5" />
              <label htmlFor="loanReq" className="text-sm text-ob cursor-pointer font-medium">I require an Education Loan</label>
            </div>
            {form.loanRequired && (
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Required Loan Amount (₹)" req><input type="number" value={form.loanAmount} onChange={e => upd('loanAmount', e.target.value)} placeholder="e.g. 3000000" className="input-field" /></F>
                <F label="Self-Funded Amount (₹)"><input type="number" value={form.selfFundedAmount} onChange={e => upd('selfFundedAmount', e.target.value)} placeholder="e.g. 500000" className="input-field" /></F>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm">{error}</div>}
        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => downloadSectionPdf([
              { title: 'Loan Type', fields: [
                { label: 'Loan Type', value: form.loanType },
                { label: 'Loan Required', value: form.loanRequired },
                { label: 'Loan Amount (₹)', value: form.loanAmount },
                { label: 'Self-Funded Amount (₹)', value: form.selfFundedAmount },
              ]},
              { title: 'Study Preferences', fields: [
                { label: 'Preferred Country', value: form.preferredCountry },
                { label: 'Study Level', value: form.studyLevel },
                { label: 'Preferred Course', value: form.preferredCourse },
                { label: 'Course Duration', value: form.courseDuration },
                { label: 'Preferred University', value: form.preferredUniversity },
                { label: 'Preferred Intake', value: form.intake },
              ]},
              { title: 'Expense Breakdown (₹)', fields: [
                { label: 'Annual Tuition Fee', value: form.tuitionFee },
                { label: 'Living Expenses (Annual)', value: form.livingExpenses },
                { label: 'Travel Expenses', value: form.travelExpenses },
                { label: 'Other Expenses', value: form.otherExpenses },
                { label: 'Total Expenses', value: totalExpenses },
              ]},
            ], 'Student', applicationId ?? undefined)} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
          <button onClick={() => handleSave(true)} disabled={loading} className="btn-primary text-sm py-2.5">
            Save & Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
