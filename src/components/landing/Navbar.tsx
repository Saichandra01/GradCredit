import { useState, useEffect } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Why Us', href: '#why' },
  { label: 'Countries', href: '#countries' },
  { label: 'How It Works', href: '#process' },
  { label: 'Partners', href: '#partners' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar({
  onLogin,
  onRegister,
  onEmployeeLogin,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onEmployeeLogin: () => void;
}){
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-ink-base/80 backdrop-blur-xl border-b border-edge shadow-premium'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-card">
              <GraduationCap className="w-5 h-5 text-[#222222]" />
            </div>
            <div>
              <span className={`font-bold text-base leading-tight block transition-colors duration-300 ${scrolled ? 'text-frost' : 'text-white'}`}>
                GradCredit
              </span>
              <span className={`text-xs leading-tight block transition-colors duration-300 ${scrolled ? 'text-steely' : 'text-white/60'}`}>
                Bridging Borders. Fueling Futures.
              </span>
            </div>
          </a>

          {/* Desktop nav */}
         <nav className="hidden lg:flex items-center gap-4 whitespace-nowrap">
  {navLinks.map((l) => (
    <a
      key={l.label}
      href={l.href}
      className={`text-sm font-medium transition-colors duration-200 relative
      after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-200 hover:after:w-full
      ${
        scrolled
          ? "text-steely hover:text-frost after:bg-brand-primary"
          : "text-white/70 hover:text-white"
      }`}
    >
      {l.label}
    </a>
  ))}

<button
  onClick={() =>
    document
      .getElementById("employee-portal")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }
    className={`text-sm font-medium transition-colors duration-200 ${
      scrolled
        ? "text-steely hover:text-frost"
        : "text-white/70 hover:text-white"
    }`}
  >
    Employee
  </button>
</nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogin}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                scrolled
                  ? 'text-steely hover:text-frost hover:bg-black/5'
                  : 'text-white hover:text-white/80 border border-white/30 hover:border-white/50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={onRegister}
              className={`text-sm font-semibold px-5 py-2 rounded-xl active:scale-95 transition-all duration-200 shadow-card ${
                scrolled
                  ? 'bg-brand-primary text-white hover:bg-[#444444]'
                  : 'bg-white text-[#222222] hover:bg-white/90'
              }`}
            >
               Register
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-frost hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
  <div className="absolute top-full right-4 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-steely hover:text-frost hover:bg-black/5 rounded-lg transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-edge flex flex-col gap-2">
              <button onClick={() => { onLogin(); setOpen(false); }} className="btn-secondary text-sm justify-center py-2.5">Sign In</button>
              <button onClick={() => { onRegister(); setOpen(false); }} className="btn-primary text-sm justify-center py-2.5"> Register</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
