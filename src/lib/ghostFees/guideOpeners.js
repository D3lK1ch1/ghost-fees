// Pack 11: each ghost does its one job first. These openers are fixed text built from
// the scan (no AI), so they're free and the numbers are always right. Each one ends with
// a single question and tap chips. Chips that start with "Ask <ghost> →" hand you over.
import { money, monthsLabel } from './format';
import { biasFor, biasGroups } from './leaks';
import { cancelInfo } from './cancelLinks';
import { GUIDES } from './guides';
import { bundleGroups } from './bundles';

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
    const target = (focus?.action && focus) || leaks.find((leak) => leak.action) || biggest;
    const kind = { cancel: 'a cancel email', refund: 'a refund request', waive: 'a polite request to waive the fee' }[target.action] || 'a letter';
    return {
      text: `${g.hello}\n\nI've drafted ${kind} for ${nameOf(target)} (${money(target.amount)}). Open it, check it, then send it from your own email.\n\nFirmer or friendlier?`,
      action: 'draft_email', leak: target,
      chips: [CHIP.firmer, CHIP.friendlier],
    };
  }
  if (guideKey === 'gus') {
    return {
      text: `${g.hello}\n\n${leaks.length} ${leaks.length === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Biggest first: ${nameOf(biggest)}, ${money(biggest.amount)}.\n\nBust it?`,
      action: 'open_leak', leak: biggest,
      chips: [CHIP.bust, CHIP.later],
    };
  }
  if (guideKey === 'cass') {
    const target = (focus?.action === 'cancel' && focus) || leaks.find((leak) => leak.action === 'cancel') || biggest;
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
    // Kit works from the subscriptions list, so he opens even with no ghosts.
    const groups = bundleGroups(analysis.subscriptions || []).filter((group) => group.key !== 'ai');
    const top = groups[0];
    return {
      text: top
        ? `${g.hello}\n\nYou pay for ${top.items.length} ${top.label}: ${money(top.monthly)} a month for the same job. Pick your favourite below and I'll show what to keep, or how to rotate.`
        : `${g.hello}\n\nNo double-ups on this statement. Got AI tools? Type them with prices, or tick what you use AI for below.`,
      kit: top ? top.key : 'ai',
      chips: [handoffChip('cass'), handoffChip('habit')],
    };
  }
  if (guideKey === 'mind') {
    const withPattern = (focus && biasFor(focus) && focus) || leaks.find((leak) => biasFor(leak)) || null;
    if (!withPattern) return { text: `${g.hello}\n\nNone of these ghosts match a common money pattern I know. Penny can walk you through the fees.`, chips: [handoffChip('penny')] };
    const info = biasFor(withPattern);
    return {
      text: `${g.hello}\n\n${nameOf(withPattern)}: ${withPattern.reason.charAt(0).toLowerCase()}${withPattern.reason.slice(1)} That's a common pattern called ${info.bias}: ${info.line.charAt(0).toLowerCase()}${info.line.slice(1)} (${shortCite(info.cite)})\n\nSound like you?`,
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
