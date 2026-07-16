import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    q: 'How does GradCredit work?',
    a: 'GradCredit is simple: create an account, upload your documents once, and our platform sends your application to 100+ partner banks simultaneously. You receive multiple loan offers, compare them side-by-side, and choose the best one — all digitally.',
  },
  {
    q: 'How many banks can I compare?',
    a: 'You can compare offers from 100+ banking partners including public sector banks, private banks, and NBFCs. Each bank reviews your profile and sends its best offer — you see all of them in one dashboard.',
  },
  {
    q: 'Is there any application fee?',
    a: 'No. Creating an account and applying through GradCredit is completely free. You only pay the processing fee charged by the bank you ultimately choose — and we show you all fees upfront with full transparency.',
  },
  {
    q: 'Which documents are required?',
    a: 'You\'ll need: your admission letter / offer letter, KYC documents (PAN, Aadhaar, Passport), income documents (salary slips, ITR, bank statements), and academic documents (transcripts, test scores). Upload them once and we share them securely with all banks.',
  },
  {
    q: 'How long does approval take?',
    a: 'With our digital process, you can receive loan offers within 5–7 days. Final approval and disbursal typically takes 7–21 days depending on the bank. NBFCs are generally faster than public sector banks.',
  },
  {
    q: 'Can I apply without collateral?',
    a: 'Yes! Many of our partner NBFCs offer unsecured (non-collateral) education loans up to ₹50–75 Lakhs based on your academic profile and co-applicant\'s financial strength. For higher amounts, collateral may be required by some banks.',
  },
  {
    q: 'What is the eligibility for an education loan?',
    a: 'You need: an admission offer from a recognized university, Indian citizenship, a co-applicant (parent/guardian), and basic academic qualifications. Eligibility varies by bank — our platform checks your profile against all 100+ partners to find the best match.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => setOpen(p => p === i ? null : i);

  return (
    <section id="faq" className="section-pad bg-ink-base">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="badge badge-primary mb-4 mx-auto">FAQ</div>
          <h2 className="section-title mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <p className="section-subtitle">Everything you need to know about getting an education loan with GradCredit.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`card transition-all duration-200 ${isOpen ? 'shadow-card-hover border-brand-primary/30' : ''}`}>
                <button
                  onClick={() => toggle(i)}
                  className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left"
                >
                  <span className="font-medium text-frost text-sm leading-snug">{faq.q}</span>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    : <ChevronDown className="w-4 h-4 text-steely shrink-0 mt-0.5" />
                  }
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-steely text-sm leading-relaxed border-t border-edge pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
