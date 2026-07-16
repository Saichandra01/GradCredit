import { GitCompare, IndianRupee, Zap, Shield, Users, Home, Wallet, Eye } from 'lucide-react';

const features = [
  { icon: GitCompare, title: 'Compare Loan Offers from 100+ Banking Partners', desc: 'Receive multiple loan offers from one simple application. No need to visit each bank individually.' },
  { icon: IndianRupee, title: 'Lower Interest Rates', desc: 'Compare and select the most competitive education loan rate from our banking partners.' },
  { icon: Zap, title: 'Faster Digital Loan Processing', desc: 'Digital document verification speeds up approval — get offers in days, not weeks.' },
  { icon: Shield, title: 'Secure Document Verification', desc: 'Enterprise-grade document protection with 256-bit encryption and bank-level security.' },
  { icon: Users, title: 'Dedicated Education Loan Experts', desc: 'Dedicated loan specialists assist you throughout the entire process — from application to disbursal.' },
  { icon: Home, title: 'Collateral & Non-Collateral Loan Support', desc: 'We handle both collateral and non-collateral education loans based on your profile and needs.' },
  { icon: Wallet, title: 'Personalized Financial Guidance', desc: 'Get tailored financial advice based on your academic profile and repayment capacity.' },
  { icon: Eye, title: 'Transparent Process', desc: 'No hidden fees. No surprises. Full transparency at every step of your loan journey.' },
];

export default function WhyChoose() {
  return (
    <section id="why" className="section-pad bg-ink-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Why Choose GradCredit</div>
          <h2 className="section-title mb-4">The Smarter Way to Get Your <span className="gradient-text">Education Loan</span></h2>
          <p className="section-subtitle">
            One platform. Multiple banks. Zero hassle. We make education loans simple, fast, and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="card p-6 group hover-glow"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-5
                              group-hover:bg-brand-primary group-hover:scale-110 transition-all duration-300">
                <Icon className="w-6 h-6 text-brand-primary group-hover:text-ink-base transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-frost text-sm mb-2 leading-snug">{title}</h3>
              <p className="text-steely text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
