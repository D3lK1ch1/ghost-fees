import { Coffee, PiggyBank, Tent, Utensils } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';

const ICONS = { coffee: Coffee, utensils: Utensils, tent: Tent, piggy: PiggyBank };
const MINT = '#5ee6c8';

// Glow-up fund bar and the four milestones (Brunch, Dinner out, Weekend away,
// Savings), as in the Moving on and Heartbreak House designs. `glow` comes from
// glowUp() in exJourney.js.
export default function GlowUpFund({ glow, compact = false, milestonesOnly = false, className }) {
  const pct = glow.goal > 0 ? Math.min(100, (glow.fund / glow.goal) * 100) : 0;
  return (
    <div className={className}>
      {!milestonesOnly && (
      <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-heading text-[16px] font-bold text-white">Glow-up fund</span>
        <span className="text-[13px] text-white/80">
          <span className="font-bold" style={{ color: MINT }}>{money(glow.fund)}</span>
          {!compact && <> of {money(glow.goal)} a year</>}
          {compact && '/yr'}
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#5ee6c8] transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
      </>
      )}
      {!compact && (
        <ul className={cn('grid grid-cols-4 gap-2 text-center', !milestonesOnly && 'mt-4')}>
          {glow.steps.map((step) => {
            const Icon = ICONS[step.icon];
            return (
              <li key={step.key} className="flex flex-col items-center">
                <span
                  className={cn('grid h-12 w-12 place-items-center rounded-2xl border', step.unlocked ? 'border-transparent text-[#0f2a24]' : 'border-white/15 bg-white/[0.04] text-white/70')}
                  style={step.unlocked ? { background: MINT } : undefined}
                  title={`${step.label}: ${money(step.amount)}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-1.5 text-[12px] font-bold leading-tight text-white">{step.label}</span>
                <span className={cn('text-[11px] font-semibold', step.unlocked ? 'text-[#5ee6c8]' : 'text-white/55')}>{step.state}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
