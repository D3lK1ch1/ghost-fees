import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { money, shortDate } from '@/lib/ghostFees/format';
import { CPI, versusCpi } from '@/lib/ghostFees/inflation';
import { useTheme } from '@/lib/ThemeContext';
import { kindOf } from '@/lib/ghostFees/exJourney';
import { exAvatar } from '@/lib/ghostFees/exArt';
import LeakSource from '@/components/results/LeakSource';
import { C, GhostButton, PrimaryButton } from './ExKit';

const ACTIONS = {
  cancel: '💔 Draft cancel email',
  refund: '💔 Draft refund request',
  waive: '💔 Ask bank to waive',
};

const FEE_RE = /\bFEE\b|\bFEES\b|INTEREST|\bATM\b|OVERDRAWN|DISHONOUR/i;

function rowDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' });
}

// One ghost card in the 💔 theme, built like the ex cards on design screen Ex4Subs:
// photo avatar, name with "kind · what happened", the amount on the right, the
// ex's one-liner in a chat bubble, then the real details and the action button.
export default function ExLeakCard({ leak, onDraft, avatar, primary = false }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const name = leak.title || leak.merchant;
  const rows = leak.rows || [];
  const rise = leak.priceRise ? versusCpi(leak.priceRise.oldPrice, leak.priceRise.newPrice) : null;
  const kind = FEE_RE.test(name) || leak.badge === 'Bank fee' ? 'Bank' : kindOf(leak.merchant || name);
  const line = theme.lines?.find((entry) => entry.match.test(leak.merchant || name))?.text || theme.fallbackLine;
  const label = ACTIONS[leak.action];
  const Button = primary ? PrimaryButton : GhostButton;

  return (
    <div className="flex flex-col gap-3 rounded-[20px] p-4" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.text }}>
      <div className="flex items-center gap-3">
        <img src={avatar || exAvatar(leak.merchant)} alt="" width={42} height={42} className="ex-av h-[42px] w-[42px] flex-none object-contain" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[17px] font-extrabold">{name}</span>
          <span className="text-[13px]" style={{ color: C.muted }}>
            {kind} · {leak.badge?.toLowerCase()}{leak.extraBadge ? ` · ${leak.extraBadge.toLowerCase()}` : ''}
          </span>
        </div>
        <div className="flex flex-none flex-col items-end">
          <span className="ex-fredoka text-[20px] font-semibold tabular-nums">{money(leak.amount)}</span>
          <span className="text-[13px]" style={{ color: C.muted }}>{leak.caption}</span>
        </div>
      </div>

      {line && (
        <div className="max-w-[88%] self-start px-3 py-2 text-[14px]" style={{ borderRadius: '16px 16px 16px 4px', background: C.bg, color: C.soft }}>
          &quot;{line}&quot;
        </div>
      )}

      <p className="m-0 text-[14px] leading-snug" style={{ color: '#e6e2ea' }}>{leak.reason}</p>

      {rise && (
        <p className="m-0 text-[13px] leading-relaxed" style={{ color: C.muted }}>
          Up <strong style={{ color: C.text }}>{rise.percent}%</strong> since {shortDate(leak.priceRise.since)}.
          {' '}Prices overall rose {CPI.rate}% in the year to {CPI.asOf} (ABS).
          {rise.above && (
            <span className="ml-2 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-extrabold" style={{ background: C.coral, color: C.bg }}>
              Above inflation
            </span>
          )}
        </p>
      )}

      <div className="-mt-2">
        <LeakSource dates={leak.dates} sources={leak.sources} dark />
      </div>

      {rows.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-[32px] items-center gap-1.5 self-start text-[15px] font-extrabold underline"
          style={{ color: '#ffa3ab' }}
        >
          {open ? 'Hide transactions' : 'Show transactions'}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {open && (
        <ul className="m-0 overflow-hidden rounded-2xl p-0" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
          {rows.map((row, index) => (
            <li
              key={`${row.date}-${index}`}
              className="flex items-center gap-3 px-3 py-2 text-[13px]"
              style={{ borderTop: index > 0 ? `1px solid ${C.line}` : undefined, background: row.wasted ? 'rgba(255,111,125,0.14)' : undefined }}
            >
              <span className="w-[62px] shrink-0 tabular-nums" style={{ color: C.muted }}>{rowDate(row.date)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{row.description}</span>
                {row.source && <span className="block truncate text-[11px]" style={{ color: C.faint }}>{row.source}</span>}
              </span>
              <span className="shrink-0 tabular-nums" style={{ color: row.wasted ? C.coral : C.muted, fontWeight: row.wasted ? 800 : 400 }}>
                {money(row.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {leak.tip && (
        <p className="m-0 rounded-2xl px-3 py-2 text-[13px] font-semibold leading-relaxed" style={{ background: C.bg, color: C.soft }}>{leak.tip}</p>
      )}

      {label && (
        <Button onClick={onDraft}>{label}</Button>
      )}
    </div>
  );
}
