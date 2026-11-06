// Pack 11: each ghost does its one job first. These openers are fixed text built from
// the scan (no AI), so they're free and the numbers are always right. Each one ends with
// a single question and tap chips. Chips that start with "Ask <ghost> →" hand you over.
import { money, monthsLabel } from './format';
import { biasFor, biasGroups } from './leaks';
import { cancelInfo } from './cancelLinks';
import { GUIDES } from './guides';
import { bundleGroups, consolidationPlan, consolidationText } from './bundles';

const nameOf = (leak) => leak.title || leak.merchant;
export const handoffChip = (key) => `Ask ${GUIDES[key].name.replace('Sir ', '')} →`;
export const HANDOFF_RE = /^Ask (Penny|Spooksworth|Gus|Cassy|Kit|Mo|Hattie|Hank) →$/;
export const handoffKey = (chip) => {
  const m = HANDOFF_RE.exec(chip);
  if (!m) return null;
  const name = m[1] === 'Hank' ? 'Hattie' : m[1];
  return Object.keys(GUIDES).find((key) => GUIDES[key].name.replace('Sir ', '') === name) || null;
};
// "O’Donoghue & Rabin, 1999, American Economic Review" -> "O’Donoghue & Rabin, 1999"
export const shortCite = (cite = '') => cite.split(', ').slice(0, 2).join(', ');

// Fixed chip labels the chat answers itself (see GhostGuide).
export const CHIP = {
  nextFee: 'Next fee',
  firmer: 'Make it firmer',
  friendlier: 'Make it friendlier',
  bust: 'Bust it',
  later: 'Show me the rest',
  worked: "Yes, it's cancelled",
  notYet: 'Not yet',
  yes: 'Yes, sounds like me',
  unsure: 'Not sure',
  no: 'Not me',
};
export const START_CHIPS = ['Tomorrow', 'Next Monday', 'The 1st of next month'];

// Fees first for Penny: bank fees and surcharges, then everything else.
export function feeOrder(leaks) {
  const fees = leaks.filter((leak) => /fee|surcharge|interest|borrow/i.test(leak.badge || ''));
  return [...fees, ...leaks.filter((leak) => !fees.includes(leak))];
}

export function pennyLine(leak, months) {
  return `${nameOf(leak)} is a ${String(leak.badge).toLowerCase()}: ${money(leak.amount)} in ${months}. ${leak.reason}`;
}

// The pattern Hattie should build a habit for: the one they said "yes" to, then their
// saved plan's, then the biggest.
export function habitPattern(analysis, answers = {}, plan = null) {
  const groups = biasGroups(analysis.leaks);
  return groups.find((g) => answers[g.key] === 'yes')
    || (plan && groups.find((g) => g.key === plan.patternKey))
    // Then the pattern behind the biggest ghost (the one Mo opens with), then the biggest pattern.
    || groups.find((g) => g.key === biasFor((analysis.leaks || []).find((leak) => biasFor(leak)) || {})?.key)
    || groups[0]
    || null;
}

// focus: the ghost the previous guide was talking about, so a handoff carries it along.
export function opener(guideKey, analysis, { answers = {}, plan = null, hank = false, focus = null } = {}) {
  const { leaks, total, monthSpan } = analysis;
  const months = `${monthsLabel(monthSpan)} months`;
  const biggest = leaks[0];
  const g = GUIDES[guideKey];
  if (!biggest && guideKey !== 'bundle') return { text: `${g.hello} No ghosts in this statement, so nothing to do. Nice.`, chips: [] };

  if (guideKey === 'penny') {
    const fee = feeOrder(leaks)[0];
    return {
      text: `${g.hello}\n\nYour biggest fee: ${pennyLine(fee, months)}\n\nNext fee, or get Spooksworth to write the ask?`,
      action: 'open_leak', leak: fee, feeIndex: 0,
      chips: [CHIP.nextFee, handoffChip('sir')],
    };
  }
  if (guideKey === 'sir') {
    // Spooksworth does the whole letter job for every ghost that needs one: no picking.
    const letters = leaks.filter((leak) => leak.action).slice(0, 6);
    if (!letters.length) return { text: `${g.hello}\n\nNone of these ghosts need a letter. They're ones to keep an eye on.`, chips: [handoffChip('cass')] };
    return {
      text: `${g.hello}\n\nI've drafted ${letters.length === 1 ? 'your letter' : `all ${letters.length} letters`}, biggest first. Send each from your own Outlook or Gmail, and I'll put a reminder in your calendar to check for a reply. Each step ticks off your task list.`,
      letters: letters.map((leak) => leak.id),
      chips: [CHIP.firmer, CHIP.friendlier],
      leak: letters[0],
    };
  }
  if (guideKey === 'gus') {
    // Gus the bust coach: the score, then each ghost with how to bust it and who helps.
    return {
      text: `${g.hello}\n\n${leaks.length} ${leaks.length === 1 ? 'ghost' : 'ghosts'}, ${money(total)} on the line. Here's the bust plan, biggest first. Tap the button on each one, grab a teammate if you need one, then hit Busted it.`,
      bust: true,
      chips: [],
    };
  }
  if (guideKey === 'cass') {
    // Prefer one with a checked cancel page (the handed-over ghost first), then the biggest
    // subscription that has one, so the opener is useful straight away.
    const hasLink = (item) => Boolean(cancelInfo(item.merchant || nameOf(item)).url);
    const subsWithLink = [...(analysis.subscriptions || [])].sort((a, b) => b.monthly - a.monthly).filter(hasLink);
    const target = (focus?.action === 'cancel' && focus)
      || leaks.find((leak) => leak.action === 'cancel' && hasLink(leak))
      || subsWithLink[0]
      || leaks.find((leak) => leak.action === 'cancel')
      || biggest;
    const info = cancelInfo(target.merchant || nameOf(target));
    const how = info.url ? `Official page: ${info.url}\nSteps: ${info.steps}` : info.steps;
    return {
      text: `${g.hello}\n\nTo cancel ${nameOf(target)}:\n${how}\n\nDid it work?`,
      leak: target,
      // No checked link: offer a live lookup on their official site (uses Cassy's free answer).
      chips: [CHIP.worked, CHIP.notYet, ...(info.url ? [] : [`Look up ${target.merchant || nameOf(target)}`])],
    };
  }
  if (guideKey === 'bundle') {
    // Kit opens with the consolidation plan for every pack (rules, no AI), then his planner.
    const all = bundleGroups(analysis.subscriptions || []);
    const plan = consolidationText(consolidationPlan(all));
    const first = all.find((group) => group.key !== 'ai');
    return {
      text: plan
        ? `${g.hello}\n\n${plan}`
        : `${g.hello}\n\nNo double-ups on this statement. Type what else you pay for below (names are enough, like "Disney+ and YouTube"), or tick what you use AI for.`,
      kit: first ? first.key : 'ai',
      chips: [handoffChip('cass'), handoffChip('habit')],
    };
  }
  if (guideKey === 'mind') {
    const withPattern = (focus && biasFor(focus) && focus) || leaks.find((leak) => biasFor(leak)) || null;
    if (!withPattern) return { text: `${g.hello}\n\nNone of these ghosts match a common money pattern I know. Penny can walk you through the fees.`, chips: [handoffChip('penny')] };
    const info = biasFor(withPattern);
    return {
      text: `${g.hello}\n\n${nameOf(withPattern)}: ${withPattern.reason.charAt(0).toLowerCase()}${withPattern.reason.slice(1)}\n\nThat's a common pattern called ${info.bias}. Here's how it works:`,
      explain: info.key,
      after: 'Sound like you?',
      action: 'open_pattern', biasKey: info.key,
      chips: [CHIP.yes, CHIP.unsure, CHIP.no],
    };
  }
  if (guideKey === 'habit') {
    const pattern = habitPattern(analysis, answers, plan);
    const hello = hank ? g.hello.replace("I'm Hattie", "I'm Hank") : g.hello;
    if (!pattern) return { text: `${hello}\n\nNo money patterns in this statement, so no habit needed.`, chips: [] };
    const habit = plan && plan.patternKey === pattern.key ? plan.habitText : pattern.beat;
    return {
      text: `${hello}\n\nFor ${pattern.bias}, one small habit:\n"${habit}"\n\nWhen do you want to start?`,
      action: 'open_habit', biasKey: pattern.key,
      chips: START_CHIPS,
    };
  }
  return { text: g.hello, chips: g.chips };
}
