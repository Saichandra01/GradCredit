import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

const F = ({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

export default function IncomeDetails({ applicationId, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    hasIncome: false,
    employmentType: '', employer: '', designation: '', monthlyIncome: '', annualIncome: '',
    businessName: '', businessType: '', annualTurnover: '', businessIncome: '',
    scholarshipAmount: '', partTimeIncome: '', otherIncome: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicationId) {
      supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle().then(({ data }) => {
        if (data?.personal_info?.income) setForm(p => ({ ...p, ...data.personal_info.income }));
      });
    }
  }, [applicationId]);

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (andContinue = false) => {
    setLoading(true); setError('');
    if (applicationId) {
      const { data: existing } = await supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle();
      await supabase.from('applications').update({
        personal_info: { ...(existing?.personal_info ?? {}), income: form },
        current_step: 5,
      }).eq('id', applicationId);
    }
    setLoading(false);
    onStepComplete('income');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('financial');
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
      <div className="card p-6">
        <h2 className="font-bold text-ob text-base mb-1">Income Details (Student)</h2>
        <p className="text-si text-sm mb-6">Provide details of your own income, if any. Most students do not have an income — this section is optional.</p>

        <div className="flex items-start gap-3 p-4 border border-sg rounded-xl mb-6">
          <input type="checkbox" id="hasIncome" checked={form.hasIncome} onChange={e => upd('hasIncome', e.target.checked)} className="accent-ob mt-0.5" />
          <label htmlFor="hasIncome" className="text-sm text-ob cursor-pointer font-medium">I have a source of income</label>
        </div>

        {form.hasIncome && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Employment</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Employment Type">
                  <select value={form.employmentType} onChange={e => upd('employmentType', e.target.value)} className="input-field appearance-none">
                    <option value="">Select type</option>
                    {['Salaried', 'Self-Employed', 'Freelancer', 'Intern', 'Part-Time'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </F>
                {(form.employmentType === 'Salaried' || form.employmentType === 'Intern' || form.employmentType === 'Part-Time') && (
                  <>
                    <F label="Employer Name"><input value={form.employer} onChange={e => upd('employer', e.target.value)} placeholder="Company name" className="input-field" /></F>
                    <F label="Designation"><input value={form.designation} onChange={e => upd('designation', e.target.value)} placeholder="Job title" className="input-field" /></F>
                    <F label="Monthly Income (₹)"><input type="number" value={form.monthlyIncome} onChange={e => upd('monthlyIncome', e.target.value)} placeholder="e.g. 50000" className="input-field" /></F>
                    <F label="Annual Income (₹)"><input type="number" value={form.annualIncome} onChange={e => upd('annualIncome', e.target.value)} placeholder="e.g. 600000" className="input-field" /></F>
                  </>
                )}
                {(form.employmentType === 'Self-Employed' || form.employmentType === 'Freelancer') && (
                  <>
                    <F label="Business / Practice Name"><input value={form.businessName} onChange={e => upd('businessName', e.target.value)} placeholder="Business name" className="input-field" /></F>
                    <F label="Business Type"><input value={form.businessType} onChange={e => upd('businessType', e.target.value)} placeholder="e.g. IT Consultancy" className="input-field" /></F>
                    <F label="Annual Turnover (₹)"><input type="number" value={form.annualTurnover} onChange={e => upd('annualTurnover', e.target.value)} className="input-field" /></F>
                    <F label="Annual Net Income (₹)"><input type="number" value={form.businessIncome} onChange={e => upd('businessIncome', e.target.value)} className="input-field" /></F>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Other Income Sources</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <F label="Scholarship Amount (₹/yr)"><input type="number" value={form.scholarshipAmount} onChange={e => upd('scholarshipAmount', e.target.value)} placeholder="0" className="input-field" /></F>
                <F label="Part-Time Income (₹/mo)"><input type="number" value={form.partTimeIncome} onChange={e => upd('partTimeIncome', e.target.value)} placeholder="0" className="input-field" /></F>
                <F label="Other Income (₹/yr)"><input type="number" value={form.otherIncome} onChange={e => upd('otherIncome', e.target.value)} placeholder="0" className="input-field" /></F>
              </div>
            </div>
          </div>
        )}

        {!form.hasIncome && (
          <div className="p-4 bg-si/20 border border-sg/40 rounded-xl text-ob text-sm">
            No income declared. The loan eligibility will be assessed based on your co-applicant's income and financial profile.
          </div>
        )}

        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => downloadSectionPdf([
              { title: 'Income Details (Student)', fields: [
                { label: 'Has Income', value: form.hasIncome },
                { label: 'Employment Type', value: form.employmentType },
                { label: 'Employer', value: form.employer },
                { label: 'Designation', value: form.designation },
                { label: 'Monthly Income (₹)', value: form.monthlyIncome },
                { label: 'Annual Income (₹)', value: form.annualIncome },
                { label: 'Business Name', value: form.businessName },
                { label: 'Business Type', value: form.businessType },
                { label: 'Annual Turnover (₹)', value: form.annualTurnover },
                { label: 'Business Income (₹)', value: form.businessIncome },
                { label: 'Scholarship Amount (₹/yr)', value: form.scholarshipAmount },
                { label: 'Part-Time Income (₹/mo)', value: form.partTimeIncome },
                { label: 'Other Income (₹/yr)', value: form.otherIncome },
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
