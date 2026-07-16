import { GraduationCap, Plane, Hotel, CreditCard, Compass, BookOpen } from 'lucide-react';

const benefits = [
  { icon: GraduationCap, title: 'Finance Your Dream Education', desc: 'Get the funding you need for tuition, living, and travel — all in one education loan.' },
  { icon: Plane, title: 'Flight Ticket Assistance', desc: 'Special student fares and discounts on international flights to your study destination.' },
  { icon: Hotel, title: 'Student Travel Benefits', desc: 'Accommodation assistance and travel insurance guidance for a smooth journey.' },
  { icon: CreditCard, title: 'International Forex Card Guidance', desc: 'Get a multi-currency forex card with the best exchange rates for your time abroad.' },
  { icon: Compass, title: 'Pre-Departure Support', desc: 'Orientation sessions on academics, culture, and life in your destination country.' },
  { icon: BookOpen, title: 'Financial Planning Guidance', desc: 'Expert advice on budgeting, managing your education loan, and planning repayments.' },
];

export default function StudentBenefits() {
  return (
    <section className="section-pad bg-ink-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-amber mb-4 mx-auto">Student Benefits</div>
          <h2 className="section-title mb-4">More Than Just a <span className="gradient-text">Loan</span></h2>
          <p className="section-subtitle">
            We support you at every step — from securing your loan to arriving at your destination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="card p-6 group hover-glow"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-11 h-11 bg-brand-amber/10 rounded-xl flex items-center justify-center mb-4
                              group-hover:bg-brand-amber group-hover:scale-105 transition-all duration-300">
                <Icon className="w-5 h-5 text-brand-amber group-hover:text-ink-base transition-colors duration-300" />
              </div>
              <h3 className="font-semibold text-frost text-base mb-2 leading-snug">{title}</h3>
              <p className="text-steely text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
