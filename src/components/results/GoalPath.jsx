import { useState } from 'react';
import { BellRing, Check, Landmark, Mail, TrendingUp, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { downloadAllReminders } from '@/lib/ghostFees/reminder';
import GhostMark from '@/components/site/GhostMark';

const KINDS = {
  cancel: { Icon: Mail, label: (name) => `Cancel ${name}`, steps: ['Open the cancel email', 'Send it from your mail app', 'Mark done once they confirm'] },
  refund: { Icon: Undo2, label: (name) => `Get your ${name} refund`, steps: ['Open the refund request', 'Send it with the extra charges listed', 'Mark done when the money is back'] },
  waive: { Icon: Landmark, label: (name) => `Ask the bank to waive ${name}`, steps: ['Open the waive request', 'Send it to your bank', 'Mark done once they reply'] },
  check: { Icon: TrendingUp, label: (name) => `Check ${name}`, steps: ['Look at the new price', 'Decide if it is still worth it', 'Mark done once you have decided'] },
  reminders: { Icon: BellRing, label: () => 'Add your reminders', steps: ['Tap Add all reminders', 'Open the file to add them to your calendar', 'That is it, renewals will not sneak up on you'] },
};

const VIEW_W = 600;
const TOP = 170;
const STEP = 120;

// Zig-zag stops up the hill, first goal at the bottom.
function layout(count) {
  const height = TOP + count * STEP + 40;
  const points = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? 170 : 430,
    y: height - 70 - i * STEP,
  }));
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

// A path of goals built from the leaks, winding up to the Haunted House.
// Busting a ghost in the house ticks its goal here too. Kept in memory only.
export default function GoalPath({ leaks, subscriptions, cleared, onClearedChange, remindersDone, onRemindersDone, onDraft, onOpenHouse }) {
  const leakGoals = leaks.map((leak) => {
    const kind = leak.action || 'check';
    const name = leak.title || leak.merchant;
    return { id: leak.id, kind, leak, label: KINDS[kind].label(name), save: leak.amount, why: leak.reason, done: cleared.includes(leak.id) };
  });
  const reminderGoal = subscriptions.length
    ? [{ id: 'reminders', kind: 'reminders', label: KINDS.reminders.label(), save: 0, why: `You have ${subscriptions.length} subscriptions. A reminder 2 days before each charge means nothing renews without you deciding.`, done: remindersDone }]
    : [];
  const goals = [...leakGoals.slice(0, 1), ...reminderGoal, ...leakGoals.slice(1)];

  const currentIndex = goals.findIndex((goal) => !goal.done);
  const [selectedId, setSelectedId] = useState(null);
  const selected = goals.find((goal) => goal.id === selectedId) || goals[currentIndex] || goals[goals.length - 1];
  const selectedIndex = goals.indexOf(selected);

  const doneCount = goals.filter((goal) => goal.done).length;
  const saved = goals.filter((goal) => goal.done).reduce((sum, goal) => sum + goal.save, 0);
  const total = leakGoals.reduce((sum, goal) => sum + goal.save, 0);
  const allDone = goals.length > 0 && doneCount === goals.length;

  const { height, points } = layout(goals.length);
  const lastDone = currentIndex === -1 ? goals.length - 1 : currentIndex - 1;
  const housePoint = { x: VIEW_W / 2, y: 110 };
  const fullPath = curve([...points, housePoint]);
  const donePath = lastDone >= 0 ? curve([...points.slice(0, lastDone + 1), ...(allDone ? [housePoint] : [])]) : '';

  const toggle = (goal) => {
    if (goal.kind === 'reminders') onRemindersDone(!goal.done);
    else onClearedChange((current) => (current.includes(goal.id) ? current.filter((id) => id !== goal.id) : [...current, goal.id]));
  };

  const Kind = KINDS[selected?.kind];

  return (
    <section className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1d1036] via-[#140c26] to-[#0f1a14] lg:self-start">
        <div className="pointer-events-none absolute right-6 top-5 h-14 w-14 animate-moon-glow rounded-full bg-[#f5efe0]" />
        <div className="relative mx-auto w-full max-w-[560px]" style={{ aspectRatio: `${VIEW_W} / ${height}` }}>
          <svg viewBox={`0 0 ${VIEW_W} ${height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d={`M 0 ${height} Q ${VIEW_W / 2} ${height - 140} ${VIEW_W} ${height} Z`} fill="#0d1610" />
            <path d={fullPath} stroke="#2a2040" strokeWidth="26" fill="none" strokeLinecap="round" />
            <path d={fullPath} stroke="#4a3770" strokeWidth="3" strokeDasharray="2 14" fill="none" strokeLinecap="round" />
            {donePath && (
              <path d={donePath} stroke="#ffb347" strokeWidth="8" fill="none" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(255,179,71,0.8)] transition-all duration-700" />
            )}
            <g transform={`translate(${VIEW_W / 2 - 70} 20)`}>
              <path d="M10 70 L70 18 L130 70 Z" fill="#1f1828" />
              <path d="M96 40 L96 22 L108 22 L108 50 Z" fill="#1f1828" />
              <rect x="22" y="68" width="96" height="62" fill="#2a2030" />
              {[[38, 82], [86, 82], [38, 106], [86, 106]].map(([x, y]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="16" height="18" rx="8" fill={allDone ? '#ffe2a0' : '#ffb347'} opacity={allDone ? 1 : 0.75} className={allDone ? '' : 'animate-window-flicker'} />
              ))}
              <rect x="62" y="104" width="16" height="26" rx="8" fill="#1a0f0a" />
            </g>
          </svg>

          <span
            className={cn(
              'absolute left-1/2 top-[3%] -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-bold',
              allDone ? 'bg-[#ffcf73] text-[#1a1230]' : 'bg-[#170f2a]/90 text-[#ffcf73]',
            )}
            style={{ top: `${(150 / height) * 100}%` }}
          >
            {allDone ? 'Ghost-free house!' : `Ghost-free house · ${money(total)}`}
          </span>

          {goals.map((goal, i) => {
            const point = points[i];
            const Icon = KINDS[goal.kind].Icon;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelectedId(goal.id)}
                aria-label={`${goal.label}${goal.done ? ', done' : ''}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(point.x / VIEW_W) * 100}%`, top: `${(point.y / height) * 100}%` }}
              >
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-all sm:h-14 sm:w-14',
                    goal.done ? 'border-[#ffcf73] bg-[#ffb347] text-[#1a1230] shadow-[0_0_20px_rgba(255,179,71,0.7)]' : 'border-[#4a3770] bg-[#231838] text-[#e6defa]',
                    isCurrent && 'border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.25)]',
                    selected?.id === goal.id && 'scale-110 ring-2 ring-white/70',
                  )}
                >
                  {goal.done ? <Check className="h-6 w-6" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                </span>
                <span className={cn('absolute top-1/2 w-36 -translate-y-1/2 text-left text-[11.5px] font-bold leading-tight', i % 2 === 0 ? 'left-full ml-2' : 'right-full mr-2 text-right')}>
                  <span className={cn('block', goal.done ? 'text-[#ffcf73] line-through decoration-2' : 'text-foreground')}>{goal.label}</span>
                  {goal.save > 0 && <span className="block text-[10.5px] font-semibold text-muted-foreground">saves {money(goal.save)}</span>}
                </span>
                {isCurrent && (
                  <span className={cn('absolute -top-11 animate-float', i % 2 === 0 ? '-left-3' : '-right-3')}>
                    <span className="relative block">
                      <GhostMark className="h-9 w-9 text-[#f4efe8]" eyeColor="#1a1230" />
                      <span className="absolute -right-1 top-5 h-3 w-3 animate-flicker rounded-full bg-[#ffcf73] shadow-[0_0_12px_4px_rgba(255,190,90,0.6)]" />
                    </span>
                    <span className="absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-1.5 text-[9.5px] font-bold text-primary-foreground">You are here</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-[15px] font-semibold text-foreground">{doneCount} of {goals.length} goals done</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            <span className="font-heading text-[1.7rem] font-bold tabular-nums text-primary">{money(saved)}</span> of {money(total)} sorted
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#ffcf73] transition-[width] duration-700" style={{ width: `${goals.length ? (doneCount / goals.length) * 100 : 0}%` }} />
          </div>
          {allDone && <p className="mt-3 rounded-xl bg-[#ffcf73] px-3 py-2 text-center font-heading text-[14px] font-bold text-[#1a1230]">You reached the ghost-free house!</p>}
        </div>

        {selected && Kind && (
          <div key={selected.id} className="animate-rise rounded-2xl bg-[#f5f0e8] p-4 text-[#1b1233]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#a24a00]">Goal {selectedIndex + 1} of {goals.length}</p>
            <h3 className="mt-1 font-heading text-lg font-semibold leading-snug">{selected.label}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#5b5275]">{selected.why}</p>
            <ol className="mt-3 space-y-1.5">
              {Kind.steps.map((step, i) => (
                <li key={step} className="flex gap-2 text-[12.5px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1b1233] text-[10.5px] font-bold text-[#f5f0e8]">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            {selected.save > 0 && <p className="mt-3 text-[13px] font-bold">Saves {money(selected.save)}</p>}
            <div className="mt-3 flex gap-2">
              {selected.leak?.action && (
                <button type="button" onClick={() => onDraft(selected.leak)} className="flex-1 rounded-xl border border-[#1b1233]/25 py-2 text-[12.5px] font-bold hover:bg-[#1b1233]/[0.06]">
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
                onClick={() => toggle(selected)}
                className={cn('flex-1 rounded-xl py-2 text-[12.5px] font-bold', selected.done ? 'border border-[#1b1233]/25' : 'bg-[#1b1233] text-[#f5f0e8] shadow-[0_0_0_2px_hsl(var(--primary))]')}
              >
                {selected.done ? 'Undo' : 'Mark done'}
              </button>
            </div>
            {selected.kind !== 'reminders' && (
              <button type="button" onClick={onOpenHouse} className="mt-2 text-[11.5px] font-bold text-[#5b5275] underline underline-offset-4">
                See this ghost in the Haunted House
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
