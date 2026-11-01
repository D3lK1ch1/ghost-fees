import { useState } from 'react';
import { ChevronDown, Landmark, Mail, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, shortDate } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';
import { CPI, versusCpi } from '@/lib/ghostFees/inflation';
import { BadgePop } from '@/components/GhostAnimations';
import { useTheme } from '@/lib/ThemeContext';
import { exAvatar } from '@/lib/ghostFees/exArt';
import LeakSource from './LeakSource';

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
  const { theme } = useTheme();
  // The My Ex theme uses dark cards with the merchant's ex ghost on the left.
  const dark = theme.key === 'ex';
  const action = ACTIONS[leak.action];
  const rows = leak.rows || [];
  const rise = leak.priceRise ? versusCpi(leak.priceRise.oldPrice, leak.priceRise.newPrice) : null;
  const muted = dark ? 'text-[#bdb7c6]' : 'text-[#5b5275]';
  const strong = dark ? 'text-[#fbf8fa]' : 'text-[#1b1233]';

  return (
    <div
      className={cn(
        'rounded-3xl p-4 sm:p-5',
        dark ? 'border border-[#34303e] bg-[#221f29] text-[#d6d1db]' : 'bg-[#f5f0e8] text-[#1b1233]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {dark && (
            <img
              src={exAvatar(leak.merchant)}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className={cn('truncate font-heading text-[17px] font-semibold', dark && 'text-[#fbf8fa]')}>
              {leak.title || leak.merchant}
            </h3>
            <BadgePop className={cn('mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold', BADGE_TONES[leak.badge])}>
              {leak.badge}
            </BadgePop>
            {leak.extraBadge && (
              <BadgePop delay={0.75} className={cn('ml-1.5 mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold', BADGE_TONES[leak.extraBadge])}>
                {leak.extraBadge}
              </BadgePop>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn('font-heading text-[1.7rem] font-bold leading-none tabular-nums', dark && 'text-[#fbf8fa]')}>
            {money(leak.amount)}
          </div>
          <div className={cn('mt-1.5 text-[12px] font-semibold', muted)}>{leak.caption}</div>
        </div>
      </div>
      <p className={cn('mt-2 text-[13px] leading-relaxed', muted)}>{leak.reason}</p>

      <LeakSource dates={leak.dates} sources={leak.sources} dark={dark} />

      {rise && (
        <p className={cn('mt-2 text-[12.5px] leading-relaxed', muted)}>
          Up <strong className={strong}>{rise.percent}%</strong> since {shortDate(leak.priceRise.since)}.
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
          className={cn('mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold underline underline-offset-4', muted, dark ? 'hover:text-[#fbf8fa]' : 'hover:text-[#1b1233]')}
        >
          {open ? 'Hide transactions' : 'Show transactions'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      )}

      {open && (
        <ul className={cn('mt-3 overflow-hidden rounded-2xl border', dark ? 'border-[#34303e] bg-white/[0.04]' : 'border-[#1b1233]/10 bg-white/70')}>
          {rows.map((row, index) => (
            <li
              key={`${row.date}-${index}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-[12.5px]',
                index > 0 && (dark ? 'border-t border-[#34303e]' : 'border-t border-[#1b1233]/[0.07]'),
                row.wasted && 'bg-[#ffd9a8]/70',
              )}
            >
              <span className={cn('w-[62px] shrink-0 tabular-nums', muted)}>{rowDate(row.date)}</span>
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate', row.wasted && 'text-[#1b1233]')}>{row.description}</span>
                {row.source && (
                  <span className={cn('block truncate text-[11px]', row.wasted ? 'text-[#8a3b00]' : muted)}>{row.source}</span>
                )}
              </span>
              <span className={cn('shrink-0 tabular-nums', row.wasted ? 'font-bold text-[#8a3b00]' : muted)}>
                {money(row.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {leak.tip && (
        <p className={cn('mt-3 rounded-2xl px-3 py-2 text-[12.5px] font-semibold leading-relaxed', muted, dark ? 'bg-white/[0.04]' : 'bg-[#1b1233]/[0.05]')}>
          {leak.tip}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={onDraft}
          className={cn(
            'mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl border py-2.5 text-[13.5px] font-bold transition-colors',
            dark
              ? 'border-[#ff6f7d]/50 text-[#fbf8fa] hover:bg-[#ff6f7d] hover:text-[#15131a]'
              : 'border-[#1b1233]/70 hover:bg-[#1b1233] hover:text-[#f5f0e8]',
          )}
        >
          <action.Icon className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  );
}