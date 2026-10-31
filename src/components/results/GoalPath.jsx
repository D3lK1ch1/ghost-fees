import { useState } from 'react';
import { ArrowRight, BellRing, Check, Landmark, Mail, TrendingUp, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { downloadAllReminders } from '@/lib/ghostFees/reminder';
import { GUIDES } from '@/lib/ghostFees/guides';
import GhostMark from '@/components/site/GhostMark';

const KINDS = {
  cancel: { Icon: Mail, label: (name) => `Cancel ${name}`, steps: ['Open the cancel email', 'Send it from your mail app', 'Wait for them to confirm'] },
  refund: { Icon: Undo2, label: (name) => `Get your ${name} refund`, steps: ['Open the refund request', 'Send it with the extra charges listed', 'Check the money is back'] },
  waive: { Icon: Landmark, label: (name) => `Ask the bank to waive ${name}`, steps: ['Open the waive request', 'Send it to your bank', 'Check their reply'] },
  check: { Icon: TrendingUp, label: (name) => `Check ${name}`, steps: ['Look at the new price', 'Decide if it is still worth it', 'Cancel it if not'] },
  reminders: { Icon: BellRing, label: () => 'Add your reminders', steps: ['Tap Add all reminders', 'Open the file to add them to your calendar', 'Renewals will not sneak up on you'] },
};

const GOAL_AMOUNTS = [50, 100, 250];
const VIEW_W = 600;
const TOP = 230;
const STEP = 125;

// Zig-zag stops up the hill, first goal at the bottom.
function layout(count) {
  const height = TOP + count * STEP + 50;
  const points = Array.from({ length: count }, (_, i) => ({ x: i % 2 === 0 ? 175 : 425, y: height - 75 - i * STEP }));
  return { height, points };
}

function curve(points) {
  if (!points.length) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const midY = (prev.y + next.y) / 2;
    d += ` C ${prev.x} ${midY}, ${next.x} ${midY}, ${next.x} ${next.y}`;
  }
  return d;
}

// The grave of money that died to a ghost. A candle is lit once the ghost is sorted.
function Tombstone({ x, y, amount, rested }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="30" rx="30" ry="5" fill="#0b120d" />
      <path d="M-24 30 V-6 A24 24 0 0 1 24 -6 V30 Z" fill={rested ? '#3a3350' : '#2a2338'} stroke="#3d3450" strokeWidth="2" />
      <text x="0" y="2" textAnchor="middle" fontSize="11" fontWeight="800" fill="#8f84a8" letterSpacing="1.5">RIP</text>
      <text x="0" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill={rested ? '#ffcf73' : '#c3b8db'}>{money(amount)}</text>
      {rested && (
        <g transform="translate(18 24)">
          <rect x="-2.5" y="-8" width="5" height="10" rx="1" fill="#f5efe0" />
          <path d="M0 -15 q4 3.5 0 6.5 q-4 -3 0 -6.5z" fill="#ffb347" className="animate-flicker" />
          <circle cx="0" cy="-11" r="9" fill="#ffcf73" opacity="0.2" />
        </g>
      )}
    </g>
  );
}

function Pumpkin({ x, y, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="13" ry="10" fill="#e8741c" />
      <ellipse cx="0" cy="0" rx="6" ry="10" fill="#f58a2c" />
      <path d="M0 -10 q2 -5 6 -6" stroke="#3d5a2a" strokeWidth="2.5" fill="none" />
      <path d="M-6 -2 l3 2 h-4z M6 -2 l-3 2 h4z M-5 4 q5 4 10 0" fill="#ffd36b" className="animate-window-flicker" style={{ animationDelay: `${delay}s` }} />
    </g>
  );
}

function House({ lit }) {
  const windows = [[-34, -6], [-12, -6], [22, -6], [-34, 22], [22, 22], [-12, -34]];
  return (
    <g transform={`translate(${VIEW_W / 2} 118)`}>
      <ellipse cx="0" cy="62" rx="120" ry="14" fill="#0b120d" />
      <path d="M-78 -40 L-64 -92 L-50 -40 Z" fill="#1f1828" />
      <rect x="-72" y="-40" width="16" height="100" fill="#2a2030" />
      <rect x="-68" y="-24" width="8" height="14" rx="4" fill={lit ? '#ffe2a0' : '#ffb347'} className={lit ? '' : 'animate-window-flicker'} />
      <path d="M-62 -16 L0 -64 L62 -16 Z" fill="#1f1828" />
      <rect x="-54" y="-18" width="108" height="80" fill="#2a2030" />
      {windows.map(([x, y], i) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="13" height="18" rx="6.5" fill={lit ? '#ffe2a0' : '#ffb347'} opacity={lit ? 1 : 0.8} className={lit ? '' : 'animate-window-flicker'} style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <rect x="-7" y="36" width="14" height="26" rx="7" fill="#1a0f0a" />
      {lit && <circle cx="0" cy="10" r="90" fill="#ffd27a" opacity="0.12" />}
      <path d="M-10 -66 l6 -4 6 4" stroke="#0b0716" strokeWidth="3" fill="none" />
    </g>
  );
}

// A trail of goals built from the ghosts, winding up to the Haunted House.
// Busting a ghost in the house ticks its goal here too. Everything stays in memory.
export default function GoalPath({ leaks, subscriptions, cleared, onClearedChange, remindersDone, onRemindersDone, onDraft, onOpenHouse, guideKey = 'penny' }) {
  const leakGoals = leaks.map((leak) => {
    const kind = leak.action || 'check';
    return { id: leak.id, kind, leak, label: KINDS[kind].label(leak.title || leak.merchant), save: leak.amount, why: leak.reason, done: cleared.includes(leak.id) };
  });
  const reminderGoal = subscriptions.length
    ? [{ id: 'reminders', kind: 'reminders', label: KINDS.reminders.label(), save: 0, why: `You have ${subscriptions.length} subscriptions. A reminder 2 days before each charge means nothing renews without you deciding.`, done: remindersDone }]
    : [];
  const goals = [...leakGoals.slice(0, 1), ...reminderGoal, ...leakGoals.slice(1)];

  const [selectedId, setSelectedId] = useState(null);
  const [ticked, setTicked] = useState({});
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState(null);

  const currentIndex = goals.findIndex((goal) => !goal.done);
  const selected = goals.find((goal) => goal.id === selectedId) || goals[currentIndex] || goals[goals.length - 1];
  const selectedIndex = goals.indexOf(selected);
  const doneCount = goals.filter((goal) => goal.done).length;
  const saved = goals.filter((goal) => goal.done).reduce((sum, goal) => sum + goal.save, 0);
  const total = leakGoals.reduce((sum, goal) => sum + goal.save, 0);
  const allDone = goals.length > 0 && doneCount === goals.length;
  const target = goalAmount === 'all' ? total : goalAmount;
  const guide = GUIDES[guideKey] || GUIDES.penny;

  const { height, points } = layout(goals.length);
  const housePoint = { x: VIEW_W / 2, y: 180 };
  const fullPath = curve([...points, housePoint]);
  const lastDone = currentIndex === -1 ? goals.length - 1 : currentIndex - 1;
  const donePath = lastDone >= 0 ? curve([...points.slice(0, lastDone + 1), ...(allDone ? [housePoint] : [points[lastDone + 1] || housePoint])]) : '';
  const walker = allDone ? housePoint : points[Math.max(currentIndex, 0)];

  const setDone = (goal, done) => {
    if (goal.kind === 'reminders') onRemindersDone(done);
    else onClearedChange((current) => (done ? [...new Set([...current, goal.id])] : current.filter((id) => id !== goal.id)));
  };
  const tick = (goalId, step) => setTicked((current) => ({ ...current, [goalId]: { ...current[goalId], [step]: !current[goalId]?.[step] } }));
  const nextGoal = () => {
    const next = goals.find((goal, i) => i > selectedIndex && !goal.done) || goals.find((goal) => !goal.done);
    if (next) setSelectedId(next.id);
  };

  const speech = allDone
    ? guide.done(total)
    : doneCount === 0
      ? guide.intro(goals.length, total)
      : `${doneCount} of ${goals.length} done, ${money(saved)} sorted. Next up: ${goals[currentIndex].label}.`;

  const Kind = KINDS[selected?.kind];
  const pct = (value, of) => `${(value / of) * 100}%`;

  return (
    <section className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1d1036] via-[#140c26] to-[#0e1a13] lg:self-start">
        <div className="pointer-events-none absolute right-6 top-5 h-16 w-16 animate-moon-glow rounded-full bg-[#f5efe0]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 animate-fog-drift bg-gradient-to-t from-[#c3b8db]/[0.07] to-transparent blur-xl" />
        <div className="relative mx-auto w-full max-w-[560px]" style={{ aspectRatio: `${VIEW_W} / ${height}` }}>
          <svg viewBox={`0 0 ${VIEW_W} ${height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d={`M 0 ${height} L 0 260 Q ${VIEW_W / 2} 200 ${VIEW_W} 260 L ${VIEW_W} ${height} Z`} fill="#0f1a13" opacity="0.9" />
            <path d={fullPath} stroke="#1a1426" strokeWidth="34" fill="none" strokeLinecap="round" />
            <path d={fullPath} stroke="#3a3048" strokeWidth="13" strokeDasharray="0.1 24" fill="none" strokeLinecap="round" />
            {donePath && (
              <path d={donePath} stroke="#ffcf73" strokeWidth="13" strokeDasharray="0.1 24" fill="none" strokeLinecap="round" className="drop-shadow-[0_0_6px_rgba(255,190,90,0.9)]" />
            )}
            {points.map((point, i) => (
              <g key={`deco-${point.y}`}>
                {goals[i].leak ? (
                  <Tombstone x={point.x < 300 ? point.x + 235 : point.x - 235} y={point.y + 6} amount={goals[i].save} rested={goals[i].done} />
                ) : (
                  <Pumpkin x={point.x < 300 ? point.x + 225 : point.x - 225} y={point.y + 30} delay={i * 0.6} />
                )}
                <g transform={`translate(${point.x < 300 ? point.x - 46 : point.x + 46} ${point.y - 6})`}>
                  <rect x="-1.5" y="0" width="3" height="34" fill="#0b0716" />
                  <rect x="-6" y="-12" width="12" height="13" rx="2" fill={goals[i].done ? '#ffcf73' : '#2a2338'} stroke="#0b0716" strokeWidth="2" />
                  {goals[i].done && <circle cx="0" cy="-6" r="14" fill="#ffcf73" opacity="0.25" />}
                </g>
              </g>
            ))}
            <House lit={allDone} />
          </svg>

          <span
            className={cn('absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-bold', allDone ? 'bg-[#ffcf73] text-[#1a1230]' : 'bg-[#170f2a]/90 text-[#ffcf73]')}
            style={{ top: pct(196, height) }}
          >
            {allDone ? 'Ghost-free house!' : `Ghost-free house · ${money(total)}`}
          </span>

          {allDone && [0, 1, 2].map((n) => (
            <span key={n} className="pointer-events-none absolute animate-fly-away" style={{ left: `${44 + n * 6}%`, top: pct(120, height), animationDelay: `${n * 0.25}s` }}>
              <GhostMark className="h-6 w-6 text-[#f4efe8]" eyeColor="#1a1230" />
            </span>
          ))}

          {goals.map((goal, i) => {
            const point = points[i];
            const Icon = KINDS[goal.kind].Icon;
            const left = point.x < 300;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelectedId(goal.id)}
                aria-label={`${goal.label}${goal.done ? ', done' : ''}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pct(point.x, VIEW_W), top: pct(point.y, height) }}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-all duration-500 sm:h-14 sm:w-14',
                    goal.done ? 'border-[#ffcf73] bg-[#ffb347] text-[#1a1230] shadow-[0_0_22px_rgba(255,179,71,0.75)]' : 'border-[#4a3770] bg-[#231838] text-[#e6defa] hover:border-primary',
                    i === currentIndex && 'animate-pulse border-primary',
                    selected?.id === goal.id && 'scale-110 ring-2 ring-white/70',
                  )}
                >
                  {goal.done ? <Check className="h-6 w-6 animate-poof" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                </span>
                <span className={cn('absolute top-1/2 w-32 -translate-y-1/2 text-[11.5px] font-bold leading-tight sm:w-40', left ? 'left-full ml-3 text-left' : 'right-full mr-3 text-right')}>
                  <span className={cn('block', goal.done ? 'text-[#ffcf73] line-through decoration-2' : 'text-foreground')}>{goal.label}</span>
                  {goal.save > 0 && <span className="block text-[10.5px] font-semibold text-muted-foreground">saves {money(goal.save)}</span>}
                </span>
              </button>
            );
          })}

          {goals.map((goal, i) => {
            if (!goal.leak || goal.done) return null;
            const point = points[i];
            const graveX = point.x < 300 ? point.x + 235 : point.x - 235;
            return (
              <span
                key={`ghost-${goal.id}`}
                className="pointer-events-none absolute -translate-x-1/2 animate-bob"
                style={{ left: pct(graveX, VIEW_W), top: `calc(${pct(point.y - 30, height)} - 28px)`, animationDelay: `${i * 0.4}s` }}
                title={`${goal.leak.title || goal.leak.merchant}`}
              >
                <GhostMark className="h-7 w-7 text-[#e8e2f2] opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" eyeColor="#1a1230" />
              </span>
            );
          })}

          {walker && (
            <span
              className="pointer-events-none absolute z-10 -translate-x-1/2 transition-[left,top] duration-1000 ease-in-out"
              style={{ left: pct(walker.x + (walker.x < 300 ? -8 : 8), VIEW_W), top: `calc(${pct(walker.y, height)} - 64px)` }}
            >
              <span className="relative block animate-float">
                <GhostMark className="h-9 w-9 text-[#f4efe8]" eyeColor="#1a1230" />
                <span className="absolute -right-1.5 top-5 h-3 w-3 animate-flicker rounded-full bg-[#ffcf73] shadow-[0_0_14px_5px_rgba(255,190,90,0.6)]" />
              </span>
              <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-1.5 text-[9.5px] font-bold text-primary-foreground">
                {allDone ? 'Home!' : 'You are here'}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-[15px] font-semibold text-foreground">{doneCount} of {goals.length} goals done</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            <span className="font-heading text-[1.7rem] font-bold tabular-nums text-primary">{money(saved)}</span> of {money(total)} sorted
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#ffcf73] transition-[width] duration-700" style={{ width: goals.length ? pct(doneCount, goals.length) : '0%' }} />
          </div>
          <div className="mt-3 flex gap-2.5">
            <span className="shrink-0" style={{ color: guide.color }}><GhostMark className="h-8 w-8" eyeColor="#1a1230" /></span>
            <p key={speech} className="animate-rise rounded-2xl rounded-tl-sm bg-background/70 px-3 py-2 text-[12.5px] leading-relaxed text-foreground">
              <span className="font-bold" style={{ color: guide.color }}>{guide.name}: </span>{speech}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label htmlFor="goal-name" className="font-heading text-[15px] font-semibold text-foreground">What are you saving for?</label>
          <input
            id="goal-name"
            value={goalName}
            maxLength={40}
            onChange={(event) => setGoalName(event.target.value)}
            placeholder="A weekend away"
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...GOAL_AMOUNTS.filter((amount) => amount < total), 'all'].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setGoalAmount(amount)}
                aria-pressed={goalAmount === amount}
                className={cn('rounded-full border px-2.5 py-1 text-[12px] font-bold transition-colors', goalAmount === amount ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
              >
                {amount === 'all' ? `All ${money(total)}` : `$${amount}`}
              </button>
            ))}
          </div>
          {target > 0 && (
            <div className="mt-3">
              <div className="flex items-baseline justify-between text-[12px]">
                <span className="font-bold text-foreground">{goalName.trim() || 'Your goal'}</span>
                <span className="tabular-nums text-muted-foreground">{money(Math.min(saved, target))} / {money(target)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#5ee6c8] transition-[width] duration-700" style={{ width: pct(Math.min(saved, target), target) }} />
              </div>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                {saved >= target ? `Goal reached! The ghosts you sorted cover ${goalName.trim() || 'it'}.` : `${money(target - saved)} to go. Sorting ghosts gets you there.`}
              </p>
            </div>
          )}
          <p className="mt-2 text-[10.5px] text-muted-foreground/80">Just for you. Not saved anywhere.</p>
        </div>

        {selected && Kind && (
          <div key={selected.id} className="animate-rise rounded-2xl bg-[#f5f0e8] p-4 text-[#1b1233]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#a24a00]">Goal {selectedIndex + 1} of {goals.length}{selected.done ? ' · done' : ''}</p>
            <h3 className="mt-1 font-heading text-lg font-semibold leading-snug">{selected.label}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#5b5275]">{selected.why}</p>
            <ul className="mt-3 space-y-1.5">
              {Kind.steps.map((step, i) => {
                const on = selected.done || ticked[selected.id]?.[i];
                return (
                  <li key={step}>
                    <button type="button" onClick={() => tick(selected.id, i)} className="flex w-full items-center gap-2 text-left text-[12.5px]">
                      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors', on ? 'border-[#1f7a5c] bg-[#1f7a5c] text-white' : 'border-[#1b1233]/30')}>
                        {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className={cn(on && 'text-[#5b5275] line-through')}>{step}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected.save > 0 && <p className="mt-3 text-[13px] font-bold">Saves {money(selected.save)}</p>}
            <div className="mt-3 flex gap-2">
              {selected.leak?.action && (
                <button
                  type="button"
                  onClick={() => { onDraft(selected.leak); setTicked((current) => ({ ...current, [selected.id]: { ...current[selected.id], 0: true } })); }}
                  className="flex-1 rounded-xl border border-[#1b1233]/25 py-2 text-[12.5px] font-bold hover:bg-[#1b1233]/[0.06]"
                >
                  Draft email
                </button>
              )}
              {selected.kind === 'reminders' && (
                <button
                  type="button"
                  onClick={() => { downloadAllReminders(subscriptions.filter((item) => item.lastDate)); onRemindersDone(true); }}
                  className="flex-1 rounded-xl border border-[#1b1233]/25 py-2 text-[12.5px] font-bold hover:bg-[#1b1233]/[0.06]"
                >
                  Add all reminders
                </button>
              )}
              <button
                type="button"
                onClick={() => setDone(selected, !selected.done)}
                className={cn('flex-1 rounded-xl py-2 text-[12.5px] font-bold', selected.done ? 'border border-[#1b1233]/25' : 'bg-[#1b1233] text-[#f5f0e8] shadow-[0_0_0_2px_hsl(var(--primary))]')}
              >
                {selected.done ? 'Undo' : 'Mark done'}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between">
              {selected.kind !== 'reminders' ? (
                <button type="button" onClick={onOpenHouse} className="text-[11.5px] font-bold text-[#5b5275] underline underline-offset-4">
                  See this ghost in the house
                </button>
              ) : <span />}
              {!allDone && (
                <button type="button" onClick={nextGoal} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#a24a00]">
                  Next goal <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
