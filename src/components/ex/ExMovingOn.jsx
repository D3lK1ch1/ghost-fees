import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { findOverlaps } from '@/lib/ghostFees/overlaps';
import { kindOf, yearly } from '@/lib/ghostFees/exJourney';
import { Bubble, C, GhostButton, GhostPal, PrimaryButton, Screen, Stars } from './ExKit';
import GlowUpFund from './GlowUpFund';

const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 20 };

const BADGES = {
  confirmed: { label: 'Gone for good', note: (item) => `${yearly(item.monthly)}/yr back`, style: { background: C.mint, color: C.mintInk } },
  requested: { label: 'Requested', note: () => 'Waiting on their reply', style: { border: '1.5px solid #ffa3ab', color: '#ffc6cb' } },
  charging: { label: 'Still texting', note: () => 'Charged you again. Message them.', style: { background: C.coral, color: C.bg } },
};

// Scene 3, design screen Ex4Subs: the Glow-up fund, double-ups, and every ex still
// charging with their line, the official cancel steps and Block and delete.
// Blocking adds the ex to the Ghost List, the same list as the Subscriptions tab.
export default function ExMovingOn({ theme, pick, pickKey, subscriptions, glow, blocked, ghostList, avatarFor, priceRiseIds, onBlock, onDone }) {
  const overlaps = findOverlaps(subscriptions);
  const overlapIds = new Set(overlaps.flatMap((group) => group.items.map((item) => item.id)));
  const open = subscriptions.filter((item) => !blocked.has(item.id));
  const gone = subscriptions.filter((item) => blocked.has(item.id));
  const statusOf = (id) => ghostList.find((item) => item.id === id)?.status || 'requested';
  const [bubbleTop, bubbleRest] = pick.movingBubble;

  return (
    <Screen stars={false} className="gap-4 px-4 pb-7 pt-[18px]">
      <div className="flex flex-col gap-0.5">
        <h2 className="ex-fredoka m-0 text-[24px] font-bold leading-tight">Moving on</h2>
        <div className="text-[14px]" style={{ color: C.soft }}>
          {open.length} {open.length === 1 ? 'ex' : 'exes'} still charging you · {money(open.reduce((sum, item) => sum + item.monthly, 0) * 12)} a year
        </div>
      </div>

      <div className="ex-in relative flex flex-col gap-3.5 overflow-hidden rounded-[26px] px-4 pb-4 pt-[18px]" style={{ animationDelay: '.1s', background: 'radial-gradient(ellipse at 20% 30%, #332c3a 0%, #262230 55%, #1b1921 100%)', border: '1px solid #3a3444' }}>
        <Stars n={16} maxY={40} />
        <div className="relative flex items-end gap-1">
          <GhostPal pickKey={pickKey} mood="power" motion="dance" width={132} speed={1.93} drift={6.4} />
          <Bubble kind="l" className="mb-[70px] flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="ex-fredoka whitespace-nowrap text-[21px] font-bold leading-none" style={{ color: C.coralDeep }}>{bubbleTop}</span>
            <span className="text-[15px] font-extrabold leading-snug">{bubbleRest}</span>
          </Bubble>
        </div>
        <GlowUpFund glow={glow} />
      </div>

      {overlaps.map((group) => (
        <div key={group.key} className="ex-in flex flex-col gap-3 p-4" style={{ ...card, border: `1.5px solid ${C.coral}`, animationDelay: '.65s' }}>
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z" /><path d="M15 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z" /></svg>
            <span className="text-[13px] font-extrabold" style={{ color: C.coralSoft }}>Double-ups</span>
          </div>
          <div className="ex-fredoka text-[21px] font-semibold leading-snug">
            {group.items.length} {group.label.replace('video ', '').replace(/ (services|apps|plans|tools|assistants|memberships)$/, '')} exes at once? That&apos;s <span style={{ color: C.coral }}>{money(group.yearly)}/yr</span>.
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <span key={item.id} className="rounded-full px-2.5 py-1.5 text-[13px] font-bold" style={{ background: C.bg, border: `1px solid ${C.line}` }}>{item.merchant} {money(item.monthly)}</span>
            ))}
          </div>
          <div className="text-[14px]" style={{ color: C.soft }}>Keep the one you actually use. Block the rest.</div>
        </div>
      ))}

      {open.map((item, index) => {
        const info = cancelInfo(item.merchant);
        const line = theme.lines.find((entry) => entry.match.test(item.merchant))?.text || theme.fallbackLine;
        const tag = priceRiseIds.has(item.id) ? 'price went up' : overlapIds.has(item.id) ? 'double-up' : null;
        const steps = info.url ? info.steps.split(/\s*>\s*|\.\s+/).filter(Boolean) : [];
        const Button = index === 0 ? PrimaryButton : GhostButton;
        return (
          <div key={item.id} className="ex-in flex flex-col gap-3 p-4" style={{ ...card, animationDelay: `${Math.min(1.2 + index * 0.25, 2.2)}s` }}>
            <div className="flex items-center gap-3">
              <img src={avatarFor(item.merchant)} alt="" className="ex-av h-[42px] w-[42px] flex-none rounded-full object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[17px] font-extrabold">{item.merchant}</span>
                <span className="text-[13px]" style={{ color: C.muted }}>{kindOf(item.merchant)}{tag && ` · ${tag}`}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="ex-fredoka text-[20px] font-semibold">{money(item.monthly)}/mo</span>
                <span className="text-[13px]" style={{ color: C.muted }}>{yearly(item.monthly)}/yr</span>
              </div>
            </div>
            <div className="max-w-[88%] self-start px-3 py-2 text-[14px]" style={{ borderRadius: '16px 16px 16px 4px', background: C.bg, color: C.soft }}>&quot;{line}&quot;</div>
            {steps.length > 1 ? (
              <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5 text-[14px] leading-snug" style={{ color: '#e6e2ea' }}>
                {steps.map((step) => <li key={step}>{step.replace(/\.$/, '')}.</li>)}
              </ol>
            ) : (
              <p className="text-[14px] leading-snug" style={{ color: '#e6e2ea' }}>{info.steps}</p>
            )}
            {info.url && (
              <a href={info.url} target="_blank" rel="noreferrer" className="inline-flex min-h-[32px] items-center self-start text-[15px] font-extrabold underline" style={{ color: '#ffa3ab' }}>
                Cancel on {info.name} ↗
              </a>
            )}
            <Button onClick={() => onBlock(item)}>💔 Block and delete</Button>
          </div>
        );
      })}

      {gone.length > 0 && (
        <div className="ex-in flex flex-col gap-2.5" style={{ animationDelay: '.3s' }}>
          <div className="flex items-baseline justify-between">
            <h3 className="ex-fredoka m-0 text-[22px] font-bold">Blocked list</h3>
            <span className="text-[13px]" style={{ color: C.muted }}>{gone.length} {gone.length === 1 ? 'ex' : 'exes'}</span>
          </div>
          <div className="flex flex-col" style={card}>
            {gone.map((item, index) => {
              const badge = BADGES[statusOf(item.id)] || BADGES.requested;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3.5" style={index < gone.length - 1 ? { borderBottom: `1px solid ${C.line}` } : undefined}>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[16px] font-extrabold">{item.merchant}</span>
                    <span className="text-[13px]" style={{ color: C.muted }}>{badge.note(item)}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-extrabold" style={badge.style}>{badge.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[12.5px]" style={{ color: C.muted }}>Next month, check your statement and mark them Gone for good on the Subscriptions tab.</div>
        </div>
      )}

      <GhostButton onClick={onDone}>{open.length ? "That's enough for today" : 'Inbox zero'}</GhostButton>
    </Screen>
  );
}
