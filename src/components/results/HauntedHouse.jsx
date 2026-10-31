import { useEffect, useRef, useState } from 'react';
import { Check, Landmark, Mail, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, monthsLabel } from '@/lib/ghostFees/format';
import { BADGE_TONES } from '@/lib/ghostFees/leaks';
import { GUIDES, GUIDE_KEYS } from '@/lib/ghostFees/guides';
import { hourlyFromMonthly, hoursOfWork } from '@/lib/ghostFees/hours';
import GhostMark from '@/components/site/GhostMark';

const ACTIONS = {
  cancel: { label: 'Draft cancel email', Icon: Mail },
  refund: { label: 'Draft refund request', Icon: Undo2 },
  waive: { label: 'Ask bank to waive', Icon: Landmark },
};

// Each ghost type lives in one room. Anything else wanders the hallway.
const ROOMS = [
  { key: 'attic', label: 'Attic', badges: ['Price creep'] },
  { key: 'guest', label: 'Guest room', badges: ['Trial converted'] },
  { key: 'mirror', label: 'Mirror room', badges: ['Duplicate'] },
  { key: 'hallway', label: 'Creaky hallway', badges: [] },
  { key: 'basement', label: 'Basement', badges: ['Bank fee'] },
];

// Saturated dots for the type breakdown (badge tones are too pale on dark).
const DOTS = {
  Duplicate: 'bg-[#ff6b8a]',
  'Price creep': 'bg-[#ff9a3c]',
  'Trial converted': 'bg-[#a78bfa]',
  'Bank fee': 'bg-[#60a5fa]',
  Overlap: 'bg-[#d08cff]',
  'Borrowing cost': 'bg-[#ff7a59]',
  Surcharge: 'bg-[#5ee6c8]',
};

function roomOf(leak) {
  return (ROOMS.find((room) => room.badges.includes(leak.badge)) || ROOMS[3]).key;
}

function Bat({ className, style }) {
  return (
    <svg viewBox="0 0 40 16" className={className} style={style} aria-hidden="true">
      <path d="M20 6c1-2 2-3 2-3l1 2c3-3 9-4 17-2-4 1-6 3-7 6-2-2-5-2-7 0-1-1-2-1-3-1h-6c-1 0-2 0-3 1-2-2-5-2-7 0-1-3-3-5-7-6 8-2 14-1 17 2l1-2s1 1 2 3Z" fill="#0b0716" />
    </svg>
  );
}

function prefersReduced() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Counts a dollar figure to its new value so the saved total counts up.
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

function Room({ room, leaks, cleared, active, onSelect, className, delay = 0 }) {
  const left = leaks.filter((leak) => !cleared.has(leak.id)).length;
  const size = leaks.length > 3 ? 'h-9 w-9' : leaks.length > 1 ? 'h-12 w-12' : 'h-16 w-16';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!leaks.length}
      aria-pressed={active}
      aria-label={`${room.label}, ${leaks.length} ${leaks.length === 1 ? 'ghost' : 'ghosts'}${leaks.length && !left ? ', all busted' : ''}`}
      className={cn(
        'relative flex min-h-[120px] w-full flex-col rounded-2xl border-2 p-3 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        active ? 'border-primary bg-[#2c1f47] shadow-[0_0_30px_hsl(var(--primary)/0.25)]' : 'border-[#3d2e66] bg-[#241a3d]',
        leaks.length ? 'hover:border-primary/60' : 'cursor-default opacity-60',
        leaks.length > 0 && !left && 'bg-[#3a2a1f] shadow-[inset_0_0_40px_rgba(255,200,110,0.18)]',
        className,
      )}
    >
      <span
        style={{ animationDelay: `${delay}s` }}
        className={cn(
          'absolute right-3 top-3 h-2.5 w-2.5 animate-window-flicker rounded-full',
          leaks.length && !left ? 'bg-[#ffcf73] shadow-[0_0_12px_#ffcf73]' : 'bg-primary/70 shadow-[0_0_10px_hsl(var(--primary))]',
        )}
      />
      <span
        className={cn(
          'self-start rounded-full px-2.5 py-1 text-[11.5px] font-bold',
          active ? 'bg-primary text-primary-foreground' : 'bg-[#170f2a]/80 text-[#e6defa]',
        )}
      >
        {room.label} · {leaks.length ? `${leaks.length} ${leaks.length === 1 ? 'ghost' : 'ghosts'}` : 'empty'}
      </span>

      <span className="flex flex-1 flex-wrap items-end justify-center gap-3 pt-3">
        {leaks.map((leak, index) => (
          cleared.has(leak.id) ? (
            <Check key={leak.id} className="h-7 w-7 animate-poof text-[#ffcf73] drop-shadow-[0_0_10px_#ffcf73]" strokeWidth={3} />
          ) : (
            <span key={leak.id} className="animate-bob" style={{ animationDelay: `${index * 0.4}s` }}>
              <GhostMark className={cn(size, 'text-[#e8e2f2] drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]')} eyeColor="#1a1230" />
            </span>
          )
        ))}
      </span>
    </button>
  );
}

// Leaks drawn as ghosts in a five-room house. Busting is kept in this component only.
export default function HauntedHouse({ leaks, onDraft, monthlyIncome, guideKey = 'penny', onGuide }) {
  const [cleared, setCleared] = useState([]);
  const [roomKey, setRoomKey] = useState(() => (leaks[0] ? roomOf(leaks[0]) : null));
  const [line, setLine] = useState(null);
  const [unit, setUnit] = useState('money');

  const guide = GUIDES[guideKey];
  const hourly = hourlyFromMonthly(monthlyIncome);
  const inHours = unit === 'hours' && hourly > 0;
  const show = (value) => (inHours ? `${hoursOfWork(value, hourly)} h` : money(value));

  const clearedSet = new Set(cleared);
  const total = leaks.reduce((sum, leak) => sum + leak.amount, 0);
  const saved = leaks.filter((leak) => clearedSet.has(leak.id)).reduce((sum, leak) => sum + leak.amount, 0);
  const shown = useTween(saved);
  const months = leaks[0]?.months || 0;

  if (!leaks.length) return null;

  const byRoom = Object.fromEntries(ROOMS.map((room) => [room.key, leaks.filter((leak) => roomOf(leak) === room.key)]));
  const room = ROOMS.find((item) => item.key === roomKey) || ROOMS[0];
  const roomLeaks = byRoom[room.key];

  const types = [];
  leaks.forEach((leak) => {
    const type = types.find((item) => item.badge === leak.badge);
    if (type) { type.count += 1; type.amount += leak.amount; } else types.push({ badge: leak.badge, count: 1, amount: leak.amount });
  });
  types.sort((a, b) => b.amount - a.amount);

  const selectRoom = (key) => {
    setRoomKey(key);
    const list = byRoom[key];
    setLine({ type: 'room', label: ROOMS.find((item) => item.key === key).label, count: list.length, amount: list.reduce((sum, leak) => sum + leak.amount, 0) });
  };

  const bust = (leak) => {
    if (clearedSet.has(leak.id)) return;
    setCleared((current) => [...current, leak.id]);
    const left = leaks.length - cleared.length - 1;
    setLine(left > 0 ? { type: 'bust', leak, left } : { type: 'done' });
  };

  // The line is rebuilt from the current guide, so switching guides re-voices it.
  const speech = !line ? guide.intro(leaks.length, total)
    : line.type === 'room' ? guide.room(line.label, line.count, line.amount)
      : line.type === 'bust' ? guide.bust(line.leak, line.left)
        : guide.done(total);

  return (
    <section className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-3xl bg-[#140c26] px-3 pb-3 pt-6 sm:px-6 lg:self-start">
        <div className="pointer-events-none absolute right-6 top-4 h-14 w-14 animate-moon-glow rounded-full bg-[#f5efe0] sm:h-20 sm:w-20" />
        {[[8, 12], [30, 6], [62, 18], [80, 40], [44, 30]].map(([x, y]) => (
          <span key={`${x}-${y}`} className="pointer-events-none absolute h-1 w-1 animate-flicker rounded-full bg-white/50" style={{ left: `${x}%`, top: `${y}px`, animationDelay: `${x / 20}s` }} />
        ))}
        <Bat className="pointer-events-none absolute left-0 top-10 w-8 animate-bat-fly" />
        <Bat className="pointer-events-none absolute left-0 top-20 w-5 animate-bat-fly opacity-70" style={{ animationDelay: '5s' }} />
        <div className="pointer-events-none absolute left-[14%] top-8 h-14 w-6 rounded-sm bg-[#2a1d47]" />

        <div className="relative mx-auto max-w-[640px]">
          <div className="relative h-24 [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#3d2e66] sm:h-28">
            <div className="absolute inset-[3px] [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#2a1d47]" />
          </div>

          <div className="space-y-3 border-x-2 border-[#3d2e66] bg-[#2a1d47] p-3">
            <Room
              room={ROOMS[0]}
              leaks={byRoom.attic}
              cleared={clearedSet}
              active={room.key === 'attic'}
              onSelect={() => selectRoom('attic')}
              className="mx-auto -mt-20 w-[58%] sm:-mt-24"
              delay={0.4}
            />
            <div className="grid grid-cols-2 gap-3">
              {[ROOMS[1], ROOMS[2]].map((item) => (
                <Room key={item.key} room={item} leaks={byRoom[item.key]} cleared={clearedSet} active={room.key === item.key} onSelect={() => selectRoom(item.key)} delay={item.key === 'guest' ? 1.3 : 2.1} />
              ))}
            </div>
            <Room room={ROOMS[3]} leaks={byRoom.hallway} cleared={clearedSet} active={room.key === 'hallway'} onSelect={() => selectRoom('hallway')} delay={2.9} />
          </div>

          <div className="relative h-1.5 bg-[#3d2e66]">
            <div className="pointer-events-none absolute -inset-x-10 -top-8 h-12 animate-fog-drift rounded-full bg-[#c3b8db]/10 blur-xl" />
          </div>
          <div className="bg-[#1a1230] p-3 [background-image:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] [background-size:22px_22px]">
            <Room room={ROOMS[4]} leaks={byRoom.basement} cleared={clearedSet} active={room.key === 'basement'} onSelect={() => selectRoom('basement')} delay={3.5} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading text-[15px] font-semibold text-foreground">
              Ghosts busted {cleared.length}/{leaks.length}
            </p>
            {hourly > 0 && (
              <div className="flex rounded-full border border-border bg-background p-0.5">
                {[['money', '$'], ['hours', 'Hours of work']].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUnit(key)}
                    aria-pressed={unit === key}
                    className={cn(
                      'rounded-full px-3 py-1 text-[12px] font-bold transition-colors',
                      unit === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            <span className="font-heading text-[1.9rem] font-bold tabular-nums text-primary [text-shadow:0_0_22px_hsl(var(--primary)/0.35)]">
              {show(shown)}
            </span>{' '}
            of {show(total)} busted{months ? ` (found in ${monthsLabel(months)} months)` : ''}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[#5ee6c8] transition-[width] duration-700"
              style={{ width: `${(cleared.length / leaks.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-heading text-[15px] font-semibold leading-tight text-foreground">Pick your ghost guide</p>
            <div className="flex gap-1.5" role="group" aria-label="Pick your ghost guide">
              {GUIDE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onGuide?.(key)}
                  aria-pressed={guideKey === key}
                  aria-label={`${GUIDES[key].name}, ${GUIDES[key].role}`}
                  title={GUIDES[key].name}
                  className={cn(
                    'rounded-full border-2 p-1.5 transition-colors',
                    guideKey === key ? 'border-primary bg-background' : 'border-border bg-background/40 hover:border-primary/50',
                  )}
                >
                  <span className="block" style={{ color: GUIDES[key].color }}>
                    <GhostMark className="h-7 w-7" eyeColor="#1a1230" />
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-right text-[11.5px] font-bold text-primary">{guide.name} · {guide.role.replace(/^the /, '')}</p>

          <div className="mt-3 flex gap-3">
            <span className="shrink-0 animate-bob" style={{ color: guide.color }}>
              <GhostMark className="h-11 w-11" eyeColor="#1a1230" />
            </span>
            <div className="min-w-0 flex-1 space-y-2.5">
              <ul className="rounded-2xl rounded-tl-sm bg-background/70 p-2">
                {types.map((type) => {
                  const key = roomOf(type);
                  return (
                    <li key={type.badge}>
                      <button
                        type="button"
                        onClick={() => selectRoom(key)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors hover:bg-white/5',
                          room.key === key && 'bg-white/[0.07]',
                        )}
                      >
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', DOTS[type.badge] || 'bg-white/60')} />
                        <span className="min-w-0 flex-1 font-bold text-foreground">
                          {type.badge} <span className="font-normal text-muted-foreground">× {type.count}</span>
                        </span>
                        <span className="font-bold tabular-nums text-foreground">{show(type.amount)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p
                key={speech}
                aria-live="polite"
                className="animate-rise rounded-2xl rounded-tl-sm bg-primary px-3.5 py-2.5 text-[13px] font-semibold leading-relaxed text-primary-foreground"
              >
                {speech}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#f5f0e8] p-4 text-[#1b1233]">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#a24a00]">
            {room.label} · {roomLeaks.length} {roomLeaks.length === 1 ? 'ghost' : 'ghosts'}
          </p>
          <div className="mt-2 divide-y divide-[#1b1233]/10">
            {roomLeaks.map((leak) => {
              const done = clearedSet.has(leak.id);
              const action = ACTIONS[leak.action];
              return (
                <div key={leak.id} className="py-3 first:pt-1 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold', BADGE_TONES[leak.badge])}>{leak.badge}</span>
                      <p className="mt-1 font-heading text-[15px] font-semibold">{leak.title || leak.merchant}</p>
                    </div>
                    <p className="shrink-0 font-heading text-lg font-bold">{show(leak.amount)}</p>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[#5b5275]">{leak.reason}</p>
                  {done ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-bold text-[#1f7a5c]">
                      <Check className="h-4 w-4" strokeWidth={3} /> Busted
                    </p>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      {action && (
                        <button
                          type="button"
                          onClick={() => onDraft(leak)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#1b1233]/25 py-2 text-[12.5px] font-bold transition-colors hover:bg-[#1b1233]/[0.06]"
                        >
                          <action.Icon className="h-3.5 w-3.5" />
                          {action.label}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => bust(leak)}
                        className="flex-1 rounded-xl bg-[#1b1233] py-2 text-[12.5px] font-bold text-[#f5f0e8] shadow-[0_0_0_2px_hsl(var(--primary))] transition-shadow hover:shadow-[0_0_0_2px_hsl(var(--primary)),0_0_20px_hsl(var(--primary)/0.5)]"
                      >
                        Bust it
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[#5b5275]">
            Bust a ghost once you&apos;ve cancelled, asked for a refund, or decided to keep it.
          </p>
          {cleared.length > 0 && (
            <button
              type="button"
              onClick={() => { setCleared([]); setLine(null); }}
              className="mt-2 text-[12px] font-bold text-[#5b5275] underline underline-offset-4"
            >
              Reset the house
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
