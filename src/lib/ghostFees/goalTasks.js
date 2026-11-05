import { useEffect, useState } from 'react';
import { money } from './format';
import { isHabitKeeper, readHabit } from './habitPlan';

// One plan, three views (3 Nov): the goal path makes the goals, the Calendar tab lists
// them as a checklist with dates and the ghost guide's "Make my goals" points there.
// Ticks and dates live in this browser only (localStorage), cleared by Clear my data.
const KEY = 'ghostFees.goalTasks.v1';
const EVENT = 'ghostFees:goalTasks';

export const GOAL_KINDS = {
  cancel: { label: (name) => `Cancel ${name}`, steps: ['Open the cancel email', 'Send it from your mail app', 'Check it is gone from your next statement'] },
  refund: { label: (name) => `Get your ${name} refund`, steps: ['Open the refund request', 'Send it with the extra charges listed', 'Check the refund lands'] },
  waive: { label: (name) => `Ask the bank to waive the ${name}`, steps: ['Open the waiver email', 'Send it to your bank', 'Ask about a fee-free account if they say no'] },
  check: { label: (name) => `Check ${name}`, steps: ['Look at the new price', 'Decide if it is still worth it', 'Cancel it if not'] },
  habit: { label: (text) => `Keep your habit: ${text}`, steps: ['Do it on your start day', 'Tell Hattie a week later', 'Do it again for a second week'] },
  reminders: { label: () => 'Add your reminders', steps: ['Tap Add all reminders', 'Open the file to add them to your calendar', 'Renewals will not sneak up on you'] },
};

// The same goals, in the same order, everywhere.
export function buildGoals({ leaks = [], subscriptions = [], cancelSubs = [], cleared = [], remindersDone = false }) {
  const leakGoals = leaks.map((leak) => {
    const kind = GOAL_KINDS[leak.action] ? leak.action : 'check';
    return { id: leak.id, kind, leak, label: GOAL_KINDS[kind].label(leak.title || leak.merchant), save: leak.amount, why: leak.reason, done: cleared.includes(leak.id) };
  });
  const reminderGoal = subscriptions.length
    ? [{ id: 'reminders', kind: 'reminders', label: GOAL_KINDS.reminders.label(), save: 0, why: `You have ${subscriptions.length} subscriptions. A reminder 2 days before each charge means nothing renews without you deciding.`, done: remindersDone }]
    : [];
  const subGoals = cancelSubs.map((item) => {
    const id = `sub:${item.id}`;
    return {
      id,
      kind: 'cancel',
      leak: { id, merchant: item.merchant, title: item.merchant, monthly: item.monthly, amount: item.monthly, action: 'cancel', badge: 'Subscription' },
      label: GOAL_KINDS.cancel.label(item.merchant),
      save: 0,
      monthly: item.monthly,
      why: `You said you would not sign up for ${item.merchant} today. It costs ${money(item.monthly)} a month.`,
      done: cleared.includes(id),
    };
  });
  // Pack 10: Hattie's habit, when you added it to your task list.
  const plan = readHabit();
  const habitGoal = plan?.inTasks ? [{ id: 'habit', kind: 'habit', label: GOAL_KINDS.habit.label(plan.habitText), save: 0, why: 'One small habit from your money patterns. Hattie checks in a week after your start day.', done: isHabitKeeper(plan) || cleared.includes('habit') }] : [];
  return [...leakGoals.slice(0, 1), ...habitGoal, ...reminderGoal, ...leakGoals.slice(1), ...subGoals];
}

function read() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '{}');
    return { ticks: parsed.ticks || {}, due: parsed.due || {} };
  } catch {
    return { ticks: {}, due: {} };
  }
}

function write(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage off: works for this visit.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

export function clearGoalTasks() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { ticks: {}, due: {} } }));
}

// Shared state: tick a step or set a goal's day in one place and every view updates.
export function useGoalTasks() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const on = (event) => setState(event.detail || read());
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const tick = (goalId, step, value) => {
    const next = read();
    const current = next.ticks[goalId] || {};
    next.ticks[goalId] = { ...current, [step]: value === undefined ? !current[step] : value };
    write(next);
  };
  const setDue = (goalId, date) => {
    const next = read();
    if (date) next.due[goalId] = date;
    else delete next.due[goalId];
    write(next);
  };
  return { ticks: state.ticks, due: state.due, tick, setDue };
}

// A goal's day as a calendar task (title, details, date) for Google, Outlook or .ics.
export const goalAsTask = (goal, date) => ({
  title: `👻 ${goal.label}`,
  details: `${GOAL_KINDS[goal.kind].steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nFrom your Ghost Fees goal path.`,
  date,
});
