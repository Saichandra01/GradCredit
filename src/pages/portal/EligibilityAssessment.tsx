import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Clock, AlertCircle, FileText, User, Users, Building2,
  TrendingUp, Shield, IndianRupee, GraduationCap, Globe, Award, ChevronRight,
  Info, Star, MessageSquare, ArrowRight, Loader2, Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadSectionPdf } from '../../lib/pdf';
import type { NavId } from '../Portal';

interface Props {
  applicationId: string | null;
  onNavigate: (id: NavId) => void;
}

interface DocStatus {
  label: string;
  status: 'uploaded' | 'missing' | 'verified' | 'pending';
}

interface AssessmentFactor {
  label: string;
  score: number;
  max: number;
  note: string;
}

interface BankSuggestion {
  name: string;
  collateral: boolean;
  nonCollateral: boolean;
}

const BANKS: BankSuggestion[] = [
  { name: 'HDFC Credila', collateral: true, nonCollateral: true },
  { name: 'ICICI Bank', collateral: true, nonCollateral: true },
  { name: 'Union Bank', collateral: true, nonCollateral: false },
  { name: 'Avanse Financial Services', collateral: true, nonCollateral: true },
  { name: 'InCred Finance', collateral: true, nonCollateral: true },
  { name: 'Auxilo Finance', collateral: true, nonCollateral: true },
  { name: 'MPOWER Financing', collateral: false, nonCollateral: true },
  { name: 'Prodigy Finance', collateral: false, nonCollateral: true },
];

const STUDENT_DOCS = ['Aadhaar Card', 'PAN Card', 'Passport', 'Admission Letter', 'Fee Structure', 'Academic Certificates'];
const COAPPLICANT_DOCS = ['Co-Applicant Aadhaar Card', 'Co-Applicant PAN Card', 'Salary Slips (Last 6 Months)', 'Income Tax Returns (Last 2 Years)', 'Bank Statements (Last 12 Months)'];

// Map spec doc names to actual document_type strings in DB
const DOC_MAP: Record<string, string[]> = {
  'Aadhaar Card': ['Aadhaar Card (Student)'],
  'PAN Card': ['PAN Card (Student)'],
  'Passport': ['Passport (Front & Back)'],
  'Admission Letter': ['Offer Letter / Admission Confirmation', 'I-20 / CAS / CoE (if received)'],
  'Fee Structure': ['Fee Structure'],
  'Academic Certificates': ['10th Marksheet', '12th Marksheet', 'Graduation Certificate', 'Graduation Transcripts'],
  'Co-Applicant Aadhaar Card': ['Co-Applicant Aadhaar Card'],
  'Co-Applicant PAN Card': ['Co-Applicant PAN Card'],
  'Salary Slips (Last 6 Months)': ['Salary Slips (Last 6 Months)'],
  'Income Tax Returns (Last 2 Years)': ['Income Tax Returns (Last 2 Years)'],
  'Bank Statements (Last 12 Months)': ['Bank Statements (Last 12 Months)'],
};

export default function EligibilityAssessment({ applicationId, onNavigate }: Props) {
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<any>(null);
  const [coApplicant, setCoApplicant] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<any>(null);

  useEffect(() => {
    if (applicationId) loadData();
    else setLoading(false);
  }, [applicationId]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: appData }, { data: coAppData }, { data: docData }, { data: remarkData }] = await Promise.all([
      supabase.from('applications').select('*').eq('id', applicationId).maybeSingle(),
      supabase.from('co_applicants').select('*').eq('application_id', applicationId).limit(1).maybeSingle(),
      supabase.from('documents').select('*').eq('application_id', applicationId),
      supabase.from('eligibility_remarks').select('*').eq('application_id', applicationId).maybeSingle(),
    ]);

    setApp(appData);
    setCoApplicant(coAppData);
    setDocuments(docData ?? []);
    setRemarks(remarkData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-ob animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-si mx-auto mb-4" />
          <h3 className="font-semibold text-ob mb-2">No Application Found</h3>
          <p className="text-si text-sm mb-5">Complete your loan requirement details first to see your eligibility assessment.</p>
          <button onClick={() => onNavigate('loan_req')} className="btn-primary">
            Go to Loan Requirement <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- Student Summary ---
  const pi = app.personal_info ?? {};
  const studentName = [pi.firstName, pi.lastName].filter(Boolean).join(' ') || 'Not provided';
  const university = app.preferred_university || 'Not provided';
  const country = app.preferred_country || 'Not provided';
  const course = app.preferred_course || 'Not provided';
  const ai = app.academic_info ?? {};
  const degree = ai.graduationDegree || ai.class12Stream || 'Not provided';
  const admissionStatus = ai.admissionStatus || 'Not provided';
  const loanAmount = app.loan_amount ? `₹${Number(app.loan_amount).toLocaleString('en-IN')}` : 'Not provided';
  const loanType = app.loan_type === 'non_collateral' ? 'Non-Collateral' : 'Collateral';

  // --- Co-Applicant Summary ---
  const co = coApplicant ?? {};
  const coPI = co.personal_info ?? {};
  const coEmp = co.employment_info ?? {};
  const coFin = co.financial_info ?? {};
  const coName = [coPI.firstName, coPI.lastName].filter(Boolean).join(' ') || 'Not provided';
  const coRelationship = co.relationship || 'Not provided';
  const coEmpType = co.employment_type || 'Not provided';
  const isSelfEmployed = ['self_employed', 'business_owner'].includes(coEmpType);
  const companyName = coEmp.companyName || coEmp.businessName || 'Not provided';
  const monthlyIncome = coEmp.monthlyGross || coEmp.monthlyNet || (coEmp.annualIncome ? (Number(coEmp.annualIncome) / 12).toFixed(0) : '');
  const annualIncome = coEmp.annualIncome || (monthlyIncome ? (Number(monthlyIncome) * 12).toFixed(0) : '');
  const existingEMIs = coFin.monthlyEMI || '0';
  const existingLoans = coFin.existingLoans?.length ? coFin.existingLoans.length : 0;
  const cibilScore = coFin.cibilScore || 'Not available';

  // Document status helpers
  const uploadedDocTypes = new Set(documents.map(d => d.document_type));
  const getDocStatus = (specLabel: string): DocStatus => {
    const dbTypes = DOC_MAP[specLabel] ?? [specLabel];
    const matching = documents.filter(d => dbTypes.includes(d.document_type));
    if (matching.length === 0) return { label: specLabel, status: 'missing' };
    const anyApproved = matching.some(d => d.status === 'approved');
    const anyPending = matching.some(d => d.status === 'pending' || d.status === 'under_review');
    if (anyApproved) return { label: specLabel, status: 'verified' };
    if (anyPending) return { label: specLabel, status: 'pending' };
    return { label: specLabel, status: 'uploaded' };
  };

  const studentDocStatuses = STUDENT_DOCS.map(getDocStatus);
  const coApplicantDocStatuses = COAPPLICANT_DOCS.map(getDocStatus);
  const allDocStatuses = [...studentDocStatuses, ...coApplicantDocStatuses];
  const totalDocs = allDocStatuses.length;
  const verifiedDocs = allDocStatuses.filter(d => d.status === 'verified').length;
  const uploadedDocs = allDocStatuses.filter(d => d.status !== 'missing').length;

  // --- Eligibility Assessment ---
  const factors: AssessmentFactor[] = [];

  // Academic Profile (0-15)
  const gradScore = parseFloat(ai.graduationScore) || 0;
  const class12Score = parseFloat(ai.class12Score) || 0;
  let academicPts = 0;
  if (gradScore >= 80 || class12Score >= 85) academicPts = 15;
  else if (gradScore >= 70 || class12Score >= 75) academicPts = 12;
  else if (gradScore >= 60 || class12Score >= 65) academicPts = 9;
  else if (gradScore > 0 || class12Score > 0) academicPts = 5;
  factors.push({
    label: 'Academic Profile',
    score: academicPts,
    max: 15,
    note: gradScore > 0 ? `Graduation: ${ai.graduationScore}%` : class12Score > 0 ? `12th: ${ai.class12Score}%` : 'Not provided',
  });

  // University Profile (0-15)
  const uniKnown = !!app.preferred_university;
  factors.push({
    label: 'University Profile',
    score: uniKnown ? 12 : 0,
    max: 15,
    note: uniKnown ? app.preferred_university : 'Not provided',
  });

  // Course (0-10)
  const courseKnown = !!app.preferred_course;
  factors.push({
    label: 'Course',
    score: courseKnown ? 8 : 0,
    max: 10,
    note: courseKnown ? app.preferred_course : 'Not provided',
  });

  // Loan Amount (0-15)
  const loanNum = Number(app.loan_amount) || 0;
  let loanPts = 0;
  if (loanNum > 0 && loanNum <= 2000000) loanPts = 15;
  else if (loanNum <= 5000000) loanPts = 12;
  else if (loanNum <= 10000000) loanPts = 8;
  else if (loanNum > 0) loanPts = 4;
  factors.push({
    label: 'Loan Amount',
    score: loanPts,
    max: 15,
    note: loanNum > 0 ? `₹${loanNum.toLocaleString('en-IN')}` : 'Not provided',
  });

  // Co-Applicant Income (0-15)
  const coMonthly = Number(monthlyIncome) || 0;
  let incomePts = 0;
  if (coMonthly >= 150000) incomePts = 15;
  else if (coMonthly >= 80000) incomePts = 12;
  else if (coMonthly >= 50000) incomePts = 8;
  else if (coMonthly >= 30000) incomePts = 5;
  else if (coMonthly > 0) incomePts = 2;
  factors.push({
    label: 'Co-Applicant Income',
    score: incomePts,
    max: 15,
    note: coMonthly > 0 ? `₹${coMonthly.toLocaleString('en-IN')}/month` : 'Not provided',
  });

  // CIBIL Score (0-15)
  const cibil = parseInt(cibilScore) || 0;
  let cibilPts = 0;
  if (cibil >= 750) cibilPts = 15;
  else if (cibil >= 700) cibilPts = 12;
  else if (cibil >= 650) cibilPts = 8;
  else if (cibil > 0) cibilPts = 4;
  factors.push({
    label: 'CIBIL Score',
    score: cibilPts,
    max: 15,
    note: cibil > 0 ? `Score: ${cibil}` : 'Not available',
  });

  // Existing EMIs (0-10)
  const emis = Number(existingEMIs) || 0;
  let emiPts = 10;
  if (coMonthly > 0 && emis > 0) {
    const ratio = emis / coMonthly;
    if (ratio > 0.5) emiPts = 2;
    else if (ratio > 0.3) emiPts = 5;
    else if (ratio > 0.15) emiPts = 8;
  }
  factors.push({
    label: 'Existing EMIs',
    score: emiPts,
    max: 10,
    note: emis > 0 ? `₹${emis.toLocaleString('en-IN')}/month` : 'No existing EMIs',
  });

  // Document Completion (0-5)
  const docPct = uploadedDocs / totalDocs;
  factors.push({
    label: 'Document Completion',
    score: Math.round(docPct * 5),
    max: 5,
    note: `${uploadedDocs}/${totalDocs} documents uploaded`,
  });

  const totalScore = factors.reduce((s, f) => s + f.score, 0);
  const maxScore = factors.reduce((s, f) => s + f.max, 0);
  const overallPct = Math.round((totalScore / maxScore) * 100);

  let overallStatus: 'Excellent' | 'Good' | 'Average' | 'Needs Review';
  let statusColor: string;
  let statusBg: string;
  if (overallPct >= 75) { overallStatus = 'Excellent'; statusColor = 'text-success-600'; statusBg = 'bg-success-500/15'; }
  else if (overallPct >= 55) { overallStatus = 'Good'; statusColor = 'text-ob'; statusBg = 'bg-si/20'; }
  else if (overallPct >= 35) { overallStatus = 'Average'; statusColor = 'text-si'; statusBg = 'bg-sg/40'; }
  else { overallStatus = 'Needs Review'; statusColor = 'text-error-600'; statusBg = 'bg-error-500/15'; }

  const fmtVal = (v: any, prefix = '', suffix = '') => v && v !== 'Not provided' && v !== 'Not available' ? `${prefix}${typeof v === 'number' ? v.toLocaleString('en-IN') : v}${suffix}` : 'Not provided';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-ob/6 rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-ob" />
          </div>
          <div>
            <h2 className="font-bold text-ob text-lg">Education Loan Eligibility</h2>
            <p className="text-si text-sm mt-0.5">
              This is an automated guidance assessment based on your application data. It does not approve or reject your loan.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score Banner */}
      <div className={`card p-6 ${statusBg} border-l-4 ${overallStatus === 'Excellent' ? 'border-l-success-500' : overallStatus === 'Good' ? 'border-l-ob' : overallStatus === 'Average' ? 'border-l-sg' : 'border-l-error-500'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-si uppercase tracking-widest mb-1">Overall Eligibility Score</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${statusColor}`}>{overallPct}%</span>
              <span className={`font-semibold ${statusColor}`}>· {overallStatus}</span>
            </div>
          </div>
          <div className="w-full sm:w-48">
            <div className="w-full bg-white/60 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${overallStatus === 'Excellent' ? 'bg-success-500' : overallStatus === 'Good' ? 'bg-ob' : overallStatus === 'Average' ? 'bg-sg/60' : 'bg-error-500'}`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <p className="text-xs text-si mt-1.5 text-center sm:text-right">{totalScore}/{maxScore} points</p>
          </div>
        </div>
      </div>

      {/* Student Summary */}
      <SectionCard icon={User} title="Student Summary">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryItem label="Student Name" value={studentName} />
          <SummaryItem label="University Name" value={university} />
          <SummaryItem label="Country of Study" value={country} />
          <SummaryItem label="Course Name" value={course} />
          <SummaryItem label="Degree" value={degree} />
          <SummaryItem label="Admission Status" value={admissionStatus} />
          <SummaryItem label="Loan Amount Requested" value={loanAmount} />
          <SummaryItem label="Loan Type" value={loanType} badge={loanType === 'Non-Collateral' ? 'bg-si/20 text-ob' : 'bg-sg/40 text-ob/60'} />
        </div>
      </SectionCard>

      {/* Co-Applicant Summary */}
      <SectionCard icon={Users} title="Co-Applicant Summary">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SummaryItem label="Name" value={coName} />
          <SummaryItem label="Relationship" value={coRelationship} />
          <SummaryItem label="Employment Type" value={coEmpType === 'salaried' ? 'Salaried Employee' : coEmpType === 'self_employed' ? 'Self-Employed' : coEmpType === 'business_owner' ? 'Business Owner' : coEmpType} />
          <SummaryItem label="Company / Business Name" value={companyName} />
          <SummaryItem label="Monthly Income" value={fmtVal(monthlyIncome, '₹')} />
          <SummaryItem label="Annual Income" value={fmtVal(annualIncome, '₹')} />
          <SummaryItem label="Existing EMIs" value={fmtVal(existingEMIs, '₹', '/month')} />
          <SummaryItem label="Existing Loans" value={existingLoans > 0 ? `${existingLoans} active` : 'None'} />
          <SummaryItem label="CIBIL Score" value={cibilScore} />
          <SummaryItem label="ITR Status" value={uploadedDocTypes.has('Income Tax Returns (Last 2 Years)') ? 'Uploaded' : 'Not Uploaded'} badge={uploadedDocTypes.has('Income Tax Returns (Last 2 Years)') ? 'bg-success-500/15 text-success-600' : 'bg-sg/40 text-ob/60'} />
          <SummaryItem label="Bank Statement Status" value={uploadedDocTypes.has('Bank Statements (Last 12 Months)') ? 'Uploaded' : 'Not Uploaded'} badge={uploadedDocTypes.has('Bank Statements (Last 12 Months)') ? 'bg-success-500/15 text-success-600' : 'bg-sg/40 text-ob/60'} />
        </div>

        {/* Self-employed extra fields */}
        {isSelfEmployed && (
          <div className="mt-5 pt-5 border-t border-sg/30">
            <h4 className="text-xs font-semibold text-ob/60 uppercase tracking-widest mb-4">Business Details (Self-Employed)</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryItem label="Business Name" value={coEmp.businessName || 'Not provided'} />
              <SummaryItem label="Business Type" value={coEmp.businessType || 'Not provided'} />
              <SummaryItem label="Years in Business" value={coEmp.yearsInBusiness ? `${coEmp.yearsInBusiness} years` : 'Not provided'} />
              <SummaryItem label="Annual Turnover" value={fmtVal(coEmp.annualTurnover, '₹')} />
              <SummaryItem label="GST Status" value={coEmp.gstNumber ? 'Registered' : 'Not provided'} badge={coEmp.gstNumber ? 'bg-success-500/15 text-success-600' : 'bg-sg/40 text-ob/60'} />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Document Status */}
      <SectionCard icon={FileText} title="Document Status">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ob">Overall: {uploadedDocs}/{totalDocs} uploaded, {verifiedDocs} verified</span>
            <span className="text-xs text-si">{Math.round(docPct * 100)}% complete</span>
          </div>
          <div className="w-full bg-sg/30 rounded-full h-2">
            <div className="bg-ob h-2 rounded-full transition-all duration-500" style={{ width: `${docPct * 100}%` }} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Student docs */}
          <div>
            <h4 className="text-xs font-semibold text-ob/60 uppercase tracking-widest mb-3">Student</h4>
            <div className="space-y-2">
              {studentDocStatuses.map(doc => <DocStatusRow key={doc.label} doc={doc} />)}
            </div>
          </div>
          {/* Co-Applicant docs */}
          <div>
            <h4 className="text-xs font-semibold text-ob/60 uppercase tracking-widest mb-3">Co-Applicant</h4>
            <div className="space-y-2">
              {coApplicantDocStatuses.map(doc => <DocStatusRow key={doc.label} doc={doc} />)}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Eligibility Assessment Factors */}
      <SectionCard icon={TrendingUp} title="Eligibility Assessment">
        <div className="space-y-4">
          {factors.map(factor => {
            const pct = Math.round((factor.score / factor.max) * 100);
            const color = pct >= 75 ? 'bg-success-500' : pct >= 50 ? 'bg-ob' : pct >= 25 ? 'bg-sg/60' : 'bg-error-500';
            return (
              <div key={factor.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-ob">{factor.label}</span>
                    <span className="text-xs text-si ml-2">{factor.note}</span>
                  </div>
                  <span className="text-xs font-semibold text-ob">{factor.score}/{factor.max}</span>
                </div>
                <div className="w-full bg-sg/30 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 p-4 bg-sg/15 rounded-xl flex items-start gap-3">
          <Info className="w-4 h-4 text-si shrink-0 mt-0.5" />
          <p className="text-xs text-si leading-relaxed">
            This guidance score is for counselor reference only and does not automatically approve or reject a loan.
            Final eligibility is determined by the partner bank after full document verification.
          </p>
        </div>
      </SectionCard>

      {/* Suggested Banks */}
      <SectionCard icon={Building2} title="Suggested Banks">
        <p className="text-sm text-si mb-4">
          Based on your loan type ({loanType}), these partner banks may be a good fit for your profile.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BANKS.map(bank => {
            const supports = loanType === 'Non-Collateral' ? bank.nonCollateral : bank.collateral;
            return (
              <div
                key={bank.name}
                className={`p-4 rounded-2xl border transition-all duration-200 ${supports ? 'border-success-500/30 bg-success-500/15' : 'border-sg/30 bg-sg/10'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${supports ? 'bg-success-500/20' : 'bg-sg/30'}`}>
                    <Building2 className={`w-4 h-4 ${supports ? 'text-success-600' : 'text-sg'}`} />
                  </div>
                  <span className="font-semibold text-ob text-xs leading-snug">{bank.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {bank.collateral && (
                    <span className={`badge text-xs ${loanType === 'Collateral' ? 'bg-success-500/20 text-success-600' : 'bg-sg/30 text-ob/50'}`}>Collateral</span>
                  )}
                  {bank.nonCollateral && (
                    <span className={`badge text-xs ${loanType === 'Non-Collateral' ? 'bg-success-500/20 text-success-600' : 'bg-sg/30 text-ob/50'}`}>Non-Collateral</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Counselor Remarks */}
      <SectionCard icon={MessageSquare} title="Counselor Remarks">
        {remarks ? (
          <div className="space-y-4">
            <RemarkItem label="Missing Documents" value={remarks.missing_documents} />
            <RemarkItem label="Recommended Bank" value={remarks.recommended_bank} />
            <RemarkItem label="Eligibility Remarks" value={remarks.eligibility_remarks} />
            <RemarkItem label="Next Steps" value={remarks.next_steps} />
            <div className="flex items-center gap-1.5 text-xs text-si pt-2 border-t border-sg/30">
              <Clock className="w-3 h-3" />
              Last updated: {new Date(remarks.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-8 h-8 text-sg mb-3" />
            <p className="text-sm text-si">No counselor remarks yet.</p>
            <p className="text-xs text-si/70 mt-1">Your loan specialist will add remarks after reviewing your application.</p>
          </div>
        )}
      </SectionCard>

      {/* Navigation hint */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => downloadSectionPdf([
            { title: 'Student Summary', fields: [
              { label: 'Student Name', value: studentName },
              { label: 'University', value: university },
              { label: 'Country', value: country },
              { label: 'Course', value: course },
              { label: 'Degree', value: degree },
              { label: 'Admission Status', value: admissionStatus },
              { label: 'Loan Amount', value: loanAmount },
              { label: 'Loan Type', value: loanType },
            ]},
            { title: 'Co-Applicant Summary', fields: [
              { label: 'Name', value: coName },
              { label: 'Relationship', value: coRelationship },
              { label: 'Employment Type', value: coEmpType },
              { label: 'Company/Business', value: companyName },
              { label: 'Monthly Income', value: monthlyIncome },
              { label: 'Annual Income', value: annualIncome },
              { label: 'Existing EMIs', value: existingEMIs },
              { label: 'CIBIL Score', value: cibilScore },
            ]},
            { title: 'Eligibility Assessment', fields: [
              { label: 'Overall Score', value: `${overallPct}%` },
              { label: 'Status', value: overallStatus },
              { label: 'Total Points', value: `${totalScore}/${maxScore}` },
              ...factors.map(f => ({ label: f.label, value: `${f.score}/${f.max} — ${f.note}` })),
            ]},
          ], studentName, applicationId ?? undefined)}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
        <button onClick={() => onNavigate('documents')} className="btn-secondary text-sm">
          Continue to Document Upload <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 bg-ob/6 rounded-xl flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-ob" />
        </div>
        <h3 className="font-semibold text-ob text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SummaryItem({ label, value, badge }: { label: string; value: string; badge?: string }) {
  return (
    <div>
      <div className="text-xs text-si font-medium mb-0.5">{label}</div>
      {badge ? (
        <span className={`badge text-sm ${badge}`}>{value}</span>
      ) : (
        <div className="text-sm font-medium text-ob">{value}</div>
      )}
    </div>
  );
}

function DocStatusRow({ doc }: { doc: DocStatus }) {
  const config = {
    uploaded: { icon: CheckCircle2, color: 'text-ob', bg: 'bg-si/20', label: 'Uploaded' },
    missing: { icon: XCircle, color: 'text-error-600', bg: 'bg-error-500/15', label: 'Missing' },
    verified: { icon: Award, color: 'text-success-600', bg: 'bg-success-500/15', label: 'Verified' },
    pending: { icon: Clock, color: 'text-si', bg: 'bg-sg/40', label: 'Pending Verification' },
  }[doc.status];
  const Icon = config.icon;
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-sg/10">
      <span className="text-sm text-ob/80">{doc.label}</span>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    </div>
  );
}

function RemarkItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs text-si font-medium uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm text-ob/80 leading-relaxed p-3 bg-sg/10 rounded-xl">
        {value || '—'}
      </div>
    </div>
  );
}
