import { Download, Save, RefreshCw } from 'lucide-react';
import type { PdfSection } from '../../lib/pdf';
import { downloadSectionPdf } from '../../lib/pdf';

interface Props {
  title: string;
  studentName?: string;
  applicationId?: string;
  sections: PdfSection[];
  onSave?: () => void;
  onUpdate?: () => void;
  saving?: boolean;
  saved?: boolean;
  saveLabel?: string;
  updateLabel?: string;
}

export default function SectionActions({
  title,
  studentName = 'Student',
  applicationId,
  sections,
  onSave,
  onUpdate,
  saving,
  saved,
  saveLabel = 'Save',
  updateLabel = 'Update',
}: Props) {
  const handleDownload = () => downloadSectionPdf(sections, studentName, applicationId);

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {onSave && (
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ob text-pw font-semibold rounded-xl
                     hover:bg-ob/90 active:scale-95 transition-all duration-200 text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : saveLabel}
        </button>
      )}
      {onUpdate && (
        <button
          onClick={onUpdate}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ob text-pw font-semibold rounded-xl
                     hover:bg-[#444444] active:scale-95 transition-all duration-200 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          {saved ? 'Updated!' : updateLabel}
        </button>
      )}
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-sg text-ob font-semibold rounded-xl
                   border border-sg hover:bg-si/30 active:scale-95 transition-all duration-200 text-sm"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </button>
    </div>
  );
}
