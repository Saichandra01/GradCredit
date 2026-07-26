import { useEffect, useRef, useState } from 'react';
import { Building2, Users, IndianRupee, BadgeCheck, Clock } from 'lucide-react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

const stats = [
  { icon: Building2, value: 20, suffix: '+', label: 'Partner Banks' },
  { icon: Users, value: 10000, suffix: '+', label: 'Students Assisted' },
  { icon: IndianRupee, value: 1000, prefix: '₹', suffix: '+ Crores', label: 'Education Loans Facilitated' },
  { icon: BadgeCheck, value: 98, suffix: '%', label: 'Approval Assistance' },
  { icon: Clock, value: 24, suffix: '×7', label: 'Student Support' },
];

function StatCard({ stat, start }: { stat: typeof stats[0]; start: boolean }) {
  const count = useAnimatedCounter(stat.value, 2000, start);
  const Icon = stat.icon;
  return (
    <div className="text-center group">
      <div className="w-12 h-12 mx-auto bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-3
                      group-hover:bg-brand-primary group-hover:scale-110 transition-all duration-300">
        <Icon className="w-5 h-5 text-brand-primary group-hover:text-ink-base transition-colors duration-300" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-frost tracking-tight tabular-nums min-h-[64px] flex items-center justify-center">
        {stat.prefix}{count.toLocaleString('en-IN')}{stat.suffix}
      </div>
      <div className="text-steely text-sm mt-1">{stat.label}</div>
    </div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStart(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-14 bg-ink-card border-y border-edge">
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map(stat => (
            <StatCard key={stat.label} stat={stat} start={start} />
          ))}
        </div>
      </div>
    </section>
  );
}
