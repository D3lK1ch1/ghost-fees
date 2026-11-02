import { MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { getSessionId } from '@/lib/session';
import { cn } from '@/lib/utils';
import GhostMark from '@/components/site/GhostMark';
import { GHOST_IT_PROFILE } from '@/lib/ghostFees/ghostItAgent';

// "Message Ghost It": hands subscriptions to our chat agent on ASI:One (a separate
// product, judged inside ASI:One). Copies "@ghostit Netflix $16.99/mo, ...",
// opens Ghost It's Agentverse page (its "Chat with Agent" button starts the chat
// in ASI:One) and counts the click (count only, nothing about the person).
// variant "card": the Ghost It card under your total, with what it's for.
// small: one clear button under a ghost card.
const BLUE = '#8FB8FF';
const isLocal = () => /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);

export function ghostItText(items) {
  const parts = items
    .filter((item) => item?.merchant && Number(item.monthly) > 0)
    .slice(0, 6)
    .map((item) => `${item.merchant} $${Number(item.monthly).toFixed(2)}/mo`);
  return parts.length ? `@ghostit ${parts.join(', ')}` : '';
}

function useGo(text) {
  return async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied. Press "Chat with Agent", then paste', description: text });
    } catch {
      toast({ title: 'Press "Chat with Agent", then type this', description: text });
    }
    window.open(GHOST_IT_PROFILE, '_blank', 'noopener');
    if (!isLocal()) base44.functions.invoke('logEvent', { session_id: getSessionId(), event_type: 'ask_ghostit_click' }).catch(() => {});
  };
}

function Avatar({ size = 'h-12 w-12' }) {
  return (
    <span className="relative shrink-0" aria-hidden="true">
      <span className={cn('flex items-center justify-center rounded-full', size)} style={{ background: `${BLUE}2e`, boxShadow: `0 0 20px ${BLUE}40` }}>
        <GhostMark className="h-3/5 w-3/5 motion-safe:animate-float" style={{ color: BLUE }} eyeColor="#1a1230" />
      </span>
      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card" style={{ background: BLUE, color: '#1a1230' }}>
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    </span>
  );
}

// What Ghost It does for this kind of ghost, in its own words (only things it does today).
function benefitFor(leak, name) {
  if (leak?.priceRise) {
    const yearly = (Number(leak.priceRise.newPrice) - Number(leak.priceRise.oldPrice)) * 12;
    return {
      line: `Works out what the rise really costs you${yearly > 0 ? ` ($${yearly.toFixed(2)} more a year)` : ''}, asks if you'd still sign up at the new price, and gives you the cancel steps.`,
      text: `@ghostit ${name} went from $${Number(leak.priceRise.oldPrice).toFixed(2)} to $${Number(leak.priceRise.newPrice).toFixed(2)}`,
    };
  }
  return {
    line: `Shows the yearly cost, spots double-ups, gives the official cancel steps and a ready email, then tracks that ${name} really stopped.`,
    text: null,
  };
}

export default function AskGhostIt({ items, label, small = false, variant, leak, className }) {
  const list = (items || []).filter(Boolean);
  const name = list.length === 1 ? list[0].merchant : null;
  const benefit = variant === 'strip' && name ? benefitFor(leak, name) : null;
  const text = benefit?.text || ghostItText(list);
  const go = useGo(text);
  if (!text) return null;

  // Attached under a ghost card: what Ghost It does for this one, and one button.
  if (variant === 'strip' && benefit) {
    return (
      <div className={cn('flex flex-col gap-3 rounded-b-3xl border-2 border-t-0 px-4 pb-4 pt-6 sm:flex-row sm:items-center', className)} style={{ borderColor: `${BLUE}55`, background: `linear-gradient(180deg, transparent, ${BLUE}14)` }}>
        <Avatar size="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-foreground">Let Ghost It handle {name} in chat</p>
          <p className="text-[14px] leading-snug text-muted-foreground">{benefit.line}</p>
        </div>
        <button type="button" onClick={go} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[14.5px] font-bold text-[#0f1730]" style={{ background: BLUE }}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Message Ghost It
        </button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <section aria-label="Ghost It, our chat agent" className={cn('flex flex-col gap-3 rounded-3xl border-2 p-4 sm:flex-row sm:items-center', className)} style={{ borderColor: `${BLUE}66`, background: `linear-gradient(90deg, ${BLUE}1a, transparent 70%)` }}>
        <Avatar size="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-heading text-[18px] font-bold text-foreground">
            Ghost It <span className="rounded-full px-2 py-0.5 text-[12.5px] font-bold" style={{ background: `${BLUE}26`, color: BLUE }}>AI agent on ASI:One</span>
          </p>
          <p className="mt-0.5 text-[14.5px] leading-snug text-muted-foreground">
            Keep going in chat, any time, without coming back here. Message it what you pay for: it does the yearly maths line by line, spots double-ups, gives the official cancel steps and a ready email, and keeps your Ghost List.
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">Free during the beta. After that, your first Ghost Pack is free, then $2 a pack or $5 for all.</p>
        </div>
        <button type="button" onClick={go} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-bold text-[#0f1730]" style={{ background: BLUE }}>
          <MessageCircle className="h-4 w-4" /> {label || 'Message Ghost It about these'}
        </button>
      </section>
    );
  }

  return (
    <button
      type="button"
      onClick={go}
      title="Ghost It, our chat agent on ASI:One, shows the maths and the cancel steps"
      className={cn(small
        ? 'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13.5px] font-bold text-foreground hover:bg-white/5'
        : 'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[14.5px] font-bold text-foreground hover:bg-white/5', className)}
      style={{ borderColor: `${BLUE}88` }}
    >
      <MessageCircle className="h-4 w-4" style={{ color: BLUE }} aria-hidden="true" />
      {label || (name ? `Message Ghost It about ${name}` : 'Message Ghost It')}
    </button>
  );
}
