import { useState } from 'react';
import { ChevronDown, Landmark, Mail, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, shortDate } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';
import { CPI, versusCpi } from '@/lib/ghostFees/inflation';
import { BadgePop } from '@/components/GhostAnimations';

const ACTIONS = {
  cancel: { label: 'Draft cancel email', Icon: Mail },
  refund: { label: 'Draft refund request', Icon: Undo2 },
  waive: { label: 'Ask bank to waive', Icon: Landmark },
};

function rowDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' });
}

export default function LeakCard({ leak, onDraft }) {
  const [open, setOpen] = useState(false);
  const action = ACTIONS[leak.action];
  const rows = leak.rows || [];
  const rise = leak.priceRise ? versusCpi(leak.priceRise.oldPrice, leak.priceRise.newPrice) : null;

  return (
    <div className="rounded-3xl bg-[#f5f0e8] p-4 text-[#1b1233] sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[17px] font-semibold">{leak.title || leak.merchant}</h3>
          <BadgePop className={cn('mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold', BADGE_TONES[leak.badge])}>
            {leak.badge}
          </BadgePop>
          {leak.extraBadge && (
            <BadgePop delay={0.75} className={cn('ml-1.5 mt-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold', BADGE_TONES[leak.extraBadge])}>
              {leak.extraBadge}
            </BadgePop>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="font-heading text-[1.7rem] font-bold leading-none tabular-nums">{money(leak.amount)}</div>
          <div className="mt-1.5 text-[12px] font-semibold text-[#5b5275]">{leak.caption}</div>
        </div>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5b5275]">{leak.reason}</p>

      {rise && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-[#5b5275]">
          Up <strong className="text-[#1b1233]">{rise.percent}%</strong> since {shortDate(leak.priceRise.since)}.
          {' '}Prices overall rose {CPI.rate}% in the year to {CPI.asOf} (ABS).
          {rise.above && (
            <span className="ml-2 inline-block rounded-full bg-[#ffd9a8] px-2 py-0.5 text-[11px] font-bold text-[#8a3b00]">
              Above inflation
            </span>
          )}
        </p>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#5b5275] underline underline-offset-4 hover:text-[#1b1233]"
        >
          {open ? 'Hide transactions' : 'Show transactions'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      )}

      {open && (
        <ul className="mt-3 overflow-hidden rounded-2xl border border-[#1b1233]/10 bg-white/70">
          {rows.map((row, index) => (
            <li
              key={`${row.date}-${index}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-[12.5px]',
                index > 0 && 'border-t border-[#1b1233]/[0.07]',
                row.wasted && 'bg-[#ffd9a8]/70',
              )}
            >
              <span className="w-[62px] shrink-0 tabular-nums text-[#5b5275]">{rowDate(row.date)}</span>
              <span className="min-w-0 flex-1 truncate">{row.description}</span>
              <span className={cn('shrink-0 tabular-nums', row.wasted ? 'font-bold text-[#8a3b00]' : 'text-[#5b5275]')}>
                {money(row.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {leak.tip && (
        <p className="mt-3 rounded-2xl bg-[#1b1233]/[0.05] px-3 py-2 text-[12.5px] font-semibold leading-relaxed text-[#5b5275]">
          {leak.tip}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={onDraft}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1b1233]/70 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-[#1b1233] hover:text-[#f5f0e8]"
        >
          <action.Icon className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}