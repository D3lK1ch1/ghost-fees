import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { xmasAvatar } from '@/lib/ghostFees/christmasArt';
import LeakSource from '@/components/results/LeakSource';
import { GoldButton, LineButton, useSeason } from './XmasKit';

const ACTIONS = { cancel: '🎄 Draft cancel email', refund: '🎄 Draft refund request', waive: '🎄 Ask bank to waive' };

function rowDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' });
}

// One ghost card in the 🎄 theme, in the style of the design's cancel list (CW6):
// green card, festive avatar, the receipt-paper badge, gold amount and button.
export default function XmasLeakCard({ leak, onDraft, primary = false }) {
  const { season, X } = useSeason();
  const [open, setOpen] = useState(false);
  const rows = leak.rows || [];
  const label = ACTIONS[leak.action];
  const Button = primary ? GoldButton : LineButton;

  return (
    <div className="x-root relative flex flex-col gap-2.5 rounded-[20px] p-4" style={{ background: X.card, border: `1px solid ${X.line}`, color: X.text }}>
      <div className="flex items-center gap-2.5">
        <img src={xmasAvatar(leak.merchant, season)} alt="" width={46} height={46} className="x-bob h-[46px] w-[46px] flex-none rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[16px] font-extrabold">{leak.title || leak.merchant}</span>
          <span className="mt-0.5 self-start rounded-md px-2 py-0.5 text-[11px] font-extrabold" style={{ background: X.cream, color: '#14301f' }}>{leak.badge}</span>
        </div>
        <div className="flex flex-none flex-col items-end">
          <span className="x-fredoka text-[20px] font-semibold" style={{ color: X.gold }}>{money(leak.amount)}</span>
          <span className="text-[12px]" style={{ color: X.muted }}>{leak.caption}</span>
        </div>
      </div>
      <p className="m-0 text-[14px] leading-snug">{leak.reason}</p>
      <div className="-mt-2"><LeakSource dates={leak.dates} sources={leak.sources} dark /></div>
      {rows.length > 0 && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="inline-flex min-h-[32px] items-center gap-1.5 self-start text-[14px] font-extrabold underline" style={{ color: X.gold }}>
          {open ? 'Hide transactions' : 'Show transactions'} <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
      {open && (
        <ul className="m-0 overflow-hidden rounded-2xl p-0" style={{ background: X.cream, color: '#14301f' }}>
          {rows.map((row, index) => (
            <li key={`${row.date}-${index}`} className="flex items-center gap-3 px-3 py-2 text-[13px]" style={{ borderTop: index ? '1px dashed #c9b28a' : undefined, background: row.wasted ? 'rgba(229,72,77,0.12)' : undefined }}>
              <span className="w-[62px] shrink-0 tabular-nums">{rowDate(row.date)}</span>
              <span className="min-w-0 flex-1 truncate">{row.description}</span>
              <span className="shrink-0 font-bold tabular-nums" style={{ color: row.wasted ? '#c0392b' : undefined }}>{money(row.amount)}</span>
            </li>
          ))}
        </ul>
      )}
      {leak.tip && <p className="m-0 rounded-2xl px-3 py-2 text-[13px] font-semibold" style={{ background: 'rgba(0,0,0,.25)', color: X.muted }}>{leak.tip}</p>}
      {label && <Button X={X} onClick={onDraft}>{label}</Button>}
    </div>
  );
}
