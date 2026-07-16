import { Phone, Mail, MessageCircle, Book, FileText, Video, ChevronRight } from 'lucide-react';
import type { NavId } from '../Portal';

const guides = [
  { title: 'How to Complete Your Application', desc: 'Step-by-step guide to filling out each section of your application.', id: 'personal' as NavId },
  { title: 'Adding a Co-Applicant', desc: 'Learn how to add your parent/guardian as a co-applicant for the education loan.', id: 'co_applicant' as NavId },
  { title: 'Document Upload Guide', desc: 'Which documents are required and in what format to upload them.', id: 'documents' as NavId },
  { title: 'Understanding Loan Options', desc: 'Compare secured vs unsecured loans, tenures, and interest rates.', id: 'loan_pref' as NavId },
];

const faqs = [
  { q: 'How long does the loan approval process take?', a: 'It typically takes 5–21 days depending on the bank. NBFCs are faster (5–7 days), while public sector banks take 15–21 days.' },
  { q: 'What is the maximum loan amount I can get?', a: 'You can get up to ₹1.5 Crore with collateral through our partner banks. Unsecured loans go up to ₹75 Lakhs for strong profiles.' },
  { q: 'Can I apply to multiple banks simultaneously?', a: 'Yes. We help you apply to multiple banks at once to maximise your approval chances and get the best terms.' },
  { q: 'What documents does my co-applicant need?', a: 'Aadhaar, PAN, salary slips (6 months), Form 16, bank statements (12 months), and ITR (2 years) for salaried co-applicants.' },
  { q: 'How do I track my visa application?', a: 'Your counselor will update the status on your dashboard. You can also track directly on the embassy/VFS website.' },
  { q: 'Is my data safe?', a: 'All your data is encrypted and stored securely in Supabase. We never share your information with third parties without your consent.' },
];

export default function HelpSupport({ onNavigate }: { onNavigate: (id: NavId) => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Contact options */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, label: 'Call Us', detail: '+91 800 123 4567', sub: 'Mon–Sat, 9AM–7PM', action: () => window.open('tel:+918001234567') },
          { icon: Mail, label: 'Email Support', detail: 'support@pathfindersoverseas.com', sub: 'Reply within 24 hours', action: () => window.open('mailto:support@pathfindersoverseas.com') },
          { icon: MessageCircle, label: 'WhatsApp', detail: 'Chat with us', sub: 'Instant support', action: () => window.open('https://wa.me/918001234567') },
        ].map(({ icon: Icon, label, detail, sub, action }) => (
          <button key={label} onClick={action} className="card p-5 flex flex-col items-center text-center gap-3 hover:shadow-card-hover transition-all">
            <div className="w-11 h-11 bg-sg/30 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-ob/60" />
            </div>
            <div>
              <div className="font-semibold text-ob text-sm">{label}</div>
              <div className="text-ob/70 text-xs">{detail}</div>
              <div className="text-si text-xs">{sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick guides */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-sg/30">
          <h3 className="font-semibold text-ob">Quick Guides</h3>
        </div>
        <div className="divide-y divide-sg/30">
          {guides.map(({ title, desc, id }) => (
            <button key={title} onClick={() => onNavigate(id)} className="w-full px-5 py-4 flex items-start gap-3 hover:bg-sg/10 transition-colors text-left">
              <div className="w-8 h-8 bg-sg/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Book className="w-4 h-4 text-ob/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ob text-sm">{title}</div>
                <div className="text-si text-xs mt-0.5">{desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-sg shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="card p-5">
        <h3 className="font-semibold text-ob mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q}>
              <div className="font-medium text-ob text-sm mb-1">{q}</div>
              <div className="text-si text-xs leading-relaxed">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Office hours */}
      <div className="card p-5 bg-ob text-pw">
        <h3 className="font-semibold text-pw mb-3">Office Hours & Address</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-pw/50 text-xs mb-1">Working Hours</div>
            <div className="text-pw">Monday – Saturday: 9:00 AM – 7:00 PM</div>
            <div className="text-pw/50 text-xs mt-0.5">Closed on Sundays & National Holidays</div>
          </div>
          <div>
            <div className="text-pw/50 text-xs mb-1">Office Address</div>
            <div className="text-pw">3rd Floor, Prestige Tower</div>
            <div className="text-pw">MG Road, Bangalore – 560001</div>
          </div>
        </div>
      </div>
    </div>
  );
}
