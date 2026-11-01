import { ExternalLink, Clock, Check, Copy } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { findOverlaps } from '@/lib/ghostFees/overlaps';
import { kindOf, yearly } from '@/lib/ghostFees/exJourney';
import { cn } from '@/lib/utils';
import GlowUpFund from './GlowUpFund';

// Scene 3 (design Ex4Subs): the Glow-up fund, double-ups, and every ex with their
// line, the official cancel steps and Block and delete. Blocking adds the ex to the
// Ghost List, the same list as the Subscriptions tab.
export default function ExMovingOn({ theme, pick, subscriptions, glow, blocked, ghostList, avatarFor, priceRiseIds, onBlock, onDone }) {
  const overlaps = findOverlaps(subscriptions);
  const overlapIds = new Set(overlaps.flatMap((group) => group.items.map((item) => item.id)));
  const open = subscriptions.filter((item) => !blocked.has(item.id));
  const statusOf = (id) => ghostList.find((item) => item.id === id)?.status;
  const [bubbleTop, bubbleRest] = pick.movingBubble;

  return (
    <div>
      <h2 className="font-heading text-[26px] font-bold text-white">Moving on</h2>
      <p className="text-[14px] text-white/70">
        {open.length} {open.length === 1 ? 'ex' : 'exes'} still charging you · {money(open.reduce((sum, item) => sum + item.monthly, 0) * 12)} a year
      </p>

      <div className="mt-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
        <div className="relative flex items-end gap-2">
          <img src={pick.moving} alt="" width={360} className="h-auto w-[150px]" />
          <p className="mb-8 rounded-[28px] bg-white px-4 py-3 text-center text-[14px] font-bold leading-snug text-[#2a1020] shadow-[0_5px_0_rgba(255,143,156,0.5)]">
            <span className="font-heading text-[16px] text-primary">{bubbleTop}</span>
            <br />
            {bubbleRest}
          </p>
        </div>
        <GlowUpFund glow={glow} className="mt-3" />
      </div>

      {overlaps.map((group) => (
        <div key={group.key} className="mt-4 rounded-[22px] border-2 border-primary/60 bg-white/[0.03] p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-primary"><Copy className="h-3.5 w-3.5" /> Double-ups</p>
          <p className="mt-1.5 font-heading text-[19px] font-bold leading-snug text-white">
            {group.items.length} {group.label.replace('video ', '').replace(/ (services|apps|plans|tools|assistants|memberships)$/, '')} exes at once? That&apos;s <span className="text-primary">{money(group.yearly)}/yr.</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span key={item.id} className="rounded-full border border-white/15 px-3 py-1 text-[13px] text-white">{item.merchant} {money(item.monthly)}</span>
            ))}
          </div>
          <p className="mt-3 text-[13.5px] text-white/70">Keep the one you actually use. Block the rest.</p>
        </div>
      ))}

      <ul className="mt-4 space-y-3">
        {open.map((item, index) => {
          const info = cancelInfo(item.merchant);
          const line = theme.lines.find((entry) => entry.match.test(item.merchant))?.text || theme.fallbackLine;
          const tag = priceRiseIds.has(item.id) ? 'price went up' : overlapIds.has(item.id) ? 'double-up' : null;
          return (
            <li key={item.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-start gap-3">
                <img src={avatarFor(item.merchant)} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-[17px] font-bold text-white">{item.merchant}</p>
                  <p className="text-[12.5px] text-white/60">{kindOf(item.merchant)}{tag && ` · ${tag}`}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-[17px] font-bold text-white">{money(item.monthly)}/mo</p>
                  <p className="text-[12px] text-white/60">{yearly(item.monthly)}/yr</p>
                </div>
              </div>
              <p className="mt-3 w-fit rounded-2xl bg-white/[0.07] px-3.5 py-2 text-[14px] text-white">&quot;{line}&quot;</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/75">{info.steps}</p>
              {info.url && (
                <a href={info.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[14px] font-bold text-primary underline underline-offset-4">
                  Cancel on {info.name} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => onBlock(item)}
                className={cn(
                  'mt-3 w-full rounded-[18px] px-5 py-3 font-heading text-[16px] font-bold transition-transform hover:-translate-y-0.5',
                  index === 0 ? 'bg-primary text-primary-foreground' : 'border-2 border-white/20 text-white',
                )}
              >
                💔 Block and delete
              </button>
              <p className="mt-1.5 text-center text-[11.5px] text-white/50">Block once you&apos;ve cancelled.</p>
            </li>
          );
        })}
      </ul>

      {blocked.size > 0 && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <h3 className="font-heading text-[20px] font-bold text-white">Blocked list</h3>
            <span className="text-[13px] text-white/60">{blocked.size} {blocked.size === 1 ? 'ex' : 'exes'}</span>
          </div>
          <ul className="mt-2 divide-y divide-white/10 rounded-[22px] border border-white/10 bg-white/[0.04]">
            {subscriptions.filter((item) => blocked.has(item.id)).map((item) => {
              const gone = statusOf(item.id) === 'confirmed';
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-heading text-[15px] font-bold text-white">{item.merchant}</p>
                    <p className="text-[12.5px] text-white/60">{gone ? `${yearly(item.monthly)}/yr back` : 'Waiting on their reply'}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-bold', gone ? 'bg-[#5ee6c8] text-[#0f2a24]' : 'border border-primary/60 text-primary')}>
                    {gone ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {gone ? 'Gone for good' : 'Requested'}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[12px] text-white/55">Next month, check your statement and mark them Gone for good on the Subscriptions tab.</p>
        </div>
      )}

      <button
        type="button"
        onClick={onDone}
        className="mt-5 w-full rounded-[20px] border-2 border-white/20 px-6 py-3.5 font-heading text-[17px] font-bold text-white hover:border-primary/60"
      >
        {open.length ? "That's enough for today" : 'Inbox zero'}
      </button>
    </div>
  );
}
