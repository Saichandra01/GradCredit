import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

const banks = ['State Bank of India', 'Bank of Baroda', 'Punjab National Bank', 'Union Bank of India', 'Bank of India', 'Canara Bank', 'Axis Bank', 'HDFC Credila', 'ICICI Bank', 'Avanse Financial Services', 'IDFC First Bank', 'Auxilo Finserve', 'InCred Finance', 'TATA Capital'];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD – US Dollar' },
  { value: 'GBP', label: 'GBP – British Pound' },
  { value: 'CAD', label: 'CAD – Canadian Dollar' },
  { value: 'AUD', label: 'AUD – Australian Dollar' },
  { value: 'EUR', label: 'EUR – Euro' },
  { value: 'SGD', label: 'SGD – Singapore Dollar' },
];

const F = ({ label, span, children }: { label: string; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}</label>
    {children}
  </div>
);

export default function LoanPreferences({ applicationId, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    preferredBank1: '', preferredBank2: '', preferredBank3: '',
    loanType: 'secured', tenure: '10', moratoriumPeriod: 'course + 6 months',
    interestType: 'floating', repaymentMode: 'Full EMI',
    needForex: false, forexAmount: '', targetCurrency: 'USD',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (applicationId) {
      supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle().then(({ data }) => {
        if (data?.personal_info?.loanPrefs) setForm(p => ({ ...p, ...data.personal_info.loanPrefs }));
      });
    }
  }, [applicationId]);

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (andContinue = false) => {
    setLoading(true);
    if (applicationId) {
      const { data: existing } = await supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle();
      await supabase.from('applications').update({
        personal_info: { ...(existing?.personal_info ?? {}), loanPrefs: form },
        current_step: 9,
      }).eq('id', applicationId);
    }
    setLoading(false);
    onStepComplete('loan_pref');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('review');
  };

  const bankOptions = banks.filter(b => b !== form.preferredBank1 && b !== form.preferredBank2 && b !== form.preferredBank3);

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
        <h2 className="font-bold text-ob text-base mb-1">Loan Preferences</h2>
        <p className="text-si text-sm mb-6">Select your preferred banks, loan structure, and repayment preferences. We'll match you with the best available option.</p>

        <div className="space-y-8">
          {/* Bank preferences */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Preferred Banks / NBFCs (in order of preference)</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[['preferredBank1', '1st Choice'], ['preferredBank2', '2nd Choice'], ['preferredBank3', '3rd Choice']].map(([k, label]) => (
                <F key={k} label={label}>
                  <select value={(form as any)[k]} onChange={e => upd(k, e.target.value)} className="input-field appearance-none text-sm">
                    <option value="">Any bank</option>
                    {banks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </F>
              ))}
            </div>
          </div>

          {/* Loan structure */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Loan Structure</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Loan Type">
                <div className="grid grid-cols-2 gap-2">
                  {[['secured', 'Secured (with collateral)'], ['unsecured', 'Unsecured (no collateral)']].map(([v, l]) => (
                    <label key={v} className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer text-sm transition-all ${form.loanType === v ? 'border-ob bg-ob/5' : 'border-sg hover:border-ob/30'}`}>
                      <input type="radio" name="loanType" value={v} checked={form.loanType === v} onChange={() => upd('loanType', v)} className="accent-ob" />
                      {l}
                    </label>
                  ))}
                </div>
              </F>
              <F label="Preferred Tenure (Years)">
                <select value={form.tenure} onChange={e => upd('tenure', e.target.value)} className="input-field appearance-none">
                  {['5', '7', '10', '12', '15'].map(t => <option key={t} value={t}>{t} Years</option>)}
                </select>
              </F>
              <F label="Moratorium Period">
                <select value={form.moratoriumPeriod} onChange={e => upd('moratoriumPeriod', e.target.value)} className="input-field appearance-none">
                  {['Course duration only', 'course + 6 months', 'course + 12 months', 'No moratorium – start immediately'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </F>
              <F label="Interest Type">
                <select value={form.interestType} onChange={e => upd('interestType', e.target.value)} className="input-field appearance-none">
                  {[['floating', 'Floating Rate'], ['fixed', 'Fixed Rate']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </F>
              <F label="Repayment Mode">
                <select value={form.repaymentMode} onChange={e => upd('repaymentMode', e.target.value)} className="input-field appearance-none">
                  {['Full EMI', 'Simple Interest during course', 'Partial Interest during course', 'Moratorium – no repayment during course'].map(o => <option key={o}>{o}</option>)}
                </select>
              </F>
            </div>
          </div>

          {/* Forex */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Forex / International Transfer</h3>
            <div className="flex items-start gap-3 p-3 border border-sg rounded-xl mb-4">
              <input type="checkbox" id="forex" checked={form.needForex} onChange={e => upd('needForex', e.target.checked)} className="accent-ob mt-0.5" />
              <label htmlFor="forex" className="text-sm text-ob cursor-pointer font-medium">I need assistance with Forex and international wire transfer</label>
            </div>
            {form.needForex && (
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Target Currency">
                  <select value={form.targetCurrency} onChange={e => upd('targetCurrency', e.target.value)} className="input-field appearance-none">
                    {CURRENCY_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </F>
                <F label="Approximate Amount (in target currency)">
                  <input type="number" value={form.forexAmount} onChange={e => upd('forexAmount', e.target.value)} placeholder="e.g. 30000" className="input-field" />
                </F>
              </div>
            )}
          </div>

          <F label="Additional Notes / Special Requirements" span>
            <textarea value={form.additionalNotes} onChange={e => upd('additionalNotes', e.target.value)} rows={3} placeholder="Any special requests or conditions for the loan..." className="input-field resize-none" />
          </F>
        </div>

        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => downloadSectionPdf([
              { title: 'Preferred Banks / NBFCs', fields: [
                { label: '1st Choice', value: form.preferredBank1 },
                { label: '2nd Choice', value: form.preferredBank2 },
                { label: '3rd Choice', value: form.preferredBank3 },
              ]},
              { title: 'Loan Structure', fields: [
                { label: 'Loan Type', value: form.loanType === 'secured' ? 'Secured (with collateral)' : 'Unsecured (no collateral)' },
                { label: 'Preferred Tenure', value: `${form.tenure} Years` },
                { label: 'Moratorium Period', value: form.moratoriumPeriod },
                { label: 'Interest Type', value: form.interestType === 'floating' ? 'Floating Rate' : 'Fixed Rate' },
                { label: 'Repayment Mode', value: form.repaymentMode },
              ]},
              { title: 'Forex / International Transfer', fields: [
                { label: 'Needs Forex Assistance', value: form.needForex },
                { label: 'Target Currency', value: form.targetCurrency },
                { label: 'Approximate Amount', value: form.forexAmount },
              ]},
              { title: 'Additional Notes', fields: [
                { label: 'Notes / Special Requirements', value: form.additionalNotes },
              ]},
            ], 'Student', applicationId ?? undefined)} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
          <button onClick={() => handleSave(true)} disabled={loading} className="btn-primary text-sm py-2.5">
            Save & Review Application <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
