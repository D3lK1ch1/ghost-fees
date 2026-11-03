import { CalendarPlus, ListTodo } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { GOAL_KINDS, buildGoals, goalAsTask, useGoalTasks } from '@/lib/ghostFees/goalTasks';
import { downloadTask, googleCalendarUrl } from '@/lib/ghostFees/reminder';
import CollapseCard from '@/components/site/CollapseCard';
import { cn } from '@/lib/utils';

// Calendar tab: every goal from the goal path as a checklist with a day (3 Nov: "under
// calendar should be a checklist of tasks that come from goals"). Same ticks and dates
// as the goal path, so tick it in either place.
const nice = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

export default function GoalTasks({ leaks, subscriptions, cancelSubs = [], cleared = [], onClearedChange, remindersDone, onRemindersDone, onOpenPath }) {
  const goals = buildGoals({ leaks, subscriptions, cancelSubs, cleared, remindersDone });
  const { ticks, due, tick, setDue } = useGoalTasks();
  if (!goals.length) return null;
  const left = goals.filter((goal) => !goal.done);
  const order = [...goals].sort((a, b) => Number(a.done) - Number(b.done) || (due[a.id] || '9999').localeCompare(due[b.id] || '9999'));
  const setDone = (goal, done) => {
    if (goal.id === 'reminders') return onRemindersDone?.(done);
    onClearedChange?.(done ? [...cleared.filter((id) => id !== goal.id), goal.id] : cleared.filter((id) => id !== goal.id));
  };

  return (
    <CollapseCard
      icon={ListTodo}
      title="Your task list"
      summary={`${left.length} of ${goals.length} goals to do${Object.keys(due).length ? ` · ${Object.keys(due).length} on the calendar` : ''}. From your goal path.`}
      defaultOpen
    >
      <ul className="space-y-2.5">
        {order.map((goal) => {
          const steps = GOAL_KINDS[goal.kind].steps;
          const date = due[goal.id];
          return (
            <li key={goal.id} className={cn('rounded-2xl border px-4 py-3', goal.done ? 'border-[#5ee6c8]/30 bg-[#5ee6c8]/[0.05]' : 'border-border bg-background/40')}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <label className="flex min-w-0 flex-1 items-center gap-2.5">
                  <input type="checkbox" checked={goal.done} onChange={(event) => setDone(goal, event.target.checked)} className="h-5 w-5 shrink-0 accent-[hsl(var(--primary))]" />
                  <span className={cn('text-[15px] font-bold', goal.done ? 'text-muted-foreground line-through' : 'text-foreground')}>{goal.label}</span>
                </label>
                <span className="text-[13.5px] font-bold text-primary">{goal.monthly ? `${money(goal.monthly)}/mo` : goal.save ? `saves ${money(goal.save)}` : ''}</span>
              </div>
              {!goal.done && (
                <>
                  <ul className="mt-2 space-y-1 pl-7">
                    {steps.map((step, i) => (
                      <li key={step}>
                        <label className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
                          <input type="checkbox" checked={Boolean(ticks[goal.id]?.[i])} onChange={() => tick(goal.id, i)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                          <span className={ticks[goal.id]?.[i] ? 'line-through' : ''}>{step}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-7">
                    <label className="flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground">
                      📅 Do it on
                      <input type="date" value={date || ''} onChange={(event) => setDue(goal.id, event.target.value)} className="rounded-lg border border-border bg-card px-2 py-1 text-[13px] text-foreground" />
                    </label>
                    {date && (
                      <>
                        <a href={googleCalendarUrl(goalAsTask(goal, date))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[12.5px] font-bold text-foreground hover:border-primary/60"><CalendarPlus className="h-3.5 w-3.5" /> Google</a>
                        <button type="button" onClick={() => downloadTask(goalAsTask(goal, date))} className="rounded-full border border-border px-3 py-1 text-[12.5px] font-bold text-foreground hover:border-primary/60">Apple / Outlook</button>
                        <span className="text-[12.5px] text-muted-foreground">{nice(date)}</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {onOpenPath && (
        <button type="button" onClick={onOpenPath} className="mt-3 text-[13.5px] font-bold text-primary underline underline-offset-4">See these on your goal path →</button>
      )}
    </CollapseCard>
  );
}
