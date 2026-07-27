import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

const Sel = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => (
  <div className="relative">
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field appearance-none">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const F = ({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
  </div>
);

export default function PersonalInfo({ applicationId, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: '', nationality: 'Indian',
    phone: '', altPhone: '', email: '', maritalStatus: '',
    aadhaar: '', pan: '', passportNumber: '', passportExpiry: '',
    currentAddress: '', currentCity: '', currentState: '', currentPin: '',
    permanentAddress: '', permanentCity: '', permanentState: '', permanentPin: '',
    sameAddress: false,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [appId, setAppId] = useState(applicationId);

  useEffect(() => { if (applicationId) { setAppId(applicationId); load(applicationId); } }, [applicationId]);

  const load = async (id: string) => {
    const { data } = await supabase.from('applications').select('personal_info').eq('id', id).maybeSingle();
    if (data?.personal_info && Object.keys(data.personal_info).length) setForm(p => ({ ...p, ...data.personal_info }));
  };

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSameAddress = (checked: boolean) => {
    if (checked) {
      setForm(p => ({ ...p, sameAddress: true, permanentAddress: p.currentAddress, permanentCity: p.currentCity, permanentState: p.currentState, permanentPin: p.currentPin }));
    } else {
      setForm(p => ({ ...p, sameAddress: false }));
    }
  };

  const handleSave = async (andContinue = false) => {
    if (!form.firstName || !form.lastName || !form.phone) { setError('Full name and phone are required.'); return; }
    setLoading(true); setError('');
    let id = appId;
    if (!id) {
      const { data } = await supabase.from('applications').insert({ status: 'draft', current_step: 1, personal_info: form }).select('id').maybeSingle();
      if (data?.id) { id = data.id; setAppId(id); }
    } else {
      await supabase.from('applications').update({ personal_info: form, current_step: 1 }).eq('id', id);
    }
    setLoading(false);
    onStepComplete('personal');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('co_applicant');
  };

return (
  <div className="max-w-3xl mx-auto space-y-6">

    <button
      onClick={() => onNavigate("dashboard")}
      className="flex items-center gap-2 text-gray-600 hover:text-black font-medium"
    >
      <ArrowLeft className="w-5 h-5" />
      Back
    </button>

    <div className="card p-6">
        <h2 className="font-bold text-ob text-base mb-1">Personal Information</h2>
        <p className="text-si text-sm mb-6">Fill in your personal details as they appear on your official documents.</p>

        <div className="space-y-8">
          {/* Basic */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Basic Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="First Name" req><input value={form.firstName} onChange={e => upd('firstName', e.target.value)} placeholder="As on passport" className="input-field" /></F>
              <F label="Last Name" req><input value={form.lastName} onChange={e => upd('lastName', e.target.value)} placeholder="As on passport" className="input-field" /></F>
              <F label="Date of Birth"><input type="date" value={form.dob} onChange={e => upd('dob', e.target.value)} className="input-field" /></F>
              <F label="Gender"><Sel value={form.gender} onChange={v => upd('gender', v)} options={['Male', 'Female', 'Non-Binary', 'Prefer not to say']} placeholder="Select gender" /></F>
              <F label="Nationality"><input value={form.nationality} onChange={e => upd('nationality', e.target.value)} className="input-field" /></F>
              <F label="Marital Status"><Sel value={form.maritalStatus} onChange={v => upd('maritalStatus', v)} options={['Single', 'Married', 'Divorced', 'Widowed']} placeholder="Select status" /></F>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Mobile Number" req><input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-field" /></F>
              <F label="Alternate Mobile"><input value={form.altPhone} onChange={e => upd('altPhone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="input-field" /></F>
              <div className="sm:col-span-2"><F label="Email Address"><input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="you@example.com" className="input-field" /></F></div>
            </div>
          </div>

          {/* ID Documents */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Identity Documents</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Aadhaar Number"><input value={form.aadhaar} onChange={e => upd('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="XXXX XXXX XXXX" className="input-field" /></F>
              <F label="PAN Number"><input value={form.pan} onChange={e => upd('pan', e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" className="input-field" /></F>
              <F label="Passport Number"><input value={form.passportNumber} onChange={e => upd('passportNumber', e.target.value.toUpperCase())} placeholder="A1234567" className="input-field" /></F>
              <F label="Passport Expiry Date"><input type="date" value={form.passportExpiry} onChange={e => upd('passportExpiry', e.target.value)} className="input-field" /></F>
            </div>
          </div>

          {/* Current Address */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Current Address</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><F label="Address Line"><textarea value={form.currentAddress} onChange={e => upd('currentAddress', e.target.value)} rows={2} className="input-field resize-none" placeholder="Street, locality" /></F></div>
              <F label="City"><input value={form.currentCity} onChange={e => upd('currentCity', e.target.value)} className="input-field" /></F>
              <F label="State"><input value={form.currentState} onChange={e => upd('currentState', e.target.value)} className="input-field" /></F>
              <F label="PIN Code"><input value={form.currentPin} onChange={e => upd('currentPin', e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field" /></F>
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest">Permanent Address</h3>
              <label className="flex items-center gap-2 text-sm text-ob/70 cursor-pointer">
                <input type="checkbox" checked={form.sameAddress} onChange={e => handleSameAddress(e.target.checked)} className="accent-ob" />
                Same as current
              </label>
            </div>
            {!form.sameAddress && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><F label="Address Line"><textarea value={form.permanentAddress} onChange={e => upd('permanentAddress', e.target.value)} rows={2} className="input-field resize-none" placeholder="Street, locality" /></F></div>
                <F label="City"><input value={form.permanentCity} onChange={e => upd('permanentCity', e.target.value)} className="input-field" /></F>
                <F label="State"><input value={form.permanentState} onChange={e => upd('permanentState', e.target.value)} className="input-field" /></F>
                <F label="PIN Code"><input value={form.permanentPin} onChange={e => upd('permanentPin', e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field" /></F>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm">{error}</div>}
        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved successfully!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
            <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadSectionPdf([{ title: 'Personal Information', fields: [
                { label: 'First Name', value: form.firstName },
                { label: 'Last Name', value: form.lastName },
                { label: 'Date of Birth', value: form.dob },
                { label: 'Gender', value: form.gender },
                { label: 'Phone', value: form.phone },
                { label: 'Email', value: form.email },
                { label: 'Nationality', value: form.nationality },
                { label: 'Marital Status', value: form.maritalStatus },
                { label: 'Current Address', value: form.currentAddress },
                { label: 'Permanent Address', value: form.permanentAddress },
              ] }], `${form.firstName} ${form.lastName}`)}
              className="btn-secondary text-sm py-2.5 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button onClick={() => handleSave(true)} disabled={loading} className="btn-primary text-sm py-2.5">
              Save & Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
