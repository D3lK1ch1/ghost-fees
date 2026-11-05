import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, monthsLabel } from '@/lib/ghostFees/format';
import { GUIDES, GUIDE_GROUPS } from '@/lib/ghostFees/guides';
import { biasGroups, PATTERN_BY_KEY } from '@/lib/ghostFees/leaks';
import { usePatterns } from '@/components/patterns/PatternContext';
import { readHabit } from '@/lib/ghostFees/habitPlan';
import { readExPick } from '@/lib/ghostFees/habitArt';
import { useTheme } from '@/lib/ThemeContext';
import { CHIP, START_CHIPS, feeOrder, handoffChip, handoffKey, opener, pennyLine, shortCite } from '@/lib/ghostFees/guideOpeners';
import CassLookup from '@/components/results/CassLookup';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/session';
import GhostMark from '@/components/site/GhostMark';
import { useAllowance } from '@/lib/AllowanceContext';

const MAX_INPUT = 500;
const MAX_AI_MESSAGES = 20;

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
    return { reply: `That's a common pattern called Present Bias (${shortCite(trial.cite)}). ${trial.what} ${trial.why} It cost you ${money(trial.total)} across ${periodOf(trial)}. The habit: ${trial.beat}`, action: 'open_pattern', biasKey: trial.key };
  }
  if (/habit|beat|stop|fix|do about/.test(text)) {
    const g = named || top;
    return { reply: `For ${g.bias}, one small habit: ${g.beat} Hattie can put it in your calendar and check in a week later.`, action: 'open_habit', biasKey: g.key };
  }
  if (named) {
    return { reply: `${named.bias}: ${named.what} ${named.why} In your statement it's ${money(named.total)} across ${periodOf(named)}. Research: ${named.cite}.`, action: 'open_pattern', biasKey: named.key };
  }
  if (/most|biggest|largest|worst|top|costs?/.test(text)) {
    return { reply: `${top.bias} is the biggest common pattern behind your ghosts: ${money(top.total)} across ${periodOf(top)}. ${top.line} (${shortCite(top.cite)})`, action: 'open_pattern', biasKey: top.key };
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
  if (/habit|start|first|which|begin|pick/.test(text)) {
    return { reply: `Start with your biggest pattern, ${g.bias} (${money(g.total)}). One habit: ${g.beat} Pick a start day and I'll put it in your calendar.`, action: 'open_habit', biasKey: g.key };
  }
  return null;
}

// Every answer is built in the browser from the scan results. No AI, nothing sent anywhere.
// Shared safety answers come first, then the chosen ghost's own speciality.
function answer(question, analysis, guideKey) {
  const text = question.toLowerCase();
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
  if (guideKey === 'mind' || guideKey === 'habit') {
    const own = guideKey === 'mind' ? moAnswer(text, analysis) : hattieAnswer(text, analysis);
    if (own) return own;
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
  if (/goals?|steps?|first|start|what (should|do) i|plan|improve|tips?|help me|next/.test(text)) {
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
  if (/remind|calendar|renew/.test(text)) {
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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [aiCount, setAiCount] = useState(0);
  const { canAskGuide, markGuide, openPaywall } = useAllowance();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const guide = GUIDES[guideKey];
  const patterns = usePatterns();
  const chips = starterChips(analysis, guide);
  const { leaks, monthSpan } = analysis;

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const { theme } = useTheme();
  const hank = theme?.key === 'ex' && readExPick() === 'fine';
  const focusRef = useRef(null);
  const openerFor = (key) => {
    const focus = focusRef.current;
    focusRef.current = null;
    return { role: 'guide', guide: key, ...opener(key, analysis, { answers: patterns?.answers || {}, plan: readHabit(), hank, focus }) };
  };
  const lastWith = (field) => [...messages].reverse().find((m) => m.role === 'guide' && m[field] != null);

  // The openers' own chips are answered here, from the scan, with no AI.
  const chipReply = (text) => {
    const to = handoffKey(text);
    if (to) { focusRef.current = lastWith('leak')?.leak || null; onGuide(to); return true; }
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
        reply({ text: 'Thanks for being honest. Lots of people say yes. Over to Hattie for one small habit.' });
        setTimeout(() => onGuide('habit'), 400);
      } else if (value === 'unsure') {
        reply({ text: 'That\'s fine. Open the pattern to see the research, and decide later.', action: 'open_pattern', biasKey, chips: [handoffChip('habit')] });
      } else {
        reply({ text: 'Fair enough, I\'ll leave that one. Ask me about another ghost any time.', chips: guide.chips.slice(0, 3) });
      }
      return true;
    }
    if (START_CHIPS.includes(text)) {
      reply({ text: `${text} it is. Open your plan, pick ${text.toLowerCase()} and save: it goes in your calendar with a check-in a week later.`, action: 'open_habit', biasKey: lastWith('biasKey')?.biasKey, chips: ['Make my habit smaller', 'I keep forgetting, help'] });
      return true;
    }
    return false;
  };

  const openPanel = () => {
    setOpen(true);
    trackEvent('guide_opened');
    if (!messages.length) setMessages([openerFor(guideKey)]);
  };

  // Switching ghost: the new one introduces itself and does its one job straight away.
  const lastGuide = useRef(guideKey);
  useEffect(() => {
    if (lastGuide.current === guideKey) return;
    lastGuide.current = guideKey;
    if (!messages.length) return;
    setMessages((current) => [...current, openerFor(guideKey)]);
  }, [guideKey]);

  // Lets the page's "Ask a ghost" tab open the chat.
  useEffect(() => {
    if (openRequest) openPanel();
  }, [openRequest]);

  const reply = (message) => setMessages((current) => [...current, { role: 'guide', guide: guideKey, ...message }]);

  // Common questions are answered instantly in the browser. Anything else goes to the AI guide.
  const ask = async (question) => {
    const text = question.trim().slice(0, MAX_INPUT);
    if (!text || thinking) return;
    trackEvent('guide_message');
    const nextChips = chips.filter((chip) => chip !== text).slice(0, 4);
    const history = messages.slice(-6).map((message) => ({ role: message.role, text: message.text }));
    setMessages((current) => [...current, { role: 'user', text }]);
    setInput('');

    if (chipReply(text)) return;

    // Cassy: name a subscription (or ask about cancelling one) and she looks it up.
    const subs = [...(analysis.subscriptions || [])].sort((a, b) => b.monthly - a.monthly);
    const named = [...subs, ...leaks].find((item) => {
      const word = String(item.merchant || '').split(/\s+/)[0];
      return word.length > 2 && text.toUpperCase().includes(word.toUpperCase());
    });
    const wantsCancel = guideKey === 'cass' || /\bcancel|phone number|contact\b/i.test(text);
    const target = named || (guideKey === 'cass' && /biggest|phone|cancel email|cancel/i.test(text) ? subs[0] : null);
    if (wantsCancel && target) {
      trackEvent('cass_lookup');
      reply({ text: `Looking up ${target.merchant} on their official site...`, lookup: { merchant: target.merchant, monthly: target.monthly || 0 }, chips: nextChips });
      return;
    }

    const local = answer(text, analysis, guideKey);
    if (local) {
      const owner = { draft_email: 'sir', open_emails: 'sir', open_path: 'gus', open_house: 'gus', open_calendar: 'gus', open_pattern: 'mind', open_habit: 'habit' }[local.action];
      const hand = owner && owner !== guideKey ? [handoffChip(owner)] : [];
      reply({ text: local.reply, action: local.action, leak: local.leak, biasKey: local.biasKey, chips: [...hand, ...nextChips].slice(0, 4) });
      return;
    }
    if (aiCount >= MAX_AI_MESSAGES) {
      reply({ text: "That's all my spirit energy for now. These questions still work:", chips: nextChips });
      return;
    }

    // Free tier: one AI answer per ghost. The quick answers above are always free.
    const lockedReply = () => reply({
      text: `That was my free answer. Unlock Ghost Fees once and all six of us will answer, within a fair daily limit. The quick questions below still work.`,
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
        if (data.reason === 'busy') reply({ text: 'Lots of ghost hunters at once. Sign in, or try again soon. The quick questions below still work.', chips: nextChips });
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
      reply({ text: 'The spirits went quiet. Try again, or tap a question below.', chips: nextChips });
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
          aria-label={`Ask ${guide.name}, your ghost guide`}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] animate-rise flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-h-[min(640px,calc(100dvh-2.5rem))] sm:w-[380px] sm:rounded-3xl"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 pb-3 pt-4">
            <span className="flex h-12 w-11 shrink-0 items-end justify-center overflow-visible pt-2" style={{ color: guide.color }}>
              {guide.image
                ? <img src={guide.image} alt="" width={44} height={44} className="h-11 w-11 object-contain motion-safe:animate-float" />
                : <GhostMark className="h-9 w-9 animate-float" eyeColor="#1a1230" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[15px] font-semibold text-foreground">
                {guide.name} <span className="text-[14px] font-semibold" style={{ color: guide.color }}>· {guide.job}</span>
                {guide.bonus && <span className="ml-1.5 rounded-full px-1.5 align-[2px] text-[9.5px] font-black uppercase text-[#1b1233]" style={{ background: guide.color }}>Bonus assistant</span>}
              </p>
              {GUIDE_GROUPS.map((group) => (
              <div key={group.label} className="mt-1.5">
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{group.label}</p>
              <div className="grid grid-cols-2 gap-1" role="group" aria-label={`${group.label}: pick a ghost guide`}>
                {group.keys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onGuide(key)}
                    aria-pressed={guideKey === key}
                    title={GUIDES[key].does}
                    className={cn(
                      'flex flex-col items-center rounded-xl px-1 py-1 text-center transition-colors',
                      guideKey === key ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span className="flex items-center gap-1 text-[12.5px] font-bold leading-tight">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: GUIDES[key].color }} aria-hidden="true" />
                      {GUIDES[key].name.replace('Sir ', '')}{GUIDES[key].bonus ? ' ★' : ''}
                    </span>
                    <span className={cn('mt-0.5 text-[12px] font-semibold leading-tight', guideKey === key ? 'opacity-90' : 'opacity-75')}>{GUIDES[key].short}</span>
                  </button>
                ))}
              </div>
              </div>
              ))}
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="shrink-0 border-b border-border px-4 py-1.5 text-[12.5px] text-muted-foreground">Your guide sees your results, not your statement. Nothing is saved.</p>

          <div ref={listRef} aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={index} className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                {message.role === 'guide' && GUIDES[message.guide] && messages.slice(0, index).filter((m) => m.role === 'guide').at(-1)?.guide !== message.guide && (
                  <span className="mb-1 ml-1 text-[12px] font-bold" style={{ color: GUIDES[message.guide].color }}>{GUIDES[message.guide].name.replace('Sir ', '')} · {GUIDES[message.guide].short}</span>
                )}
                <p
                  className={cn(
                    'max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-primary font-semibold text-primary-foreground'
                      : 'rounded-tl-sm bg-background text-foreground',
                  )}
                >
                  {message.text}
                </p>
                {message.unlock && (
                  <button type="button" onClick={() => openPaywall(message.unlock)} className="mt-2 rounded-full bg-primary px-3 py-1.5 text-[13.5px] font-bold text-primary-foreground">
                    Unlock all ghosts
                  </button>
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
                {index === messages.length - 1 && message.chips?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {message.chips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => ask(chip)}
                        className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-left text-[13px] font-bold text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-1.5 px-1" aria-label={`${guide.name} is typing`}>
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
              placeholder={guide.ask || 'Ask about your ghosts'}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button type="submit" aria-label="Send" className="rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-50" disabled={!input.trim() || thinking}>
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-4 pb-3 text-center text-[12px] text-muted-foreground">Factual information only, not financial advice.</p>
        </div>
      )}
    </>
  );
}