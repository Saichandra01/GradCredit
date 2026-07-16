import { Building2, ShieldCheck, Zap, GitCompare, Monitor, Users } from 'lucide-react';

const trustItems = [
  { icon: Building2, title: '100+ Banking Partners', desc: 'We work with India\'s top banks and NBFCs to get you the best loan terms.' },
  { icon: ShieldCheck, title: 'Secure Document Verification', desc: 'Bank-grade encryption protects your documents at every step.' },
  { icon: Zap, title: 'Fast Loan Approval', desc: 'Digital processing means approvals in days, not months.' },
  { icon: GitCompare, title: 'Transparent Loan Comparison', desc: 'See all offers side-by-side. No hidden charges. No surprises.' },
  { icon: Monitor, title: 'Digital Application Process', desc: '100% online — apply, upload, compare, and get your loan from home.' },
  { icon: Users, title: 'Dedicated Loan Experts', desc: 'A personal loan specialist guides you through every step.' },
];

export default function Trust() {
  return (
    <section className="section-pad bg-ink-card relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Why Students Trust Us</div>
          <h2 className="section-title mb-4">Trusted by Students. <span className="gradient-text">Powered by Leading Banks.</span></h2>
          <p className="section-subtitle">
            We've helped thousands of students finance their education abroad. Here's why they chose GradCredit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trustItems.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="card-glass rounded-2xl p-6 hover-glow"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-frost text-sm pt-1">{title}</h3>
              </div>
              <p className="text-steely text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
