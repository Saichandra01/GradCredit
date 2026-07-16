import { GraduationCap, Instagram, Facebook, Linkedin, Twitter, Youtube, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919564159999';
const PHONE_NUMBER = '+919564159999';

const linkColumns = [
  { title: 'Education Loans', items: ['Apply for Loan', 'Collateral Loan', 'Non-Collateral Loan', 'Loan Eligibility'] },
  { title: 'Partner Banks', items: ['HDFC Credila', 'ICICI Bank', 'Union Bank', 'Avanse', 'InCred', 'MPOWER'] },
  { title: 'Resources', items: ['FAQ', 'Contact Us', 'Student Support', 'Privacy Policy', 'Terms & Conditions'] },
];

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const openWhatsApp = () => {
    const msg = encodeURIComponent("Hi GradCredit, I'd like to know more about your education loan services.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-ink-base border-t border-edge">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-glow">
                <GraduationCap className="w-5 h-5 text-ink-base" />
              </div>
              <div>
                <span className="font-bold text-frost text-base block">GradCredit</span>
                <span className="text-steely text-xs">Bridging Borders. Fueling Futures.</span>
              </div>
            </div>
            <p className="text-steely text-sm leading-relaxed mb-6 max-w-xs">
              India's trusted education loan platform. One application. Multiple banks.
              Compare and choose the best education loan for studying abroad — 100% digital.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 mb-6">
              <a href="mailto:info@gradcredit.com" className="flex items-center gap-2.5 text-steely text-sm hover:text-frost transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                info@gradcredit.com
              </a>
              <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2.5 text-steely text-sm hover:text-frost transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                +91 9564159999
              </a>
              <div className="flex items-start gap-2.5 text-steely text-sm">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Hyderabad, Telangana – 500032, India</span>
              </div>
              <button onClick={openWhatsApp} className="flex items-center gap-2.5 text-steely text-sm hover:text-brand-success transition-colors">
                <MessageCircle className="w-4 h-4 shrink-0" />
                Chat on WhatsApp
              </button>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-ink-surface hover:bg-brand-primary/15 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 border border-edge hover:border-brand-primary/30"
                >
                  <Icon className="w-4 h-4 text-steely hover:text-brand-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {linkColumns.map(({ title, items }) => (
            <div key={title}>
              <h4 className="text-frost font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-steely text-sm hover:text-frost transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-edge mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-steely/60 text-sm">
            © {new Date().getFullYear()} GradCredit. All rights reserved.
          </p>
          <div className="flex gap-6 text-steely/60 text-sm">
            <a href="#" className="hover:text-frost transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-frost transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-frost transition-colors">Student Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
