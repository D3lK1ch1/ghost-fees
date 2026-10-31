import { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money, monthsLabel } from '@/lib/ghostFees/format';
import { GUIDES, GUIDE_KEYS } from '@/lib/ghostFees/guides';
import { trackEvent } from '@/lib/session';
import GhostMark from '@/components/site/GhostMark';

const MAX_INPUT = 500;

const ACTION_LABELS = {
  draft_email: 'Open the email',
  open_leak: 'Take me there',
  open_house: 'Open the haunted house',
  scroll_feedback: 'Take me there',
};

const nameOf = (leak) => leak.title || leak.merchant;

// Finds a leak the question mentions by merchant name.
function findLeak(text, leaks) {
  return leaks.find((leak) => `${leak.title || ''} ${leak.merchant || ''}`.toLowerCase().split(/[\s,]+/)
    .some((word) => word.length > 3 && text.includes(word)));
}

// Every answer is built in the browser from the scan results. No AI, nothing sent anywhere.
function answer(question, analysis) {
  const text = question.toLowerCase();
  const { leaks, total, monthSpan } = analysis;
  const months = `${monthsLabel(monthSpan)} months`;
  const biggest = leaks[0];
  const mentioned = findLeak(text, leaks);

  if (/\b(bank should|switch|invest|loan|credit card|which (bank|card|account)|super(annuation)?|tax|debt|mortgage|advice|should i)\b/.test(text)) {
    return { reply: "I can't give financial advice, and I never recommend banks, cards or products. For that, moneysmart.gov.au is a good free place to start, or a licensed financial adviser." };
  }
  if (/next year|future|will i|predict|per year|a year|yearly|annual/.test(text)) {
    return { reply: `I only show money already lost in your statement: ${money(total)} in ${months}. I don't guess or project future amounts.` };
  }
  if (/\b(rent|groceries|grocery|transport|salary|wage|bills?)\b|not (here|there|shown|listed)/.test(text)) {
    return { reply: 'Rent, groceries, transport, transfers and pay are left out on purpose. They are normal spending, not leaks. I only flag fees, forgotten subscriptions, trials, duplicates, overlaps and price rises.' };
  }
  if (/stor|saved?|privacy|private|data|keep/.test(text)) {
    return { reply: 'Your statement is never stored. CSVs are read in your browser. PDFs are read once, then deleted. This chat is not saved either.' };
  }
  if (/creep|price (rise|increase)|went up|go up/.test(text)) {
    const creep = leaks.find((leak) => leak.priceRise);
    return {
      reply: `Price creep is when a regular charge quietly goes up.${creep ? ` ${nameOf(creep)} went from ${money(creep.priceRise.oldPrice)} to ${money(creep.priceRise.newPrice)}, which has cost you ${money(creep.amount)} so far.` : ' I didn\'t find any in this statement.'}`,
      action: creep ? 'open_leak' : null,
      leak: creep,
    };
  }
  if (/house|haunted/.test(text)) {
    return { reply: 'Each room holds one type of ghost. Pick a room, then draft an email or bust each ghost once it is sorted.', action: 'open_house' };
  }
  if (/feedback|bug|suggest/.test(text)) {
    return { reply: 'The feedback form is at the bottom of the page. It takes about 20 seconds.', action: 'scroll_feedback' };
  }
  if (/email|cancel|refund|waive|write|draft/.test(text)) {
    if (mentioned && !mentioned.action) return { reply: `${nameOf(mentioned)} doesn't need an email. It's one to keep an eye on.`, action: 'open_leak', leak: mentioned };
    const leak = mentioned || leaks.find((item) => item.action);
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
  return { reply: "I only know about the ghosts in your statement. Try one of these questions." };
}

function starterChips(analysis) {
  const biggest = analysis.leaks[0];
  return [
    'Which ghost costs the most?',
    biggest && `How did you work out ${nameOf(biggest)}?`,
    'Write my first email',
    'Is my data stored?',
    'What is price creep?',
    'Show me the haunted house',
  ].filter(Boolean);
}

export default function GhostGuide({ analysis, guideKey, onGuide, onAction }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const guide = GUIDES[guideKey];
  const chips = starterChips(analysis);
  const { leaks, total, monthSpan } = analysis;

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

  const openPanel = () => {
    setOpen(true);
    trackEvent('guide_opened');
    if (!messages.length) {
      const first = leaks.length
        ? `I found ${leaks.length} ${leaks.length === 1 ? 'ghost' : 'ghosts'} that cost you ${money(total)} in ${monthsLabel(monthSpan)} months. Want to start with the biggest?`
        : 'No ghosts in this statement. Ask me how Ghost Fees works.';
      setMessages([{ role: 'guide', text: first, chips: chips.slice(0, 3) }]);
    }
  };

  const ask = (question) => {
    const text = question.trim().slice(0, MAX_INPUT);
    if (!text) return;
    trackEvent('guide_message');
    const result = answer(text, analysis);
    const nextChips = chips.filter((chip) => chip !== text).slice(0, 3);
    setMessages((current) => [
      ...current,
      { role: 'user', text },
      { role: 'guide', text: result.reply, action: result.action, leak: result.leak, chips: nextChips },
    ]);
    setInput('');
  };

  const run = (message) => {
    onAction(message.action, message.leak);
    if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="fixed bottom-5 right-5 z-40 flex animate-bob items-center gap-2 rounded-full bg-primary p-3.5 font-bold text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.45)] sm:px-5"
          aria-label="Ask a ghost"
        >
          <GhostMark className="h-6 w-6 text-primary-foreground" eyeColor="hsl(30 100% 62%)" />
          <span className="hidden text-[14px] sm:inline">Ask a ghost</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={`Ask ${guide.name}, your ghost guide`}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] animate-rise flex-col rounded-t-3xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:max-h-[640px] sm:w-[380px] sm:rounded-3xl"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="animate-bob" style={{ color: guide.color }}>
              <GhostMark className="h-9 w-9" eyeColor="#1a1230" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[15px] font-semibold text-foreground">{guide.name}</p>
              <div className="mt-0.5 flex gap-1" role="group" aria-label="Pick your ghost guide">
                {GUIDE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onGuide(key)}
                    aria-pressed={guideKey === key}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10.5px] font-bold transition-colors',
                      guideKey === key ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {GUIDES[key].name.replace('Sir ', '')}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="border-b border-border px-4 py-2 text-[11.5px] text-muted-foreground">
            Your guide sees your results, not your statement. Nothing is saved.
          </p>

          <div ref={listRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={index} className={cn('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
                <p
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-primary font-semibold text-primary-foreground'
                      : 'rounded-tl-sm bg-background text-foreground',
                  )}
                >
                  {message.text}
                </p>
                {message.action && (
                  <button
                    type="button"
                    onClick={() => run(message)}
                    className="mt-1.5 rounded-full border border-primary px-3 py-1 text-[12px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
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
                        className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-left text-[12px] font-bold text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(event) => { event.preventDefault(); ask(input); }}
            className="flex items-center gap-2 border-t border-border px-3 py-3"
          >
            <label htmlFor="guide-input" className="sr-only">Ask your ghost guide</label>
            <input
              id="guide-input"
              ref={inputRef}
              value={input}
              maxLength={MAX_INPUT}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your ghosts"
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            <button type="submit" aria-label="Send" className="rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-50" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-4 pb-3 text-center text-[10.5px] text-muted-foreground">Factual information only, not financial advice.</p>
        </div>
      )}
    </>
  );
}
