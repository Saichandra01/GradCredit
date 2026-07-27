import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, Plus, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

interface Loan { type: string; bank: string; emi: string; outstanding: string; }
const loanTypes = ['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Gold Loan', 'Credit Card', 'Business Loan', 'Other'];

const F = ({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

export default function FinancialDetails({ applicationId, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    cibilScore: '', cibilRemark: '',
    savings: '', fixedDeposits: '', ppf: '', mutualFunds: '', stocks: '',
    realEstate: '', gold: '', otherAssets: '',
    monthlyHouseholdExpenses: '', monthlyRent: '',
    otherLiabilities: '',
  });
  const [existingLoans, setExistingLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicationId) {
      supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle().then(({ data }) => {
        if (data?.personal_info?.financials) {
          setForm(p => ({ ...p, ...data.personal_info.financials }));
          setExistingLoans(data.personal_info.financials.existingLoans ?? []);
        }
      });
    }
  }, [applicationId]);

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const addLoan = () => setExistingLoans(p => [...p, { type: '', bank: '', emi: '', outstanding: '' }]);
  const removeLoan = (i: number) => setExistingLoans(p => p.filter((_, idx) => idx !== i));
  const updLoan = (i: number, k: keyof Loan, v: string) => setExistingLoans(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));

  const totalMonthlyEMI = existingLoans.reduce((s, l) => s + (parseFloat(l.emi) || 0), 0);
  const totalOutstanding = existingLoans.reduce((s, l) => s + (parseFloat(l.outstanding) || 0), 0);

  const handleSave = async (andContinue = false) => {
    setLoading(true); setError('');
    const financials = { ...form, existingLoans, totalMonthlyEMI, totalOutstanding };
    if (applicationId) {
      const { data: existing } = await supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle();
      await supabase.from('applications').update({
        personal_info: { ...(existing?.personal_info ?? {}), financials },
        current_step: 6,
      }).eq('id', applicationId);
    }
    setLoading(false);
    onStepComplete('financial');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('collateral');
  };

  const cibilColor = !form.cibilScore ? '' : +form.cibilScore >= 750 ? 'text-success-600' : +form.cibilScore >= 650 ? 'text-si' : 'text-error-600';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
      type="button"
      onClick={() => onNavigate("dashboard")}
      className="flex items-center gap-2 text-gray-600 hover:text-black font-medium"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>
      <div className="card p-6">
        <h2 className="font-bold text-ob text-base mb-1">Financial Details (Student)</h2>
        <p className="text-si text-sm mb-6">Your overall financial profile helps assess loan repayment capacity.</p>

        <div className="space-y-8">
          {/* CIBIL */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Credit Score</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="CIBIL / Credit Score">
                <div className="relative">
                  <input type="number" min={300} max={900} value={form.cibilScore} onChange={e => upd('cibilScore', e.target.value)} placeholder="300 – 900" className="input-field pr-24" />
                  {form.cibilScore && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${cibilColor}`}>
                      {+form.cibilScore >= 750 ? 'Excellent' : +form.cibilScore >= 650 ? 'Good' : 'Poor'}
                    </span>
                  )}
                </div>
              </F>
              <F label="Credit Remark">
                <select value={form.cibilRemark} onChange={e => upd('cibilRemark', e.target.value)} className="input-field appearance-none">
                  <option value="">Select</option>
                  {['No prior credit history', 'Clean repayment record', 'Occasional delays', 'Settled loans', 'Default on record'].map(o => <option key={o}>{o}</option>)}
                </select>
              </F>
            </div>
          </div>

          {/* Existing Loans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest">Existing Loans & Liabilities</h3>
              <button onClick={addLoan} className="flex items-center gap-1.5 text-xs text-ob font-medium hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Loan
              </button>
            </div>
            {existingLoans.length === 0 && (
              <div className="text-sm text-si p-3 bg-sg/20 rounded-xl">No existing loans declared.</div>
            )}
            {existingLoans.map((loan, i) => (
              <div key={i} className="border border-sg rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-ob">Loan {i + 1}</span>
                  <button onClick={() => removeLoan(i)} className="p-1 hover:bg-error-50 rounded text-sg hover:text-error-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Loan Type</label>
                    <select value={loan.type} onChange={e => updLoan(i, 'type', e.target.value)} className="input-field appearance-none">
                      <option value="">Select</option>
                      {loanTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Bank / Lender</label>
                    <input value={loan.bank} onChange={e => updLoan(i, 'bank', e.target.value)} placeholder="Bank name" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Monthly EMI (₹)</label>
                    <input type="number" value={loan.emi} onChange={e => updLoan(i, 'emi', e.target.value)} placeholder="0" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Outstanding Amount (₹)</label>
                    <input type="number" value={loan.outstanding} onChange={e => updLoan(i, 'outstanding', e.target.value)} placeholder="0" className="input-field" />
                  </div>
                </div>
              </div>
            ))}
            {existingLoans.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-sg/20 rounded-xl text-center">
                  <div className="text-xs text-si">Total Monthly EMI</div>
                  <div className="font-bold text-ob">₹{totalMonthlyEMI.toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3 bg-sg/20 rounded-xl text-center">
                  <div className="text-xs text-si">Total Outstanding</div>
                  <div className="font-bold text-ob">₹{totalOutstanding.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Assets */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Assets & Savings (₹)</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[['savings', 'Savings Account Balance'], ['fixedDeposits', 'Fixed Deposits'], ['ppf', 'PPF / EPF'], ['mutualFunds', 'Mutual Funds'], ['stocks', 'Stocks / Shares'], ['gold', 'Gold (approx. value)'], ['realEstate', 'Real Estate'], ['otherAssets', 'Other Assets']].map(([k, l]) => (
                <F key={k} label={l}><input type="number" value={(form as any)[k]} onChange={e => upd(k, e.target.value)} placeholder="0" className="input-field" /></F>
              ))}
            </div>
          </div>

          {/* Monthly Expenses */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Monthly Expenses (₹)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Household Expenses"><input type="number" value={form.monthlyHouseholdExpenses} onChange={e => upd('monthlyHouseholdExpenses', e.target.value)} placeholder="e.g. 40000" className="input-field" /></F>
              <F label="Monthly Rent (if applicable)"><input type="number" value={form.monthlyRent} onChange={e => upd('monthlyRent', e.target.value)} placeholder="0" className="input-field" /></F>
              <F label="Other Liabilities" span><input value={form.otherLiabilities} onChange={e => upd('otherLiabilities', e.target.value)} placeholder="Describe other financial obligations" className="input-field" /></F>
            </div>
          </div>
        </div>

        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => downloadSectionPdf([
              { title: 'Credit Score', fields: [
                { label: 'CIBIL / Credit Score', value: form.cibilScore },
                { label: 'Credit Remark', value: form.cibilRemark },
              ]},
              { title: 'Assets & Savings (₹)', fields: [
                { label: 'Savings Account Balance', value: form.savings },
                { label: 'Fixed Deposits', value: form.fixedDeposits },
                { label: 'PPF / EPF', value: form.ppf },
                { label: 'Mutual Funds', value: form.mutualFunds },
                { label: 'Stocks / Shares', value: form.stocks },
                { label: 'Gold (approx. value)', value: form.gold },
                { label: 'Real Estate', value: form.realEstate },
                { label: 'Other Assets', value: form.otherAssets },
              ]},
              { title: 'Monthly Expenses (₹)', fields: [
                { label: 'Household Expenses', value: form.monthlyHouseholdExpenses },
                { label: 'Monthly Rent', value: form.monthlyRent },
                { label: 'Other Liabilities', value: form.otherLiabilities },
              ]},
              { title: 'Existing Loans & Liabilities', fields: [
                { label: 'Total Monthly EMI', value: totalMonthlyEMI },
                { label: 'Total Outstanding', value: totalOutstanding },
                ...existingLoans.flatMap((l, i) => [
                  { label: `Loan ${i + 1} — Type`, value: l.type },
                  { label: `Loan ${i + 1} — Bank`, value: l.bank },
                  { label: `Loan ${i + 1} — EMI (₹)`, value: l.emi },
                  { label: `Loan ${i + 1} — Outstanding (₹)`, value: l.outstanding },
                ]),
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
