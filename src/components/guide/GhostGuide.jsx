import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, monthsLabel } from '@/lib/ghostFees/format';
import { GUIDES, GUIDE_GROUPS } from '@/lib/ghostFees/guides';
import { biasFor, biasGroups, PATTERN_BY_KEY } from '@/lib/ghostFees/leaks';
import { usePatterns } from '@/components/patterns/PatternContext';
import { readHabit } from '@/lib/ghostFees/habitPlan';
import { readExPick } from '@/lib/ghostFees/habitArt';
import { useTheme } from '@/lib/ThemeContext';
import { CHIP, START_CHIPS, feeOrder, handoffChip, handoffKey, opener, pennyLine, shortCite } from '@/lib/ghostFees/guideOpeners';
import CassLookup from '@/components/results/CassLookup';
import KitPlanner from '@/components/guide/KitPlanner';
import LetterActions from '@/components/guide/LetterActions';
import BustPlan from '@/components/guide/BustPlan';
import MoExplainer from '@/components/guide/MoExplainer';
import HabitCoach from '@/components/guide/HabitCoach';
import CancelActions from '@/components/guide/CancelActions';
import FeeCheck from '@/components/guide/FeeCheck';
import { APP_STORE_NOTE, cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { aiToolFor, bundleGroups, consolidationPlan, consolidationText, mergeSubs, organiseText, parseTyped } from '@/lib/ghostFees/bundles';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/session';
import GhostMark from '@/components/site/GhostMark';
import { useAllowance } from '@/lib/AllowanceContext';

const MAX_INPUT = 500;
const MAX_AI_MESSAGES = 20;
const NO_MESSAGES = [];

const ACTION_LABELS = {
  draft_email: 'Open the email',
  open_leak: 'Take me there',
  show_transactions: 'Show the transactions',
  open_house: 'Open the haunted house',
  open_calendar: 'Open the calendar',
  open_path: 'Open my goal path',
  open_emails: 'See all email templates',
  scroll_feedback: 'Take me there',
  open_pattern: 'Open the pattern',
  open_habit: 'Open my habit plan',
};

const nameOf = (leak) => leak.title || leak.merchant;

// Finds a leak the question mentions by merchant name.
function findLeak(text, leaks) {
  return leaks.find((leak) => `${leak.title || ''} ${leak.merchant || ''}`.toLowerCase().split(/[\s,]+/)
    .some((word) => word.length > 3 && text.includes(word)));
}

const periodOf = (group) => (group.charges === 1 ? '1 charge' : `${group.charges} charges`);

// Mo's quick answers: the money patterns, from biasGroups (the app's own maths).
function moAnswer(text, analysis) {
  const groups = biasGroups(analysis.leaks);
  const top = groups[0];
  if (!groups.length) {
    if (/pattern|why|habit|trial|bias/.test(text)) return { reply: "None of these ghosts match a money pattern I know, so there's nothing to explain here. Penny can walk you through the fees." };
    return null;
  }
  const named = groups.find((g) => text.includes(g.bias.toLowerCase()) || text.includes(g.badge.toLowerCase()));
  if (/what (is|are) (a )?(money )?pattern|patterns\??$|explain .*pattern|mean/.test(text) && !named) {
    const list = groups.map((g) => `${g.bias} (${money(g.total)})`).join(', ');
    return {
      reply: `A money pattern is a shortcut most brains take, studied by researchers. It isn't a flaw, it's how people work. Yours: ${list}. Tap one in Money patterns to see the research and one habit.`,
      action: 'open_pattern', biasKey: top.key,
    };
  }
  if (/trial/.test(text)) {
    const trial = groups.find((g) => g.key === 'present_bias');
    if (!trial) return { reply: "None of your ghosts are trials that turned paid, so Present Bias isn't one of yours this time." };
    return { reply: `Your trials that turned into charges follow a common pattern called Present Bias. It cost you ${money(trial.total)} across ${periodOf(trial)}.`, explain: trial.key, action: 'open_pattern', biasKey: trial.key };
  }
  if (/habit|beat|stop|fix|do about/.test(text)) {
    const g = named || top;
    return { reply: `For ${g.bias}, one small habit: ${g.beat} Hattie can put it in your calendar and check in a week later.`, action: 'open_habit', biasKey: g.key };
  }
  if (named) {
    return { reply: `Here's ${named.bias}, step by step:`, explain: named.key, action: 'open_pattern', biasKey: named.key };
  }
  if (/most|biggest|largest|worst|top|costs?/.test(text) && !/ghost|fee|charge|subscription/.test(text)) {
    return { reply: `${top.bias} is the biggest common pattern behind your ghosts: ${money(top.total)} across ${periodOf(top)}.`, explain: top.key, action: 'open_pattern', biasKey: top.key };
  }
  if (/why|pattern|bias|brain|psycholog/.test(text)) {
    return { reply: `Your ghosts follow ${groups.length} common ${groups.length === 1 ? 'pattern' : 'patterns'}. The biggest is ${top.bias}: ${top.line} (${shortCite(top.cite)})`, action: 'open_pattern', biasKey: top.key };
  }
  return null;
}

// Hattie's quick answers: one small habit, from the pattern's own "beat it" line.
function hattieAnswer(text, analysis) {
  const groups = biasGroups(analysis.leaks);
  const plan = readHabit();
  const g = (plan && groups.find((item) => item.key === plan.patternKey)) || groups[0];
  if (!g && !plan) return /habit|start|forget|smaller|plan/.test(text) ? { reply: 'No money patterns in this statement, so no habit needed. Nice work.' } : null;
  if (/open|my (habit )?plan|calendar/.test(text)) {
    return { reply: plan ? `Your habit: ${plan.habitText} It's in your plan, with a check-in a week after you start.` : `No habit picked yet. Start with this one: ${g.beat}`, action: 'open_habit', biasKey: g?.key };
  }
  if (/smaller|easier|too (hard|much|big)|tiny/.test(text)) {
    return { reply: 'Make it so small it feels silly: do it just once this week, the next time it comes up. Habits take weeks of repeats to stick, and missing a day doesn\'t undo them.', action: 'open_habit', biasKey: g?.key };
  }
  if (/forget|forgot|remember|remind/.test(text)) {
    return { reply: 'Tie it to something you already do, like checking your bank app on payday. Then save the plan: it goes in your calendar with a check-in a week later, so I remind you.', action: 'open_habit', biasKey: g?.key };
  }
  if (/habit|start|begin/.test(text)) {
    return { reply: `Start with your biggest pattern, ${g.bias} (${money(g.total)}). One habit: ${g.beat} Pick a start day and I'll put it in your calendar.`, action: 'open_habit', biasKey: g.key };
  }
  return null;
}

// Every answer is built in the browser from the scan results. No AI, nothing sent anywhere.
// Shared safety answers come first, then the chosen ghost's own speciality.
// Common fast-typing slips, so "how cna you help me optuik mise" still routes right.
const TYPOS = [[/\bcna\b/g, 'can'], [/\bteh\b/g, 'the'], [/\byuo\b/g, 'you'], [/\bstuyd\b/g, 'study'], [/opt\w*\s?mi[sz]e?/g, 'optimise'], [/\bsub\w*(scr|crip|ript)\w*/g, 'subscriptions'], [/\bsubs\b/g, 'subscriptions'], [/reaser\w*|reserach\w*|reseach\w*/g, 'research']];
// Fuzzy fix, like most chat models: a word one letter off (two for long words) from a
// word the ghosts know is read as that word ("cancle" -> cancel, "stratgies" -> strategies).
const VOCAB = ['subscriptions', 'subscription', 'optimise', 'optimize', 'cancel', 'cancelled', 'email', 'emails', 'letter', 'letters', 'refund', 'waive', 'habit', 'habits', 'pattern', 'patterns', 'research', 'streaming', 'rotate', 'rotation', 'consolidate', 'organise', 'organize', 'collate', 'reminder', 'reminders', 'remind', 'calendar', 'progress', 'goals', 'strategies', 'strategy', 'improve', 'spending', 'compare', 'double', 'doubles', 'bust', 'score', 'budget', 'renewal', 'renewals', 'trial', 'trials', 'charges', 'charge', 'fees', 'total', 'price', 'creep', 'netflix', 'spotify', 'youtube', 'disney', 'stan', 'adobe', 'chatgpt', 'claude', 'privacy', 'stored', 'help', 'what', 'which', 'should', 'could', 'would', 'how', 'why', 'happen', 'happened', 'money', 'save', 'saving', 'explain', 'write', 'draft', 'phone', 'number', 'first', 'biggest', 'most', 'costs', 'track', 'tracker', 'start', 'smaller', 'forgetting', 'teammate', 'everything', 'study', 'review', 'manage', 'tidy'];
const VOCAB_SET = new Set([...VOCAB, 'store', 'stores', 'share', 'shared', 'stare', 'scare', 'trail', 'treat', 'other', 'there', 'where', 'these', 'those', 'their', 'month', 'weeks', 'alone', 'start', 'stack', 'chart', 'charm', 'hello', 'thank', 'thanks', 'great', 'stuff', 'state', 'statement']);
function close(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return false;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length] <= max;
}
const fixWord = (w) => {
  if (w.length < 5 || VOCAB_SET.has(w) || /\d/.test(w)) return w;
  const max = w.length >= 8 ? 2 : 1;
  return VOCAB.find((v) => v[0] === w[0] && close(w, v, max)) || VOCAB.find((v) => close(w, v, max)) || w;
};
const tidy = (q) => TYPOS.reduce((t, [re, fix]) => t.replace(re, fix), q.toLowerCase()).replace(/[a-z]+/g, fixWord);

function answer(question, analysis, guideKey) {
  const text = tidy(question);
  const { leaks, total, monthSpan } = analysis;
  const months = `${monthsLabel(monthSpan)} months`;
  const biggest = leaks[0];
  const mentioned = findLeak(text, leaks);

  if (/\b(bank should|switch|invest|loan|credit card|which (bank|card|account)|super(annuation)?|tax|debt|mortgage|advice|should i (invest|buy|switch|get|open|take|borrow|pay off))\b/.test(text)) {
    return { reply: "I can't give financial advice and I never recommend banks, cards or products. For that, moneysmart.gov.au is a good free place to start, or a licensed financial adviser." };
  }
  if (/next year|future|will i|predict|per year|a year|yearly|annual/.test(text)) {
    return { reply: `I only show money already lost in your statement: ${money(total)} in ${months}. I don't guess or project future amounts.` };
  }
  if (/\b(rent|groceries|grocery|transport|salary|wage|bills?)\b|not (here|there|shown|listed)/.test(text)) {
    return { reply: 'Rent, groceries, transport, transfers and pay are left out on purpose. They are normal spending, not leaks. I only flag bank fees, free trials that turned paid, duplicate charges and price rises.' };
  }
  if (/\b(stor(e|ed|ing|age)|saved?|privacy|private|data|keep (my|it|this)|delete)\b/.test(text)) {
    return { reply: 'CSVs are read in your browser and never leave it. PDFs are uploaded to private storage so they can be read. Your results and this chat are not saved either.' };
  }
  // "What can you do?", "How do you optimise my subscriptions?", "Can you help me?": the
  // ghost explains its own job in steps (from its description), then offers to start.
  const about = /what (can|do|does) (you|kit|penny|mo|hattie|gus|cassy) do|what('?s| is) your (job|role)|who are you|how (do|does|can|would|will) (you|it|this)|what are you (for|good at)|can you help|could you help|how does (this|it) work|explain yourself/;
  // Whose job is the thing they asked about? "Can you help me with X?" gets a straight
  // yes (here's how) or no (that's Kit's job) with a handoff chip.
  const TOPICS = [
    ['sir', /email|letter|write|draft/],
    ['cass', /cancel|phone number|unsubscribe/],
    ['mind', /pattern|bias|psycholog|why (do|does) (i|this|it)/],
    ['habit', /\bhabits?\b|remind me to|stick to/],
    ['bundle', /double|consolidat|rotat|optimi|streaming|ai tools?|organi[sz]|collat|too many|subscriptions?|renewals?/],
    ['gus', /goals?|progress|score|motivat|plan of attack|bust/],
    ['penny', /fees?|totals?|charges?|how much|price (rise|creep)|work(ed)? out/],
  ];
  const owner = TOPICS.find(([, re]) => re.test(text))?.[0] || null;
  if (/can (you|kit|penny|mo|hattie|gus|cassy) help|could you help|are you able to|do you do/.test(text) && owner && owner !== guideKey) {
    const o = GUIDES[owner];
    return { reply: `Not me, but ${o.name} can. ${o.does}`, owner };
  }
  if (guideKey === 'habit' && /improv|strateg|spending|track|better|stop doing|patterns?|bias|cost/.test(text) && !/collat|organi[sz]|cancel|email/.test(text)) {
    return { reply: 'Here\'s your plan, building on what Mo found: the pattern costing you most, strategies for it, one habit, and your tracker.', coach: true };
  }
  if (guideKey === 'penny' && /why (do|am) i (pay|paying|charged)|get (my )?(fees? |money )?back|refund|stop (these|the|my)? ?fees?|avoid|fees?\b.*\b(mean|for)|what (are|is) (these|this|my) fees?|help/.test(text) && !/subscriptions|cancel|email|letter/.test(text)) {
    const fees = leaks.filter((leak) => /fee|surcharge|interest|borrow/i.test(leak.badge || ''));
    if (fees.length) return { reply: 'Here\'s each fee: why you pay it, how to stop it, and whether you can get it back.', fees: fees.map((f) => f.id) };
  }
  if (about.test(text) && GUIDES[guideKey]?.how && !/collat|organi[sz]|\blist\b|consolidat|cancel (my|the|it)|email|letter/.test(text.replace(/^(yes|so)\b/, ''))) {
    const g = GUIDES[guideKey];
    const steps = g.how.map((step, i) => `${i + 1}. ${step}`).join('\n');
    if (guideKey === 'bundle') {
      const plan = consolidationText(consolidationPlan(bundleGroups(analysis.subscriptions || [])));
      return { reply: `${/can you help|could you help/.test(text) ? 'Yes! ' : ''}Here's how I optimise your subscriptions:\n${steps}${plan ? `\n\nOn this statement:\n${plan.replace("Here's your consolidation plan, pack by pack:\n\n", '')}` : ''}`, kit: 'video' };
    }
    const yes = /can you help|could you help|are you able/.test(text) ? 'Yes, I can help with that. ' : '';
    return { reply: `${yes}${g.hello}\n\nHow I do it:\n${steps}\n\nTap a question at the top, or ask me anything here.` };
  }
  if (guideKey === 'mind' || guideKey === 'habit') {
    const own = guideKey === 'mind' ? moAnswer(text, analysis) : hattieAnswer(text, analysis);
    if (own) return own;
  }
  // Kit: double-ups, rotation and AI tools open his planner (rules, no AI).
  const doubles = /consolidat|double|doubling|paying twice|rotat|which (one )?(should i|to) keep|too many|bundle|pick one|same thing|streaming|ai tools?|chatgpt|claude|midjourney|gemini|copilot|cursor/;
  if (guideKey === 'bundle') {
    const typed = parseTyped(question);
    if (typed.length >= 2) {
      const ai = typed.filter((t) => aiToolFor(t.merchant)).length >= 2;
      const first = bundleGroups(mergeSubs(analysis.subscriptions || [], typed)).find((g) => g.key !== 'ai' && g.items.some((i) => i.typed || typed.some((t) => t.name === i.name)));
      return ai
        ? { reply: `Got ${typed.length} tools. Tick what you use AI for and pick a budget, and I'll keep the 2 or 3 that cover it.`, kit: 'ai', typed: question }
        : { reply: first ? `Got it. ${first.items.length} ${first.label} doing the same job. ${first.key === 'video' ? 'Tell me what you watch and I\'ll research where it is, or just pick your favourite.' : 'Pick your favourite and I\'ll show what to keep, or how to rotate.'}` : 'Got it. None of those double up with each other or your statement.', kit: first?.key || 'video', typed: question };
    }
    if (/\bai\b|chatgpt|claude|midjourney|gemini|copilot|cursor|tools?/.test(text)) return { reply: 'Tick what you use AI for and pick a budget. I only choose from tools you already pay for.', kit: 'ai' };
    if (/rotat/.test(text)) return { reply: 'Rotating means one service a month: start one, cancel the last. Pick your favourite and tap Rotate, one a month. I can put every switch in your calendar.', kit: 'video' };
    // "Collate / organise / list my subscriptions": everything by pack first, then the plan.
    if (/collat|organi[sz]|\blist\b|overview|everything i pay|all (of )?my|what do i pay|tidy|manage|review|audit/.test(text)) {
      const groups = bundleGroups(analysis.subscriptions || []);
      const all = organiseText(analysis.subscriptions || []);
      const plan = consolidationText(consolidationPlan(groups));
      if (all) return { reply: plan ? `${all}\n\n${plan}` : `${all}\n\nNo double-ups between them. Type anything else you pay for below and I'll check it.`, kit: groups.find((g) => g.key !== 'ai')?.key || 'ai' };
    }
    if (doubles.test(text) || /optimi|save (me )?money|my subscriptions|subscriptions|sort (out|my)|help me/.test(text)) {
      const groups = bundleGroups(analysis.subscriptions || []);
      const plan = consolidationText(consolidationPlan(groups));
      return plan
        ? { reply: plan, kit: groups.find((g) => g.key !== 'ai')?.key || 'ai' }
        : { reply: 'No double-ups on this statement yet. Type what else you pay for, like "Disney+ $16, YouTube Premium $17", and I\'ll check every pack.', kit: 'video' };
    }
  } else if ((doubles.test(text) || /collat|organi[sz]|optimi|(sort|tidy|manage|review|audit) (out )?(all )?my subscriptions/.test(text)) && !/cancel|email|letter/.test(text)) {
    return { reply: "That's Kit's job. He compares subscriptions that do the same thing and helps you keep one or rotate.", owner: 'bundle' };
  }
  if (guideKey !== 'bundle' && /subscriptions/.test(text) && /optimi|study|go through|look at|all of them|all my|research|compare|sort|organi|collat|help/.test(text) && !/cancel|email|letter/.test(text)) {
    return { reply: "That's Kit's job. He researches and optimises all your subscriptions: finds double-ups, compares cost against what you use, then helps you keep one, rotate or cancel.", owner: 'bundle' };
  }
  // Another ghost's job: one line, then a chip that hands you to the right ghost.
  if (guideKey !== 'mind' && /pattern|bias|psycholog|brain|why do (i|my)|why does (this|it) keep|turn into charges/.test(text)) {
    return { reply: "That's Mo's job. He explains the common pattern behind each ghost, with the research.", owner: 'mind' };
  }
  if (guideKey !== 'habit' && /\bhabits?\b/.test(text)) {
    return { reply: "That's Hattie's job. She helps you keep one small habit so ghosts don't come back.", owner: 'habit' };
  }
  if (/work(ed)? out|how .*total|calculat/.test(text) && !mentioned) {
    return { reply: `${money(total)} is every ghost added up: ${leaks.slice(0, 5).map((leak) => `${nameOf(leak)} ${money(leak.amount)}`).join(', ')}. Each card shows its own charges, line by line.` };
  }
  if (/creep|price (rise|increase)|went up|go up/.test(text)) {
    const creep = leaks.find((leak) => leak.priceRise);
    return {
      reply: `Price creep is when a regular charge quietly goes up.${creep ? ` ${nameOf(creep)} went from ${money(creep.priceRise.oldPrice)} to ${money(creep.priceRise.newPrice)}, which has cost you ${money(creep.amount)} so far.` : ' I didn\'t find any in this statement.'}`,
      action: creep ? 'open_leak' : null,
      leak: creep,
    };
  }
  if (guideKey === 'gus' && /who (helps|does)|teammate|team/.test(text)) {
    return { reply: "Here's the team:\nPenny: what a fee is and how a total adds up.\nSpooksworth: writes and sends your emails.\nCassy: the provider's cancel page and phone number.\nKit: subscriptions that double up, keep or rotate.\nMo: why it happened.\nHattie: one habit so it doesn't come back.\nMe: the plan and the score." , bust: true };
  }
  if (guideKey === 'gus' && /bust|goals?|first|start|what (should|do) i|plan|how|next|score|progress|help/.test(text) && !/email|letter|write|draft/.test(text)) {
    return { reply: 'Here\'s your bust plan. Each ghost has the button that busts it and the teammate who helps. Hit Busted it when it\'s done and your score goes up.', bust: true };
  }
  if (guideKey === 'habit' && /improv|strateg|spend|plan|help|habit|track|better|stop|how|tips?|pattern|bias|cost/.test(text)) {
    return { reply: 'Here\'s your plan, building on what Mo found: the pattern costing you most, strategies for it, one habit, and your tracker.', coach: true };
  }
  if (/goals?|steps?|first|start|what (should|do) i|plan|improve|tips?|help me|next/.test(text) && !/email|letter|write|draft|cancel/.test(text) && guideKey !== 'habit' && guideKey !== 'mind') {
    const verb = { cancel: 'Cancel', refund: 'Get a refund for', waive: 'Ask the bank to waive' };
    const goals = leaks.slice(0, 4).map((item, i) => `${i + 1}. ${verb[item.action] || 'Check'} ${nameOf(item)} (${money(item.amount)})`);
    const more = leaks.length > 4 ? ` Plus ${leaks.length - 4} more.` : '';
    return {
      reply: leaks.length
        ? `I've laid out your goals, biggest first: ${goals.join(' ')}.${more} Each one has 3 steps: open the email, send it, then check it worked. Pick a day for each and it goes on your calendar's task list. Tick them off there or on the goal path.`
        : 'No ghosts to chase. Add your reminders so renewals never sneak up on you.',
      action: leaks.length ? 'open_path' : 'open_calendar',
    };
  }
  if (/remind|calendar|renew/.test(text) && guideKey !== 'habit') {
    return { reply: 'The calendar shows the days ghosts charged you, plus your next subscription charges. Tap Remind me, or Add all, to put reminders in your own calendar 2 days before each charge.', action: 'open_calendar' };
  }
  if (/templates?|all (the )?emails|every email/.test(text)) {
    return { reply: 'Every ghost that needs an email has one ready: cancel, refund or ask your bank to waive a fee. Open one, edit it, then copy it or send it from your mail app.', action: 'open_emails' };
  }
  if (/house|haunted/.test(text)) {
    return { reply: 'Each room holds one type of ghost. Pick a room, then draft an email or bust each ghost once it is sorted.', action: 'open_house' };
  }
  if (/feedback|bug|suggest/.test(text)) {
    return { reply: 'The feedback form is at the bottom of the page. It takes about 20 seconds.', action: 'scroll_feedback' };
  }
  if (/email|cancel|refund|waive|write|draft/.test(text)) {
    if (mentioned && !mentioned.action) return { reply: `${nameOf(mentioned)} doesn't need an email. It's one to keep an eye on.`, action: 'open_leak', leak: mentioned };
    const wanted = /refund/.test(text) ? 'refund' : /waive|bank/.test(text) ? 'waive' : /cancel/.test(text) ? 'cancel' : null;
    const leak = mentioned || (wanted && leaks.find((item) => item.action === wanted)) || leaks.find((item) => item.action);
    if (!leak) return { reply: "None of these ghosts need an email. They're things to keep an eye on." };
    const kind = { cancel: 'a cancel email', refund: 'a refund request', waive: 'a request to waive the fee' }[leak.action];
    const about = leak.targets?.length
      ? `your ${nameOf(leak)}, cancelling ${leak.targets.map((target) => target.merchant).join(' and ')}`
      : `${nameOf(leak)} (${money(leak.amount)})`;
    return { reply: `I've got ${kind} ready for ${about}. You can edit it before sending.`, action: 'draft_email', leak };
  }
  if (mentioned && /how|why|work|calculat|explain|what/.test(text)) {
    return {
      reply: `${nameOf(mentioned)} is a ${mentioned.badge.toLowerCase()}: ${mentioned.reason} That adds up to ${money(mentioned.amount)} in ${months}.`,
      action: 'open_leak',
      leak: mentioned,
    };
  }
  if (/most|biggest|largest|worst|top/.test(text) && biggest) {
    return {
      reply: `${nameOf(biggest)} costs the most: ${money(biggest.amount)} in ${months}, as a ${biggest.badge.toLowerCase()}. ${biggest.reason}`,
      action: 'open_leak',
      leak: biggest,
    };
  }
  if (mentioned) {
    return { reply: `${nameOf(mentioned)}: ${money(mentioned.amount)} in ${months}. ${mentioned.reason}`, action: 'open_leak', leak: mentioned };
  }
  return null;
}

// What the AI guide may see: the results summary only. Never rows, descriptions, pay or file names.
function summaryFor(analysis, patternAnswers = {}) {
  return {
    // Pack 9: the money patterns, computed by biasGroups (the AI explains, never calculates).
    patterns: biasGroups(analysis.leaks).map((g) => ({ key: g.key, name: g.bias, badge: g.badge, total: g.total, charges: g.charges, from: g.from, to: g.to, evidence: g.evidence })),
    patternAnswers,
    habitPlan: (() => { const p = readHabit(); return p ? { patternKey: p.patternKey, habitText: p.habitText } : null; })(),
    total: analysis.total,
    months: analysis.monthSpan,
    leaks: analysis.leaks.map((leak) => ({
      id: leak.id, merchant: nameOf(leak), badge: leak.badge, amount: leak.amount, monthly: leak.monthly, reason: leak.reason,
    })),
    subscriptions: analysis.subscriptions.map((item) => ({ merchant: item.merchant, monthly: item.monthly })),
  };
}

// Each ghost offers only its own speciality questions, so it's obvious what it's for.
function starterChips(analysis, guide) {
  const own = guide?.chips || [];
  return own.includes('Is my data stored?') ? own : [...own, 'Is my data stored?'];
}

export default function GhostGuide({ analysis, guideKey, onGuide, onAction, openRequest = 0 }) {
  const [open, setOpen] = useState(false);
  const [big, setBig] = useState(false); // expand button: nearly full screen
  // Ghost team: the chain of ghosts that referred you on (Penny → Spooksworth → Cassy).
  const [team, setTeam] = useState([]);
  const [input, setInput] = useState('');
  // Each ghost has its own conversation ("its own window"): switching ghost shows that
  // ghost's chat, fresh the first time, and switching back brings the old one back.
  const [threads, setThreads] = useState({});
  const setThread = (key, update) => setThreads((all) => ({ ...all, [key]: typeof update === 'function' ? update(all[key] || []) : update }));
  const messages = threads[guideKey] || NO_MESSAGES;
  const [thinking, setThinking] = useState(false);
  const [aiCount, setAiCount] = useState(0);
  const { canAskGuide, markGuide, openPaywall } = useAllowance();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const guide = GUIDES[guideKey];
  const patterns = usePatterns();
  const chips = starterChips(analysis, guide);
  const quickChips = chips.slice(0, 5);
  const { leaks, monthSpan } = analysis;

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Always show the newest message. On reopen jump straight there: the list remounts at
  // the top, which showed an old ghost's hello under the newly picked one.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open) { wasOpen.current = false; return; }
    const behavior = wasOpen.current ? 'smooth' : 'auto';
    wasOpen.current = true;
    // Scroll to the START of the newest ghost reply, so the answer is what you see (Kit's
    // planner sits under his reply; scrolling to the bottom hid the answer).
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (!list) return;
      const items = [...list.children];
      const last = items[items.length - 1];
      const target = last && last.offsetHeight > list.clientHeight * 0.6 ? last : null;
      list.scrollTo({ top: target ? target.offsetTop - 8 : list.scrollHeight, behavior });
    });
  }, [messages, open]);

  const { theme } = useTheme();
  const hank = theme?.key === 'ex' && readExPick() === 'fine';
  // Hank is Hattie's "I'm Fine" twin on the Ex theme: same job, his own name everywhere.
  const nameFor = (key) => (key === 'habit' && hank ? 'Hank' : GUIDES[key].name);
  const chipLabel = (chip) => (hank ? chip.replace('Ask Hattie →', 'Ask Hank →') : chip);
  const guideName = nameFor(guideKey);
  const focusRef = useRef(null);
  const openerFor = (key) => {
    const focus = focusRef.current;
    focusRef.current = null;
    return { role: 'guide', guide: key, ...opener(key, analysis, { answers: patterns?.answers || {}, plan: readHabit(), hank, focus }) };
  };
  const lastKitIndex = messages.reduce((at, m, i) => (m.kit ? i : at), -1);
  const lastWith = (field) => [...messages].reverse().find((m) => m.role === 'guide' && m[field] != null);

  // The openers' own chips are answered here, from the scan, with no AI.
  const chipReply = (text) => {
    const to = handoffKey(text);
    if (to) {
      focusRef.current = lastWith('leak')?.leak || null;
      setTeam((t) => [...(t.length ? t : [guideKey]).filter((k) => k !== to), to].slice(-5));
      onGuide(to);
      return true;
    }
    const months = `${monthsLabel(monthSpan)} months`;
    const leak = lastWith('leak')?.leak;
    if (text === CHIP.nextFee) {
      const order = feeOrder(leaks);
      const at = ((lastWith('feeIndex')?.feeIndex ?? -1) + 1) % order.length;
      reply({ text: `${pennyLine(order[at], months)}\n\nNext fee, or get Spooksworth to write the ask?`, action: 'open_leak', leak: order[at], feeIndex: at, chips: [CHIP.nextFee, handoffChip('sir')] });
      return true;
    }
    if ((text === CHIP.firmer || text === CHIP.friendlier) && leak) {
      const line = text === CHIP.firmer
        ? 'Add this line before you sign off: "Please confirm in writing within 5 business days."'
        : 'Add this line before you sign off: "Thanks so much for your help with this."';
      reply({ text: `${line} Open the email to paste it in.`, action: 'draft_email', leak, chips: [text === CHIP.firmer ? CHIP.friendlier : CHIP.firmer, handoffChip('cass')] });
      return true;
    }
    if (text === CHIP.bust && leak) {
      reply({ text: `Let's go! Cancel ${nameOf(leak)}, then mark it done on its card. Every ghost you clear goes on your score.`, action: 'open_leak', leak, chips: [handoffChip('sir'), handoffChip('cass'), CHIP.later] });
      return true;
    }
    if (text === CHIP.later) {
      const list = leaks.slice(0, 5).map((item, i) => `${i + 1}. ${nameOf(item)} ${money(item.amount)}`).join('\n');
      reply({ text: `Your score sheet, biggest first:\n${list}\n\nOne at a time. You've got this.`, action: 'open_path', chips: [CHIP.bust] });
      return true;
    }
    if (text === CHIP.worked) {
      reply({ text: 'Nice work! Check your next statement to be sure the charge stopped. Want one small habit so it doesn\'t sneak back?', chips: [handoffChip('habit'), handoffChip('mind')] });
      return true;
    }
    if (text === CHIP.notYet) {
      reply({ text: 'No rush. If the steps didn\'t work, Spooksworth can write a cancel email for you to send instead.', chips: [handoffChip('sir')] });
      return true;
    }
    if ([CHIP.yes, CHIP.unsure, CHIP.no].includes(text)) {
      const biasKey = lastWith('biasKey')?.biasKey;
      const value = { [CHIP.yes]: 'yes', [CHIP.unsure]: 'unsure', [CHIP.no]: 'no' }[text];
      if (biasKey) patterns?.setAnswer?.(biasKey, value);
      if (value === 'yes') {
        reply({ text: `Thanks for being honest. Lots of people say yes. Over to ${nameFor('habit')} for one small habit.` });
        setTeam((t) => [...(t.length ? t : ['mind']).filter((k) => k !== 'habit'), 'habit'].slice(-5));
        setTimeout(() => onGuide('habit'), 400);
      } else if (value === 'unsure') {
        reply({ text: 'That\'s fine. Open the pattern to see the research, and decide later.', action: 'open_pattern', biasKey, chips: [handoffChip('habit')] });
      } else {
        reply({ text: 'Fair enough, I\'ll leave that one. Ask me about another ghost any time.', chips: guide.chips.slice(0, 3) });
      }
      return true;
    }
    if (START_CHIPS.includes(text)) {
      reply({ text: `${text} it is. Open your plan, pick ${text} and save: it goes in your calendar with a check-in a week later.`, action: 'open_habit', biasKey: lastWith('biasKey')?.biasKey, chips: ['Make my habit smaller', 'I keep forgetting, help'] });
      return true;
    }
    return false;
  };

  const openPanel = () => {
    setOpen(true);
    trackEvent('guide_opened');
    if (!messages.length) setThread(guideKey, [openerFor(guideKey)]);
  };

  // Switching ghost: the new one introduces itself and does its one job straight away.
  const lastGuide = useRef(guideKey);
  useEffect(() => {
    if (lastGuide.current === guideKey) return;
    lastGuide.current = guideKey;
    if (!open) return; // opening the panel adds the opener
    // A fresh window gets the ghost's opener; a handoff ("Ask Kit →") also re-opens with
    // the ghost the last one was talking about.
    if (!messages.length || focusRef.current) setThread(guideKey, (current) => [...current, openerFor(guideKey)]);
  }, [guideKey]);

  // Safety net: an open window is never empty or showing another ghost. Whenever the
  // chat is open on a ghost with no conversation yet, that ghost says its opener.
  useEffect(() => {
    if (open && !(threads[guideKey]?.length)) setThread(guideKey, [openerFor(guideKey)]);
  }, [open, guideKey]);

  // Lets the page's "Ask a ghost" tab open the chat.
  useEffect(() => {
    if (openRequest) openPanel();
  }, [openRequest]);

  const withLetters = (message) => {
    if (guideKey === 'sir' && message.action === 'draft_email' && message.leak && !message.letters) return { ...message, letters: [message.leak.id], action: null };
    // Penny: a fee she explains gets the waive / refund letter buttons right there.
    return message;
  };
  const reply = (raw) => { const message = withLetters(raw); return setThread(guideKey, (current) => [...current, { role: 'guide', guide: guideKey, ...message, text: hank ? String(message.text).replace("Hattie's job. She", "Hank's job. He").replace("I'm Hattie", "I'm Hank") : message.text }]); };

  // Common questions are answered instantly in the browser. Anything else goes to the AI guide.
  const ask = async (question) => {
    const text = question.trim().slice(0, MAX_INPUT);
    if (!text || thinking) return;
    trackEvent('guide_message');
    const nextChips = chips.filter((chip) => chip !== text).slice(0, 4);
    const history = messages.slice(-6).map((message) => ({ role: message.role, text: message.text }));
    setThread(guideKey, (current) => [...current, { role: 'user', text }]);
    setInput('');

    if (chipReply(text)) return;

    // Cassy: name a subscription (or ask about cancelling one) and she looks it up.
    const subs = [...(analysis.subscriptions || [])].sort((a, b) => b.monthly - a.monthly);
    const named = [...subs, ...leaks].find((item) => {
      const word = String(item.merchant || '').split(/\s+/)[0];
      return word.length > 2 && text.toUpperCase().includes(word.toUpperCase());
    });
    const clean = tidy(text);
    const wantsCancel = guideKey === 'cass' || /\bcancel|phone number|contact\b/i.test(clean);
    // "My biggest one": the biggest subscription with a checked cancel page, so Cassy can
    // answer straight away (made-up sample names like Fitlife Gym can't be confirmed).
    const biggestKnown = subs.find((item) => cancelInfo(item.merchant).url) || subs[0];
    const target = named || (guideKey === 'cass' && /biggest|phone|cancel email|cancel/i.test(clean) ? biggestKnown : null);
    const checked = target && cancelInfo(target.merchant);
    if (wantsCancel && target && checked?.url && !/phone|number|call/i.test(clean)) {
      const isLeak = leaks.includes(target);
      reply({ text: `${checked.name}: ${money(target.monthly || target.amount || 0)} a month.\n\nTo cancel: ${checked.steps}\n\n${APP_STORE_NOTE}`, cancel: { item: { id: target.id, merchant: target.merchant, title: target.title || target.merchant, monthly: target.monthly, amount: target.amount, badge: target.badge }, goalId: isLeak ? target.id : `sub:${target.id}` }, chips: [`Find ${checked.name}'s phone number`, handoffChip('sir'), ...nextChips].slice(0, 4) });
      return;
    }
    if (wantsCancel && target) {
      trackEvent('cass_lookup');
      reply({ text: `Looking up ${target.merchant} on their official site...`, lookup: { merchant: target.merchant, monthly: target.monthly || 0 }, chips: nextChips });
      return;
    }

    const local = answer(text, analysis, guideKey);
    if (local) {
      const pennyish = /total|work(ed)? out|calculat|cost(s)? the most|creep|price/.test(text.toLowerCase()) ? 'penny' : null;
      const owner = local.owner || { draft_email: 'sir', open_emails: 'sir', open_path: 'gus', open_house: 'gus', open_calendar: 'bundle', open_pattern: 'mind', open_habit: 'habit' }[local.action] || pennyish;
      const hand = owner && owner !== guideKey ? [handoffChip(owner)] : [];
      reply({ text: local.reply, action: local.action, leak: local.leak, biasKey: local.biasKey, kit: local.kit, typed: local.typed, bust: local.bust, explain: local.explain, coach: local.coach, fees: local.fees, chips: [...hand, ...nextChips].slice(0, 4) });
      return;
    }
    if (aiCount >= MAX_AI_MESSAGES) {
      reply({ text: "That's all my spirit energy for now. These questions still work:", chips: nextChips });
      return;
    }

    // Free tier: one AI answer per ghost. The quick answers above are always free.
    const lockedReply = () => reply({
      text: `That was my free answer. Unlock Ghost Fees once and all seven of us will answer, within a fair daily limit. The quick questions at the top still work.`,
      unlock: 'guide',
      chips: nextChips,
    });
    if (!canAskGuide(guideKey)) {
      lockedReply();
      return;
    }

    setThinking(true);
    setAiCount((count) => count + 1);
    try {
      const response = await base44.functions.invoke('askGhostGuide', { guide: guideKey, question: text, history, summary: summaryFor(analysis, patterns?.answers) });
      const data = response?.data || {};
      if (data.locked) {
        if (data.reason === 'busy') reply({ text: 'Lots of ghost hunters at once. Sign in, or try again soon. The quick questions at the top still work.', chips: nextChips });
        else {
          markGuide(guideKey);
          lockedReply();
        }
        return;
      }
      if (!data.reply) throw new Error('empty');
      markGuide(guideKey);
      const leak = leaks.find((item) => item.id === data.leakId);
      const action = ACTION_LABELS[data.action] && (leak || !['draft_email', 'open_leak', 'show_transactions'].includes(data.action)) ? data.action : null;
      const biasKey = (action === 'open_pattern' || action === 'open_habit') && PATTERN_BY_KEY[data.biasKey] ? data.biasKey : null;
      const serverChips = data.chips?.length ? data.chips.slice(0, 3) : nextChips;
      const hand = GUIDES[data.handoff] && data.handoff !== guideKey ? [handoffChip(data.handoff)] : [];
      reply({ text: data.reply, action: action === 'open_pattern' && !biasKey ? null : action, leak, biasKey, chips: [...hand, ...serverChips].slice(0, 4) });
    } catch {
      reply({ text: 'The spirits went quiet. Try again, or tap a question at the top.', chips: nextChips });
    } finally {
      setThinking(false);
    }
  };

  const run = (message) => {
    if (message.action === 'open_pattern' && message.biasKey) patterns?.openPattern(message.biasKey);
    else if (message.action === 'open_habit') patterns?.openHabit?.(message.biasKey);
    else onAction(message.action, message.leak);
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="fixed bottom-5 right-5 z-40 flex animate-bob items-center gap-2 rounded-full border border-primary/60 bg-card p-3.5 font-bold text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:px-5"
          data-tour="ask"
          aria-label="Ask a ghost"
        >
          {/* White: there are several ghost guides now, so the button isn't one guide's colour. */}
          <GhostMark className="h-6 w-6 text-white" eyeColor="#1a1230" />
          <span className="hidden text-[14px] sm:inline">Ask a ghost</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={`Ask ${guideName}, your ghost guide`}
          className={cn('fixed inset-x-0 bottom-0 z-50 flex animate-rise flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:rounded-3xl', big ? 'h-[94dvh] sm:h-[calc(100dvh-2.5rem)] sm:w-[min(900px,calc(100vw-2.5rem))]' : 'max-h-[90dvh] sm:max-h-[min(780px,calc(100dvh-2.5rem))] sm:w-[460px]')}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 pb-3 pt-4">
            <span className="flex h-12 w-11 shrink-0 items-end justify-center overflow-visible pt-2" style={{ color: guide.color }}>
              <GhostMark className="h-9 w-9 animate-float" eyeColor="#1a1230" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[15px] font-semibold text-foreground">
                {guideName} <span className="text-[14px] font-semibold" style={{ color: guide.color }}>· {guide.job}</span>
                {guide.bonus && <span className="ml-1.5 rounded-full px-1.5 align-[2px] text-[9.5px] font-black uppercase text-[#1b1233]" style={{ background: guide.color }}>Bonus assistant</span>}
              </p>
            </div>
            <button type="button" onClick={() => setBig((b) => !b)} aria-label={big ? 'Make the chat smaller' : 'Make the chat bigger'} title={big ? 'Smaller' : 'Bigger'} className="hidden rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground sm:block">
              {big ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Full-width picker: each ghost's name and a 3-4 word job, so people know which
              to pick. Each ghost opens its own conversation. */}
          <div className="shrink-0 space-y-1 border-b border-border px-3 pb-2 pt-1" role="group" aria-label="Pick your ghost guide">
            {GUIDE_GROUPS.map((group) => (
              <div key={group.label} className="flex items-stretch gap-1">
                <span className="flex w-8 shrink-0 items-center text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{group.label.replace('Your ', '')}</span>
                <div className={cn('grid flex-1 gap-1', group.keys.length === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
                  {group.keys.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onGuide(key)}
                      aria-pressed={guideKey === key}
                      title={`${nameFor(key)}: ${GUIDES[key].does}`}
                      className={cn(
                        'flex min-w-0 flex-col items-center rounded-xl px-1 py-1 text-center transition-colors',
                        guideKey === key ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <span className="flex max-w-full items-center gap-1 truncate text-[12px] font-bold leading-tight tracking-tight">
                        <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: GUIDES[key].color }} aria-hidden="true" />
                        {nameFor(key).replace('Sir ', '')}{GUIDES[key].bonus ? ' ★' : ''}
                      </span>
                      <span className={cn('mt-0.5 text-[11px] font-semibold leading-tight', guideKey === key ? 'opacity-90' : 'opacity-75')}>{GUIDES[key].short}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {team.length > 1 && (
            <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-3 py-1.5 text-[12px]" aria-label="Your ghost team on this">
              <span className="font-bold uppercase tracking-[0.1em] text-muted-foreground">Team on this</span>
              {team.map((key, i) => (
                <span key={key} className="inline-flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true" className="text-muted-foreground">→</span>}
                  <button type="button" onClick={() => onGuide(key)} aria-pressed={guideKey === key}
                    className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold', guideKey === key ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: GUIDES[key].color }} aria-hidden="true" />
                    {nameFor(key).replace('Sir ', '')}
                  </button>
                </span>
              ))}
              <button type="button" onClick={() => setTeam([])} className="ml-auto text-muted-foreground underline-offset-2 hover:underline">Clear</button>
            </div>
          )}
          {/* Ready-made questions at the top, the conversation and typing box at the bottom
              (like most chat apps). Tap one, or type your own question below. */}
          <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-border px-3 py-2" aria-label={`Quick questions for ${guideName}`}>
            {quickChips.map((chip) => (
              <button key={chip} type="button" onClick={() => ask(chipLabel(chip))} disabled={thinking}
                className="rounded-full border px-3 py-1 text-[12.5px] font-bold text-foreground transition-colors hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: `${guide.color}88` }}>
                {chipLabel(chip)}
              </button>
            ))}
          </div>


          <div ref={listRef} aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {/* Kit's planner shows once, under his latest reply, so the chat doesn't repeat it. */}
            {messages.map((message, index) => (
              <div key={index} className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                {message.role === 'guide' && GUIDES[message.guide] && messages.slice(0, index).filter((m) => m.role === 'guide').at(-1)?.guide !== message.guide && (
                  <span className="mb-1 ml-1 text-[12px] font-bold" style={{ color: GUIDES[message.guide].color }}>{nameFor(message.guide).replace('Sir ', '')} · {GUIDES[message.guide].short}</span>
                )}
                <p
                  className={cn(
                    'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-primary font-semibold text-primary-foreground'
                      : 'rounded-tl-sm border-l-[3px] bg-background text-foreground',
                  )}
                  style={message.role === 'guide' && GUIDES[message.guide] ? { borderLeftColor: GUIDES[message.guide].color } : undefined}
                >
                  {message.text}
                </p>
                {message.unlock && (
                  <button type="button" onClick={() => openPaywall(message.unlock)} className="mt-2 rounded-full bg-primary px-3 py-1.5 text-[13.5px] font-bold text-primary-foreground">
                    Unlock all ghosts
                  </button>
                )}
                {message.coach && index === messages.map((m) => Boolean(m.coach)).lastIndexOf(true) && (
                  <HabitCoach leaks={leaks} hank={hank} prefer={Object.keys(patterns?.answers || {}).find((k) => patterns.answers[k] === 'yes') || null} onOpenHabit={(key) => run({ action: 'open_habit', biasKey: key })}
                    onAskMo={(key) => { focusRef.current = leaks.find((l) => biasFor(l)?.key === key) || null; setTeam((t) => [...(t.length ? t : ['habit']).filter((k) => k !== 'mind'), 'mind'].slice(-5)); onGuide('mind'); }} />
                )}
                {message.explain && (
                  <MoExplainer biasKey={message.explain} group={biasGroups(leaks).find((g) => g.key === message.explain)} />
                )}
                {message.after && <p className="mt-2 rounded-2xl bg-background px-3.5 py-2 text-[14.5px] font-semibold text-foreground">{message.after}</p>}
                {message.bust && index === messages.map((m) => Boolean(m.bust)).lastIndexOf(true) && (
                  <BustPlan leaks={leaks} onOpenEmail={(leak) => onAction('draft_email', leak)} onOpenPath={() => onAction('open_path')}
                    onHandoff={(key, leak) => { focusRef.current = leak; setTeam((t) => [...(t.length ? t : [guideKey]).filter((k) => k !== key), key].slice(-5)); onGuide(key); }} />
                )}
                {message.fees?.length > 0 && (
                  <FeeCheck fees={message.fees.map((id) => leaks.find((item) => item.id === id)).filter(Boolean)}
                    onLetter={(leak) => { focusRef.current = leak; setTeam((t) => [...(t.length ? t : [guideKey]).filter((k) => k !== 'sir'), 'sir'].slice(-5)); onGuide('sir'); }} />
                )}
                {message.cancel && (
                  <CancelActions item={message.cancel.item} goalId={message.cancel.goalId} accent={GUIDES[message.guide]?.color}
                    onOpenEmail={(leak) => onAction('draft_email', leak)}
                    onLookup={(item) => reply({ text: `Looking up ${item.merchant} on their official site...`, lookup: { merchant: item.merchant, monthly: item.monthly || 0 } })} />
                )}
                {message.letters?.length > 0 && (
                  <LetterActions leaks={message.letters.map((id) => leaks.find((item) => item.id === id)).filter(Boolean)} onOpen={(leak) => onAction('draft_email', leak)} />
                )}
                {message.kit && index === lastKitIndex && (
                  <KitPlanner compact subscriptions={analysis.subscriptions || []} initialTab={message.kit} initialTyped={message.typed || ''} onOpenEmail={(leak) => onAction('draft_email', leak)}
                    onCancelHelp={(names) => reply({ text: `Cassy can find the official cancel page for ${names.join(' and ')}.`, chips: names.slice(0, 2).map((n) => `Cancel ${n}`).concat(handoffChip('cass')) })}
                    className="mt-2 w-full" />
                )}
                {message.lookup && <CassLookup merchant={message.lookup.merchant} monthly={message.lookup.monthly} auto className="mt-2 w-full" />}
                {message.action && (
                  <button
                    type="button"
                    onClick={() => run(message)}
                    className="mt-1.5 rounded-full border border-primary px-3 py-1 text-[13px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {ACTION_LABELS[message.action]}
                  </button>
                )}
                {index === messages.length - 1 && message.chips?.some((chip) => !quickChips.includes(chip)) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.chips.filter((chip) => !quickChips.includes(chip)).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => ask(chipLabel(chip))}
                        className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-left text-[13px] font-bold text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                      >
                        {chipLabel(chip)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-1.5 px-1" aria-label={`${guideName} is typing`}>
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="animate-bob" style={{ animationDelay: `${dot * 0.2}s`, color: guide.color }}>
                    <GhostMark className="h-4 w-4" eyeColor="#1a1230" />
                  </span>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => { event.preventDefault(); ask(input); }}
            className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-3"
          >
            <label htmlFor="guide-input" className="sr-only">Ask your ghost guide</label>
            <input
              id="guide-input"
              ref={inputRef}
              value={input}
              maxLength={MAX_INPUT}
              onChange={(event) => setInput(event.target.value)}
              placeholder={(hank ? guide.ask?.replace('Hattie', 'Hank') : guide.ask) || 'Ask about your ghosts'}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button type="submit" aria-label="Send" className="rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-50" disabled={!input.trim() || thinking}>
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-4 pb-3 text-center text-[12px] text-muted-foreground">Your guide sees your results, not your statement. Nothing is saved. Factual information only, not financial advice.</p>
        </div>
      )}
    </>
  );
}