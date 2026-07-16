import { ArrowRight } from 'lucide-react';
import { countries, type CountryInfo } from '../../data/countries';

export default function Countries({ onSelectCountry }: { onSelectCountry: (country: CountryInfo) => void }) {
  return (
    <section id="countries" className="section-pad bg-ink-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Countries We Support</div>
          <h2 className="section-title mb-4">Education Loans for Universities <span className="gradient-text">Worldwide</span></h2>
          <p className="section-subtitle">
            Whether you're heading to the USA, UK, Canada, Australia, or Europe — GradCredit has you covered.
            Click on any country to learn more.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
          {countries.map(({ name, flag, desc, image }, i) => (
            <button
              key={name}
              onClick={() => onSelectCountry(countries[i])}
              className="card overflow-hidden group text-left hover-glow cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-card via-ink-base/40 to-transparent" />
                <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                  <span className="text-xl">{flag}</span>
                  <span className="text-frost font-bold text-sm">{name}</span>
                </div>
                <div className="absolute top-2.5 right-3 w-7 h-7 bg-ink-base/60 backdrop-blur-md rounded-full flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-3.5 h-3.5 text-frost" />
                </div>
              </div>
              <div className="p-4">
                <p className="text-steely text-xs leading-relaxed">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
