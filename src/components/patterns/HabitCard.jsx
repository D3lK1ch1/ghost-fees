import { forwardRef, useEffect, useState } from 'react';
import { CalendarPlus, ListTodo } from 'lucide-react';
import { habitGhost, habitImgProps, readExPick } from '@/lib/ghostFees/habitArt';
import { addDays, checkInDue, downloadHabitIcs, habitGoogleUrls, habitOutlookUrls, niceDate, startChoices, useHabitPlan } from '@/lib/ghostFees/habitPlan';
import { PATTERN_BY_KEY } from '@/lib/ghostFees/leaks';
import { money } from '@/lib/ghostFees/format';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';
import { BeatButton } from './PatternDialog';
import HabitCheckIn from './HabitCheckIn';

// Pack 10 part B: Hattie (Hank on the Ex "I'm Fine" pick) helps you keep ONE habit from
// your patterns: pick it, pick a start day, put it in your calendar and task list.
// Part D: on a later real scan, the same pattern's total then and now (past only).
const TITLE = { haunted: 'One habit, one month', ex: 'Your no-going-back plan', christmas: 'Your Christmas resolution' };
const LINES = {
  hattie: { open: "Mo told you why. I'll help you do something about it. Just one habit.", save: (d) => `Done. I'll check in on ${d}. Small and boring beats big and forgotten.` },
  hank: { open: "Mo told you why. I'll help you do one thing about it. No drama.", save: (d) => `Sorted. I'll check in on ${d}. Small and boring. That's the move.` },
};
const monthOf = (ymd) => String(ymd || '').slice(0, 7);

const HabitCard = forwardRef(function HabitCard({ groups, leaks, preselect, usedSample, onDraft, onTab }, ref) {
  const { theme } = useTheme();
  const exPick = readExPick();
  const ghost = habitGhost(theme.key, exPick);
  const lines = ghost.hank ? LINES.hank : LINES.hattie;
  const [plan, save] = useHabitPlan();
  const [editing, setEditing] = useState(!plan);
  const [pick, setPick] = useState(preselect || plan?.patternKey || groups[0]?.key);
  const [start, setStart] = useState(plan?.startDate || startChoices()[1].date);
  const [checkParam] = useState(() => { try { return new URLSearchParams(window.location.search).get('habit') === 'check'; } catch { return false; } });
  useEffect(() => { if (preselect) { setPick(preselect); setEditing(true); } }, [preselect]);
  if (!groups.length) return null;

  const pattern = PATTERN_BY_KEY[pick];
  const group = groups.find((g) => g.key === pick);
  const saveNow = () => {
    const baseline = !usedSample && group ? { patternKey: group.key, amount: group.total, fromMonth: monthOf(group.from), toMonth: monthOf(group.to) } : (plan?.patternKey === pick ? plan?.baseline : undefined);
    save({ patternKey: pick, habitText: pattern.beat, startDate: start, checkIns: plan?.patternKey === pick ? plan.checkIns || [] : [], baseline, savedAt: new Date().toISOString(), inTasks: plan?.inTasks || false });
    setEditing(false);
  };
  const title = ghost.hank ? "Hank's habit plan" : "Hattie's habit plan";
  const subtitle = TITLE[theme.key] || TITLE.haunted;
  const btn = 'inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 text-[13.5px] font-semibold text-foreground hover:border-[#ff8a7a]/70';

  // Part D: the pattern on this scan vs when the plan was saved (past numbers only).
  const base = plan?.baseline;
  const nowGroup = base ? groups.find((g) => g.key === base.patternKey) : null;
  let compare = null;
  if (base && !usedSample && nowGroup) {
    if (monthOf(nowGroup.to) > base.toMonth) compare = `${nowGroup.bias}: ${money(base.amount)} on your last statement, ${money(nowGroup.total)} on this one.`;
    else compare = "Upload next month's statement and I'll show you how this pattern changed.";
  }

  return (
    <section ref={ref} id="habit-card" aria-labelledby="habit-title" className="scroll-mt-24 rounded-2xl border border-[#ff8a7a]/35 bg-white/[0.025] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <img {...habitImgProps(theme.key, exPick, 'main')} className="h-24 w-24 shrink-0 object-contain motion-safe:animate-float sm:h-28 sm:w-28" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#ff8a7a]">{ghost.name}, {ghost.role}</p>
          <h3 id="habit-title" className="mt-0.5 text-[18px] font-semibold text-foreground">{title} · {subtitle}</h3>
          <p className="mt-1 text-[14.5px] text-foreground/85">{editing ? lines.open : lines.save(niceDate(addDays(plan.startDate, 7)))}</p>
        </div>
      </div>

      {plan && !editing && (checkParam || checkInDue(plan)) && <HabitCheckIn className="mt-4" onPickAnother={() => setEditing(true)} />}

      {editing ? (
        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-[14.5px] font-semibold text-foreground">1. Pick one habit</legend>
            <div className="mt-2 space-y-2" role="radiogroup">
              {groups.map((g) => (
                <label key={g.key} className={cn('flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[14.5px]', pick === g.key ? 'border-[#ff8a7a] bg-[#ff8a7a]/[0.08]' : 'border-white/[0.08]')}>
                  <input type="radio" name="habit" checked={pick === g.key} onChange={() => setPick(g.key)} className="mt-1 accent-[#ff8a7a]" />
                  <span><span className="text-foreground">{g.beat}</span> <span className="text-[12.5px] text-muted-foreground">({g.bias})</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[14.5px] font-semibold text-foreground">2. Pick a start day</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {startChoices().map((c) => (
                <button key={c.key} type="button" aria-pressed={start === c.date} onClick={() => setStart(c.date)} className={cn(btn, start === c.date && 'border-[#ff8a7a] bg-[#ff8a7a] text-[#2a1414]')}>{c.label}</button>
              ))}
              <input type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} aria-label="Or pick a day" className="rounded-lg border border-white/15 bg-card px-2 py-1 text-[13.5px] text-foreground" />
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">Fresh starts help: people stick to plans better from a new week or month (Dai, Milkman &amp; Riis, 2014).</p>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveNow} disabled={!pattern} className="rounded-full bg-[#ff8a7a] px-5 py-2 text-[15px] font-semibold text-[#2a1414] disabled:opacity-50">Save my habit</button>
            {plan && <button type="button" onClick={() => setEditing(false)} className="text-[14px] text-muted-foreground hover:text-foreground">Cancel</button>}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="rounded-2xl bg-[#ff8a7a]/[0.08] px-4 py-3 text-[17px] font-semibold leading-snug text-foreground">{plan.habitText} <span className="text-[#ff8a7a]">Starting {niceDate(plan.startDate)}.</span></p>
          <p className="mt-3 text-[14.5px] font-semibold text-foreground">3. Make it real</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => downloadHabitIcs(plan, ghost.name)} className={btn}><CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to my calendar (Apple / .ics)</button>
            <a href={habitGoogleUrls(plan, ghost.name)[0]} target="_blank" rel="noopener noreferrer" className={btn}>Google: start day</a>
            <a href={habitGoogleUrls(plan, ghost.name)[1]} target="_blank" rel="noopener noreferrer" className={btn}>Google: check-in</a>
            <a href={habitOutlookUrls(plan, ghost.name)[0]} target="_blank" rel="noopener noreferrer" className={btn}>Outlook</a>
            <button type="button" aria-pressed={Boolean(plan.inTasks)} onClick={() => save({ ...plan, inTasks: !plan.inTasks })} className={cn(btn, plan.inTasks && 'border-[#5ee6c8] text-[#5ee6c8]')}><ListTodo className="h-4 w-4" aria-hidden="true" /> {plan.inTasks ? 'On my task list' : 'Add to my task list'}</button>
            {PATTERN_BY_KEY[plan.patternKey] && <BeatButton pattern={PATTERN_BY_KEY[plan.patternKey]} leaks={leaks.filter((l) => groups.find((g) => g.key === plan.patternKey)?.leakIds.includes(l.id))} onDraft={onDraft} onTab={onTab} />}
          </div>
          {compare && <p className="mt-3 rounded-xl border border-white/[0.08] px-3 py-2 text-[14.5px] text-foreground" role="status">{compare}</p>}
          <div className="mt-3 flex gap-4 text-[14px]">
            <button type="button" onClick={() => setEditing(true)} className="font-semibold text-foreground/85 hover:text-foreground">Edit</button>
            <button type="button" onClick={() => { save(null); setEditing(true); }} className="text-muted-foreground hover:text-foreground">Stop this habit</button>
          </div>
        </div>
      )}
      <p className="mt-4 text-[12.5px] leading-snug text-muted-foreground">
        &lsquo;When X, I will Y&rsquo; plans are called implementation intentions (Gollwitzer, 1999). Habits take a while to feel automatic, often weeks (Lally et al., 2010). Not a judgement, and not financial advice.
      </p>
    </section>
  );
});

export default HabitCard;
