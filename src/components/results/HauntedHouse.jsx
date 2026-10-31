import { useEffect, useRef, useState } from 'react';
import { Check, Flame, Landmark, Mail, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';
import { GUIDES, GUIDE_KEYS } from '@/lib/ghostFees/guides';
import { hourlyFromMonthly, hoursOfWork } from '@/lib/ghostFees/hours';
import GhostMark from '@/components/site/GhostMark';

const ACTIONS = {
  cancel: { label: 'Draft cancel email', Icon: Mail },
  refund: { label: 'Draft refund request', Icon: Undo2 },
  waive: { label: 'Ask bank to waive', Icon: Landmark },
};

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Counts a dollar figure to its new value so the remaining total counts down.
function useTween(value) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const frame = useRef(0);

  useEffect(() => {
    if (prefersReduced()) {
      setShown(value);
      from.current = value;
      return undefined;
    }
    const start = performance.now();
    const beginning = from.current;
    const step = (now) => {
      const progress = Math.min((now - start) / 700, 1);
      const eased = 1 - (1 - progress) ** 3;
      setShown(beginning + (value - beginning) * eased);
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else from.current = value;
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [value]);

  return shown;
}

// One room per leak, biggest first. Busting is kept in this component only.
export default function HauntedHouse({ leaks, onDraft, monthlyIncome }) {
  const [cleared, setCleared] = useState([]);
  const [selectedId, setSelectedId] = useState(leaks[0]?.id ?? null);
  const [guideKey, setGuideKey] = useState('penny');
  const [line, setLine] = useState(null);
  const [unit, setUnit] = useState('money');

  const guide = GUIDES[guideKey];
  const hourly = hourlyFromMonthly(monthlyIncome);
  const inHours = unit === 'hours' && hourly > 0;
  const show = (value) => (inHours ? `${hoursOfWork(value, hourly)} h` : money(value));

  const clearedSet = new Set(cleared);
  const total = leaks.reduce((sum, leak) => sum + leak.amount, 0);
  const remaining = leaks
    .filter((leak) => !clearedSet.has(leak.id))
    .reduce((sum, leak) => sum + leak.amount, 0);
  const shown = useTween(remaining);

  const next = leaks.find((leak) => !clearedSet.has(leak.id));
  const selected = leaks.find((leak) => leak.id === selectedId) || next || null;
  const allClear = leaks.length > 0 && cleared.length === leaks.length;

  if (!leaks.length) return null;

  const exorcise = (leak) => {
    setCleared((current) => (current.includes(leak.id) ? current : [...current, leak.id]));
    const after = leaks.find((item) => item.id !== leak.id && !clearedSet.has(item.id));
    if (after) setSelectedId(after.id);
    const left = leaks.length - cleared.length - (clearedSet.has(leak.id) ? 0 : 1);
    setLine(left > 0 ? { type: 'bust', leak, left } : { type: 'done' });
  };

  const pick = (leak) => {
    setSelectedId(leak.id);
    setLine({ type: 'pick', leak });
  };

  // The line is rebuilt from the current guide, so switching guides re-voices it.
  const speech = !line
    ? guide.intro(leaks.length, total)
    : line.type === 'pick' ? guide.pick(line.leak)
      : line.type === 'bust' ? guide.bust(line.leak, line.left)
        : guide.done(total);

  const action = selected ? ACTIONS[selected.action] : null;

  return (
    <section className="mt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-retro text-[15px] uppercase tracking-[0.18em] text-primary/80">Haunted house</p>
          <p className="mt-1 font-heading text-lg font-semibold text-foreground">
            Each dark room is a money leak. Bust them one by one.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-[2rem] font-bold leading-none tabular-nums text-primary [text-shadow:0_0_22px_hsl(var(--primary)/0.35)]">
            {show(shown)}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {remaining > 0 ? 'still haunting you' : 'nothing left haunting you'}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-[#5ee6c8] transition-[width] duration-700"
          style={{ width: `${(cleared.length / leaks.length) * 100}%` }}
        />
      </div>
      <p className="mt-2 font-retro text-[15px] text-[#ffc27a]">
        Ghosts busted {cleared.length}/{leaks.length} · {show(total - remaining)} exorcised
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div className="flex items-center gap-1.5" role="group" aria-label="Pick your ghost guide">
          {GUIDE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setGuideKey(key)}
              aria-pressed={guideKey === key}
              aria-label={`${GUIDES[key].name}, ${GUIDES[key].role}`}
              title={GUIDES[key].name}
              className={cn(
                'rounded-xl border-2 p-1.5 transition-colors',
                guideKey === key ? 'border-primary bg-card' : 'border-border bg-card/40 hover:border-primary/50',
              )}
            >
              <span className="block" style={{ color: GUIDES[key].color }}>
                <GhostMark className="h-7 w-7" eyeColor="#1a1230" />
              </span>
            </button>
          ))}
        </div>
        <p
          key={speech}
          aria-live="polite"
          className="relative min-w-0 flex-1 animate-rise rounded-2xl rounded-tl-sm border border-border bg-card px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground"
        >
          <span className="font-bold" style={{ color: guide.color }}>{guide.name}: </span>
          {speech}
        </p>
        {hourly > 0 && (
          <div className="flex rounded-full border border-border bg-card/60 p-0.5">
            {[['money', '$'], ['hours', 'Hours of work']].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setUnit(key)}
                aria-pressed={unit === key}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors',
                  unit === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mx-auto h-14 w-[78%] [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#3b2b5c] p-[3px] sm:h-16">
            <div className="h-full w-full [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#2a1b45]" />
          </div>

          <div
            className={cn(
              'rounded-b-3xl border-2 border-[#4a3770] bg-[#1b1230] p-3 transition-shadow sm:p-4',
              allClear && 'shadow-[0_0_60px_rgba(255,240,200,0.22)]',
            )}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {leaks.map((leak) => {
                const done = clearedSet.has(leak.id);
                const isNext = !done && next?.id === leak.id;
                const active = selected?.id === leak.id;

                return (
                  <button
                    key={leak.id}
                    type="button"
                    onClick={() => pick(leak)}
                    aria-label={`${leak.title || leak.merchant}, ${leak.badge}, ${money(leak.amount)}${done ? ', cleared' : ''}`}
                    className={cn(
                      'relative rounded-xl border-2 p-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                      done ? 'border-[#ffcf73]/50 bg-[#3a2a1f]' : 'border-[#3b2b5c] bg-[#231838] hover:bg-[#2c1f47]',
                      isNext && 'border-primary',
                      active && 'ring-2 ring-primary/60',
                    )}
                  >
                    {isNext && (
                      <Flame className="absolute right-2 top-2 h-4 w-4 animate-bob text-primary" strokeWidth={2.4} />
                    )}

                    <div
                      className={cn(
                        'flex h-14 items-center justify-center rounded-md border-2',
                        done
                          ? 'border-[#ffcf73] bg-[#ffcf73] shadow-[0_0_18px_rgba(255,190,90,0.75)]'
                          : 'border-[#5a4785] bg-[#0d0819]',
                      )}
                    >
                      {done ? (
                        <Check className="h-6 w-6 text-[#1f7a5c]" strokeWidth={3} />
                      ) : (
                        <GhostMark className="h-8 w-8 animate-bob text-[#f5efe6]" eyeColor="#1a1230" />
                      )}
                    </div>

                    <p className="mt-2 truncate text-[12.5px] font-bold text-[#f4ede2]">
                      {leak.title || leak.merchant}
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-[#ffc27a]">
                      {show(leak.amount)} · {leak.badge}
                    </p>
                  </button>
                );
              })}
            </div>

            {allClear && (
              <p className="mt-3 rounded-xl bg-[#f4ede2] px-4 py-3 text-center font-heading text-base font-bold text-[#1a1230]">
                Ghost-free house!
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-2xl bg-[#f5f0e8] p-4 text-[#1b1233] sm:p-5 lg:self-start">
          {selected && (
            <>
              <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold', BADGE_TONES[selected.badge])}>
                {selected.badge}
              </span>
              <h3 className="mt-2 font-heading text-xl font-semibold">{selected.title || selected.merchant}</h3>
              <p className="mt-1 font-heading text-3xl font-bold leading-none">{money(selected.amount)}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#5b5275]">{selected.reason}</p>

              {clearedSet.has(selected.id) ? (
                <p className="mt-3 text-[13px] font-bold text-[#1f7a5c]">Room cleared. Nice work.</p>
              ) : (
                <>
                  {action && (
                    <button
                      type="button"
                      onClick={() => onDraft(selected)}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1b1233]/30 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-[#1b1233]/[0.06]"
                    >
                      <action.Icon className="h-4 w-4" />
                      {action.label}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => exorcise(selected)}
                    className="mt-2 w-full rounded-xl bg-[#1b1233] py-3 text-[14px] font-bold text-[#f5f0e8] shadow-[0_0_0_2px_hsl(var(--primary))] transition-shadow hover:shadow-[0_0_0_2px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.55)]"
                  >
                    Exorcise this ghost
                  </button>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-[#5b5275]">
                    Exorcise when you&apos;ve cancelled, asked for a refund, or decided to keep it.
                  </p>
                </>
              )}
            </>
          )}

          {cleared.length > 0 && (
            <button
              type="button"
              onClick={() => { setCleared([]); setSelectedId(leaks[0].id); setLine(null); }}
              className="mt-3 text-[12px] font-bold text-[#5b5275] underline underline-offset-4"
            >
              Reset the house
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}