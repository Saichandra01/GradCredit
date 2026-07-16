import { useState, useMemo } from 'react';
import { Calculator, IndianRupee, TrendingUp, Receipt, Rocket } from 'lucide-react';

export default function LoanCalculator({ onApply }: { onApply: () => void }) {
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(11);
  const [tenure, setTenure] = useState(10);

  const { emi, totalPayment, totalInterest, schedule } = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = tenure * 12;
    const calculatedEmi = loanAmount > 0 && monthlyRate > 0
      ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1))
      : 0;
    const calculatedTotal = calculatedEmi * totalMonths;
    const calculatedInterest = calculatedTotal - loanAmount;

    // Yearly schedule for chart
    const yearlySchedule: { year: number; principal: number; interest: number; balance: number }[] = [];
    let balance = loanAmount;
    for (let y = 1; y <= tenure; y++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        const interestPart = balance * monthlyRate;
        const principalPart = calculatedEmi - interestPart;
        balance -= principalPart;
        yearPrincipal += principalPart;
        yearInterest += interestPart;
      }
      yearlySchedule.push({ year: y, principal: Math.round(yearPrincipal), interest: Math.round(yearInterest), balance: Math.max(0, Math.round(balance)) });
    }

    return { emi: calculatedEmi, totalPayment: calculatedTotal, totalInterest: calculatedInterest, schedule: yearlySchedule };
  }, [loanAmount, interestRate, tenure]);

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);

  const principalPct = totalPayment > 0 ? Math.round((loanAmount / totalPayment) * 100) : 0;
  const interestPct = 100 - principalPct;

  const maxBar = Math.max(...schedule.map(s => s.principal + s.interest), 1);

  return (
    <section id="calculator" className="section-pad bg-ink-card">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="badge badge-primary mb-4 mx-auto">Loan Calculator</div>
          <h2 className="section-title mb-4">Calculate Your <span className="gradient-text">Education Loan EMI</span></h2>
          <p className="section-subtitle">
            Estimate your monthly EMI, total interest, and repayment amount instantly.
          </p>
        </div>

        <div className="card-premium p-6 md:p-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="space-y-8">
              {/* Loan Amount */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-frost text-sm">Loan Amount</label>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary/10 rounded-lg">
                    <IndianRupee className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="font-bold text-frost text-sm">{fmt(loanAmount)}</span>
                  </div>
                </div>
                <input
                  type="range" min={500000} max={15000000} step={100000}
                  value={loanAmount}
                  onChange={e => setLoanAmount(+e.target.value)}
                  className="w-full accent-brand-primary"
                />
                <div className="flex justify-between text-xs text-steely mt-1">
                  <span>₹5 Lakh</span><span>₹1.5 Crore</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-frost text-sm">Interest Rate (p.a.)</label>
                  <div className="px-3 py-1.5 bg-brand-primary/10 rounded-lg">
                    <span className="font-bold text-frost text-sm">{interestRate}%</span>
                  </div>
                </div>
                <input
                  type="range" min={8} max={18} step={0.25}
                  value={interestRate}
                  onChange={e => setInterestRate(+e.target.value)}
                  className="w-full accent-brand-primary"
                />
                <div className="flex justify-between text-xs text-steely mt-1">
                  <span>8%</span><span>18%</span>
                </div>
              </div>

              {/* Tenure */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold text-frost text-sm">Loan Tenure</label>
                  <div className="px-3 py-1.5 bg-brand-primary/10 rounded-lg">
                    <span className="font-bold text-frost text-sm">{tenure} Years</span>
                  </div>
                </div>
                <input
                  type="range" min={1} max={15} step={1}
                  value={tenure}
                  onChange={e => setTenure(+e.target.value)}
                  className="w-full accent-brand-primary"
                />
                <div className="flex justify-between text-xs text-steely mt-1">
                  <span>1 Year</span><span>15 Years</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex flex-col gap-4">
              {/* EMI */}
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-6 text-center border border-brand-primary/20">
                <div className="text-steely text-sm mb-1">Monthly EMI</div>
                <div className="text-frost font-bold text-4xl">
                  ₹{fmt(emi)}
                </div>
                <div className="text-steely text-xs mt-1">per month for {tenure} years</div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ink-surface rounded-xl p-4 text-center border border-edge">
                  <div className="flex items-center justify-center gap-1 text-steely text-xs mb-1">
                    <IndianRupee className="w-3 h-3" /> Principal
                  </div>
                  <div className="font-bold text-frost">₹{fmt(loanAmount)}</div>
                </div>
                <div className="bg-ink-surface rounded-xl p-4 text-center border border-edge">
                  <div className="flex items-center justify-center gap-1 text-steely text-xs mb-1">
                    <TrendingUp className="w-3 h-3" /> Total Interest
                  </div>
                  <div className="font-bold text-brand-amber">₹{fmt(totalInterest)}</div>
                </div>
                <div className="col-span-2 bg-ink-surface rounded-xl p-4 text-center border border-edge">
                  <div className="flex items-center justify-center gap-1 text-steely text-xs mb-1">
                    <Receipt className="w-3 h-3" /> Total Repayment
                  </div>
                  <div className="font-bold text-frost text-xl">₹{fmt(totalPayment)}</div>
                </div>
              </div>

              {/* Principal vs Interest donut */}
              <div className="flex items-center gap-4 mt-1">
                <div className="relative w-16 h-16 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#D1D1D1" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none" stroke="#222222" strokeWidth="3"
                      strokeDasharray={`${principalPct} ${100 - principalPct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-brand-primary" />
                    <span className="text-steely">Principal {principalPct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-brand-amber" />
                    <span className="text-steely">Interest {interestPct}%</span>
                  </div>
                </div>
              </div>

              <button onClick={onApply} className="btn-primary justify-center mt-auto">
                <Rocket className="w-4 h-4" />
                Apply for Loan Now
              </button>
            </div>
          </div>

          {/* Yearly EMI Chart */}
          <div className="mt-8 pt-8 border-t border-edge">
            <h3 className="font-semibold text-frost text-sm mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-primary" />
              Yearly Repayment Breakdown
            </h3>
            <div className="flex items-end gap-2 h-40">
              {schedule.map(s => {
                const totalHeight = ((s.principal + s.interest) / maxBar) * 100;
                const principalHeight = (s.principal / (s.principal + s.interest)) * totalHeight;
                const interestHeight = totalHeight - principalHeight;
                return (
                  <div key={s.year} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                      <div
                        className="w-full bg-brand-amber/60 rounded-t-md group-hover:bg-brand-amber transition-colors"
                        style={{ height: `${interestHeight}%` }}
                        title={`Interest: ₹${fmt(s.interest)}`}
                      />
                      <div
                        className="w-full bg-brand-primary rounded-b-md group-hover:bg-[#444444] transition-all"
                        style={{ height: `${principalHeight}%` }}
                        title={`Principal: ₹${fmt(s.principal)}`}
                      />
                    </div>
                    <span className="text-xs text-steely">Y{s.year}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-brand-primary" />
                <span className="text-steely text-xs">Principal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-brand-amber/60" />
                <span className="text-steely text-xs">Interest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
