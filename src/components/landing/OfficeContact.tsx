import { MapPin, Phone, Mail, Clock, Calendar, ArrowRight, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919564159999';
const PHONE_NUMBER = '+919564159999';
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Hyderabad,Telangana,500032,India';

export default function OfficeContact({ onConsult }: { onConsult: () => void }) {
  const openWhatsApp = () => {
    const msg = encodeURIComponent("Hi GradCredit, I'd like to book a consultation at your Hyderabad office.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="contact" className="section-pad bg-ink-card relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Our Office & Contact Information</div>
          <h2 className="section-title mb-4">Visit Our <span className="gradient-text">Hyderabad Office</span></h2>
          <p className="section-subtitle">
            Have questions about your education loan? Reach out to us — we're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left — Contact cards */}
          <div className="space-y-4">
            {/* Location */}
            <div className="card-glass rounded-2xl p-6 hover-glow">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-primary/15 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-frost text-sm mb-1">Head Office</h3>
                  <p className="text-steely text-sm leading-relaxed">
                    Hyderabad, Telangana – 500032, India
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <a href={`tel:${PHONE_NUMBER}`} className="card-glass rounded-2xl p-6 hover-glow block transition-all duration-300 hover:border-brand-primary/30">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-success/15 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-frost text-sm mb-1">Phone</h3>
                  <p className="text-steely text-sm">+91 9564159999</p>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:info@gradcredit.com" className="card-glass rounded-2xl p-6 hover-glow block transition-all duration-300 hover:border-brand-primary/30">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-blue/15 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-frost text-sm mb-1">Email</h3>
                  <p className="text-steely text-sm">info@gradcredit.com</p>
                </div>
              </div>
            </a>

            {/* Business Hours */}
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-amber/15 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-brand-amber" />
                </div>
                <div>
                  <h3 className="font-semibold text-frost text-sm mb-1">Business Hours</h3>
                  <div className="text-steely text-sm space-y-0.5">
                    <p>Monday – Friday: 9:30 AM – 6:30 PM</p>
                    <p>Saturday: 10:00 AM – 2:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onConsult}
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-primary text-white font-semibold rounded-xl
                           hover:bg-[#444444] active:scale-95 transition-all duration-200 text-sm shadow-card"
              >
                <Calendar className="w-4 h-4" />
                Book a Consultation
              </button>
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-3 bg-brand-success/15 text-brand-success font-semibold rounded-xl
                           border border-brand-success/30 hover:bg-brand-success/25 active:scale-95 transition-all duration-200 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="inline-flex items-center gap-2 px-5 py-3 glass-premium text-frost font-semibold rounded-xl
                           border border-edge hover:border-brand-primary/50 active:scale-95 transition-all duration-200 text-sm"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a
                href="mailto:info@gradcredit.com"
                className="inline-flex items-center gap-2 px-5 py-3 glass-premium text-frost font-semibold rounded-xl
                           border border-edge hover:border-brand-primary/50 active:scale-95 transition-all duration-200 text-sm"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </div>

          {/* Right — Google Map embed */}
          <div className="card-glass rounded-2xl overflow-hidden h-full min-h-[400px] relative">
            <iframe
              src="https://www.google.com/maps?q=Hyderabad,Telangana,500032,India&output=embed"
              className="w-full h-full min-h-[400px]"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="GradCredit Office Location — Hyderabad"
            />
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-4 py-2 bg-ink-base/80 backdrop-blur-md text-frost text-sm font-medium rounded-xl
                       border border-edge hover:border-brand-primary/50 transition-all"
            >
              <MapPin className="w-4 h-4 text-brand-primary" />
              Open in Google Maps
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
