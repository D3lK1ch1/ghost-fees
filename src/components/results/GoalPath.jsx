import { useState } from 'react';
import { ArrowRight, BellRing, Check, Landmark, Mail, TrendingUp, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, monthsLabel } from '@/lib/ghostFees/format';
import { downloadAllReminders } from '@/lib/ghostFees/reminder';
import GhostMark from '@/components/site/GhostMark';
import { useTheme } from '@/lib/ThemeContext';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { SEASON_KEY, SEASONS, xmasAvatar } from '@/lib/ghostFees/christmasArt';

// One colour set per theme for the hill, road, house and stops. Haunted keeps its
// purple; 💔 is charcoal with coral and mint; 🎄 is green and gold (Summer: blue).
const HAUNTED = { gold: '#ffcf73', goldSoft: '#ffe2a0', nodeBorder: '#6b5aa0', tree: '#2a1f45', roof: '#3a2c5c', star: '#c3b8db', wall: '#33264f', wall2: '#2f2349', door: '#22183a', sky1: '#1f1438', sky2: '#22174a', sky3: '#1b1236', moon: '#e9e2d0', hill: '#2a1d52', hill2: '#2f2160', roadEdge: '#150e2a', road: '#3d2e6b', dash: '#8f80c8', ink: '#1a1230', card: '#140c22', current: '#2a1840', node: '#2a1d47', nodeText: '#e6defa', tomb: '#3d3060', tombText: '#a99cd0', ghost: '#f4efe8' };
const PALETTES = {
  haunted: HAUNTED,
  ex: { ...HAUNTED, gold: '#5ee6c8', goldSoft: '#a8f3e2', nodeBorder: '#5c5668', tree: '#2f2b38', roof: '#3a3444', star: '#d6d1db', wall: '#2f2b38', wall2: '#2a2632', door: '#15131a', sky1: '#2a2530', sky2: '#1d1a22', sky3: '#15131a', moon: '#f3e9f0', hill: '#221f29', hill2: '#2a2632', roadEdge: '#0f0d13', road: '#34303e', dash: '#bdb7c6', ink: '#15131a', card: '#1b1921', current: '#2a1f29', node: '#221f29', nodeText: '#fbf8fa', tomb: '#34303e', tombText: '#ff6f7d', ghost: '#fbf8fa' },
  christmas: { ...HAUNTED, gold: '#f2c14e', goldSoft: '#ffe3a3', nodeBorder: '#2d5a48', tree: '#0b1a13', roof: '#7a2e2a', star: '#f5f0e8', wall: '#24433a', wall2: '#1d3b2c', door: '#0d1f17', sky1: '#1d3b2c', sky2: '#13291f', sky3: '#0d1f17', moon: '#f5f0e8', hill: '#13291f', hill2: '#1a3528', roadEdge: '#081510', road: '#24433a', dash: '#b9c9bf', ink: '#15131a', card: '#0d1f17', current: '#1d3b2c', node: '#13291f', nodeText: '#f5f0e8', tomb: '#24433a', tombText: '#f2c14e', ghost: '#f5f0e8' },
  summer: { gold: '#f2c14e', goldSoft: '#ffe3a3', nodeBorder: '#3b4c80', tree: '#0c1222', roof: '#2c3a63', star: '#f6efe0', wall: '#1a2340', wall2: '#22305a', door: '#10172a', sky1: '#22305a', sky2: '#1a2340', sky3: '#10172a', moon: '#f6efe0', hill: '#1a2340', hill2: '#22305a', roadEdge: '#0a0f1c', road: '#2c3a63', dash: '#b8c0d8', ink: '#15131a', card: '#10172a', current: '#22305a', node: '#1a2340', nodeText: '#f6efe0', tomb: '#2c3a63', tombText: '#f2c14e', ghost: '#f6efe0' },
};

const KINDS = {
  cancel: { Icon: Mail, label: (name) => `Cancel ${name}`, steps: ['Open the cancel email', 'Send it from your mail app', 'Check it is gone from your next statement'] },
  refund: { Icon: Undo2, label: (name) => `Get your ${name} refund`, steps: ['Open the refund request', 'Send it with the extra charges listed', 'Check the refund lands'] },
  waive: { Icon: Landmark, label: (name) => `Ask the bank to waive the ${name}`, steps: ['Open the waiver email', 'Send it to your bank', 'Ask about a fee-free account if they say no'] },
  check: { Icon: TrendingUp, label: (name) => `Check ${name}`, steps: ['Look at the new price', 'Decide if it is still worth it', 'Cancel it if not'] },
  reminders: { Icon: BellRing, label: () => 'Add your reminders', steps: ['Tap Add all reminders', 'Open the file to add them to your calendar', 'Renewals will not sneak up on you'] },
};

const VIEW_W = 640;
const TOP = 300;
const STEP = 132;
const LEFT_X = 230;
const RIGHT_X = 410;

// Zig-zag stops up the hill, first goal at the bottom.
function layout(count) {
  const height = TOP + count * STEP + 60;
  const points = Array.from({ length: count }, (_, i) => ({ x: i % 2 === 0 ? LEFT_X : RIGHT_X, y: height - 90 - i * STEP }));
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

// Purple silhouette of the house at the top of the hill. Windows glow once every goal is done.
function House({ lit, P }) {
  const glow = lit ? P.goldSoft : P.nodeBorder;
  return (
    <g transform={`translate(${VIEW_W / 2} 150)`}>
      <path d="M-150 60 C-150 40 -140 10 -132 -10 M-136 18 l-16 -14 M-138 0 l12 -12" stroke={P.tree} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M150 60 C150 40 140 14 134 -6 M138 22 l16 -12 M140 6 l-12 -12" stroke={P.tree} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M-78 -10 L-62 -78 L-46 -10 Z" fill={P.roof} />
      <circle cx="-62" cy="-80" r="2" fill={P.star} />
      <rect x="-74" y="-12" width="24" height="76" fill={P.wall} />
      <rect x="-67" y="4" width="10" height="16" rx="5" fill={glow} className={lit ? '' : 'animate-window-flicker'} />
      <path d="M-50 2 L8 -48 L66 2 Z" fill={P.roof} />
      <rect x="-44" y="0" width="104" height="64" fill={P.wall} />
      <path d="M40 -6 L58 -30 L76 -6 Z" fill={P.roof} />
      <rect x="44" y="-8" width="28" height="72" fill={P.wall2} />
      <circle cx="8" cy="18" r="9" fill={glow} opacity="0.9" />
      <rect x="-30" y="28" width="12" height="16" rx="6" fill={glow} opacity="0.85" />
      <rect x="34" y="28" width="12" height="16" rx="6" fill={glow} opacity="0.85" />
      <rect x="51" y="14" width="12" height="16" rx="6" fill={glow} opacity="0.85" />
      <path d="M-2 64 v-18 a10 10 0 0 1 20 0 v18 z" fill={P.door} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={-44 + i * 13} cy={2 - Math.sin((i / 8) * Math.PI) * 10} r="2.2" fill={P.gold} className="animate-window-flicker" style={{ animationDelay: `${(i % 4) * 0.5}s` }} />
      ))}
      {lit && <circle cx="8" cy="20" r="110" fill={P.gold} opacity="0.1" />}
    </g>
  );
}

// A road of goals built from the ghosts, winding up to the Haunted House.
// Busting a ghost in the house ticks its goal here too. Everything stays in memory.
const LIFE_GOALS = ['A holiday', 'Emergency fund', 'Study', 'Family', 'A new home', 'Something fun'];

export default function GoalPath({ leaks, subscriptions, cleared, onClearedChange, remindersDone, onRemindersDone, onDraft, onOpenHouse, cancelSubs = [], lifeGoal = {}, onLifeGoal, avatarFor }) {
  const { theme } = useTheme();
  const [season] = useSavedChoice(SEASON_KEY, SEASONS, 'winter');
  const P = theme.key === 'christmas' ? PALETTES[season === 'summer' ? 'summer' : 'christmas'] : PALETTES[theme.key] || HAUNTED;
  const gpVars = Object.fromEntries(Object.entries(P).map(([key, value]) => [`--gp-${key}`, value]));
  // Each stop's ghost is the theme's own: 💔 the ex, 🎄 the festive ghost, Haunted the plain ghost.
  const themeGhost = (merchant) => (theme.key === 'ex' && avatarFor ? avatarFor(merchant) : theme.key === 'christmas' ? xmasAvatar(merchant, season) : null);
  const leakGoals = leaks.map((leak) => {
    const kind = leak.action || 'check';
    return { id: leak.id, kind, leak, label: KINDS[kind].label(leak.title || leak.merchant), save: leak.amount, why: leak.reason, done: cleared.includes(leak.id) };
  });
  const reminderGoal = subscriptions.length
    ? [{ id: 'reminders', kind: 'reminders', label: KINDS.reminders.label(), save: 0, why: `You have ${subscriptions.length} subscriptions. A reminder 2 days before each charge means nothing renews without you deciding.`, done: remindersDone }]
    : [];
  // Subscriptions the user would not sign up for again become cancel goals.
  const subGoals = cancelSubs.map((item) => {
    const id = `sub:${item.id}`;
    return {
      id,
      kind: 'cancel',
      leak: { id, merchant: item.merchant, title: item.merchant, monthly: item.monthly, amount: item.monthly, action: 'cancel', badge: 'Subscription' },
      label: KINDS.cancel.label(item.merchant),
      save: 0,
      monthly: item.monthly,
      why: `You said you would not sign up for ${item.merchant} today. It costs ${money(item.monthly)} a month.`,
      done: cleared.includes(id),
    };
  });
  const goals = [...leakGoals.slice(0, 1), ...reminderGoal, ...leakGoals.slice(1), ...subGoals];

  const [selectedId, setSelectedId] = useState(null);
  const [ticked, setTicked] = useState({});

  const currentIndex = goals.findIndex((goal) => !goal.done);
  const selected = goals.find((goal) => goal.id === selectedId) || goals[currentIndex] || goals[goals.length - 1];
  const selectedIndex = goals.indexOf(selected);
  const doneCount = goals.filter((goal) => goal.done).length;
  const saved = goals.filter((goal) => goal.done).reduce((sum, goal) => sum + goal.save, 0);
  const total = leakGoals.reduce((sum, goal) => sum + goal.save, 0);
  const allDone = goals.length > 0 && doneCount === goals.length;
  const months = leaks[0]?.months || 0;

  const { height, points } = layout(goals.length);
  const housePoint = { x: VIEW_W / 2, y: 236 };
  const fullPath = curve([...points, housePoint]);
  const reach = allDone ? goals.length : currentIndex;
  const donePath = reach > 0 ? curve([...points.slice(0, reach + 1), ...(allDone ? [housePoint] : [])]) : '';

  const setDone = (goal, done) => {
    if (goal.kind === 'reminders') onRemindersDone(done);
    else onClearedChange((current) => (done ? [...new Set([...current, goal.id])] : current.filter((id) => id !== goal.id)));
  };
  const tick = (goalId, step) => setTicked((current) => ({ ...current, [goalId]: { ...current[goalId], [step]: !current[goalId]?.[step] } }));
  const nextGoal = () => {
    const next = goals.find((goal, i) => i > selectedIndex && !goal.done) || goals.find((goal) => !goal.done);
    if (next) setSelectedId(next.id);
  };

  const pct = (value, of) => `${(value / of) * 100}%`;
  const Kind = KINDS[selected?.kind];

  return (
    <section className="mt-4" style={gpVars}>
      <div className="mb-3 flex justify-end">
        <div className="w-full max-w-[280px]">
          <div className="flex items-baseline justify-between text-[12.5px] font-bold">
            <span className="text-foreground">{doneCount} of {goals.length} done</span>
            <span className="tabular-nums text-[var(--gp-gold)]">{money(saved)} of {money(total)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[var(--gp-gold)] transition-[width] duration-700" style={{ width: goals.length ? pct(doneCount, goals.length) : '0%' }} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-b from-[var(--gp-sky1)] via-[var(--gp-sky2)] to-[var(--gp-sky3)] lg:self-start">
          <div className="pointer-events-none absolute left-1/2 top-6 h-12 w-12 translate-x-6 animate-moon-glow rounded-full bg-[var(--gp-moon)]" />
          {[[8, 40], [20, 120], [78, 60], [90, 150], [62, 24]].map(([x, y]) => (
            <span key={`${x}-${y}`} className="pointer-events-none absolute h-1 w-1 animate-flicker rounded-full bg-white/50" style={{ left: `${x}%`, top: `${y}px` }} />
          ))}
          <div className="relative mx-auto w-full max-w-[640px]" style={{ aspectRatio: `${VIEW_W} / ${height}` }}>
            <svg viewBox={`0 0 ${VIEW_W} ${height}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path d={`M 0 ${height} L 0 300 Q ${VIEW_W / 2} 250 ${VIEW_W} 300 L ${VIEW_W} ${height} Z`} fill={P.hill} />
              <path d={`M 0 ${height} L 0 ${height * 0.55} Q ${VIEW_W * 0.3} ${height * 0.5} ${VIEW_W} ${height * 0.6} L ${VIEW_W} ${height} Z`} fill={P.hill2} opacity="0.6" />
              <House lit={allDone} P={P} />
              <path d={fullPath} stroke={P.roadEdge} strokeWidth="50" fill="none" strokeLinecap="round" />
              <path d={fullPath} stroke={P.road} strokeWidth="40" fill="none" strokeLinecap="round" />
              <path d={fullPath} stroke={P.dash} strokeWidth="2.5" strokeDasharray="7 11" fill="none" strokeLinecap="round" opacity="0.55" />
              {donePath && (
                <>
                  <path d={donePath} stroke={P.gold} strokeWidth="22" fill="none" strokeLinecap="round" opacity="0.18" />
                  <path d={donePath} stroke={P.gold} strokeWidth="9" fill="none" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(255,207,115,0.9)]" />
                </>
              )}
            </svg>

            <span
              className={cn('absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border px-3 py-1.5 text-[12px] font-bold', allDone ? 'border-[var(--gp-gold)] bg-[var(--gp-gold)] text-[var(--gp-ink)]' : 'border-white/10 bg-[var(--gp-card)]/90 text-[var(--gp-gold)]')}
              style={{ top: pct(238, height) }}
            >
              {allDone ? 'Ghost-free house!' : `Ghost-free house · ${money(total)}`}
            </span>

            {goals.map((goal, i) => {
              const point = points[i];
              const left = point.x === LEFT_X;
              const Icon = KINDS[goal.kind].Icon;
              const isCurrent = i === currentIndex;
              const isSelected = selected?.id === goal.id;
              const sideX = left ? point.x - 110 : point.x + 110;
              return (
                <div key={goal.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(goal.id)}
                    aria-label={`${goal.label}${goal.done ? ', done' : ''}`}
                    aria-pressed={isSelected}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: pct(point.x, VIEW_W), top: pct(point.y, height) }}
                  >
                    <span
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full border-[3px] shadow-[0_6px_16px_rgba(0,0,0,0.4)] transition-all duration-500 sm:h-14 sm:w-14',
                        goal.done && 'border-[var(--gp-goldSoft)] bg-[var(--gp-gold)] text-[var(--gp-ink)] shadow-[0_0_24px_rgba(255,207,115,0.7)]',
                        !goal.done && isCurrent && 'border-primary bg-[var(--gp-current)] text-primary shadow-[0_0_22px_hsl(var(--primary)/0.55)]',
                        !goal.done && !isCurrent && 'border-[var(--gp-nodeBorder)] bg-[var(--gp-node)] text-[var(--gp-nodeText)] group-hover:border-primary/70',
                      )}
                    >
                      {goal.done ? <Check className="h-6 w-6 animate-poof" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                    </span>
                    <span
                      className={cn(
                        'absolute top-1/2 w-[150px] -translate-y-1/2 rounded-xl border px-3 py-2 text-[11.5px] font-bold leading-snug shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-colors sm:w-[190px] sm:text-[12.5px]',
                        left ? 'left-full ml-2.5 text-left' : 'right-full mr-2.5 text-right',
                        isCurrent || isSelected ? 'border-primary/80 bg-[var(--gp-current)]' : 'border-white/10 bg-[var(--gp-card)]/95 group-hover:border-white/25',
                      )}
                    >
                      <span className="block text-foreground">{goal.label}</span>
                      <span className={cn('block text-[11px]', goal.done ? 'text-[var(--gp-gold)]' : 'text-primary')}>{goal.done ? 'Done' : goal.monthly ? `${money(goal.monthly)} a month` : `saves ${money(goal.save)}`}</span>
                    </span>
                  </button>

                  {!goal.done && goal.leak && !isCurrent && (
                    <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-bob" style={{ left: pct(sideX, VIEW_W), top: pct(point.y - 16, height), animationDelay: `${i * 0.4}s` }}>
                      {themeGhost(goal.leak.merchant) ? (
                        <img src={themeGhost(goal.leak.merchant)} alt="" width={40} height={40} className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]" />
                      ) : (
                        <GhostMark className="h-8 w-8 text-[var(--gp-ghost)] drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]" eyeColor={P.ink} />
                      )}
                    </span>
                  )}
                  {goal.done && goal.leak && (
                    <span className="pointer-events-none absolute flex h-14 w-11 -translate-x-1/2 -translate-y-1/2 animate-rise flex-col items-center justify-center rounded-t-full bg-[var(--gp-tomb)] shadow-[0_6px_0_#140c22]" style={{ left: pct(sideX, VIEW_W), top: pct(point.y, height) }}>
                      <span className="text-[8px] font-bold tracking-[0.15em] text-[var(--gp-tombText)]">RIP</span>
                      <span className="text-[9.5px] font-bold text-[var(--gp-ghost)]">{money(goal.save || goal.monthly)}</span>
                    </span>
                  )}
                  {isCurrent && (
                    <span className="pointer-events-none absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-[left,top] duration-700" style={{ left: pct(sideX, VIEW_W), top: pct(point.y - 18, height) }}>
                      <span className="relative animate-float">
                        <span className="absolute -top-1 left-1/2 h-3 w-6 -translate-x-1/2 rounded-t-full bg-primary" />
                        <GhostMark className="h-8 w-8 text-[var(--gp-ghost)]" eyeColor={P.ink} />
                        <span className="absolute -right-2 top-4 h-2.5 w-2.5 animate-flicker rounded-full bg-[var(--gp-gold)] shadow-[0_0_12px_4px_rgba(255,190,90,0.6)]" />
                      </span>
                      <span className="mt-1 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-bold text-primary-foreground">You are here</span>
                    </span>
                  )}
                </div>
              );
            })}

            {allDone && [0, 1, 2].map((n) => (
              <span key={n} className="pointer-events-none absolute animate-fly-away" style={{ left: `${44 + n * 6}%`, top: pct(170, height), animationDelay: `${n * 0.25}s` }}>
                <GhostMark className="h-6 w-6 text-[var(--gp-ghost)]" eyeColor={P.ink} />
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4 self-start">
        {onLifeGoal && (
          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="font-heading text-[15px] font-semibold text-foreground">What matters to you?</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Pick a life goal. Every ghost you sort moves money towards it.</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {LIFE_GOALS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onLifeGoal((current) => ({ ...current, name: current.name === name ? '' : name }))}
                  aria-pressed={lifeGoal.name === name}
                  className={cn('rounded-full border px-2.5 py-1 text-[12px] font-bold transition-colors', lifeGoal.name === name ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground')}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="mt-2.5 flex gap-2">
              <label className="sr-only" htmlFor="life-goal-name">Your goal</label>
              <input
                id="life-goal-name"
                value={lifeGoal.name || ''}
                maxLength={40}
                onChange={(event) => onLifeGoal((current) => ({ ...current, name: event.target.value }))}
                placeholder="Or type your own"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <label className="sr-only" htmlFor="life-goal-amount">Amount</label>
              <span className="flex items-center rounded-xl border border-border bg-background px-2 text-[13px] text-muted-foreground focus-within:border-primary">
                $
                <input
                  id="life-goal-amount"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={lifeGoal.amount || ''}
                  onChange={(event) => onLifeGoal((current) => ({ ...current, amount: Number(event.target.value) || 0 }))}
                  placeholder="Amount"
                  className="w-20 bg-transparent py-2 pl-1 text-foreground outline-none"
                />
              </span>
            </div>
            {lifeGoal.name && lifeGoal.amount > 0 && (
              <div className="mt-3">
                <div className="flex items-baseline justify-between text-[12.5px]">
                  <span className="font-bold text-foreground">{lifeGoal.name}</span>
                  <span className="tabular-nums text-muted-foreground">{money(Math.min(saved, lifeGoal.amount))} / {money(lifeGoal.amount)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#5ee6c8] transition-[width] duration-700" style={{ width: pct(Math.min(saved, lifeGoal.amount), lifeGoal.amount) }} />
                </div>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                  {saved >= lifeGoal.amount ? `You've covered ${lifeGoal.name.toLowerCase()} with the ghosts you sorted!` : `${money(lifeGoal.amount - saved)} to go. Sorting the next ghost gets you closer.`}
                </p>
              </div>
            )}
            <p className="mt-2 text-[10.5px] text-muted-foreground/80">Your goal, your call. Not saved anywhere.</p>
          </div>
        )}
        {selected && Kind && (
          <div key={selected.id} className="animate-rise rounded-3xl bg-[#f5f0e8] p-5 text-[#1b1233] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <p className="font-retro text-[13px] uppercase tracking-[0.2em] text-[#a24a00]">Goal {selectedIndex + 1} of {goals.length}{selected.done ? ' · done' : ''}</p>
            <h3 className="mt-1.5 font-heading text-[1.45rem] font-bold leading-tight">{selected.label}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#5b5275]">{selected.why}</p>
            <ul className="mt-4 space-y-2.5">
              {Kind.steps.map((step, i) => {
                const on = selected.done || ticked[selected.id]?.[i];
                return (
                  <li key={step}>
                    <button type="button" onClick={() => tick(selected.id, i)} className="flex w-full items-center gap-3 text-left text-[14px]">
                      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors', on ? 'border-[#1f7a5c] bg-[#1f7a5c] text-white' : 'border-[#1b1233]/35')}>
                        {on && <Check className="h-4 w-4" strokeWidth={3} />}
                      </span>
                      <span className={cn(on && 'text-[#5b5275] line-through')}>{step}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected.save > 0 && (
              <div className="mt-4 flex items-baseline justify-between border-t border-[#1b1233]/10 pt-3">
                <span className="text-[13px] text-[#5b5275]">Saves{months ? ` (found in ${monthsLabel(months)} months)` : ''}</span>
                <span className="font-heading text-[1.6rem] font-bold">{money(selected.save)}</span>
              </div>
            )}
            <div className="mt-3 flex gap-2.5">
              {selected.leak?.action && (
                <button
                  type="button"
                  onClick={() => { onDraft(selected.leak); setTicked((current) => ({ ...current, [selected.id]: { ...current[selected.id], 0: true } })); }}
                  className="flex-1 rounded-xl border-2 border-[#1b1233]/80 py-2.5 text-[14px] font-bold transition-colors hover:bg-[#1b1233]/[0.06]"
                >
                  Draft email
                </button>
              )}
              {selected.kind === 'reminders' && !selected.done && (
                <button
                  type="button"
                  onClick={() => { downloadAllReminders(subscriptions.filter((item) => item.lastDate)); onRemindersDone(true); }}
                  className="flex-1 rounded-xl border-2 border-[#1b1233]/80 py-2.5 text-[14px] font-bold transition-colors hover:bg-[#1b1233]/[0.06]"
                >
                  Add all reminders
                </button>
              )}
              <button
                type="button"
                onClick={() => setDone(selected, !selected.done)}
                className={cn('flex-1 rounded-xl py-2.5 text-[14px] font-bold transition-transform active:translate-y-0.5', selected.done ? 'border-2 border-[#1b1233]/40' : 'bg-[#1b1233] text-[#f5f0e8] shadow-[0_4px_0_#000]')}
              >
                {selected.done ? 'Undo' : 'Mark done'}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              {selected.kind !== 'reminders' ? (
                <button type="button" onClick={onOpenHouse} className="text-[13px] font-bold underline underline-offset-4">See this ghost in the house</button>
              ) : <span />}
              {!allDone && (
                <button type="button" onClick={nextGoal} className="inline-flex items-center gap-1 text-[13px] font-bold text-[#a24a00]">
                  Next goal <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            {allDone && <p className="mt-3 rounded-xl bg-[#ffcf73] px-3 py-2 text-center font-heading text-[14px] font-bold">You reached the ghost-free house!</p>}
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
