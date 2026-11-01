// Numbers and words for the My Ex Ghosted Me story. Everything comes from the
// real scan: monthly prices of the subscriptions and which ones the user blocked.
// Nothing is guessed; yearly amounts are monthly x 12, as shown everywhere else.
import { money } from './format';

// The glow-up milestones from the design: one month of your exes buys brunch,
// three months dinner out, six a weekend away, twelve a savings goal.
export const MILESTONES = [
  { key: 'brunch', label: 'Brunch', months: 1, icon: 'coffee' },
  { key: 'dinner', label: 'Dinner out', months: 3, icon: 'utensils' },
  { key: 'weekend', label: 'Weekend away', months: 6, icon: 'tent' },
  { key: 'savings', label: 'Savings', months: 12, icon: 'piggy' },
];

export function monthlyOf(items = []) {
  return items.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
}

// Glow-up fund: what the blocked exes would have taken in a year.
export function glowUp(subscriptions = [], blockedIds = new Set()) {
  const monthly = monthlyOf(subscriptions);
  const blocked = subscriptions.filter((item) => blockedIds.has(item.id));
  const fund = monthlyOf(blocked) * 12;
  const goal = monthly * 12;
  let nextFound = false;
  const steps = MILESTONES.map((step) => {
    const amount = monthly * step.months;
    const unlocked = fund > 0 && fund >= amount;
    let state = unlocked ? 'Unlocked' : 'Later';
    if (!unlocked && !nextFound) {
      state = 'Next up';
      nextFound = true;
    }
    return { ...step, amount, unlocked, state };
  });
  return { monthly, fund, goal, blockedCount: blocked.length, steps };
}

// Short kind of thing it is, for the line under each ex's name.
export function kindOf(merchant = '') {
  if (/NETFLIX|\bSTAN\b|BINGE|DISNEY|PRIME|PARAMOUNT|STREAM|KAYO|FOXTEL|YOUTUBE/i.test(merchant)) return 'Streaming';
  if (/SPOTIFY|MUSIC|TIDAL|DEEZER/i.test(merchant)) return 'Music';
  if (/GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45|PILATES|YOGA/i.test(merchant)) return 'Membership';
  if (/ICLOUD|GOOGLE\s*ONE|DROPBOX|ONEDRIVE|STORAGE/i.test(merchant)) return 'Storage';
  if (/ADOBE|CANVA|MICROSOFT|OFFICE/i.test(merchant)) return 'Software';
  return 'Subscription';
}

export const yearly = (monthly) => money((Number(monthly) || 0) * 12);
