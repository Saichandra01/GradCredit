import { X, GraduationCap, Building2, BookOpen, IndianRupee, Home, Calendar, Briefcase, Landmark, Award, Rocket, CheckCircle2 } from 'lucide-react';
import type { CountryInfo } from '../../data/countries';

export default function CountryModal({ country, onClose, onApply }: { country: CountryInfo | null; onClose: () => void; onApply: () => void }) {
  if (!country) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-base/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl my-0 sm:my-8 animate-scale-in">
        <div className="bg-ink-card rounded-none sm:rounded-3xl border border-edge shadow-premium overflow-hidden">
          {/* Hero image */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img src={country.image} alt={country.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-card via-ink-base/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-ink-base/60 backdrop-blur-md rounded-full flex items-center justify-center text-frost hover:bg-ink-base/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-6 flex items-center gap-3">
              <span className="text-3xl">{country.flag}</span>
              <div>
                <h2 className="text-2xl font-bold text-frost">{country.name}</h2>
                <p className="text-frost/60 text-sm">{country.desc}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {/* Overview */}
            <Section icon={GraduationCap} title="Overview">
              <p className="text-steely text-sm leading-relaxed">{country.overview}</p>
            </Section>

            {/* Why choose */}
            <Section icon={CheckCircle2} title="Why Students Choose It">
              <ul className="space-y-2">
                {country.whyChoose.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-steely">
                    <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Top universities */}
            <Section icon={Building2} title="Top Universities">
              <div className="flex flex-wrap gap-2">
                {country.topUniversities.map((uni, i) => (
                  <span key={i} className="badge bg-ink-surface text-frost/80 border border-edge">{uni}</span>
                ))}
              </div>
            </Section>

            {/* Popular courses */}
            <Section icon={BookOpen} title="Popular Courses">
              <div className="flex flex-wrap gap-2">
                {country.popularCourses.map((course, i) => (
                  <span key={i} className="badge badge-primary">{course}</span>
                ))}
              </div>
            </Section>

            {/* Fees & Expenses */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-glass p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs font-semibold text-steely uppercase tracking-wide">Tuition Fees</span>
                </div>
                <p className="text-sm font-medium text-frost">{country.tuitionFees}</p>
              </div>
              <div className="card-glass p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-brand-secondary" />
                  <span className="text-xs font-semibold text-steely uppercase tracking-wide">Living Expenses</span>
                </div>
                <p className="text-sm font-medium text-frost">{country.livingExpenses}</p>
              </div>
            </div>

            {/* Intakes */}
            <Section icon={Calendar} title="Intakes">
              <div className="flex flex-wrap gap-2">
                {country.intakes.map((intake, i) => (
                  <span key={i} className="badge badge-blue">{intake}</span>
                ))}
              </div>
            </Section>

            {/* Post-study work */}
            <Section icon={Briefcase} title="Post-Study Work Opportunities">
              <p className="text-steely text-sm leading-relaxed">{country.postStudyWork}</p>
            </Section>

            {/* Loan availability */}
            <Section icon={Landmark} title="Education Loan Availability">
              <p className="text-steely text-sm leading-relaxed">{country.loanAvailability}</p>
            </Section>

            {/* Scholarships */}
            <Section icon={Award} title="Scholarship Opportunities">
              <ul className="space-y-2">
                {country.scholarships.map((sch, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-steely">
                    <Award className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                    <span>{sch}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t border-edge bg-ink-surface/50">
            <button onClick={onApply} className="btn-primary w-full justify-center">
              <Rocket className="w-4 h-4" />
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-brand-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-brand-primary" />
        </div>
        <h3 className="text-sm font-semibold text-frost">{title}</h3>
      </div>
      {children}
    </div>
  );
}
