import { useMemo, useState } from 'react';
import { COMMON_SUBS, CHECKED_ON, GROUP_LABELS, monthlyRange } from '@/data/commonSubs';
import { money, moneyWhole } from '@/lib/ghostFees/format';
import { cn } from '@/lib/utils';

const unitWord = (item) => (item.unit === 'week' ? 'a week' : 'a month');
const priceText = (item) => (item.low === item.high ? `${money(item.low)} ${unitWord(item)}` : `${money(item.low)} to ${money(item.high)} ${unitWord(item)}`);
const yearly = (item, amount) => amount * (item.unit === 'week' ? 52 : 12);
// Tappable amounts: the cheapest plan, the dearest plan and the middle when they differ.
const amountsFor = (item) => {
  if (item.low === item.high) return [item.low];
  const mid = Math.round(((item.low + item.high) / 2) * 100) / 100;
  return [item.low, mid, item.high];
};

// Free hook, no upload and no agent (4 Nov): tap what you have, then tap what you pay.
// Your own taps make a yearly total that never leaves the page and is never mixed into a
// scan. Typical prices are sourced and dated. No cancel links are guessed here.
export default function CommonSubsChecker({ onUpload, onSample }) {
  const [picked, setPicked] = useState([]);
  const [paid, setPaid] = useState({});
  const toggle = (key) => setPicked((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  const choose = (key, value) => setPaid((current) => ({ ...current, [key]: value }));

  const chosen = COMMON_SUBS.filter((item) => picked.includes(item.key));
  const range = useMemo(() => chosen.reduce((sum, item) => {
    const month = monthlyRange(item);
    return { low: sum.low + month.low * 12, high: sum.high + month.high * 12 };
  }, { low: 0, high: 0 }), [chosen]);
  const tapped = chosen.filter((item) => Number(paid[item.key]) > 0);
  const yourYear = tapped.reduce((sum, item) => sum + yearly(item, Number(paid[item.key])), 0);
  const streaming = chosen.filter((item) => item.group === 'video');
  const dearest = tapped.length ? tapped.reduce((top, item) => (yearly(item, Number(paid[item.key])) > yearly(top, Number(paid[top.key])) ? item : top)) : null;

  const groups = Object.keys(GROUP_LABELS).map((group) => ({ group, items: COMMON_SUBS.filter((item) => item.group === group) })).filter((g) => g.items.length);

  return (
    <section aria-labelledby="common-subs-title" className="mx-auto mt-10 w-full max-w-5xl px-4">
      <div className="rounded-3xl border border-border bg-card/80 p-5 sm:p-7">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary">No upload, no agent</p>
        <h2 id="common-subs-title" className="mt-1 font-heading text-[22px] font-bold text-foreground">Don&apos;t want to upload your statements?</h2>
        <p className="mt-1 text-[14.5px] text-muted-foreground">1. Tap the ones you pay for. 2. Tap what you pay. We add it up for a year. Nothing is uploaded or saved.</p>

        <div className="mt-4 space-y-3">
          {groups.map(({ group, items }) => (
            <div key={group}>
              <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{GROUP_LABELS[group]}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {items.map((item) => {
                  const on = picked.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(item.key)}
                      className={cn('rounded-full border px-3 py-1.5 text-[14px] font-semibold transition-colors', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground hover:border-primary/60')}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {chosen.length > 0 && (
          <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
            <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted-foreground">What do you pay?</p>
            <ul className="mt-2 space-y-3">
              {chosen.map((item) => {
                const value = paid[item.key];
                const preset = amountsFor(item);
                const custom = value !== undefined && !preset.includes(Number(value));
                return (
                  <li key={item.key} className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-[14px]">
                      <span className="font-semibold text-foreground">{item.name}{item.note ? <span className="font-normal text-muted-foreground"> · {item.note}</span> : null}</span>
                      <span className="text-[13px] text-muted-foreground">
                        typically {priceText(item)} (<a href={item.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{item.source}</a>)
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={`What you pay for ${item.name}`}>
                      {preset.map((amount) => {
                        const on = Number(value) === amount && !custom;
                        return (
                          <button
                            key={amount}
                            type="button"
                            aria-pressed={on}
                            onClick={() => choose(item.key, amount)}
                            className={cn('rounded-full border px-3 py-1 text-[13.5px] font-semibold transition-colors', on ? 'border-[#5ee6c8] bg-[#5ee6c8]/15 text-foreground' : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground')}
                          >
                            {money(amount)}
                          </button>
                        );
                      })}
                      <label className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[13.5px] text-muted-foreground focus-within:border-primary">
                        <span aria-hidden="true">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          placeholder="other"
                          aria-label={`Type what you pay for ${item.name}`}
                          value={custom ? value : ''}
                          onChange={(event) => choose(item.key, event.target.value)}
                          className="w-16 bg-transparent py-0.5 text-foreground outline-none placeholder:text-muted-foreground"
                        />
                      </label>
                      <span className="text-[13px] text-muted-foreground">{unitWord(item)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 rounded-xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] p-3">
              {tapped.length > 0 ? (
                <>
                  <p className="text-[16px] font-semibold text-foreground">
                    You pay about {moneyWhole(yourYear)} a year for {tapped.length === 1 ? 'this one' : `these ${tapped.length}`}.
                  </p>
                  {dearest && tapped.length > 1 && (
                    <p className="mt-1 text-[14px] text-muted-foreground">The dearest is {dearest.name} at {moneyWhole(yearly(dearest, Number(paid[dearest.key])))} a year.</p>
                  )}
                  {tapped.length < chosen.length && (
                    <p className="mt-1 text-[13.5px] text-muted-foreground">Tap an amount for the other {chosen.length - tapped.length} to add {chosen.length - tapped.length === 1 ? 'it' : 'them'}.</p>
                  )}
                </>
              ) : (
                <p className="text-[14.5px] text-foreground">Typically {moneyWhole(range.low)} to {moneyWhole(range.high)} a year for these. Tap what you pay to see your own number.</p>
              )}
              {streaming.length >= 2 && (
                <p className="mt-2 text-[14px] text-foreground">
                  <span className="font-semibold text-primary">Double up? </span>
                  You have {streaming.length} streaming services. Most people watch one at a time, so you could keep one and pause the rest, then swap each month.
                </p>
              )}
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">Typical prices checked {CHECKED_ON}. Your taps stay on this page and aren&apos;t counted anywhere.</p>

            <p className="mt-3 text-[13.5px] text-muted-foreground">Want the ones you forgot about too? Only a statement shows those.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={onUpload} className="rounded-full bg-primary px-4 py-2 text-[14px] font-bold text-primary-foreground">
                Upload a statement
              </button>
              <button type="button" onClick={onSample} className="rounded-full border border-border px-4 py-2 text-[14.5px] font-bold text-foreground hover:border-primary/60">
                Try the sample first
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
