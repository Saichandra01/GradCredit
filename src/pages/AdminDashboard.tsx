import { useState, useEffect } from 'react';
import {
  Users, FileText, CreditCard, CheckCircle2, Clock, XCircle,
  Search, Eye, Shield, ArrowLeft, GraduationCap, BarChart3, ChevronDown
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Row = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex items-start justify-between py-2 border-b border-sg/20 last:border-0 gap-3">
    <span className="text-si text-xs shrink-0 w-36">{label}</span>
    <span className="text-ob text-xs font-medium text-right">{value ?? '—'}</span>
  </div>
);

const EMP_LABELS: Record<string, string> = {
  salaried: 'Salaried', self_employed: 'Self-Employed', business_owner: 'Business Owner',
  government: 'Government', retired: 'Retired', professional: 'Professional', other: 'Other',
};

const VERIFY_COLORS: Record<string, string> = {
  pending: 'bg-sg/40 text-ob',
  under_review: 'bg-si/30 text-ob',
  verified: 'bg-success-500/15 text-success-600',
  rejected: 'bg-error-500/15 text-error-600',
};

const APP_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-sg/40 text-ob/60',
  submitted: 'bg-si/30 text-ob',
  under_review: 'bg-sg/40 text-ob',
  offer_received: 'bg-success-500/15 text-success-600',
  visa_applied: 'bg-si/30 text-ob',
  visa_approved: 'bg-success-500/20 text-success-700',
  enrolled: 'bg-ob text-pw',
};

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'applications' | 'co_applicants' | 'non_collateral' | 'documents' | 'consultations'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [coApplicants, setCoApplicants] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCoApp, setSelectedCoApp] = useState<any | null>(null);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [updatingVerify, setUpdatingVerify] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('co_applicants').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('consultations').select('*').order('created_at', { ascending: false }),
    ]).then(([a, c, d, con]) => {
      setApplications(a.data ?? []);
      setCoApplicants(c.data ?? []);
      setDocuments(d.data ?? []);
      setConsultations(con.data ?? []);
      setLoading(false);
    });
  }, []);

  const updateVerificationStatus = async (id: string, status: string) => {
    setUpdatingVerify(id);
    await supabase.from('co_applicants').update({ verification_status: status }).eq('id', id);
    setCoApplicants(p => p.map(c => c.id === id ? { ...c, verification_status: status } : c));
    if (selectedCoApp?.id === id) setSelectedCoApp((p: any) => ({ ...p, verification_status: status }));
    setUpdatingVerify(null);
  };

  const updateDocStatus = async (id: string, status: string) => {
    await supabase.from('documents').update({ status }).eq('id', id);
    setDocuments(p => p.map(d => d.id === id ? { ...d, status } : d));
  };

  const updateAppStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    setApplications(p => p.map(a => a.id === id ? { ...a, status } : a));
  };

  const filteredApps = applications.filter(a =>
    !search || a.preferred_country?.toLowerCase().includes(search.toLowerCase()) || a.id?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCoApps = coApplicants.filter(c =>
    !search || c.relationship?.toLowerCase().includes(search.toLowerCase()) || c.personal_info?.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="portal-theme min-h-screen bg-[#F6F7F9]">
      {/* Header */}
      <header className="bg-ob px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-pw" />
          </div>
          <div>
            <span className="font-bold text-pw text-base">Pathfinders Overseas</span>
            <span className="text-pw/40 text-xs ml-2">Admin Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-sg/40 text-ob text-xs"><Shield className="w-3 h-3" /> Admin</span>
          <button onClick={onBack} className="flex items-center gap-1.5 text-pw/60 hover:text-pw text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Applications', value: applications.length, icon: FileText, color: 'bg-sg/40 text-ob' },
              { label: 'Non-Collateral Apps', value: applications.filter(a => a.loan_type === 'non_collateral').length, icon: FileText, color: 'bg-si/30 text-ob' },
              { label: 'Co-Applicants', value: coApplicants.length, icon: Users, color: 'bg-success-500/15 text-success-600' },
              { label: 'Consultations', value: consultations.length, icon: CreditCard, color: 'bg-sg/40 text-ob' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-card border border-sg/50">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-ob">{value}</div>
                <div className="text-sm text-si mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-sg/50 shadow-card overflow-hidden">
            <div className="border-b border-sg/30 px-5 pt-1">
              <div className="flex gap-0.5">
                {([
                  { id: 'applications', label: 'Applications' },
                  { id: 'co_applicants', label: 'Co-Applicants' },
                  { id: 'non_collateral', label: 'Non-Collateral' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'consultations', label: 'Consultations' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSelectedCoApp(null); }}
                    className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-ob text-ob' : 'border-transparent text-si hover:text-ob'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-sg/30">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-si" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-9 py-2 text-sm" />
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-si">Loading data...</div>
            ) : (
              <>
                {/* Applications Tab */}
                {activeTab === 'applications' && (
                  <div>
                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-sg/20">
                          <tr>
                            {['Ref ID', 'Student', 'Co-Applicant', 'University', 'Country', 'Loan Type', 'Loan Amount', 'Status', ''].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ob/60 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sg/20">
                          {filteredApps.map(app => {
                            const pi = app.personal_info ?? {};
                            const studentName = `${pi.firstName ?? ''} ${pi.lastName ?? ''}`.trim() || '—';
                            const isExpanded = expandedApp === app.id;
                            const appCoApps = coApplicants.filter(c => c.application_id === app.id);
                            const coAppSummary = appCoApps.length > 0
                              ? `${appCoApps[0].personal_info?.firstName ?? ''} ${appCoApps[0].personal_info?.lastName ?? ''}`.trim() || appCoApps[0].relationship
                              : '—';
                            return (
                              <>
                                <tr key={app.id} className="hover:bg-sg/10 transition-colors cursor-pointer" onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
                                  <td className="px-4 py-3 font-mono text-xs text-ob/60">{app.id.slice(0, 8).toUpperCase()}</td>
                                  <td className="px-4 py-3 font-medium text-ob">{studentName}</td>
                                  <td className="px-4 py-3 text-ob/70 text-xs">{coAppSummary}</td>
                                  <td className="px-4 py-3 text-ob/70 text-xs truncate max-w-32">{app.preferred_university || app.non_collateral_details?.universityName || '—'}</td>
                                  <td className="px-4 py-3 font-medium text-ob">{app.preferred_country || '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`badge text-xs ${app.loan_type === 'non_collateral' ? 'bg-sg/40 text-ob' : 'bg-sg/40 text-ob/60'}`}>
                                      {app.loan_type === 'non_collateral' ? 'Non-Collateral' : 'Collateral'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-ob/70">{app.loan_amount ? `₹${Number(app.loan_amount).toLocaleString('en-IN')}` : '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`badge text-xs ${APP_STATUS_COLORS[app.status] ?? ''}`}>{app.status?.replace(/_/g, ' ')}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <button onClick={(e) => { e.stopPropagation(); setExpandedApp(isExpanded ? null : app.id); }} className="p-1 rounded hover:bg-sg/30 transition-colors">
                                      <ChevronDown className={`w-4 h-4 text-si transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr key={app.id + '-detail'}>
                                    <td colSpan={9} className="px-4 py-5 bg-sg/5">
                                      <div className="grid lg:grid-cols-2 gap-5">
                                        {/* Left column: Application details + status changer */}
                                        <div className="space-y-4">
                                          <div className="card p-4">
                                            <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Application Details</h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              <div className="text-si">Student:</div><div className="font-medium text-ob">{studentName}</div>
                                              <div className="text-si">Email:</div><div className="font-medium text-ob">{pi.email || '—'}</div>
                                              <div className="text-si">Phone:</div><div className="font-medium text-ob">{pi.phone || '—'}</div>
                                              <div className="text-si">Course:</div><div className="font-medium text-ob">{app.preferred_course || '—'}</div>
                                              <div className="text-si">University:</div><div className="font-medium text-ob">{app.preferred_university || app.non_collateral_details?.universityName || '—'}</div>
                                              <div className="text-si">Loan Amount:</div><div className="font-medium text-ob">{app.loan_amount ? `₹${Number(app.loan_amount).toLocaleString('en-IN')}` : '—'}</div>
                                              <div className="text-si">Loan Type:</div>
                                              <div>
                                                <span className={`badge text-xs ${app.loan_type === 'non_collateral' ? 'bg-sg/40 text-ob' : 'bg-sg/40 text-ob/60'}`}>
                                                  {app.loan_type === 'non_collateral' ? 'Non-Collateral' : 'Collateral'}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-sg/20">
                                              <label className="text-xs text-si block mb-1">Update Status</label>
                                              <select
                                                value={app.status}
                                                onChange={e => updateAppStatus(app.id, e.target.value)}
                                                className="text-xs border border-sg rounded-lg px-2 py-1.5 appearance-none bg-white w-full"
                                              >
                                                {['draft','submitted','under_review','offer_received','visa_applied','visa_approved','enrolled'].map(s => (
                                                  <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>

                                          {/* Collateral-specific: Property details */}
                                          {app.loan_type !== 'non_collateral' && pi.collateral && (
                                            <div className="card p-4">
                                              <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Property / Collateral Details</h4>
                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-si">Type:</div><div className="font-medium text-ob">{pi.collateral.collateralType || '—'}</div>
                                                {pi.collateral.propertyType && (<><div className="text-si">Property Type:</div><div className="font-medium text-ob">{pi.collateral.propertyType}</div></>)}
                                                {pi.collateral.propertyMarketValue && (<><div className="text-si">Market Value:</div><div className="font-medium text-ob">₹{Number(pi.collateral.propertyMarketValue).toLocaleString('en-IN')}</div></>)}
                                                {pi.collateral.propertyOwner && (<><div className="text-si">Owner:</div><div className="font-medium text-ob">{pi.collateral.propertyOwner}</div></>)}
                                                {pi.collateral.propertyOwnerRelation && (<><div className="text-si">Relation:</div><div className="font-medium text-ob">{pi.collateral.propertyOwnerRelation}</div></>)}
                                                {pi.collateral.propertyAddress && (<><div className="text-si">Address:</div><div className="font-medium text-ob">{pi.collateral.propertyAddress}</div></>)}
                                                {pi.collateral.fdBank && (<><div className="text-si">FD Bank:</div><div className="font-medium text-ob">{pi.collateral.fdBank}</div></>)}
                                                {pi.collateral.fdAmount && (<><div className="text-si">FD Amount:</div><div className="font-medium text-ob">₹{Number(pi.collateral.fdAmount).toLocaleString('en-IN')}</div></>)}
                                              </div>
                                              <div className="mt-2 flex flex-wrap gap-1">
                                                {['Property Documents (Title Deed)', 'EC (Encumbrance Certificate)', 'Property Tax Receipt', 'FD Certificate', 'LIC Policy Document'].map(doc => {
                                                  const uploaded = documents.find(d => d.application_id === app.id && d.document_type === doc);
                                                  return (
                                                    <span key={doc} className={`badge text-xs ${uploaded ? 'bg-success-500/15 text-success-600' : 'bg-sg/30 text-si'}`}>
                                                      {uploaded ? '✓' : '○'} {doc.split(' (')[0]}
                                                    </span>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Right column: Non-collateral or co-applicant details */}
                                        <div className="space-y-4">
                                          {/* Non-collateral specific */}
                                          {app.loan_type === 'non_collateral' && app.non_collateral_details && (
                                            <div className="card p-4">
                                              <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Non-Collateral Academic Profile</h4>
                                              <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="text-si">University:</div><div className="font-medium text-ob">{app.non_collateral_details.universityName || '—'}</div>
                                                <div className="text-si">QS Ranking:</div><div className="font-medium text-ob">{app.non_collateral_details.universityRanking ? `#${app.non_collateral_details.universityRanking}` : '—'}</div>
                                                <div className="text-si">Degree:</div><div className="font-medium text-ob">{app.non_collateral_details.degree || '—'}</div>
                                                <div className="text-si">Admission:</div><div className="font-medium text-ob">{app.non_collateral_details.admissionStatus || '—'}</div>
                                                <div className="text-si">10th Score:</div><div className="font-medium text-ob">{app.non_collateral_details.class10Score ? `${app.non_collateral_details.class10Score}%` : '—'}</div>
                                                <div className="text-si">12th Score:</div><div className="font-medium text-ob">{app.non_collateral_details.class12Score ? `${app.non_collateral_details.class12Score}%` : '—'}</div>
                                                <div className="text-si">Grad Score:</div><div className="font-medium text-ob">{app.non_collateral_details.graduationScore || '—'}</div>
                                                {app.non_collateral_details.ieltsScore && (<><div className="text-si">IELTS:</div><div className="font-medium text-ob">{app.non_collateral_details.ieltsScore}</div></>)}
                                                {app.non_collateral_details.greScore && (<><div className="text-si">GRE:</div><div className="font-medium text-ob">{app.non_collateral_details.greScore}</div></>)}
                                              </div>
                                              {app.non_collateral_details.eligibilityRating && (
                                                <div className={`mt-3 p-3 rounded-xl border ${app.non_collateral_details.eligibilityRating === 'Excellent' ? 'bg-success-500/15 border-success-500/30' : app.non_collateral_details.eligibilityRating === 'Good' ? 'bg-si/20 border-sg/50' : app.non_collateral_details.eligibilityRating === 'Fair' ? 'bg-sg/30 border-sg/50' : 'bg-error-500/15 border-error-500/30'}`}>
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs text-si">Eligibility Assessment</span>
                                                    <span className={`font-bold text-sm ${app.non_collateral_details.eligibilityRating === 'Excellent' ? 'text-success-600' : app.non_collateral_details.eligibilityRating === 'Good' ? 'text-ob' : app.non_collateral_details.eligibilityRating === 'Fair' ? 'text-si' : 'text-error-600'}`}>
                                                      {app.non_collateral_details.eligibilityRating} ({app.non_collateral_details.eligibilityScore}%)
                                                    </span>
                                                  </div>
                                                  <p className="text-xs text-si mt-1">Preliminary assessment only — does not auto-approve or reject.</p>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Co-Applicant Financial Profile */}
                                          {appCoApps.length > 0 && (
                                            <div className="card p-4">
                                              <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Co-Applicant Financial Profile</h4>
                                              {appCoApps.map((ca, i) => (
                                                <div key={ca.id} className={i > 0 ? 'mt-3 pt-3 border-t border-sg/20' : ''}>
                                                  <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-ob text-xs">{ca.personal_info?.firstName} {ca.personal_info?.lastName}</span>
                                                    <span className={`badge text-xs ${VERIFY_COLORS[ca.verification_status] ?? ''}`}>{ca.verification_status}</span>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                                                    <div className="text-si">Relationship:</div><div className="font-medium text-ob">{ca.relationship}</div>
                                                    <div className="text-si">Employment:</div><div className="font-medium text-ob">{EMP_LABELS[ca.employment_type] ?? ca.employment_type}</div>
                                                    {ca.employment_info?.companyName && (<><div className="text-si">Company:</div><div className="font-medium text-ob">{ca.employment_info.companyName}</div></>)}
                                                    {ca.employment_info?.businessName && (<><div className="text-si">Business:</div><div className="font-medium text-ob">{ca.employment_info.businessName}</div></>)}
                                                    {ca.employment_info?.monthlyGross && (<><div className="text-si">Monthly Income:</div><div className="font-medium text-ob">₹{Number(ca.employment_info.monthlyGross).toLocaleString('en-IN')}</div></>)}
                                                    {ca.employment_info?.annualIncome && (<><div className="text-si">Annual Income:</div><div className="font-medium text-ob">₹{Number(ca.employment_info.annualIncome).toLocaleString('en-IN')}</div></>)}
                                                    {ca.financial_info?.cibilScore && (<><div className="text-si">CIBIL:</div><div className="font-medium text-ob">{ca.financial_info.cibilScore}</div></>)}
                                                    {ca.financial_info?.monthlyEMI && (<><div className="text-si">Monthly EMI:</div><div className="font-medium text-ob">₹{Number(ca.financial_info.monthlyEMI).toLocaleString('en-IN')}</div></>)}
                                                    {ca.financial_info?.savings && (<><div className="text-si">Savings:</div><div className="font-medium text-ob">₹{Number(ca.financial_info.savings).toLocaleString('en-IN')}</div></>)}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Document status */}
                                          <div className="card p-4">
                                            <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Required Documents Status</h4>
                                            {(() => {
                                              const appDocs = documents.filter(d => d.application_id === app.id);
                                              return appDocs.length === 0 ? (
                                                <p className="text-si text-xs">No documents uploaded.</p>
                                              ) : (
                                                <div className="space-y-1.5">
                                                  {appDocs.slice(0, 8).map(doc => (
                                                    <div key={doc.id} className="flex items-center justify-between text-xs">
                                                      <span className="text-ob truncate flex-1">{doc.document_type}</span>
                                                      <span className={`badge text-xs ml-2 ${doc.status === 'approved' ? 'bg-success-500/15 text-success-600' : doc.status === 'rejected' ? 'bg-error-500/15 text-error-600' : doc.status === 'under_review' ? 'bg-si/30 text-ob' : 'bg-sg/40 text-ob'}`}>{doc.status}</span>
                                                    </div>
                                                  ))}
                                                  {appDocs.length > 8 && <div className="text-xs text-si pt-1">+{appDocs.length - 8} more</div>}
                                                </div>
                                              );
                                            })()}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                          {filteredApps.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-si text-sm">No applications found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Co-Applicants Tab */}
                {activeTab === 'co_applicants' && (
                  <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-sg/30">
                    {/* List */}
                    <div className="lg:col-span-2 overflow-y-auto max-h-[60vh]">
                      <div className="divide-y divide-sg/20">
                        {filteredCoApps.map(ca => (
                          <button
                            key={ca.id}
                            onClick={() => setSelectedCoApp(ca)}
                            className={`w-full px-5 py-4 flex items-start gap-3 hover:bg-sg/10 transition-colors text-left ${selectedCoApp?.id === ca.id ? 'bg-sg/20' : ''}`}
                          >
                            <div className="w-10 h-10 bg-sg/30 rounded-full flex items-center justify-center shrink-0">
                              <span className="font-bold text-ob/60 text-sm">
                                {(ca.personal_info?.firstName || 'C')[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-ob text-sm truncate">
                                {ca.personal_info?.firstName ? `${ca.personal_info.firstName} ${ca.personal_info.lastName ?? ''}`.trim() : 'Co-Applicant'}
                              </div>
                              <div className="text-xs text-si mt-0.5">{ca.relationship} · {EMP_LABELS[ca.employment_type] ?? ca.employment_type}</div>
                              <span className={`badge text-xs mt-1 ${VERIFY_COLORS[ca.verification_status] ?? ''}`}>{ca.verification_status}</span>
                            </div>
                            <Eye className="w-4 h-4 text-sg shrink-0 mt-1" />
                          </button>
                        ))}
                        {filteredCoApps.length === 0 && (
                          <div className="p-8 text-center text-si text-sm">No co-applicants found.</div>
                        )}
                      </div>
                    </div>

                    {/* Detail panel */}
                    <div className="lg:col-span-3 p-6 overflow-y-auto max-h-[60vh]">
                      {!selectedCoApp ? (
                        <div className="h-full flex items-center justify-center text-si">
                          <div className="text-center">
                            <Users className="w-10 h-10 text-sg mx-auto mb-2" />
                            <p className="text-sm">Select a co-applicant to view details</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-ob text-base">
                                {selectedCoApp.personal_info?.firstName ? `${selectedCoApp.personal_info.firstName} ${selectedCoApp.personal_info.lastName ?? ''}`.trim() : 'Co-Applicant'}
                              </h3>
                              <div className="text-si text-sm">{selectedCoApp.relationship} · {EMP_LABELS[selectedCoApp.employment_type] ?? selectedCoApp.employment_type}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`badge text-xs ${VERIFY_COLORS[selectedCoApp.verification_status] ?? ''}`}>{selectedCoApp.verification_status}</span>
                              <div className="flex gap-1.5">
                                {['pending', 'under_review', 'verified', 'rejected'].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => updateVerificationStatus(selectedCoApp.id, s)}
                                    disabled={updatingVerify === selectedCoApp.id || selectedCoApp.verification_status === s}
                                    className={`px-2 py-1 text-xs rounded-lg border transition-all ${selectedCoApp.verification_status === s ? 'bg-ob text-pw border-ob' : 'border-sg hover:border-ob/30 text-ob/60'}`}
                                  >
                                    {s.replace('_', ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Personal Info */}
                          <div className="card p-4">
                            <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Personal Information</h4>
                            <Row label="Full Name" value={`${selectedCoApp.personal_info?.firstName ?? ''} ${selectedCoApp.personal_info?.lastName ?? ''}`.trim()} />
                            <Row label="Mobile" value={selectedCoApp.personal_info?.phone} />
                            <Row label="Email" value={selectedCoApp.personal_info?.email} />
                            <Row label="Aadhaar" value={selectedCoApp.personal_info?.aadhaar} />
                            <Row label="PAN" value={selectedCoApp.personal_info?.pan} />
                            <Row label="Date of Birth" value={selectedCoApp.personal_info?.dob} />
                            <Row label="Nationality" value={selectedCoApp.personal_info?.nationality} />
                          </div>

                          {/* Employment */}
                          <div className="card p-4">
                            <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Employment Details</h4>
                            <Row label="Type" value={EMP_LABELS[selectedCoApp.employment_type] ?? selectedCoApp.employment_type} />
                            {selectedCoApp.employment_info && Object.entries(selectedCoApp.employment_info).map(([k, v]) => (
                              <Row key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={String(v)} />
                            ))}
                          </div>

                          {/* Financial Profile */}
                          <div className="card p-4">
                            <h4 className="font-semibold text-ob text-xs uppercase tracking-wide mb-3">Financial Profile</h4>
                            {selectedCoApp.financial_info && (
                              <>
                                <Row label="CIBIL Score" value={selectedCoApp.financial_info.cibilScore} />
                                <Row label="Monthly EMI" value={selectedCoApp.financial_info.monthlyEMI ? `₹${Number(selectedCoApp.financial_info.monthlyEMI).toLocaleString('en-IN')}` : undefined} />
                                <Row label="Household Expenses" value={selectedCoApp.financial_info.householdExpenses ? `₹${Number(selectedCoApp.financial_info.householdExpenses).toLocaleString('en-IN')}` : undefined} />
                                <Row label="Savings" value={selectedCoApp.financial_info.savings ? `₹${Number(selectedCoApp.financial_info.savings).toLocaleString('en-IN')}` : undefined} />
                                <Row label="Fixed Deposits" value={selectedCoApp.financial_info.fixedDeposits ? `₹${Number(selectedCoApp.financial_info.fixedDeposits).toLocaleString('en-IN')}` : undefined} />
                                <Row label="Investments" value={selectedCoApp.financial_info.investments ? `₹${Number(selectedCoApp.financial_info.investments).toLocaleString('en-IN')}` : undefined} />
                                <Row label="Other Liabilities" value={selectedCoApp.financial_info.otherLiabilities} />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-sg/20">
                        <tr>
                          {['Document Type', 'File Name', 'Uploaded', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ob/60 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sg/20">
                        {documents.map(doc => (
                          <tr key={doc.id} className="hover:bg-sg/10">
                            <td className="px-4 py-3 font-medium text-ob text-sm">{doc.document_type}</td>
                            <td className="px-4 py-3 text-ob/70 text-sm truncate max-w-48">{doc.file_name}</td>
                            <td className="px-4 py-3 text-si text-xs">{new Date(doc.created_at).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <span className={`badge text-xs ${doc.status === 'approved' ? 'bg-success-500/15 text-success-600' : doc.status === 'rejected' ? 'bg-error-500/15 text-error-600' : doc.status === 'under_review' ? 'bg-si/30 text-ob' : 'bg-sg/40 text-ob'}`}>
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                {['under_review', 'approved', 'rejected'].map(s => (
                                  <button key={s} onClick={() => updateDocStatus(doc.id, s)} className={`px-2 py-0.5 text-xs rounded border transition-all ${doc.status === s ? 'bg-ob text-pw border-ob' : 'border-sg hover:border-ob/30 text-ob/50'}`}>
                                    {s.replace('_', ' ')}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {documents.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-si text-sm">No documents uploaded.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Non-Collateral Tab */}
                {activeTab === 'non_collateral' && (
                  <div className="divide-y divide-sg/20">
                    {applications.filter(a => a.loan_type === 'non_collateral').length === 0 ? (
                      <div className="p-10 text-center text-si text-sm">No non-collateral loan applications found.</div>
                    ) : applications.filter(a => a.loan_type === 'non_collateral').map(app => {
                      const ncd = app.non_collateral_details ?? {};
                      return (
                        <div key={app.id} className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-ob/50">{app.id.slice(0, 8).toUpperCase()}</span>
                                <span className="badge text-xs bg-sg/40 text-ob">Non-Collateral</span>
                                <span className={`badge text-xs ${APP_STATUS_COLORS[app.status] ?? ''}`}>{app.status?.replace(/_/g, ' ')}</span>
                                {ncd.eligibilityRating && (
                                  <span className={`badge text-xs ${
                                    ncd.eligibilityRating === 'Excellent' ? 'bg-success-500/15 text-success-600' :
                                    ncd.eligibilityRating === 'Good' ? 'bg-si/30 text-ob' :
                                    ncd.eligibilityRating === 'Fair' ? 'bg-sg/40 text-ob' : 'bg-error-500/15 text-error-600'
                                  }`}>Eligibility: {ncd.eligibilityRating} ({ncd.eligibilityScore}%)</span>
                                )}
                              </div>
                              <div className="text-sm font-semibold text-ob mt-1">{ncd.universityName || app.preferred_university || '—'}</div>
                              <div className="text-xs text-si">{ncd.courseName || app.preferred_course || '—'} · {ncd.degree || ''} · {ncd.countryOfStudy || app.preferred_country || '—'}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs text-si">Loan Amount</div>
                              <div className="font-bold text-ob">{app.loan_amount ? `₹${Number(app.loan_amount).toLocaleString('en-IN')}` : '—'}</div>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                              ['QS Ranking', ncd.universityRanking ? `#${ncd.universityRanking}` : '—'],
                              ['Admission', ncd.admissionStatus || '—'],
                              ['Duration', ncd.courseDuration || '—'],
                              ['10th Score', ncd.class10Score ? `${ncd.class10Score}%` : '—'],
                              ['12th Score', ncd.class12Score ? `${ncd.class12Score}%` : '—'],
                              ['Grad Score', ncd.graduationScore || '—'],
                            ].map(([label, value]) => (
                              <div key={label} className="bg-sg/10 rounded-xl p-3 text-center">
                                <div className="text-xs text-si">{label}</div>
                                <div className="font-semibold text-ob text-sm">{value}</div>
                              </div>
                            ))}
                          </div>

                          {(ncd.ieltsScore || ncd.greScore || ncd.gmatScore) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {ncd.ieltsScore && <span className="badge bg-sg/30 text-ob/70 text-xs">IELTS: {ncd.ieltsScore}</span>}
                              {ncd.toeflScore && <span className="badge bg-sg/30 text-ob/70 text-xs">TOEFL: {ncd.toeflScore}</span>}
                              {ncd.greScore && <span className="badge bg-sg/30 text-ob/70 text-xs">GRE: {ncd.greScore}</span>}
                              {ncd.gmatScore && <span className="badge bg-sg/30 text-ob/70 text-xs">GMAT: {ncd.gmatScore}</span>}
                              {ncd.scholarshipDetails && <span className="badge bg-success-500/15 text-success-600 text-xs">Scholarship: {ncd.scholarshipDetails}</span>}
                              {ncd.estimatedSalary && <span className="badge bg-sg/30 text-ob/70 text-xs">Est. Salary: ₹{Number(ncd.estimatedSalary).toLocaleString('en-IN')}/yr</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Consultations Tab */}
                {activeTab === 'consultations' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-sg/20">
                        <tr>
                          {['Name', 'Email', 'Phone', 'Country', 'Course', 'Date', 'Counselor', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ob/60 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sg/20">
                        {consultations.map(c => (
                          <tr key={c.id} className="hover:bg-sg/10">
                            <td className="px-4 py-3 font-medium text-ob">{c.name}</td>
                            <td className="px-4 py-3 text-ob/70 text-xs">{c.email}</td>
                            <td className="px-4 py-3 text-ob/70">{c.phone}</td>
                            <td className="px-4 py-3 text-ob/70">{c.preferred_country || '—'}</td>
                            <td className="px-4 py-3 text-ob/70">{c.course_interest || '—'}</td>
                            <td className="px-4 py-3 text-xs text-si">{c.preferred_date ? new Date(c.preferred_date).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="px-4 py-3 text-xs text-ob/70">{c.counselor_name || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`badge text-xs ${c.status === 'confirmed' ? 'bg-success-500/15 text-success-600' : c.status === 'completed' ? 'bg-sg/40 text-ob/60' : 'bg-sg/40 text-ob'}`}>{c.status}</span>
                            </td>
                          </tr>
                        ))}
                        {consultations.length === 0 && (
                          <tr><td colSpan={8} className="px-4 py-8 text-center text-si text-sm">No consultation bookings.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
