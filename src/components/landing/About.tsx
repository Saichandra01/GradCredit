import { Globe, ShieldCheck, Handshake, CreditCard, Target } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="section-pad bg-ink-base relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-40" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div>
            <div className="badge badge-primary mb-4">About GradCredit</div>
            <h2 className="section-title mb-5">
              Welcome to GradCredit – Your Gateway to <span className="gradient-text">Global Education!</span>
            </h2>
            <div className="space-y-4 text-steely text-base leading-relaxed">
              <p>
                At GradCredit, we're more than just an education loan facilitator; we're your trusted
                partner in making your international academic dreams a reality.
              </p>
              <p>
                Our strong alliances with leading financial institutions help students secure competitive
                education loans with better interest rates and faster processing.
              </p>
              <div className="flex items-center gap-3 p-4 card-glass rounded-2xl">
                <Target className="w-5 h-5 text-brand-primary shrink-0" />
                <p className="font-semibold text-frost text-sm">
                  Our mission is simple: Bridging Borders. Fueling Futures.
                </p>
              </div>
              <p>
                Whether you're planning to study in the USA, UK, Australia, Canada, New Zealand, Ireland,
                Germany, France, or other European countries, GradCredit supports you throughout your
                education loan journey.
              </p>
            </div>

            {/* Specialization pills */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              {['Collateral Education Loans', 'Non-Collateral Education Loans'].map(tag => (
                <span key={tag} className="badge bg-ink-surface text-frost/80 border border-edge text-sm px-4 py-2">{tag}</span>
              ))}
            </div>
          </div>

          {/* Right — Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Globe, title: 'Global Reach', desc: 'Education loans for universities across USA, UK, Canada, Australia, Germany, Ireland, France, New Zealand & Europe.' },
              { icon: Handshake, title: 'Personalized Guidance', desc: 'We provide personalized guidance based on every student\'s profile and financial requirements.' },
              { icon: ShieldCheck, title: 'Trusted Partner', desc: 'Strong alliances with leading financial institutions for competitive rates and faster processing.' },
              { icon: CreditCard, title: 'International Credit Card Guidance', desc: 'We also assist eligible students with international credit card guidance for a smoother transition abroad.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="card p-5 group hover-glow"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4
                                group-hover:bg-brand-primary group-hover:scale-105 transition-all duration-300">
                  <Icon className="w-5 h-5 text-brand-primary group-hover:text-ink-base transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-frost text-sm mb-1.5 leading-snug">{title}</h3>
                <p className="text-steely text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
