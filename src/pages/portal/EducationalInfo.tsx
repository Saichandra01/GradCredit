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

export default function EducationalInfo({ applicationId, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    class10Board: '', class10Year: '', class10Score: '', class10School: '',
    class12Board: '', class12Year: '', class12Score: '', class12School: '', class12Stream: '',
    graduationDegree: '', graduationUniversity: '', graduationYear: '', graduationScore: '', graduationMode: 'Full Time',
    mastersDegree: '', mastersUniversity: '', mastersYear: '', mastersScore: '',
    backlogs: '0', currentBacklogs: '0', gapYear: false, gapExplanation: '',
    workExpYears: '0', workExpMonths: '0', workExpDetails: '',
    englishTest: '', ieltsScore: '', toeflScore: '', pteScore: '',
    aptitudeTest: '', greScore: '', gmatScore: '', satScore: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicationId) {
      supabase.from('applications').select('academic_info').eq('id', applicationId).maybeSingle().then(({ data }) => {
        if (data?.academic_info && Object.keys(data.academic_info).length) setForm(p => ({ ...p, ...data.academic_info }));
      });
    }
  }, [applicationId]);

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (andContinue = false) => {
    if (!form.class10Score || !form.class12Score) { setError('10th and 12th scores are required.'); return; }
    setLoading(true); setError('');
    if (applicationId) {
      await supabase.from('applications').update({ academic_info: form, current_step: 3 }).eq('id', applicationId);
    }
    setLoading(false);
    onStepComplete('education');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('loan_req');
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
        <h2 className="font-bold text-ob text-base mb-1">Educational Information</h2>
        <p className="text-si text-sm mb-6">Provide your complete academic history. This is used to assess loan and university eligibility.</p>

        <div className="space-y-8">
          {/* 10th */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">10th Standard (SSC / Matriculation)</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="Board/Exam"><input value={form.class10Board} onChange={e => upd('class10Board', e.target.value)} placeholder="CBSE / ICSE / State" className="input-field" /></F>
              <F label="Year of Passing"><input type="number" value={form.class10Year} onChange={e => upd('class10Year', e.target.value)} placeholder="2018" className="input-field" /></F>
              <F label="Score (%)" req><input type="number" step="0.01" value={form.class10Score} onChange={e => upd('class10Score', e.target.value)} placeholder="85.5" className="input-field" /></F>
              <F label="School Name" span><input value={form.class10School} onChange={e => upd('class10School', e.target.value)} placeholder="School name" className="input-field" /></F>
            </div>
          </div>

          {/* 12th */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">12th Standard (HSC / Intermediate)</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="Board/Exam"><input value={form.class12Board} onChange={e => upd('class12Board', e.target.value)} placeholder="CBSE / ICSE / State" className="input-field" /></F>
              <F label="Year of Passing"><input type="number" value={form.class12Year} onChange={e => upd('class12Year', e.target.value)} placeholder="2020" className="input-field" /></F>
              <F label="Score (%)" req><input type="number" step="0.01" value={form.class12Score} onChange={e => upd('class12Score', e.target.value)} placeholder="88.0" className="input-field" /></F>
              <F label="Stream"><input value={form.class12Stream} onChange={e => upd('class12Stream', e.target.value)} placeholder="Science / Commerce / Arts" className="input-field" /></F>
              <F label="School Name" span><input value={form.class12School} onChange={e => upd('class12School', e.target.value)} placeholder="School/College name" className="input-field" /></F>
            </div>
          </div>

          {/* Graduation */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Graduation / Bachelor's Degree</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="Degree & Specialization"><input value={form.graduationDegree} onChange={e => upd('graduationDegree', e.target.value)} placeholder="B.Tech CSE / BBA / MBBS" className="input-field" /></F>
              <F label="Year of Passing"><input type="number" value={form.graduationYear} onChange={e => upd('graduationYear', e.target.value)} placeholder="2024" className="input-field" /></F>
              <F label="Score (% / CGPA)"><input value={form.graduationScore} onChange={e => upd('graduationScore', e.target.value)} placeholder="7.8 CGPA or 78%" className="input-field" /></F>
              <F label="University" span><input value={form.graduationUniversity} onChange={e => upd('graduationUniversity', e.target.value)} placeholder="University name" className="input-field" /></F>
              <F label="Mode">
                <div className="relative">
                  <select value={form.graduationMode} onChange={e => upd('graduationMode', e.target.value)} className="input-field appearance-none">
                    {['Full Time', 'Part Time', 'Distance Learning', 'Correspondence'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </F>
            </div>
          </div>

          {/* Masters */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Post-Graduation (if completed)</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="Degree"><input value={form.mastersDegree} onChange={e => upd('mastersDegree', e.target.value)} placeholder="MBA / M.Tech / MA" className="input-field" /></F>
              <F label="Year"><input type="number" value={form.mastersYear} onChange={e => upd('mastersYear', e.target.value)} placeholder="2026" className="input-field" /></F>
              <F label="Score"><input value={form.mastersScore} onChange={e => upd('mastersScore', e.target.value)} placeholder="CGPA / %" className="input-field" /></F>
              <F label="University" span><input value={form.mastersUniversity} onChange={e => upd('mastersUniversity', e.target.value)} placeholder="University name" className="input-field" /></F>
            </div>
          </div>

          {/* Backlogs & Gap */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">Academic History</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="Total Historical Backlogs"><input type="number" min={0} value={form.backlogs} onChange={e => upd('backlogs', e.target.value)} className="input-field" /></F>
              <F label="Current Active Backlogs"><input type="number" min={0} value={form.currentBacklogs} onChange={e => upd('currentBacklogs', e.target.value)} className="input-field" /></F>
              <F label="Work Experience">
                <div className="flex gap-2">
                  <input type="number" min={0} max={20} value={form.workExpYears} onChange={e => upd('workExpYears', e.target.value)} placeholder="Yrs" className="input-field" />
                  <input type="number" min={0} max={11} value={form.workExpMonths} onChange={e => upd('workExpMonths', e.target.value)} placeholder="Mos" className="input-field" />
                </div>
              </F>
              <div className="sm:col-span-3 flex items-start gap-3 p-3 border border-sg rounded-xl">
                <input type="checkbox" id="gapYear" checked={form.gapYear} onChange={e => upd('gapYear', e.target.checked)} className="accent-ob mt-0.5" />
                <label htmlFor="gapYear" className="text-sm text-ob cursor-pointer">I have a gap year in my academics</label>
              </div>
              {form.gapYear && (
                <div className="sm:col-span-3">
                  <F label="Gap Year Explanation"><textarea value={form.gapExplanation} onChange={e => upd('gapExplanation', e.target.value)} rows={3} placeholder="Explain the reason for gap year..." className="input-field resize-none" /></F>
                </div>
              )}
              {(+form.workExpYears > 0 || +form.workExpMonths > 0) && (
                <div className="sm:col-span-3">
                  <F label="Work Experience Details"><textarea value={form.workExpDetails} onChange={e => upd('workExpDetails', e.target.value)} rows={3} placeholder="Role, company, responsibilities..." className="input-field resize-none" /></F>
                </div>
              )}
            </div>
          </div>

          {/* Test Scores */}
          <div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4">English Proficiency Tests</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="IELTS Score"><input type="number" step="0.5" min={0} max={9} value={form.ieltsScore} onChange={e => upd('ieltsScore', e.target.value)} placeholder="7.0" className="input-field" /></F>
              <F label="TOEFL Score"><input type="number" value={form.toeflScore} onChange={e => upd('toeflScore', e.target.value)} placeholder="100" className="input-field" /></F>
              <F label="PTE Score"><input type="number" value={form.pteScore} onChange={e => upd('pteScore', e.target.value)} placeholder="65" className="input-field" /></F>
            </div>
            <h3 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-4 mt-6">Aptitude Tests</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="GRE Score"><input type="number" value={form.greScore} onChange={e => upd('greScore', e.target.value)} placeholder="320" className="input-field" /></F>
              <F label="GMAT Score"><input type="number" value={form.gmatScore} onChange={e => upd('gmatScore', e.target.value)} placeholder="680" className="input-field" /></F>
              <F label="SAT Score"><input type="number" value={form.satScore} onChange={e => upd('satScore', e.target.value)} placeholder="1450" className="input-field" /></F>
            </div>
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-error-500/15 border border-error-500/20 rounded-xl text-error-600 text-sm">{error}</div>}
        {saved && <div className="mt-4 flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved!</div>}

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-sg/30">
          <div className="flex items-center gap-3">
            <button onClick={() => handleSave(false)} disabled={loading} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => downloadSectionPdf([
              { title: '10th Standard', fields: [
                { label: 'Board', value: form.class10Board },
                { label: 'Year of Passing', value: form.class10Year },
                { label: 'Score (%)', value: form.class10Score },
                { label: 'School Name', value: form.class10School },
              ]},
              { title: '12th Standard', fields: [
                { label: 'Board', value: form.class12Board },
                { label: 'Year of Passing', value: form.class12Year },
                { label: 'Score (%)', value: form.class12Score },
                { label: 'Stream', value: form.class12Stream },
                { label: 'School Name', value: form.class12School },
              ]},
              { title: 'Graduation', fields: [
                { label: 'Degree', value: form.graduationDegree },
                { label: 'University', value: form.graduationUniversity },
                { label: 'Year of Passing', value: form.graduationYear },
                { label: 'Score', value: form.graduationScore },
                { label: 'Mode', value: form.graduationMode },
              ]},
              { title: 'Post-Graduation', fields: [
                { label: 'Degree', value: form.mastersDegree },
                { label: 'University', value: form.mastersUniversity },
                { label: 'Year', value: form.mastersYear },
                { label: 'Score', value: form.mastersScore },
              ]},
              { title: 'Academic History', fields: [
                { label: 'Total Backlogs', value: form.backlogs },
                { label: 'Current Backlogs', value: form.currentBacklogs },
                { label: 'Gap Year', value: form.gapYear },
                { label: 'Gap Explanation', value: form.gapExplanation },
                { label: 'Work Experience (Years)', value: form.workExpYears },
                { label: 'Work Experience (Months)', value: form.workExpMonths },
                { label: 'Work Experience Details', value: form.workExpDetails },
              ]},
              { title: 'Test Scores', fields: [
                { label: 'IELTS', value: form.ieltsScore },
                { label: 'TOEFL', value: form.toeflScore },
                { label: 'PTE', value: form.pteScore },
                { label: 'GRE', value: form.greScore },
                { label: 'GMAT', value: form.gmatScore },
                { label: 'SAT', value: form.satScore },
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
