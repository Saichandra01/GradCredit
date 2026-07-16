import { Building2, Briefcase, Calendar, Users, MapPin, GraduationCap } from 'lucide-react';

const infoCards = [
  { icon: Building2, label: 'Company Name', value: 'GradCredit' },
  { icon: Briefcase, label: 'Industry', value: 'Higher Education' },
  { icon: Calendar, label: 'Founded', value: '2023' },
  { icon: Users, label: 'Company Size', value: '2–10 Employees' },
  { icon: MapPin, label: 'Headquarters', value: 'Hyderabad, Telangana' },
  { icon: GraduationCap, label: 'Specialization', value: 'Education Loan Provider' },
];

export default function CompanyInfo() {
  return (
    <section className="section-pad bg-ink-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Company Information</div>
          <h2 className="section-title mb-4">About <span className="gradient-text">GradCredit</span></h2>
          <p className="section-subtitle">
            A trusted education loan provider helping students bridge borders and fuel their futures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {infoCards.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="card p-6 group hover-glow"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center shrink-0
                                group-hover:bg-brand-primary group-hover:scale-105 transition-all duration-300">
                  <Icon className="w-6 h-6 text-brand-primary group-hover:text-ink-base transition-colors duration-300" />
                </div>
                <div>
                  <div className="text-xs text-steely font-medium uppercase tracking-wide mb-0.5">{label}</div>
                  <div className="font-semibold text-frost text-base">{value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
