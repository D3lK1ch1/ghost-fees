import { useState } from 'react';
import { Check, ExternalLink, Heart } from 'lucide-react';
import { ThoughtBubble } from '@/components/site/Bubbles';
import { useGhostList } from '@/hooks/use-ghost-list';
import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { glowUp, kindOf, yearly } from '@/lib/ghostFees/exJourney';
import { cn } from '@/lib/utils';
import GlowUpFund from './GlowUpFund';

const SHOWN = 5;

// One window of the house: an ex, or the last window holding the rest.
function Tile({ label, price, avatar, onClick, active, lit }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative flex flex-col items-center rounded-2xl border-2 px-2 pb-2.5 pt-3 transition-colors',
        lit ? 'border-[#5ee6c8] bg-[#5ee6c8]/10' : active ? 'border-primary bg-white/[0.06]' : 'border-white/10 bg-black/30 hover:border-primary/50',
      )}
    >
      <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 px-2 py-1.5">
        <img src={avatar} alt="" width={36} height={36} className={cn('h-9 w-9 rounded-full', lit && 'opacity-60 grayscale')} />
        <span className="rounded-full bg-white/80 px-1.5 text-[10px] font-black leading-4 text-[#141218]">{lit ? '✓' : '•••'}</span>
      </span>
      <span className="mt-1.5 text-[13px] font-bold text-white">{label}</span>
      <span className={cn('text-[12px] font-semibold', lit ? 'text-[#5ee6c8]' : 'text-primary')}>{lit ? 'Blocked' : price}</span>
    </button>
  );
}

// Heartbreak House (design screen HeartbreakHouse): the 💔 version of the Haunted
// House. Every ex has a window; block one once you've cancelled and its window
// lights up and its yearly price goes in your glow-up jar. Uses the same Ghost List
// as the Subscriptions tab and the story.
export default function HeartbreakHouse({ theme, pick, subscriptions, avatarFor }) {
  const [ghostList, setGhostList] = useGhostList();
  const blocked = new Set(ghostList.filter((item) => item.status !== 'charging').map((item) => item.id));
  const glow = glowUp(subscriptions, blocked);
  const [selectedId, setSelectedId] = useState(subscriptions[0]?.id);
  const selected = subscriptions.find((item) => item.id === selectedId) || subscriptions[0];
  const shown = subscriptions.slice(0, SHOWN);
  const rest = subscriptions.slice(SHOWN);
  const stillMonthly = subscriptions.filter((item) => !blocked.has(item.id)).reduce((sum, item) => sum + item.monthly, 0);
  const jar = glow.goal > 0 ? Math.min(100, (glow.fund / glow.goal) * 100) : 0;

  const block = (item) => setGhostList((current) => (
    current.some((entry) => entry.id === item.id)
      ? current.map((entry) => (entry.id === item.id ? { ...entry, status: 'requested' } : entry))
      : [...current, { id: item.id, merchant: item.merchant, monthly: item.monthly, status: 'requested', date: new Date().toISOString() }]
  ));
  const unblock = (item) => setGhostList((current) => current.filter((entry) => entry.id !== item.id));

  if (!selected) return null;
  const info = cancelInfo(selected.merchant);
  const line = theme.lines.find((entry) => entry.match.test(selected.merchant))?.text || theme.fallbackLine;
  const isBlocked = blocked.has(selected.id);

  return (
    <div className="mx-auto max-w-[460px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-primary"><Heart className="h-3.5 w-3.5" /> Heartbreak House</p>
          <h3 className="mt-1 font-heading text-[26px] font-bold leading-tight text-white">Block every ex. Then go out.</h3>
        </div>
        <div className="text-right">
          <p className="font-heading text-[28px] font-bold leading-none text-[#5ee6c8]">{money(glow.fund)}</p>
          <p className="text-[12px] text-white/60">a year back</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-[12.5px] text-white/70">
        <span>{glow.blockedCount} of {subscriptions.length} exes blocked</span>
        <span>{money(stillMonthly * 12)}/yr still texting</span>
      </div>
      <GlowUpFund glow={glow} milestonesOnly className="mt-4" />

      {/* The house */}
      <div className="relative mt-6">
        <div className="mx-auto h-0 w-0 border-x-[150px] border-b-[70px] border-x-transparent border-b-[#2a1c2c]" aria-hidden="true" />
        <Heart className="absolute left-1/2 top-6 h-7 w-7 -translate-x-1/2 fill-primary text-primary drop-shadow-[0_0_12px_hsl(var(--primary))]" aria-hidden="true" />
        <span className="absolute right-2 top-0 h-12 w-12 rounded-full bg-[#f3e9f0] shadow-[0_0_30px_rgba(255,255,255,0.35)]" aria-hidden="true" />
        <div className="rounded-b-2xl border-2 border-t-0 border-primary/40 bg-[#1d1520] p-3 shadow-[inset_0_0_40px_hsl(var(--primary)/0.15)]">
          <div className="grid grid-cols-2 gap-3">
            {shown.map((item) => (
              <Tile
                key={item.id}
                label={item.merchant.length > 14 ? item.merchant.split(' ')[0] : item.merchant}
                price={`${money(item.monthly)}/mo`}
                avatar={avatarFor(item.merchant)}
                active={item.id === selected.id}
                lit={blocked.has(item.id)}
                onClick={() => setSelectedId(item.id)}
              />
            ))}
            {rest.length > 0 && (
              <Tile
                label={`${rest.length} more ${rest.length === 1 ? 'ex' : 'exes'}`}
                price={`${money(rest.reduce((sum, item) => sum + item.monthly, 0))}/mo`}
                avatar={avatarFor(rest[0].merchant)}
                active={rest.some((item) => item.id === selected.id)}
                lit={rest.every((item) => blocked.has(item.id))}
                onClick={() => setSelectedId(rest.find((item) => !blocked.has(item.id))?.id || rest[0].id)}
              />
            )}
          </div>
          <div className="mx-auto mt-3 h-10 w-14 rounded-t-full border-2 border-white/10 bg-black/40" aria-hidden="true" />
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex flex-col items-center">
            <div className="relative h-16 w-12 overflow-hidden rounded-b-xl rounded-t-md border-2 border-white/60 bg-white/5">
              <div className="absolute inset-x-0 bottom-0 bg-[#5ee6c8]/70 transition-[height] duration-700" style={{ height: `${jar}%` }} />
            </div>
            <span className="mt-1 text-[11.5px] font-bold text-[#5ee6c8]">Glow-up jar</span>
          </div>
          <div className="relative">
            <ThoughtBubble trail="right" tones="text-[#2a1020]" size="sm" className="absolute -left-36 -top-10 w-max max-w-[170px]">
              {pick.houseBubble}
            </ThoughtBubble>
            <img src={pick.house} alt="" width={360} className="h-auto w-[120px]" />
          </div>
        </div>
      </div>

      {/* The selected ex */}
      <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-start gap-3">
          <img src={avatarFor(selected.merchant)} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[17px] font-bold text-white">{selected.merchant}</p>
            <p className="text-[12.5px] text-white/60">{kindOf(selected.merchant)}</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-[18px] font-bold text-white">{money(selected.monthly)}/mo</p>
            <p className="text-[12px] text-white/60">{yearly(selected.monthly)}/yr</p>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-white/[0.07] px-3.5 py-2 text-[14px] text-white">{line}</p>
        {info.url ? (
          <a href={info.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold text-primary underline underline-offset-4">
            Cancel on {info.name} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="mt-3 text-[13px] text-white/70">{info.steps}</p>
        )}
        {isBlocked ? (
          <div className="mt-3 flex items-center justify-between rounded-[18px] border-2 border-[#5ee6c8] px-4 py-3">
            <span className="inline-flex items-center gap-1.5 font-heading text-[15px] font-bold text-[#5ee6c8]"><Check className="h-4 w-4" /> Blocked · {yearly(selected.monthly)}/yr in your jar</span>
            <button type="button" onClick={() => unblock(selected)} className="text-[12.5px] font-bold text-white/60 underline underline-offset-4">Undo</button>
          </div>
        ) : (
          <button type="button" onClick={() => block(selected)} className="mt-3 w-full rounded-[18px] bg-primary px-5 py-3 font-heading text-[16px] font-bold text-primary-foreground">
            💔 Block and delete
          </button>
        )}
        <p className="mt-2 text-[12.5px] leading-relaxed text-white/55">Block once you&apos;ve cancelled. The room lights up and the money goes in your jar.</p>
      </div>
    </div>
  );
}
