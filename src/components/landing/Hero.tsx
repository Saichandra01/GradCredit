import { Rocket, FileCheck, ArrowRight, ChevronDown, GraduationCap, Globe, Shield, Building2, Laptop, CheckCircle2, Award, Zap, TrendingUp } from 'lucide-react';

const loanOffers = [
  { bank: 'HDFC Credila', rate: '10.5%', amount: '₹40 L', status: 'Approved', bestOffer: true, fastApproval: false },
  { bank: 'ICICI Bank', rate: '11.0%', amount: '₹35 L', status: 'Approved', bestOffer: false, fastApproval: true },
  { bank: 'Avanse', rate: '11.5%', amount: '₹50 L', status: 'Pending', bestOffer: false, fastApproval: false },
  { bank: 'InCred Finance', rate: '12.0%', amount: '₹45 L', status: 'Pending', bestOffer: false, fastApproval: false },
];

export default function Hero({ onApply, onCheckEligibility }: { onApply: () => void; onCheckEligibility: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background — dark charcoal gradient with radial lighting */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 dot-pattern opacity-30" />
      {/* Soft radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.04] rounded-full blur-[120px] pointer-events-none" />
      {/* Floating orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-white/[0.02] rounded-full blur-2xl animate-float pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 hero-glass-badge rounded-full text-white/90 text-sm font-medium mb-6 animate-fade-in">
              <div className="w-2 h-2 bg-brand-success rounded-full animate-pulse" />
              Bridging Borders. Fueling Futures.
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 text-balance animate-slide-up">
              Your Dream University <span className="text-white/60">Starts Here</span>
            </h1>

            {/* Sub-heading */}
            <h2 className="text-xl sm:text-2xl font-semibold text-white/80 mb-5 leading-snug animate-slide-up">
              One Application. 20+ Banks. The Best Education Loan Offers.
            </h2>

            {/* Description */}
            <p className="text-white/50 text-base md:text-lg leading-relaxed mb-8 animate-slide-up">
              At GradCredit, we're more than just an education loan facilitator—we're your trusted partner
              in helping students achieve their dream of studying abroad. Submit one application, upload your
              documents once, compare offers from multiple banks, and choose the best education loan with
              complete transparency and expert guidance.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-10 animate-slide-up">
              <button
                onClick={onApply}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#222222] font-semibold rounded-xl
                           hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-card text-base"
              >
                <Rocket className="w-4 h-4" />
                Apply Now
              </button>
              <button
                onClick={onCheckEligibility}
                className="inline-flex items-center gap-2 px-7 py-3.5 hero-glass-badge text-white font-semibold rounded-xl
                           border border-white/20 hover:border-white/40 hover:bg-white/5 active:scale-95 transition-all duration-200 text-base"
              >
                <FileCheck className="w-4 h-4" />
                Check Eligibility
              </button>
            </div>

            {/* Quick highlights */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 animate-slide-up">
              {['Upload documents once', 'Compare interest rates', '100% digital process'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-white/50 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right side — Interactive Loan Comparison Dashboard */}
          <div className="hidden lg:block relative">
            <HeroDashboard />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main dashboard card */}
      <div className="relative hero-glass rounded-[20px] p-6 shadow-premium animate-float hover-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <Laptop className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">Loan Comparison</div>
              <div className="text-white/40 text-xs">{loanOffers.length} offers received</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-brand-success/15 rounded-full">
            <Shield className="w-3 h-3 text-brand-success" />
            <span className="text-brand-success text-xs font-medium">Secure</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-2 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wide">
          <div className="col-span-5">Bank</div>
          <div className="col-span-3 text-center">Rate</div>
          <div className="col-span-2 text-center">Amount</div>
          <div className="col-span-2 text-center">Status</div>
        </div>

        {/* Loan offer rows */}
        <div className="space-y-2.5">
          {loanOffers.map((offer, i) => (
            <div
              key={offer.bank}
              className={`relative bg-white/[0.04] rounded-xl p-3 border transition-all duration-300 hover:bg-white/[0.06] cursor-pointer group
                ${offer.bestOffer ? 'border-brand-success/40' : 'border-white/10 hover:border-white/20'}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Bank */}
                <div className="col-span-5 flex items-center gap-2">
                  <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-white/70" />
                  </div>
                  <span className="text-white font-medium text-sm truncate">{offer.bank}</span>
                </div>
                {/* Rate */}
                <div className="col-span-3 text-center">
                  <span className="text-white font-bold text-sm">{offer.rate}</span>
                </div>
                {/* Amount */}
                <div className="col-span-2 text-center">
                  <span className="text-white/70 text-sm font-medium">{offer.amount}</span>
                </div>
                {/* Status */}
                <div className="col-span-2 text-center">
                  <span className={`badge text-xs px-2 py-0.5 ${offer.status === 'Approved' ? 'bg-brand-success/15 text-brand-success' : 'bg-brand-amber/15 text-brand-amber'}`}>
                    {offer.status}
                  </span>
                </div>
              </div>

              {/* Badges */}
              {(offer.bestOffer || offer.fastApproval) && (
                <div className="flex gap-1.5 mt-2 ml-9">
                  {offer.bestOffer && (
                    <span className="inline-flex items-center gap-1 badge bg-brand-success/15 text-brand-success text-xs">
                      <Award className="w-3 h-3" />
                      Best Offer
                    </span>
                  )}
                  {offer.fastApproval && (
                    <span className="inline-flex items-center gap-1 badge bg-brand-blue/15 text-brand-blue text-xs">
                      <Zap className="w-3 h-3" />
                      Fast Approval
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="mt-4 p-3 bg-white/[0.03] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white/60" />
            <span className="text-xs text-white/40">Best rate: <span className="text-white font-semibold">10.5% p.a.</span></span>
          </div>
          <button className="text-xs font-semibold text-white hover:text-white/70 transition-colors flex items-center gap-1">
            Compare All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-6 -left-8 hero-glass-badge rounded-2xl p-3 shadow-premium animate-float" style={{ animationDelay: '1s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-success/20 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-brand-success" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">Admission Letter</div>
            <div className="text-white/40 text-xs">Verified</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-6 hero-glass-badge rounded-2xl p-3 shadow-premium animate-float" style={{ animationDelay: '2s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-blue/20 rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">Study Anywhere</div>
            <div className="text-white/40 text-xs">Universities worldwide</div>
          </div>
        </div>
      </div>

      <div className="absolute -top-2 -right-4 hero-glass-badge rounded-2xl p-3 shadow-premium animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-amber/20 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-brand-amber" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">20+ Banks</div>
            <div className="text-white/40 text-xs">Compared instantly</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-2 hero-glass-badge rounded-2xl p-3 shadow-premium animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-purple/20 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-brand-purple" />
          </div>
          <div>
            <div className="text-white text-xs font-semibold">Bank-Grade Security</div>
            <div className="text-white/40 text-xs">256-bit encryption</div>
          </div>
        </div>
      </div>
    </div>
  );
}
