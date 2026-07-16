import { Rocket, MessageCircle, CheckCircle2, Phone } from 'lucide-react';

const WHATSAPP_NUMBER = '919564159999';
const PHONE_NUMBER = '+919564159999';

export default function FinalCTA({ onApply }: { onApply: () => void }) {
  const openWhatsApp = () => {
    const msg = encodeURIComponent("Hi GradCredit, I'd like to talk to an expert about education loans for studying abroad.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="section-pad bg-ink-base relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-40" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="badge badge-primary mb-6 mx-auto">Start Today</div>

        <h2 className="text-3xl md:text-5xl font-bold text-frost mb-5 leading-tight text-balance">
          Your Future Deserves the <span className="gradient-text">Best Education Loan.</span>
        </h2>

        <p className="text-steely text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          Upload your documents once. Compare offers from 100+ banks.
          Choose the best interest rate. Start your journey toward your dream university.
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10">
          {['No application fee', '100% digital process', 'Offers in 5–7 days'].map(t => (
            <div key={t} className="flex items-center gap-1.5 text-steely text-sm">
              <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
              {t}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-white font-semibold rounded-xl
                       hover:bg-[#444444] active:scale-95 transition-all duration-200 shadow-card text-base"
          >
            <Rocket className="w-5 h-5" />
            Apply Now
          </button>
          <button
            onClick={openWhatsApp}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-success/15 text-brand-success font-semibold rounded-xl
                       border-2 border-brand-success/30 hover:bg-brand-success/25 active:scale-95 transition-all duration-200 text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Talk to an Expert
          </button>
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="inline-flex items-center gap-2 px-8 py-4 glass-premium text-frost font-semibold rounded-xl
                       border border-edge hover:border-brand-primary/50 active:scale-95 transition-all duration-200 text-base"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
        </div>

        <p className="text-steely/60 text-xs mt-6">
          Prefer WhatsApp? Chat with us at +91 9564159999
        </p>
      </div>
    </section>
  );
}
