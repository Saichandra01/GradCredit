import { X, Building2, Landmark, IndianRupee, Clock, Calendar, CheckCircle2, FileText, Award, Rocket, Shield, Zap } from 'lucide-react';
import type { BankInfo } from '../../data/banks';

export default function BankModal({ bank, onClose, onApply }: { bank: BankInfo | null; onClose: () => void; onApply: () => void }) {
  if (!bank) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-ink-base/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-3xl my-0 sm:my-8 animate-scale-in">
        <div className="bg-ink-card rounded-none sm:rounded-3xl border border-edge shadow-premium overflow-hidden">
          {/* Header */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-ink-surface to-ink-card border-b border-edge">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-ink-base/60 backdrop-blur-md rounded-full flex items-center justify-center text-frost hover:bg-ink-base/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bank.color} flex items-center justify-center shadow-glow`}>
                <span className="text-white font-bold text-sm tracking-wide">{bank.logo}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-frost">{bank.name}</h2>
                <p className="text-steely text-sm">{bank.loanType}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {bank.collateral && <span className="badge badge-blue">Collateral</span>}
                  {bank.nonCollateral && <span className="badge badge-primary">Non-Collateral</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
            {/* Overview */}
            <Section icon={Building2} title="Bank Overview">
              <p className="text-steely text-sm leading-relaxed">{bank.overview}</p>
            </Section>

            {/* Key metrics grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <MetricCard icon={IndianRupee} label="Interest Rate" value={bank.interestRate} color="text-brand-primary" />
              <MetricCard icon={Landmark} label="Max Loan Amount" value={bank.maxLoanAmount} color="text-brand-secondary" />
              <MetricCard icon={FileText} label="Processing Fee" value={bank.processingFee} color="text-brand-amber" />
              <MetricCard icon={Clock} label="Moratorium" value={bank.moratorium} color="text-brand-purple" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <MetricCard icon={Calendar} label="Repayment Period" value={bank.repaymentPeriod} color="text-brand-success" />
              <MetricCard icon={Shield} label="Loan Type" value={bank.loanType} color="text-brand-blue" />
            </div>

            {/* Eligibility */}
            <Section icon={CheckCircle2} title="Eligibility Criteria">
              <ul className="space-y-2">
                {bank.eligibility.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-steely">
                    <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Required documents */}
            <Section icon={FileText} title="Required Documents">
              <ul className="space-y-2">
                {bank.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-steely">
                    <FileText className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Section>

            {/* Key benefits */}
            <Section icon={Award} title="Key Benefits">
              <div className="grid sm:grid-cols-2 gap-3">
                {bank.keyBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 card-glass rounded-xl">
                    <Zap className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                    <span className="text-sm text-frost/80">{benefit}</span>
                  </div>
                ))}
              </div>
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

function MetricCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="card-glass p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-semibold text-steely uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium text-frost">{value}</p>
    </div>
  );
}
