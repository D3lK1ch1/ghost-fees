import { Check, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { getSessionId } from '@/lib/session';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { GHOST_IT_MASCOT, GHOST_IT_PRICE, GHOST_IT_CHAT, GHOST_IT_SNIP, GHOST_IT_MENTION } from '@/lib/ghostFees/ghostItAgent';
import GhostItDialog from './GhostItDialog';

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
  return parts.length ? `${GHOST_IT_MENTION} ${parts.join(', ')}` : '';
}

export function useGo(text) {
  return async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied. Paste it in the Ghost It chat and send', description: text });
    } catch {
      toast({ title: 'Type this in the Ghost It chat', description: text });
    }
    window.open(GHOST_IT_CHAT, '_blank', 'noopener');
    if (!isLocal()) base44.functions.invoke('logEvent', { session_id: getSessionId(), event_type: 'ask_ghostit_click' }).catch(() => {});
  };
}

function Avatar({ size = 'h-12 w-12', src = GHOST_IT_MASCOT }) {
  return (
    <span className="relative shrink-0" aria-hidden="true">
      <span className={cn('flex items-center justify-center rounded-full', size)} style={{ background: `${BLUE}24`, boxShadow: `0 0 20px ${BLUE}40` }}>
        <img src={src} alt="" className="h-[92%] w-[92%] object-contain motion-safe:animate-float" />
      </span>
    </span>
  );
}

// What Ghost It does for this kind of ghost, in its own words (only things it does today).
function benefitFor(leak, name) {
  if (leak?.priceRise) {
    const yearly = (Number(leak.priceRise.newPrice) - Number(leak.priceRise.oldPrice)) * 12;
    return {
      points: [`Works out the rise a year${yearly > 0 ? ` ($${yearly.toFixed(2)} more)` : ''}`, 'Asks if you’d still sign up at the new price', 'Gives you the official cancel steps'],
      text: `${GHOST_IT_MENTION} ${name} went from $${Number(leak.priceRise.oldPrice).toFixed(2)} to $${Number(leak.priceRise.newPrice).toFixed(2)}`,
    };
  }
  return {
    points: ['Shows the yearly cost, line by line', 'Spots double-ups', 'Official cancel steps and a ready email', `Tracks that ${name} really stopped`],
    text: null,
  };
}

export default function AskGhostIt({ items, label, small = false, variant, leak, className }) {
  const list = (items || []).filter(Boolean);
  const name = list.length === 1 ? list[0].merchant : null;
  const benefit = variant === 'strip' && name ? benefitFor(leak, name) : null;
  const text = benefit?.text || ghostItText(list);
  const go = useGo(text);
  const [about, setAbout] = useState(false);
  if (!text) return null;
  const whatIs = (
    <button type="button" onClick={() => setAbout(true)} className="text-[13.5px] font-bold underline-offset-4 hover:underline" style={{ color: BLUE }}>What is Ghost It?</button>
  );
  const dialog = <GhostItDialog open={about} onClose={() => setAbout(false)} onMessage={go} />;

  // Attached under a ghost card: what Ghost It does for this one and one button.
  if (variant === 'strip' && benefit) {
    return (
      <div className={cn('flex flex-col gap-3 rounded-b-3xl border-2 border-t-0 px-4 pb-4 pt-6 sm:flex-row sm:items-center', className)} style={{ borderColor: `${BLUE}55`, background: `linear-gradient(180deg, transparent, ${BLUE}14)` }}>
        <Avatar size="h-14 w-14" src={GHOST_IT_SNIP} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-foreground">Let Ghost It handle {name} in chat</p>
          <ul className="mt-1 grid gap-x-4 gap-y-0.5 text-[14px] leading-snug text-muted-foreground sm:grid-cols-2">
            {benefit.points.map((point) => (
              <li key={point} className="flex gap-1.5"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BLUE }} aria-hidden="true" />{point}</li>
            ))}
          </ul>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground"><b className="text-foreground">1 free try,</b> then $5 once for every pack. {whatIs}</p>
        </div>
        <button type="button" onClick={go} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[14.5px] font-bold text-[#0f1730]" style={{ background: BLUE }}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Message Ghost It
        </button>
        {dialog}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <section aria-label="Ghost It, our chat agent" className={cn('flex flex-col gap-3 rounded-3xl border-2 p-4 sm:flex-row sm:items-center', className)} style={{ borderColor: `${BLUE}66`, background: `linear-gradient(90deg, ${BLUE}1a, transparent 70%)` }}>
        <Avatar size="h-16 w-16" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 font-heading text-[18px] font-bold text-foreground">
            Ghost It <span className="rounded-full px-2 py-0.5 text-[12.5px] font-bold" style={{ background: `${BLUE}26`, color: BLUE }}>AI agent on ASI:One</span>
          </p>
          <p className="mt-0.5 text-[14.5px] leading-snug text-muted-foreground">
            Keep going in chat, any time, without coming back here. Message it what you pay for: it does the yearly maths line by line, spots double-ups, gives the official cancel steps and a ready email and keeps your Ghost List.
          </p>
          <p className="mt-1 text-[13.5px] text-muted-foreground"><b className="text-foreground">Free trial: 1 try.</b> {GHOST_IT_PRICE} {whatIs}</p>
        </div>
        <button type="button" onClick={go} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-[15px] font-bold text-[#0f1730]" style={{ background: BLUE }}>
          <MessageCircle className="h-4 w-4" /> {label || 'Message Ghost It about these'}
        </button>
        {dialog}
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
