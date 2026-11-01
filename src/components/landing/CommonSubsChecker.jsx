import { useMemo, useState } from 'react';
import { COMMON_SUBS, CHECKED_ON, GROUP_LABELS, monthlyRange } from '@/data/commonSubs';
import { money, moneyWhole } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';

const priceText = (item) => {
  const unit = item.unit === 'week' ? 'a week' : 'a month';
  return item.low === item.high ? `${money(item.low)} ${unit}` : `${money(item.low)} to ${money(item.high)} ${unit}`;
};

// Free hook, no upload: "Do you have any of these?" with typical prices.
// Clearly typical, sourced and dated, never mixed into a real total.
export default function CommonSubsChecker({ onUpload, onSample }) {
  const [picked, setPicked] = useState([]);
  const toggle = (key) => setPicked((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));

  const range = useMemo(() => COMMON_SUBS.filter((item) => picked.includes(item.key)).reduce((sum, item) => {
    const month = monthlyRange(item);
    return { low: sum.low + month.low * 12, high: sum.high + month.high * 12 };
  }, { low: 0, high: 0 }), [picked]);

  const groups = Object.keys(GROUP_LABELS).map((group) => ({ group, items: COMMON_SUBS.filter((item) => item.group === group) })).filter((g) => g.items.length);

  return (
    <section aria-labelledby="common-subs-title" className="mx-auto mt-10 w-full max-w-5xl px-4">
      <div className="rounded-3xl border border-border bg-card/80 p-5 sm:p-7">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary">No upload needed</p>
        <h2 id="common-subs-title" className="mt-1 font-heading text-[22px] font-bold text-foreground">Do you have any of these?</h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">Tap the ones you pay for to see what they typically cost in Australia. Typical prices only, not yours.</p>

        <div className="mt-4 space-y-3">
          {groups.map(({ group, items }) => (
            <div key={group}>
              <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{GROUP_LABELS[group]}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {items.map((item) => {
                  const on = picked.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(item.key)}
                      className={cn('rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:border-primary/60')}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {picked.length > 0 && (
          <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
            <ul className="space-y-1.5">
              {COMMON_SUBS.filter((item) => picked.includes(item.key)).map((item) => (
                <li key={item.key} className="flex flex-wrap items-baseline justify-between gap-x-3 text-[13px]">
                  <span className="font-semibold text-foreground">{item.name}{item.note ? <span className="font-normal text-muted-foreground"> · {item.note}</span> : null}</span>
                  <span className="text-muted-foreground">
                    typically {priceText(item)} · <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{item.source}</a>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[14px] font-semibold text-foreground">
              Typically {moneyWhole(range.low)} to {moneyWhole(range.high)} a year for these.
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">Typical prices checked {CHECKED_ON}. This is not your total and isn&apos;t counted anywhere.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onUpload} className="rounded-full bg-primary px-4 py-2 text-[14px] font-bold text-primary-foreground">
                Upload your statement to see what you actually pay
              </button>
              <button type="button" onClick={onSample} className="rounded-full border border-border px-4 py-2 text-[13.5px] font-bold text-foreground hover:border-primary/60">
                Try the sample first
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
