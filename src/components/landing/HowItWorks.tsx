import { UserPlus, Upload, GitCompare, Award, ChevronDown, Rocket } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Register',
    desc: 'Create your free GradCredit account in minutes. No paperwork required to get started.',
    items: [] as string[],
  },
  {
    step: '02',
    icon: Upload,
    title: 'Upload Documents',
    desc: 'Upload your documents once. Our secure platform verifies them digitally.',
    items: ['Admission Letter', 'KYC (PAN, Aadhaar, Passport)', 'Income Documents', 'Academic Documents'],
  },
  {
    step: '03',
    icon: GitCompare,
    title: 'Compare Loan Offers',
    desc: 'Receive loan offers from 100+ partner banks. Compare interest rates, tenure, and terms side-by-side.',
    items: [] as string[],
  },
  {
    step: '04',
    icon: Award,
    title: 'Get Your Loan',
    desc: 'Select the best bank and complete your education loan process — all digitally, with expert guidance.',
    items: [] as string[],
  },
];

export default function HowItWorks({ onApply }: { onApply: () => void }) {
  return (
    <section id="process" className="section-pad bg-ink-base relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="badge badge-primary mb-4 mx-auto">How It Works</div>
          <h2 className="section-title mb-4">Your Education Loan in <span className="gradient-text">4 Simple Steps</span></h2>
          <p className="section-subtitle">
            From registration to loan disbursal — the entire process is digital, transparent, and fast.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute left-0 right-0 top-16 h-0.5 bg-gradient-to-r from-transparent via-edge to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map(({ step, icon: Icon, title, desc, items }, i) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Icon circle */}
                <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mb-5
                                shadow-glow group hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-ink-base" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-ink-card text-frost text-xs font-bold rounded-full flex items-center justify-center border border-edge">
                    {step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-frost text-base mb-2">{title}</h3>
                <p className="text-steely text-sm leading-relaxed mb-3 max-w-xs">{desc}</p>

                {/* Document items */}
                {items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
                    {items.map(item => (
                      <span key={item} className="badge bg-ink-surface text-steely border border-edge text-xs">{item}</span>
                    ))}
                  </div>
                )}

                {/* Arrow between steps (mobile) */}
                {i < steps.length - 1 && (
                  <div className="md:hidden mt-4">
                    <ChevronDown className="w-5 h-5 text-edge" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <button onClick={onApply} className="btn-primary text-base">
            <Rocket className="w-4 h-4" />
            Start Your Application
          </button>
        </div>
      </div>
    </section>
  );
}
