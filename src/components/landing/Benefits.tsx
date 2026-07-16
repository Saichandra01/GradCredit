import { Check, PiggyBank, Clock, GitCompare, Building2, TrendingUp } from 'lucide-react';

const benefits = [
  { icon: TrendingUp, title: 'Lower Interest Rates', desc: 'Compare rates from 100+ banks and pick the lowest.' },
  { icon: Clock, title: 'Reduced Processing Time', desc: 'Digital verification cuts approval time by 60%.' },
  { icon: GitCompare, title: 'Compare Multiple Loan Offers', desc: 'See all offers side-by-side in one dashboard.' },
  { icon: Building2, title: 'No Need to Visit Multiple Banks', desc: 'One application reaches 100+ lenders instantly.' },
  { icon: PiggyBank, title: 'Higher Loan Approval Chances', desc: 'Multiple lenders means more chances of approval.' },
  { icon: Check, title: 'Transparent Process', desc: 'No hidden fees. No surprises. Full transparency.' },
];

export default function Benefits() {
  return (
    <section id="benefits" className="section-pad bg-ink-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Benefits</div>
          <h2 className="section-title mb-4">We Help You <span className="gradient-text">Save More</span></h2>
          <p className="section-subtitle">
            Stop running from bank to bank. With GradCredit, you get the best loan terms without the legwork.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="card-glass p-5 flex items-start gap-4 hover-glow"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-10 h-10 bg-brand-success/15 rounded-xl flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-brand-success" />
              </div>
              <div>
                <h3 className="font-semibold text-frost text-sm mb-1">{title}</h3>
                <p className="text-steely text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
