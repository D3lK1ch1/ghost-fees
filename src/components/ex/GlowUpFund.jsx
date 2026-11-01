import { money } from '@/lib/ghostFees/format';
import { C } from './ExKit';

// Milestone icons from the design (Brunch, Dinner out, Weekend away, Savings).
export const MILESTONE_PATHS = {
  coffee: 'M4 11h16M5 11a7 7 0 0 0 14 0M9 4v3M12 3v4M15 4v3',
  utensils: 'M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 2-2 6 0 8v10',
  tent: 'M3 17h18M5 17l3-8h8l3 8M9 9V6h6v3',
  piggy: 'M5 10a7 6 0 0 1 14 0v5H5zM9 15v4M15 15v4M19 10h2M12 7v-3',
};

export function MilestoneIcon({ icon, on, size = 44 }) {
  return (
    <div
      className="flex flex-none items-center justify-center"
      style={{ width: size, height: size, borderRadius: 14, background: on ? C.mint : C.bg, border: `2px solid ${on ? C.mint : '#3a3644'}` }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? C.mintInk : C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={MILESTONE_PATHS[icon]} />
      </svg>
    </div>
  );
}

// Glow-up fund bar and the four milestones, as in Moving on and Heartbreak House.
// `glow` comes from glowUp() in exJourney.js.
export default function GlowUpFund({ glow, compact = false, milestonesOnly = false, className = '' }) {
  const pct = glow.goal > 0 ? Math.min(100, (glow.fund / glow.goal) * 100) : 0;
  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {!milestonesOnly && (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className={`ex-fredoka font-semibold ${compact ? 'text-[14px]' : 'text-[18px]'}`}>Glow-up fund</span>
            <span className={`${compact ? 'text-[13px]' : 'text-[14px]'} font-extrabold`}>
              <span style={{ color: C.mint }}>{money(glow.fund)}</span>{compact ? '/yr' : ` of ${money(glow.goal)} a year`}
            </span>
          </div>
          <div className="overflow-hidden rounded-full" style={{ height: compact ? 8 : 12, background: 'rgba(255,255,255,0.1)' }}>
            <div className="ex-bar h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.coral}, ${C.mint})` }} />
          </div>
        </>
      )}
      {!compact && (
        <div className={`grid grid-cols-4 gap-1.5 ${milestonesOnly ? '' : 'mt-1'}`}>
          {glow.steps.map((step) => (
            <div key={step.key} className="flex flex-col items-center gap-1 text-center" title={`${step.label}: ${money(step.amount)}`}>
              <MilestoneIcon icon={step.icon} on={step.unlocked} />
              <span className="text-[12px] font-extrabold leading-tight">{step.label}</span>
              <span className="text-[11px] font-extrabold" style={{ color: step.unlocked ? C.mint : step.state === 'Next up' ? C.muted : C.faint }}>{step.state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
