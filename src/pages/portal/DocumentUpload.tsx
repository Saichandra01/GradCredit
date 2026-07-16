import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Clock, XCircle, Trash2, AlertCircle, Eye, Download, RefreshCw, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { NavId } from '../Portal';

interface Props { applicationId: string | null; onNavigate: (id: NavId) => void; onStepComplete: (id: NavId) => void; }

const DOC_CATEGORIES = [
  { group: 'Student Identity', docs: ['Passport (Front & Back)', 'Aadhaar Card (Student)', 'PAN Card (Student)', 'Passport-size Photo (Student)', 'Signature (Student)'] },
  { group: 'Academic Documents', docs: ['10th Marksheet', '12th Marksheet', 'Graduation Certificate', 'Graduation Transcripts', 'Masters Transcript (if applicable)', 'IELTS / TOEFL Score', 'GRE / GMAT / SAT Score'] },
  { group: 'Admission Documents', docs: ['Offer Letter / Admission Confirmation', 'I-20 / CAS / CoE (if received)', 'SOP (Statement of Purpose)', 'LOR 1 (Letter of Recommendation)', 'LOR 2 (Letter of Recommendation)'] },
  { group: 'Co-Applicant Documents', docs: ['Co-Applicant Aadhaar Card', 'Co-Applicant PAN Card', 'Co-Applicant Passport-size Photo', 'Co-Applicant Signature', 'Salary Slips (Last 6 Months)', 'Form 16', 'Employment ID Card', 'Income Tax Returns (Last 2 Years)', 'Bank Statements (Last 12 Months)'] },
  { group: 'Business / Self-Employment (if applicable)', docs: ['GST Certificate', 'Business Registration Certificate', 'Profit & Loss Statement', 'Balance Sheet', 'Business Bank Statements', 'CA Certified Financial Statements', 'ITR with P&L Computation'] },
  { group: 'Collateral Documents (if applicable)', docs: ['Property Documents (Title Deed)', 'EC (Encumbrance Certificate)', 'Property Tax Receipt', 'FD Certificate', 'LIC Policy Document'] },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2; bg: string }> = {
  pending: { label: 'Pending Review', color: 'text-si', icon: Clock, bg: 'bg-sg/40' },
  under_review: { label: 'Under Review', color: 'text-ob', icon: Clock, bg: 'bg-si/20' },
  approved: { label: 'Approved', color: 'text-success-600', icon: CheckCircle2, bg: 'bg-success-500/15' },
  rejected: { label: 'Rejected', color: 'text-error-500', icon: XCircle, bg: 'bg-error-500/15' },
};

export default function DocumentUpload({ applicationId, onNavigate, onStepComplete }: Props) {
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState('');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [replaceDoc, setReplaceDoc] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (data) setDocs(data);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) { setError('Please select a document type first.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return; }
    setUploading(true); setError('');
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { setError('Not authenticated.'); setUploading(false); return; }

    const path = `${userId}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageErr } = await supabase.storage.from('documents').upload(path, file, { upsert: false });
    const fileUrl = storageErr ? path : supabase.storage.from('documents').getPublicUrl(storageData!.path).data.publicUrl;

    await supabase.from('documents').insert({
      user_id: userId,
      application_id: applicationId,
      document_type: selectedType,
      file_name: file.name,
      file_url: fileUrl,
      status: 'pending',
    });

    setUploading(false);
    setSelectedType('');
    if (fileRef.current) fileRef.current.value = '';
    onStepComplete('documents');
    load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocs(p => p.filter(d => d.id !== id));
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceDoc) return;
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return; }
    setUploading(true); setError('');
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { setError('Not authenticated.'); setUploading(false); return; }

    const path = `${userId}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageErr } = await supabase.storage.from('documents').upload(path, file, { upsert: false });
    const fileUrl = storageErr ? path : supabase.storage.from('documents').getPublicUrl(storageData!.path).data.publicUrl;

    await supabase.from('documents').update({
      file_name: file.name,
      file_url: fileUrl,
      status: 'pending',
    }).eq('id', replaceDoc.id);

    setUploading(false);
    setReplaceDoc(null);
    if (replaceRef.current) replaceRef.current.value = '';
    load();
  };

  const handleDownload = async (doc: any) => {
    try {
      // Try to get a signed URL for private storage, or use public URL
      const url = doc.file_url;
      if (url && url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Try creating a signed URL from the path
        const { data } = await supabase.storage.from('documents').createSignedUrl(url, 300);
        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      setError('Could not download file. Please try again.');
    }
  };

  const handlePreview = (doc: any) => setPreviewDoc(doc);

  const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isPdf = (fileName: string) => /\.pdf$/i.test(fileName);

  const uploadedTypes = new Set(docs.map(d => d.document_type));
  const totalRequired = DOC_CATEGORIES.slice(0, 3).flatMap(c => c.docs).length;
  const uploadedRequired = DOC_CATEGORIES.slice(0, 3).flatMap(c => c.docs).filter(d => uploadedTypes.has(d)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-pw text-sm">Upload Progress</h3>
          <span className="font-bold text-pw">{uploadedRequired}/{totalRequired} core documents</span>
        </div>
        <div className="w-full bg-sg/30 rounded-full h-2">
          <div className="bg-ob h-2 rounded-full transition-all duration-500" style={{ width: `${(uploadedRequired / totalRequired) * 100}%` }} />
        </div>
        <p className="text-si text-xs mt-2">Upload all student identity, academic, and admission documents to proceed.</p>
      </div>

      {/* Upload widget */}
      <div className="card p-6">
        <h3 className="font-semibold text-pw mb-4">Upload a Document</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Document Type <span className="text-error-500">*</span></label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="input-field appearance-none">
              <option value="">Select document type</option>
              {DOC_CATEGORIES.map(cat => (
                <optgroup key={cat.group} label={cat.group}>
                  {cat.docs.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="label">File (PDF, JPG, PNG – max 10MB)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleUpload}
              disabled={uploading || !selectedType}
              className="input-field file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-ob/10 file:text-ob hover:file:bg-ob/20 disabled:opacity-50 text-sm"
            />
          </div>
        </div>
        {uploading && <div className="flex items-center gap-2 mt-3 text-sm text-ob"><div className="w-4 h-4 border-2 border-ob border-t-transparent rounded-full animate-spin" /> Uploading...</div>}
        {error && <div className="flex items-center gap-2 mt-3 p-3 bg-error-500/10 border border-error-500/20 rounded-xl text-error-500 text-sm"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
      </div>

      {/* Checklist by category */}
      <div className="grid sm:grid-cols-2 gap-4">
        {DOC_CATEGORIES.map(cat => (
          <div key={cat.group} className="card p-4">
            <h4 className="font-semibold text-pw text-xs mb-3 uppercase tracking-wide">{cat.group}</h4>
            <div className="space-y-2">
              {cat.docs.map(doc => {
                const uploaded = uploadedTypes.has(doc);
                const docData = docs.find(d => d.document_type === doc);
                return (
                  <div key={doc} className="flex items-center gap-2 text-xs">
                    {uploaded
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-success-600 shrink-0" />
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-sg shrink-0" />}
                    <span className={`flex-1 truncate ${uploaded ? 'text-pw' : 'text-si'}`}>{doc}</span>
                    {uploaded && docData && (
                      <span className={`text-xs font-medium ${statusConfig[docData.status]?.color ?? ''}`}>{statusConfig[docData.status]?.label ?? ''}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Uploaded documents list */}
      {docs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-sg/50">
            <h3 className="font-semibold text-pw">Uploaded Documents ({docs.length})</h3>
          </div>
          <div className="divide-y divide-edge">
            {docs.map(doc => {
              const s = statusConfig[doc.status] ?? statusConfig.pending;
              const Icon = s.icon;
              return (
                <div key={doc.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-9 h-9 bg-sg/30 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-si" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-pw text-sm truncate">{doc.document_type}</div>
                    <div className="text-xs text-si truncate">{doc.file_name} • {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 text-xs font-medium shrink-0 px-2 py-1 rounded-full ${s.bg} ${s.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-1.5 rounded-lg hover:bg-ob/10 text-si hover:text-ob transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg hover:bg-ob/10 text-si hover:text-ob transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReplaceDoc(doc)}
                      className="p-1.5 rounded-lg hover:bg-sg/40 text-si hover:text-ob transition-colors"
                      title="Replace"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg hover:bg-error-500/10 text-si hover:text-error-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden replace file input */}
      <input
        ref={replaceRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleReplace}
        className="hidden"
      />

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ob/80 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewDoc(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl border border-sg/50 shadow-premium overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-sg/50">
              <div className="min-w-0">
                <h3 className="font-semibold text-pw text-sm truncate">{previewDoc.document_type}</h3>
                <p className="text-xs text-si truncate">{previewDoc.file_name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="p-2 rounded-lg hover:bg-ob/10 text-si hover:text-ob transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg hover:bg-white/5 text-si hover:text-pw transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto scrollbar-hide">
              {isImage(previewDoc.file_name) ? (
                <img src={previewDoc.file_url} alt={previewDoc.file_name} className="w-full h-auto rounded-lg" />
              ) : isPdf(previewDoc.file_name) ? (
                <iframe src={previewDoc.file_url} className="w-full h-[60vh] rounded-lg bg-white" title={previewDoc.file_name} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-12 h-12 text-si mb-3" />
                  <p className="text-sm text-si mb-4">Preview not available for this file type.</p>
                  <button onClick={() => handleDownload(previewDoc)} className="btn-primary text-sm">
                    <Download className="w-4 h-4" /> Download to View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Replace confirmation modal */}
      {replaceDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-ob/80 backdrop-blur-sm animate-fade-in" onClick={() => setReplaceDoc(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-sg/50 shadow-premium p-6 animate-scale-in">
            <h3 className="font-semibold text-pw text-base mb-2">Replace Document</h3>
            <p className="text-si text-sm mb-4">
              You're replacing <span className="text-pw font-medium">{replaceDoc.document_type}</span>.
              The current file ({replaceDoc.file_name}) will be replaced and the status will be reset to Pending Review.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setReplaceDoc(null); if (replaceRef.current) replaceRef.current.value = ''; }}
                className="btn-secondary text-sm flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={() => replaceRef.current?.click()}
                className="btn-primary text-sm flex-1 justify-center"
              >
                <Upload className="w-4 h-4" /> Choose New File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
