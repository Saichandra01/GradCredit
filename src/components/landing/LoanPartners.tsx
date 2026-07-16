import { ArrowRight } from 'lucide-react';
import { banks, type BankInfo } from '../../data/banks';

export default function LoanPartners({ onSelectBank }: { onSelectBank: (bank: BankInfo) => void }) {
  return (
    <section id="partners" className="section-pad bg-ink-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Banking Partners</div>
          <h2 className="section-title mb-4">Our <span className="gradient-text">Banking Partners</span></h2>
          <p className="section-subtitle">
            We've partnered with India's leading banks and NBFCs to bring you the best education loan offers.
            Click on any bank to view detailed loan information.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {banks.map((bank, i) => (
            <button
              key={bank.name}
              onClick={() => onSelectBank(bank)}
              className="card p-6 flex flex-col items-center gap-3 group cursor-pointer hover-glow transition-all duration-300 hover:-translate-y-1 text-left"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${bank.color} rounded-2xl flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                <span className="text-white font-bold text-sm tracking-wide">{bank.logo}</span>
              </div>
              <span className="text-frost font-medium text-sm text-center leading-snug">{bank.name}</span>
              <div className="flex gap-1.5">
                {bank.collateral && <span className="badge badge-blue text-xs">Collateral</span>}
                {bank.nonCollateral && <span className="badge badge-primary text-xs">Non-Collateral</span>}
              </div>
              <div className="flex items-center gap-1 text-brand-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
