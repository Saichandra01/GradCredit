import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, CreditCard, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';

interface Props { applicationId: string | null; loanType?: 'collateral' | 'non_collateral'; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

const F = ({ label, req, span, children }: { label: string; req?: boolean; span?: boolean; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

export default function CollateralDetails({ applicationId, loanType, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    hasCollateral: false,
    collateralType: '',
    propertyType: '', propertyAddress: '', propertyMarketValue: '', propertyOwner: '', propertyOwnerRelation: '',
    propertyMortgaged: false, existingMortgageBank: '', existingMortgageBalance: '',
    fdBank: '', fdAmount: '', fdMaturityDate: '', fdOwner: '',
    insuranceCompany: '', policyNumber: '', surrenderValue: '',
    otherCollateral: '',
    thirdPartyGuarantor: false,
    guarantorName: '', guarantorRelation: '', guarantorIncome: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loanType === 'non_collateral') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="card p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 bg-sg/30 rounded-full flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-ob/40" />
          </div>
          <h3 className="font-bold text-ob">Not Required for Non-Collateral Loan</h3>
          <p className="text-si text-sm">
            You selected a <strong>Non-Collateral Loan</strong>. This section is not required — please fill in the <strong>Non-Collateral Loan Details</strong> section instead.
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => onNavigate('loan_req')} className="btn-secondary text-sm py-2.5">Change Loan Type</button>
            <button onClick={() => onNavigate('non_collateral')} className="btn-primary text-sm py-2.5">Go to Non-Collateral Details</button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (applicationId) {
      supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle().then(({ data }) => {
        if (data?.personal_info?.collateral) setForm(p => ({ ...p, ...data.personal_info.collateral }));
      });
    }
  }, [applicationId]);

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (andContinue = false) => {
    setLoading(true);
    if (applicationId) {
      const { data: existing } = await supabase.from('applications').select('personal_info').eq('id', applicationId).maybeSingle();
      await supabase.from('applications').update({
        personal_info: { ...(existing?.personal_info ?? {}), collateral: form },
        current_step: 7,
      }).eq('id', applicationId);
    }
    setLoading(false);
    onStepComplete('collateral');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('documents');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h2 className="font-bold text-ob text-base mb-1">Collateral Details <span className="text-si font-normal text-sm">(Optional)</span></h2>
        <p className="text-si text-sm mb-6">Collateral secures higher loan amounts at lower interest rates. Leave this blank if you have no collateral to offer.</p>

        <div className="flex items-start gap-3 p-4 border border-sg rounded-xl mb-6">
          <input type="checkbox" id="hasCollateral" checked={form.hasCollateral} onChange={e => upd('hasCollateral', e.target.checked)} className="accent-ob mt-0.5" />
          <div>
            <label htmlFor="hasCollateral" className="text-sm text-ob cursor-pointer font-medium">I have collateral to offer (Property / FD / Insurance)</label>
            <p className="text-xs text-si mt-0.5">Offering collateral can increase loan eligibility by up to 3x and reduce interest rates significantly.</p>
          </div>
        </div>

        {form.hasCollateral && (
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Collateral Type</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {['Property / Real Estate', 'Fixed Deposit', 'LIC / Insurance Policy', 'Other'].map(t => (
                  <label key={t} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all ${form.collateralType === t ? 'border-ob bg-ob/5' : 'border-sg hover:border-ob/30'}`}>
                    <input type="radio" name="collateralType" value={t} checked={form.collateralType === t} onChange={e => upd('collateralType', e.target.value)} className="accent-ob" />
                    <span className="text-sm font-medium text-ob">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {form.collateralType === 'Property / Real Estate' && (
              <div>
                <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Property Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <F label="Property Type"><select value={form.propertyType} onChange={e => upd('propertyType', e.target.value)} className="input-field appearance-none">
                    <option value="">Select</option>
                    {['Residential Plot', 'Residential House', 'Apartment / Flat', 'Commercial Property', 'Agricultural Land'].map(o => <option key={o}>{o}</option>)}
                  </select></F>
                  <F label="Market Value (₹)"><input type="number" value={form.propertyMarketValue} onChange={e => upd('propertyMarketValue', e.target.value)} placeholder="e.g. 5000000" className="input-field" /></F>
                  <F label="Property Owner Name"><input value={form.propertyOwner} onChange={e => upd('propertyOwner', e.target.value)} placeholder="Owner's full name" className="input-field" /></F>
                  <F label="Relation to Student"><input value={form.propertyOwnerRelation} onChange={e => upd('propertyOwnerRelation', e.target.value)} placeholder="e.g. Father" className="input-field" /></F>
                  <F label="Property Address" span><textarea value={form.propertyAddress} onChange={e => upd('propertyAddress', e.target.value)} rows={2} className="input-field resize-none" /></F>
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 border border-sg rounded-xl">
                    <input type="checkbox" id="mortgaged" checked={form.propertyMortgaged} onChange={e => upd('propertyMortgaged', e.target.checked)} className="accent-ob" />
                    <label htmlFor="mortgaged" className="text-sm text-ob cursor-pointer">Property is currently mortgaged</label>
                  </div>
                  {form.propertyMortgaged && (
                    <>
                      <F label="Mortgaged with (Bank)"><input value={form.existingMortgageBank} onChange={e => upd('existingMortgageBank', e.target.value)} className="input-field" /></F>
                      <F label="Outstanding Balance (₹)"><input type="number" value={form.existingMortgageBalance} onChange={e => upd('existingMortgageBalance', e.target.value)} className="input-field" /></F>
                    </>
                  )}
                </div>
              </div>
            )}

            {form.collateralType === 'Fixed Deposit' && (
              <div>
                <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Fixed Deposit Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <F label="Bank Name"><input value={form.fdBank} onChange={e => upd('fdBank', e.target.value)} placeholder="Bank name" className="input-field" /></F>
                  <F label="FD Amount (₹)"><input type="number" value={form.fdAmount} onChange={e => upd('fdAmount', e.target.value)} className="input-field" /></F>
                  <F label="Maturity Date"><input type="date" value={form.fdMaturityDate} onChange={e => upd('fdMaturityDate', e.target.value)} className="input-field" /></F>
                  <F label="FD Holder Name"><input value={form.fdOwner} onChange={e => upd('fdOwner', e.target.value)} className="input-field" /></F>
                </div>
              </div>
            )}

            {form.collateralType === 'LIC / Insurance Policy' && (
              <div>
                <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Insurance Policy Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <F label="Insurance Company"><input value={form.insuranceCompany} onChange={e => upd('insuranceCompany', e.target.value)} className="input-field" /></F>
                  <F label="Policy Number"><input value={form.policyNumber} onChange={e => upd('policyNumber', e.target.value)} className="input-field" /></F>
                  <F label="Surrender Value (₹)"><input type="number" value={form.surrenderValue} onChange={e => upd('surrenderValue', e.target.value)} className="input-field" /></F>
                </div>
              </div>
            )}

            {form.collateralType === 'Other' && (
              <div>
                <F label="Describe Collateral" span><textarea value={form.otherCollateral} onChange={e => upd('otherCollateral', e.target.value)} rows={3} className="input-field resize-none" /></F>
              </div>
            )}

            {/* Third Party Guarantor */}
            <div>
              <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Third-Party Guarantor (Optional)</h3>
              <div className="flex items-start gap-3 p-3 border border-sg rounded-xl mb-4">
                <input type="checkbox" id="guarantor" checked={form.thirdPartyGuarantor} onChange={e => upd('thirdPartyGuarantor', e.target.checked)} className="accent-ob mt-0.5" />
                <label htmlFor="guarantor" className="text-sm text-ob cursor-pointer">I have a third-party guarantor</label>
              </div>
              {form.thirdPartyGuarantor && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <F label="Guarantor Name"><input value={form.guarantorName} onChange={e => upd('guarantorName', e.target.value)} className="input-field" /></F>
                  <F label="Relation to Student"><input value={form.guarantorRelation} onChange={e => upd('guarantorRelation', e.target.value)} className="input-field" /></F>
                  <F label="Annual Income (₹)"><input type="number" value={form.guarantorIncome} onChange={e => upd('guarantorIncome', e.target.value)} className="input-field" /></F>
                </div>
              )}
            </div>
          </div>
        )}

        {!form.hasCollateral && (
          <div className="p-4 bg-sg/20 rounded-xl text-ob/60 text-sm">
            No collateral offered. You may still qualify for an unsecured education loan up to ₹75 Lakhs depending on your co-applicant's profile.
          </div>
        )}

        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => downloadSectionPdf([
              { title: 'Collateral Details', fields: [
                { label: 'Has Collateral', value: form.hasCollateral },
                { label: 'Collateral Type', value: form.collateralType },
                { label: 'Property Type', value: form.propertyType },
                { label: 'Property Address', value: form.propertyAddress },
                { label: 'Property Market Value (₹)', value: form.propertyMarketValue },
                { label: 'Property Owner', value: form.propertyOwner },
                { label: 'Owner Relation to Student', value: form.propertyOwnerRelation },
                { label: 'Property Mortgaged', value: form.propertyMortgaged },
                { label: 'Existing Mortgage Bank', value: form.existingMortgageBank },
                { label: 'Existing Mortgage Balance (₹)', value: form.existingMortgageBalance },
                { label: 'FD Bank', value: form.fdBank },
                { label: 'FD Amount (₹)', value: form.fdAmount },
                { label: 'FD Maturity Date', value: form.fdMaturityDate },
                { label: 'FD Owner', value: form.fdOwner },
                { label: 'Insurance Company', value: form.insuranceCompany },
                { label: 'Policy Number', value: form.policyNumber },
                { label: 'Surrender Value (₹)', value: form.surrenderValue },
                { label: 'Other Collateral', value: form.otherCollateral },
                { label: 'Third-Party Guarantor', value: form.thirdPartyGuarantor },
                { label: 'Guarantor Name', value: form.guarantorName },
                { label: 'Guarantor Relation', value: form.guarantorRelation },
                { label: 'Guarantor Annual Income (₹)', value: form.guarantorIncome },
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
