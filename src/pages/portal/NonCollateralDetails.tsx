import { useState, useEffect } from 'react';
import { Save, CheckCircle2, ChevronRight, GraduationCap, TrendingUp, FileText, AlertCircle, Home, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';
import { ArrowLeft } from "lucide-react";

interface Props {
  applicationId: string | null;
  loanType?: 'collateral' | 'non_collateral';
  onNavigate: (id: NavId) => void;
  onStepComplete: (id: NavId) => void;
}

const ADMISSION_STATUSES = ['Applied', 'Offer Received', 'Conditional Offer', 'Enrolled', 'Deferred', 'Not yet applied'];
const DEGREES = ["Bachelor's", 'Masters (MS)', 'Masters (MA)', 'MBA', 'PhD', 'Diploma', 'Certificate', 'Associate Degree'];

interface EligibilityResult {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Low';
  color: string;
  bgColor: string;
  factors: { label: string; pts: number; max: number; note: string }[];
}

function computeEligibility(form: any, coApp: any, loanAmount: number): EligibilityResult {
  const factors: EligibilityResult['factors'] = [];

  // University ranking (0-20)
  const rank = parseInt(form.universityRanking) || 0;
  const rankPts = rank > 0 && rank <= 100 ? 20 : rank <= 300 ? 15 : rank <= 500 ? 10 : rank <= 1000 ? 6 : 3;
  factors.push({ label: 'University Ranking', pts: rank > 0 ? rankPts : 0, max: 20, note: rank > 0 ? `QS Rank #${rank}` : 'Not provided' });

  // Academic performance (0-20)
  const gradScore = parseFloat(form.graduationScore) || 0;
  const gradPts = gradScore >= 80 ? 20 : gradScore >= 70 ? 16 : gradScore >= 60 ? 12 : gradScore >= 50 ? 8 : 4;
  factors.push({ label: 'Academic Performance', pts: gradScore > 0 ? gradPts : 0, max: 20, note: gradScore > 0 ? `Graduation: ${form.graduationScore}%/CGPA` : 'Not provided' });

  // Test scores (0-15)
  const hasIelts = parseFloat(form.ieltsScore) >= 6.5;
  const hasGre = parseInt(form.greScore) >= 300;
  const hasGmat = parseInt(form.gmatScore) >= 600;
  const testPts = (hasIelts ? 8 : 0) + (hasGre ? 4 : 0) + (hasGmat ? 3 : 0);
  factors.push({ label: 'Test Scores', pts: testPts, max: 15, note: [hasIelts && `IELTS ${form.ieltsScore}`, hasGre && `GRE ${form.greScore}`, hasGmat && `GMAT ${form.gmatScore}`].filter(Boolean).join(', ') || 'No test scores' });

  // Co-applicant CIBIL (0-20)
  const cibil = parseInt(coApp?.financial_info?.cibilScore) || 0;
  const cibilPts = cibil >= 750 ? 20 : cibil >= 700 ? 15 : cibil >= 650 ? 10 : cibil > 0 ? 4 : 0;
  factors.push({ label: 'Co-Applicant CIBIL', pts: cibilPts, max: 20, note: cibil > 0 ? `Score: ${cibil}` : 'Not provided' });

  // Co-applicant income vs loan amount (0-25)
  const annualIncome = parseFloat(coApp?.employment_info?.annualIncome) || parseFloat(coApp?.employment_info?.annualTurnover) || 0;
  const monthlyIncome = parseFloat(coApp?.employment_info?.monthlyGross) || (annualIncome / 12);
  const foir = loanAmount > 0 && monthlyIncome > 0 ? (loanAmount / 120) / monthlyIncome : 0; // EMI/income ratio approx
  const incomePts = monthlyIncome >= 150000 ? 25 : monthlyIncome >= 80000 ? 20 : monthlyIncome >= 50000 ? 14 : monthlyIncome >= 30000 ? 8 : monthlyIncome > 0 ? 4 : 0;
  factors.push({ label: 'Co-Applicant Income', pts: incomePts, max: 25, note: monthlyIncome > 0 ? `₹${Math.round(monthlyIncome).toLocaleString('en-IN')}/month` : 'Not provided' });

  const total = factors.reduce((s, f) => s + f.pts, 0);
  const maxTotal = factors.reduce((s, f) => s + f.max, 0);
  const pct = Math.round((total / maxTotal) * 100);

  let rating: EligibilityResult['rating'] = 'Low';
  let color = 'text-error-600';
  let bgColor = 'bg-error-50 border-error-100';
  if (pct >= 75) { rating = 'Excellent'; color = 'text-success-600'; bgColor = 'bg-success-500/15 border-success-500/30'; }
  else if (pct >= 55) { rating = 'Good'; color = 'text-ob'; bgColor = 'bg-si/20 border-sg/50'; }
  else if (pct >= 35) { rating = 'Fair'; color = 'text-si'; bgColor = 'bg-sg/40 border-sg/50'; }

  return { score: pct, rating, color, bgColor, factors };
}

const F = ({ label, req, span, note, children }: { label: string; req?: boolean; span?: boolean; note?: string; children: React.ReactNode }) => (
  <div className={span ? 'sm:col-span-2' : ''}>
    <label className="label">{label}{req && <span className="text-error-500 ml-0.5">*</span>}</label>
    {children}
    {note && <p className="text-si text-xs mt-1">{note}</p>}
  </div>
);

export default function NonCollateralDetails({ applicationId, loanType, onNavigate, onStepComplete }: Props) {
  const [form, setForm] = useState({
    universityName: '', universityRanking: '', courseName: '', degree: '',
    countryOfStudy: '', courseDuration: '', admissionStatus: '',
    tuitionFee: '', livingExpenses: '', scholarshipDetails: '',
    estimatedSalary: '',
    // Auto-loaded from academic_info
    class10Score: '', class12Score: '', graduationScore: '',
    ieltsScore: '', toeflScore: '', greScore: '', gmatScore: '', pteScore: '', satScore: '',
  });
  const [coApplicant, setCoApplicant] = useState<any>(null);
  const [loanAmount, setLoanAmount] = useState(0);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!applicationId) { setLoading(false); return; }
    Promise.all([
      supabase.from('applications').select('academic_info, loan_amount, preferred_country, preferred_course, preferred_university, non_collateral_details').eq('id', applicationId).maybeSingle(),
      supabase.from('co_applicants').select('*').eq('application_id', applicationId).limit(1).maybeSingle(),
    ]).then(([appRes, coRes]) => {
      const app = appRes.data;
      const co = coRes.data;
      if (app) {
        const ai = app.academic_info ?? {};
        const ncd = app.non_collateral_details ?? {};
        setLoanAmount(app.loan_amount ?? 0);
        setForm(p => ({
          ...p,
          universityName: ncd.universityName ?? app.preferred_university ?? '',
          universityRanking: ncd.universityRanking ?? '',
          courseName: ncd.courseName ?? app.preferred_course ?? '',
          degree: ncd.degree ?? '',
          countryOfStudy: ncd.countryOfStudy ?? app.preferred_country ?? '',
          courseDuration: ncd.courseDuration ?? '',
          admissionStatus: ncd.admissionStatus ?? '',
          tuitionFee: ncd.tuitionFee ?? '',
          livingExpenses: ncd.livingExpenses ?? '',
          scholarshipDetails: ncd.scholarshipDetails ?? '',
          estimatedSalary: ncd.estimatedSalary ?? '',
          class10Score: ai.class10Score ?? '',
          class12Score: ai.class12Score ?? '',
          graduationScore: ai.graduationScore ?? '',
          ieltsScore: ai.ieltsScore ?? '',
          toeflScore: ai.toeflScore ?? '',
          greScore: ai.greScore ?? '',
          gmatScore: ai.gmatScore ?? '',
          pteScore: ai.pteScore ?? '',
          satScore: ai.satScore ?? '',
        }));
      }
      if (co) setCoApplicant(co);
      setLoading(false);
    });
  }, [applicationId]);

  // Recompute eligibility whenever relevant fields change
  useEffect(() => {
    if (coApplicant || form.universityRanking) {
      setEligibility(computeEligibility(form, coApplicant, loanAmount));
    }
  }, [form.universityRanking, form.graduationScore, form.ieltsScore, form.greScore, form.gmatScore, coApplicant, loanAmount]);

  const upd = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (andContinue = false) => {
    if (!form.universityName || !form.admissionStatus) { setError('University name and admission status are required.'); return; }
    setSaving(true); setError('');
    if (applicationId) {
      await supabase.from('applications').update({
        non_collateral_details: { ...form, eligibilityScore: eligibility?.score, eligibilityRating: eligibility?.rating },
        current_step: 8,
      }).eq('id', applicationId);
    }
    setSaving(false);
    onStepComplete('non_collateral');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (andContinue) onNavigate('documents');
  };

  // Not applicable if collateral type
  if (!loading && loanType === 'collateral') {
    return (
      <div className="max-w-lg mx-auto py-12">
        <div className="card p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 bg-sg/30 rounded-full flex items-center justify-center">
            <Home className="w-7 h-7 text-ob/40" />
          </div>
          <h3 className="font-bold text-ob">Not Required for Collateral Loan</h3>
          <p className="text-si text-sm">
            You selected a <strong>Collateral Loan</strong> in Loan Requirement. This section is only needed for Non-Collateral loans.
          </p>
          <p className="text-si text-sm">
            If you want to switch to a Non-Collateral loan, go back to <strong>Loan Requirement</strong> and change the loan type.
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => onNavigate('loan_req')} className="btn-secondary text-sm py-2.5">Change Loan Type</button>
            <button onClick={() => onNavigate('documents')} className="btn-primary text-sm py-2.5">Continue to Documents</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-12 text-si">Loading...</div>;

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
      <div className="flex items-center gap-2 px-1">
        <span className="badge bg-ob text-pw text-xs">Non-Collateral Loan</span>
        <span className="text-si text-xs">Assessed on academic profile + co-applicant financial strength</span>
      </div>

      {/* Student Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap className="w-5 h-5 text-ob/60" />
          <h3 className="font-bold text-ob">Student Profile</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-ob/50 text-xs uppercase tracking-widest mb-4">University & Course</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="University Name" req>
                <input value={form.universityName} onChange={e => upd('universityName', e.target.value)} placeholder="Full university name" className="input-field" />
              </F>
              <F label="QS World Ranking" note="Leave blank if unranked">
                <input type="number" min={1} value={form.universityRanking} onChange={e => upd('universityRanking', e.target.value)} placeholder="e.g. 150" className="input-field" />
              </F>
              <F label="Course Name" req>
                <input value={form.courseName} onChange={e => upd('courseName', e.target.value)} placeholder="e.g. MSc Artificial Intelligence" className="input-field" />
              </F>
              <F label="Degree">
                <select value={form.degree} onChange={e => upd('degree', e.target.value)} className="input-field appearance-none">
                  <option value="">Select degree</option>
                  {DEGREES.map(d => <option key={d}>{d}</option>)}
                </select>
              </F>
              <F label="Country of Study">
                <input value={form.countryOfStudy} onChange={e => upd('countryOfStudy', e.target.value)} placeholder="e.g. United Kingdom" className="input-field" />
              </F>
              <F label="Course Duration">
                <input value={form.courseDuration} onChange={e => upd('courseDuration', e.target.value)} placeholder="e.g. 2 Years" className="input-field" />
              </F>
              <F label="Admission Status" req>
                <select value={form.admissionStatus} onChange={e => upd('admissionStatus', e.target.value)} className="input-field appearance-none">
                  <option value="">Select status</option>
                  {ADMISSION_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </F>
              <F label="Annual Tuition Fee (₹)">
                <input type="number" value={form.tuitionFee} onChange={e => upd('tuitionFee', e.target.value)} placeholder="e.g. 2500000" className="input-field" />
              </F>
              <F label="Expected Living Expenses (₹/yr)">
                <input type="number" value={form.livingExpenses} onChange={e => upd('livingExpenses', e.target.value)} placeholder="e.g. 1200000" className="input-field" />
              </F>
              <F label="Estimated Salary After Graduation (₹/yr)" note="Optional — helps banks assess repayment potential">
                <input type="number" value={form.estimatedSalary} onChange={e => upd('estimatedSalary', e.target.value)} placeholder="e.g. 2000000" className="input-field" />
              </F>
              <F label="Scholarship Details (if any)" span>
                <input value={form.scholarshipDetails} onChange={e => upd('scholarshipDetails', e.target.value)} placeholder="Scholarship name, amount, details..." className="input-field" />
              </F>
            </div>
          </div>

          {/* Academic performance - auto-loaded, editable */}
          <div>
            <h4 className="font-semibold text-ob/50 text-xs uppercase tracking-widest mb-3">Previous Academic Performance</h4>
            <p className="text-si text-xs mb-4">Auto-loaded from your Educational Information. Update directly in that section if needed.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="10th Score (%)">
                <input type="number" value={form.class10Score} onChange={e => upd('class10Score', e.target.value)} placeholder="e.g. 85" className="input-field bg-sg/10" />
              </F>
              <F label="12th Score (%)">
                <input type="number" value={form.class12Score} onChange={e => upd('class12Score', e.target.value)} placeholder="e.g. 88" className="input-field bg-sg/10" />
              </F>
              <F label="Graduation Score">
                <input value={form.graduationScore} onChange={e => upd('graduationScore', e.target.value)} placeholder="CGPA or %" className="input-field bg-sg/10" />
              </F>
            </div>
          </div>

          {/* Test scores */}
          <div>
            <h4 className="font-semibold text-ob/50 text-xs uppercase tracking-widest mb-3">Entrance & Language Test Scores</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <F label="IELTS"><input type="number" step="0.5" value={form.ieltsScore} onChange={e => upd('ieltsScore', e.target.value)} placeholder="e.g. 7.0" className="input-field bg-sg/10" /></F>
              <F label="TOEFL"><input type="number" value={form.toeflScore} onChange={e => upd('toeflScore', e.target.value)} placeholder="e.g. 105" className="input-field bg-sg/10" /></F>
              <F label="PTE"><input type="number" value={form.pteScore} onChange={e => upd('pteScore', e.target.value)} placeholder="e.g. 65" className="input-field bg-sg/10" /></F>
              <F label="GRE"><input type="number" value={form.greScore} onChange={e => upd('greScore', e.target.value)} placeholder="e.g. 320" className="input-field bg-sg/10" /></F>
              <F label="GMAT"><input type="number" value={form.gmatScore} onChange={e => upd('gmatScore', e.target.value)} placeholder="e.g. 680" className="input-field bg-sg/10" /></F>
              <F label="SAT"><input type="number" value={form.satScore} onChange={e => upd('satScore', e.target.value)} placeholder="e.g. 1450" className="input-field bg-sg/10" /></F>
            </div>
          </div>
        </div>
      </div>

      {/* Co-Applicant Financial Summary */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-ob/60" />
          <h3 className="font-bold text-ob">Co-Applicant Financial Profile</h3>
        </div>
        <p className="text-si text-xs mb-5">Auto-loaded from your Co-Applicant Details. Edit details there to update this summary.</p>

        {!coApplicant ? (
          <div className="flex items-start gap-3 p-4 bg-sg/40 border border-sg/40 rounded-xl">
            <AlertCircle className="w-5 h-5 text-si shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-si text-sm">No co-applicant found</div>
              <p className="text-si text-xs mt-0.5">A co-applicant is required for a Non-Collateral loan. Please add one in the Co-Applicant Details section.</p>
              <button onClick={() => onNavigate('co_applicant')} className="btn-primary text-xs py-1.5 px-3 mt-3">Add Co-Applicant</button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ['Relationship', coApplicant.relationship],
              ['Employment Type', coApplicant.employment_type?.replace('_', ' ')],
              ['Monthly Income', coApplicant.employment_info?.monthlyGross ? `₹${Number(coApplicant.employment_info.monthlyGross).toLocaleString('en-IN')}` : coApplicant.employment_info?.monthlyPension ? `₹${Number(coApplicant.employment_info.monthlyPension).toLocaleString('en-IN')} (pension)` : '—'],
              ['Annual Income', coApplicant.employment_info?.annualIncome ? `₹${Number(coApplicant.employment_info.annualIncome).toLocaleString('en-IN')}` : coApplicant.employment_info?.annualTurnover ? `₹${Number(coApplicant.employment_info.annualTurnover).toLocaleString('en-IN')} (turnover)` : '—'],
              ['CIBIL Score', coApplicant.financial_info?.cibilScore ?? '—'],
              ['Monthly EMI (Existing)', coApplicant.financial_info?.monthlyEMI ? `₹${Number(coApplicant.financial_info.monthlyEMI).toLocaleString('en-IN')}` : '—'],
              ['Savings', coApplicant.financial_info?.savings ? `₹${Number(coApplicant.financial_info.savings).toLocaleString('en-IN')}` : '—'],
              ['Fixed Deposits', coApplicant.financial_info?.fixedDeposits ? `₹${Number(coApplicant.financial_info.fixedDeposits).toLocaleString('en-IN')}` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between p-3 bg-sg/10 rounded-xl gap-2">
                <span className="text-si text-xs">{label}</span>
                <span className="font-medium text-ob text-xs text-right capitalize">{value ?? '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Checklist */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-5 h-5 text-ob/60" />
          <h3 className="font-bold text-ob">Required Documents for Non-Collateral Loan</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <h4 className="font-semibold text-ob/50 text-xs uppercase tracking-widest mb-3">Student Documents</h4>
            <ul className="space-y-2">
              {['Admission Letter / Offer Letter', 'University Fee Structure', 'Passport', 'Academic Transcripts (10th, 12th, Graduation)', 'Entrance Exam Scorecards (IELTS, GRE, etc.)', 'Resume / CV', 'Statement of Purpose (SOP)', 'Letters of Recommendation (LOR)'].map(doc => (
                <li key={doc} className="flex items-start gap-2 text-sm text-ob/70">
                  <span className="w-1.5 h-1.5 bg-ob/30 rounded-full shrink-0 mt-1.5" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-ob/50 text-xs uppercase tracking-widest mb-3">Co-Applicant Documents</h4>
            <ul className="space-y-2">
              {['Aadhaar Card', 'PAN Card', 'Salary Slips (Last 3–6 Months)', 'Form 16', 'Income Tax Returns (Last 2–3 Years)', 'Bank Statements (Last 6–12 Months)', 'Employment ID Card', 'GST Registration & Business Proof (if self-employed)'].map(doc => (
                <li key={doc} className="flex items-start gap-2 text-sm text-ob/70">
                  <span className="w-1.5 h-1.5 bg-ob/30 rounded-full shrink-0 mt-1.5" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-si text-xs mt-4">Upload all documents in the <strong>Document Upload</strong> section.</p>
      </div>

      {/* Loan Eligibility Assessment */}
      {eligibility && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-ob/60" />
            <h3 className="font-bold text-ob">Loan Eligibility Assessment</h3>
          </div>

          {/* Overall score */}
          <div className={`rounded-2xl border p-5 mb-5 ${eligibility.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className={`text-3xl font-bold ${eligibility.color}`}>{eligibility.score}%</div>
                <div className={`font-semibold text-sm mt-0.5 ${eligibility.color}`}>
                  Eligibility: {eligibility.rating}
                </div>
              </div>
              <div className="text-right text-sm text-ob/60">
                {eligibility.rating === 'Excellent' && 'Very high chance of approval at favorable rates.'}
                {eligibility.rating === 'Good' && 'Good profile — most banks will consider this application.'}
                {eligibility.rating === 'Fair' && 'Approval possible. Strengthening co-applicant profile recommended.'}
                {eligibility.rating === 'Low' && 'Profile needs improvement before applying.'}
              </div>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  eligibility.rating === 'Excellent' ? 'bg-success-600' :
                  eligibility.rating === 'Good' ? 'bg-ob' :
                  eligibility.rating === 'Fair' ? 'bg-sg/60' : 'bg-error-600'
                }`}
                style={{ width: `${eligibility.score}%` }}
              />
            </div>
          </div>

          {/* Factor breakdown */}
          <h4 className="font-semibold text-ob/60 text-xs uppercase tracking-widest mb-3">Assessment Factors</h4>
          <div className="space-y-3">
            {eligibility.factors.map(f => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-ob">{f.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-si text-xs">{f.note}</span>
                    <span className="font-bold text-ob">{f.pts}/{f.max}</span>
                  </div>
                </div>
                <div className="w-full bg-sg/30 rounded-full h-1.5">
                  <div
                    className="bg-ob h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${f.max > 0 ? (f.pts / f.max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-sg/20 rounded-xl text-xs text-si">
            This is a preliminary assessment only. Final approval depends on the bank's internal credit policy and verification of all submitted documents.
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-error-50 border border-error-100 rounded-xl text-error-600 text-sm">{error}</div>}
      {saved && <div className="flex items-center gap-2 p-3 bg-success-500/15 border border-success-500/20 rounded-xl text-success-600 text-sm"><CheckCircle2 className="w-4 h-4" /> Saved successfully!</div>}

      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
            <Save className="w-3.5 h-3.5" />{saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={() => downloadSectionPdf([
            { title: 'Student Profile — University & Course', fields: [
              { label: 'University Name', value: form.universityName },
              { label: 'QS World Ranking', value: form.universityRanking },
              { label: 'Course Name', value: form.courseName },
              { label: 'Degree', value: form.degree },
              { label: 'Country of Study', value: form.countryOfStudy },
              { label: 'Course Duration', value: form.courseDuration },
              { label: 'Admission Status', value: form.admissionStatus },
              { label: 'Annual Tuition Fee (₹)', value: form.tuitionFee },
              { label: 'Expected Living Expenses (₹/yr)', value: form.livingExpenses },
              { label: 'Estimated Salary After Graduation (₹/yr)', value: form.estimatedSalary },
              { label: 'Scholarship Details', value: form.scholarshipDetails },
            ]},
            { title: 'Previous Academic Performance', fields: [
              { label: '10th Score (%)', value: form.class10Score },
              { label: '12th Score (%)', value: form.class12Score },
              { label: 'Graduation Score', value: form.graduationScore },
            ]},
            { title: 'Entrance & Language Test Scores', fields: [
              { label: 'IELTS', value: form.ieltsScore },
              { label: 'TOEFL', value: form.toeflScore },
              { label: 'PTE', value: form.pteScore },
              { label: 'GRE', value: form.greScore },
              { label: 'GMAT', value: form.gmatScore },
              { label: 'SAT', value: form.satScore },
            ]},
            { title: 'Loan Eligibility Assessment', fields: [
              { label: 'Eligibility Score', value: eligibility ? `${eligibility.score}%` : '—' },
              { label: 'Eligibility Rating', value: eligibility?.rating ?? '—' },
            ]},
          ], 'Student', applicationId ?? undefined)} className="btn-secondary text-sm py-2.5 flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary text-sm py-2.5">
          Save & Continue to Documents <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
