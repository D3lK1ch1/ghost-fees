import { useState } from 'react';
import { habitGhost, habitImgProps, readExPick } from '@/lib/ghostFees/habitArt';
import { addDays, doneCount, isHabitKeeper, niceDate, startChoices, useHabitPlan, ymdLocal } from '@/lib/ghostFees/habitPlan';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

// Pack 10 part C: the 7-day check-in. "Did you do it?" Yes / Not yet / It's not for me.
// No streaks and no guilt; at most one prompt a week. Two "Yes" answers earn Habit Keeper.
const LINES = {
  hattie: { ask: "It's been a week. Did you do it?", yes: "That's how it starts.", notYet: 'No shame. Want to move the start day?', notMe: 'Fair. Pick a different one?' },
  hank: { ask: "Week's up. Did you do it?", yes: "Told you. That's how it starts.", notYet: 'All good. Want to move the day?', notMe: 'Fair. Pick a different one?' },
};

export default function HabitCheckIn({ onPickAnother, className = '' }) {
  const { theme } = useTheme();
  const exPick = readExPick();
  const ghost = habitGhost(theme.key, exPick);
  const lines = ghost.hank ? LINES.hank : LINES.hattie;
  const [plan, save] = useHabitPlan();
  const [result, setResult] = useState(null);
  if (!plan) return null;
  const today = ymdLocal(new Date());
  const answer = (done) => {
    const next = { ...plan, checkIns: [...(plan.checkIns || []), { date: today, done }], lastPrompt: today };
    save(next);
    setResult(done ? 'yes' : 'notYet');
  };
  const notMe = () => { save({ ...plan, lastPrompt: today }); setResult('notMe'); onPickAnother?.(); };
  const keeper = isHabitKeeper(plan);
  const btn = 'rounded-full border px-3.5 py-1.5 text-[14px] font-semibold';
  return (
    <section aria-label={`${ghost.name}'s check-in`} className={cn('relative overflow-hidden rounded-2xl border border-[#ff8a7a]/40 bg-[#ff8a7a]/[0.07] p-4', className)}>
      {result === 'yes' && Array.from({ length: 18 }, (_, i) => (
        <span key={i} aria-hidden="true" className="gl-confetti pointer-events-none absolute top-0" style={{ left: `${(i * 41) % 100}%`, width: i % 2 ? 7 : 9, height: i % 3 ? 11 : 7, borderRadius: i % 4 ? 2 : '50%', background: ['#ff8a7a', '#5ee6c8', '#ffd36e', '#b79cff'][i % 4], animationDelay: `${(i % 6) * 0.12}s` }} />
      ))}
      <div className="flex items-start gap-3">
        <img {...habitImgProps(theme.key, exPick, 'checkin')} className="h-20 w-20 shrink-0 object-contain" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#ff8a7a]">{ghost.name}&apos;s check-in</p>
          <p className="mt-0.5 text-[16px] font-semibold text-foreground">{lines.ask}</p>
          <p className="mt-0.5 text-[14px] text-foreground/80">{plan.habitText}</p>
          {!result && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button type="button" onClick={() => answer(true)} className={cn(btn, 'border-[#ff8a7a] bg-[#ff8a7a] text-[#2a1414]')}>Yes, I did it</button>
              <button type="button" onClick={() => answer(false)} className={cn(btn, 'border-white/20 text-foreground')}>Not yet</button>
              <button type="button" onClick={notMe} className={cn(btn, 'border-white/20 text-foreground')}>It&apos;s not for me</button>
            </div>
          )}
          {result === 'yes' && (
            <p className="mt-2 text-[14.5px] text-foreground" role="status">
              {lines.yes}{keeper && <> <b>🏅 Habit Keeper:</b> you kept one money habit for 2 weeks.</>}
              {!keeper && doneCount(plan) === 1 && <> One more week and you earn <b>Habit Keeper</b>.</>}
            </p>
          )}
          {result === 'notYet' && (
            <div className="mt-2" role="status">
              <p className="text-[14.5px] text-foreground">{lines.notYet}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {startChoices().map((c) => (
                  <button key={c.key} type="button" onClick={() => { save({ ...plan, startDate: c.date, lastPrompt: today }); setResult('moved'); }} className={cn(btn, 'border-white/20 text-foreground')}>{c.label}</button>
                ))}
              </div>
            </div>
          )}
          {result === 'moved' && <p className="mt-2 text-[14.5px] text-foreground" role="status">Moved to {niceDate(plan.startDate)}. I&apos;ll check in on {niceDate(addDays(plan.startDate, 7))}.</p>}
          {result === 'notMe' && <p className="mt-2 text-[14.5px] text-foreground" role="status">{lines.notMe}</p>}
        </div>
      </div>
    </section>
  );
}
