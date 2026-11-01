import ReceiptGhost from '@/components/site/ReceiptGhost';
import { useState } from 'react';
import { useGhostList } from '@/hooks/use-ghost-list';
import FkJar from './FkJar';
import { money } from '@/lib/ghostFees/format';
import { Bubble, C, GhostButton, GhostPal, PrimaryButton, Screen } from './ExKit';
import { MilestoneIcon } from './GlowUpFund';

// Act 2 of the My Ex Ghosted Me design: what happens after you block your exes.
// Every number comes from the exes you actually blocked. Where the design shows a
// made-up event (an ex charging you again), it is worded as "if", never invented.

const SITE = 'hunt-ghost-fees.base44.app';
const card = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 20 };

const blockedMonthly = (glow) => glow.fund / 12;

// Design screen Ex8Back: an ex texts again after you cancelled.
// Mouth of each party ghost, as % of the art (shown at its own size, no padding).
const PARTY_MOUTH = {
  '/themes/ex/men-footy.webp': [44, 34],
  '/themes/ex/ghost-dinner.webp': [49, 36],
};

export function ExComesBack({ pick, pickKey, ex, onNext, label = 'Act 2 · If the ex comes back' }) {
  const [copied, setCopied] = useState(false);
  const now = new Date();
  const time = now.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[ap]m/i, '');
  const date = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
  const message = `Hi ${ex.merchant}, I cancelled my subscription but was charged ${money(ex.monthly)} after that. Please refund it and confirm my account is closed. Thanks.`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Screen background="radial-gradient(ellipse at 50% 20%, #2e2834 0%, #15131a 60%)" maxY={26} className="gap-3 px-4 py-[22px]">
      <div className="relative flex flex-col items-center">
        <div className="text-[13px] font-extrabold" style={{ color: C.coralSoft }}>{label}</div>
        <div className="ex-fredoka text-[56px] font-semibold leading-none">{time}</div>
        <div className="text-[14px] font-bold" style={{ color: C.soft }}>{date}</div>
      </div>
      <div className="ex-in relative flex items-start gap-3 rounded-[18px] px-3.5 py-3" style={{ animationDelay: '.2s', background: 'rgba(34,31,41,0.95)', border: `1.5px solid ${C.coral}`, boxShadow: '0 10px 30px -12px rgba(255,111,125,0.5)' }}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex justify-between text-[13px]"><span className="font-extrabold">{ex.merchant}</span><span style={{ color: C.muted }}>now</span></div>
          <div className="text-[15px] leading-snug">u up? Just charged you {money(ex.monthly)}. For old times&apos; sake.</div>
        </div>
      </div>
      <div className="relative flex h-[190px] items-end justify-center gap-1">
        <GhostPal pickKey={pickKey} mood="sassy" motion="dance" width={140} speed={1.79} drift={6.4} side="left" atMouth bubble={pick?.backShout || 'New phone. Who dis?'} bubbleWidth={150} bubbleDelay=".9s" bubbleClass="!px-5 !pt-4 !pb-7 text-[13px]" />
      </div>
      <div className="ex-in relative flex flex-col gap-2.5 p-4" style={{ ...card, animationDelay: '1.45s' }}>
        <span className="ex-fredoka text-[19px] font-semibold">If {ex.merchant} charges you after you cancelled</span>
        <div className="text-[14px]" style={{ color: C.soft }}>You&apos;re owed that back. Here&apos;s a message ready to send:</div>
        <div className="px-3.5 py-3 text-[14px] font-bold leading-relaxed" style={{ borderRadius: '16px 16px 4px 16px', background: C.coral, color: C.bg }}>{message}</div>
      </div>
      <div className="flex-1" />
      <PrimaryButton onClick={copy} delay="2s">{copied ? 'Copied' : 'Copy refund message'}</PrimaryButton>
      {onNext && <GhostButton onClick={onNext} delay="2s">Next: your glow-up plan</GhostButton>}
    </Screen>
  );
}

// Design screen Ex9Glowup: the better-life plan, month by month.
export function ExGlowupPlan({ pick, pickKey, glow, blockedCount, onNext, monthlyIfAll = 0, label = 'Act 2 · The glow-up' }) {
  // With nothing blocked yet, show what the plan would be if you blocked them all.
  const preview = glow.fund <= 0 && monthlyIfAll > 0;
  const monthly = preview ? monthlyIfAll : blockedMonthly(glow);
  // A timeline from today: nothing is done yet, month 1 is next. Each milestone's
  // money is what your blocked exes would have charged by that month.
  // Done once the blocked exes' yearly money covers that milestone, as in the design.
  const nextIndex = glow.steps.findIndex((step) => !step.unlocked);
  const badge = (index) => {
    if (!preview && glow.steps[index].unlocked) {
      return index === nextIndex - 1
        ? { text: 'Unlocked', style: { background: C.coral, color: C.bg } }
        : { text: 'Done', style: { background: C.mint, color: C.mintInk } };
    }
    if (index === (nextIndex < 0 ? -1 : nextIndex)) return { text: 'Next up', style: { color: C.coralSoft, border: '1.5px solid #ffa3ab' } };
    return { text: 'Later', style: { color: C.muted, border: `1.5px solid ${C.line}` } };
  };
  const lit = (index) => !preview && glow.steps[index].unlocked;

  return (
    <Screen background="radial-gradient(ellipse at 80% 10%, #2a2530 0%, #15131a 55%)" className="gap-3.5 px-4 pb-[22px] pt-[18px]">
      <div className="relative flex items-end gap-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-2">
          <div className="text-[13px] font-extrabold" style={{ color: C.coralSoft }}>{label}</div>
          <h2 className="ex-fredoka m-0 text-[26px] font-bold leading-tight">{pick?.planTitle || 'Your better-life plan'}</h2>
          <div className="text-[14px]" style={{ color: C.soft }}>
            {monthly > 0 ? `${money(monthly)} a month ${preview ? 'once you block them all' : "you're not giving your exes"}.` : 'Block an ex to start your plan.'}
          </div>
        </div>
        <GhostPal pickKey={pickKey} mood="focused" width={104} speed={3.5} drift={5.95} />
      </div>
      <div className="relative flex flex-col gap-3.5">
        {glow.steps.map((step, index) => {
          const b = badge(index);
          const last = index === glow.steps.length - 1;
          return (
            <div key={step.key} className="ex-in relative flex items-start gap-3" style={{ animationDelay: `${0.2 + index * 0.55}s` }}>
              {!last && <div aria-hidden="true" className="absolute left-[21px] top-[46px] w-[3px] rounded" style={{ bottom: -14, background: lit(index + 1) ? C.mint : C.line }} />}
              <div className="relative z-[1]"><MilestoneIcon icon={step.icon} on={lit(index)} /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3" style={{ ...card, borderRadius: 16, border: b.text === 'Unlocked' || (b.text === 'Next up' && nextIndex === 0) ? `1.5px solid ${C.coral}` : card.border }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold" style={{ color: C.muted }}>Month {step.months}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[12px] font-extrabold" style={b.style}>{b.text}</span>
                </div>
                <div className="ex-fredoka text-[19px] font-semibold">{pick?.planLabels?.[index] || step.label}</div>
                <div className="text-[14px]" style={{ color: C.soft }}><span className="font-extrabold" style={{ color: C.mint }}>{money(monthly * step.months)}</span> back from your exes</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1" />
      <div className="text-center text-[12px]" style={{ color: C.muted }}>
        {preview ? `Based on all your exes: ${money(monthly * 12)} a year. Block them to make it real.` : `Based on the ${blockedCount} ${blockedCount === 1 ? 'ex' : 'exes'} you blocked: ${money(glow.fund)} a year.`}
      </div>
      {onNext && <PrimaryButton onClick={onNext} delay="2.4s">Fast-forward to month 6</PrimaryButton>}
    </Screen>
  );
}

// Design screen Ex10Weekend: month 6, on the beach, paid for by your exes.
export function ExWeekend({ pick, pickKey, glow, biggest, onNext, preview = false }) {
  const [sent, setSent] = useState(false);
  // The weekend-away saving goal is the third milestone: 6 months of every ex.
  // Progress is the yearly money from the exes you've blocked, up to the goal.
  const goal = glow.steps.find((step) => step.key === 'weekend')?.amount || 0;
  const saved = preview ? 0 : Math.min(goal, glow.fund);
  const pct = goal > 0 ? Math.round((saved / goal) * 100) : 0;
  const reached = goal > 0 && saved >= goal;
  const name = biggest?.merchant || 'my exes';
  const send = async () => {
    const text = `Wish you weren't here, ${name}. ${money(saved)} saved for my weekend away. ${SITE}`;
    try {
      if (navigator.share) await navigator.share({ title: 'My Ex Ghosted Me', text, url: `https://${SITE}` });
      else await navigator.clipboard.writeText(text);
      setSent(true);
    } catch {
      setSent(false);
    }
  };

  return (
    <Screen background="linear-gradient(180deg, #1d2a3a 0%, #2a2530 45%, #15131a 75%)" className="gap-3 px-4 pb-[22px] pt-[18px]">
      <div className="relative text-[13px] font-extrabold" style={{ color: C.coralSoft }}>{pick?.weekendTag || 'Act 2 · Month 6'}</div>
      <div className="ex-in relative h-[330px] overflow-hidden rounded-[26px]" style={{ containerType: 'inline-size', animationDelay: '.2s', background: 'linear-gradient(180deg, #ffb48a 0%, #ff8a7d 38%, #6a4a7a 70%, #2b3a55 100%)', border: `1px solid ${C.line}` }}>
        {pick?.weekendArt ? (
          <img src={pick.weekendArt} alt="The I'm Fine ghost fishing off a boat with a cold drink" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: 'center 30%' }} />
        ) : (
        <>
        <div aria-hidden="true" className="absolute left-1/2 top-[120px] -ml-[60px] h-[120px] w-[120px] rounded-full" style={{ background: '#ffe3a3', boxShadow: '0 0 60px rgba(255,211,140,0.7)' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[120px]" style={{ background: '#1f3a55' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[104px] h-[3px]" style={{ background: 'rgba(255,227,163,0.6)' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[52px]" style={{ background: '#e8c99a', borderRadius: '60% 40% 0 0 / 30% 30% 0 0' }} />
        <div aria-hidden="true" className="absolute bottom-[38px] left-6 h-[120px] w-1.5 origin-bottom -rotate-[8deg]" style={{ background: '#6b4a35' }} />
        <div aria-hidden="true" className="absolute -left-1 bottom-[150px] h-[26px] w-[70px] -rotate-[20deg] rounded-[50%]" style={{ background: '#2c5a52' }} />
        <div aria-hidden="true" className="absolute bottom-[156px] left-[22px] h-6 w-[70px] rotate-[18deg] rounded-[50%]" style={{ background: '#3f7d72' }} />
        <div aria-hidden="true" className="absolute bottom-[26px] right-[26px] h-11 w-14 rounded-lg" style={{ background: C.coral, border: `3px solid ${C.coralDeep}` }} />
        {/* Ghost and bubble dance together; the bubble's tail sits at the mouth. */}
        <div className="ex-dance absolute bottom-[46px] left-1/2 -ml-[70px]" style={{ '--gs': '2.2s' }}>
          <GhostPal pickKey={pickKey} mood="happy" motion="none" width={140} speed={2.2} drift={8.2} style={{ '--gdx': '0px' }} />
          <Bubble kind="l" className="ex-in absolute bottom-[74px] left-[74px] w-[132px] !min-w-0 !px-4 !pb-6 !pt-3 text-[11.5px] leading-tight" style={{ animationDelay: '1s' }}>Paid for by {name}&apos;s tears.</Bubble>
        </div>
        </>
        )}
        {/* Bubble tail at his mouth. The art is a square cropped to fill this 330px-high
            card (object-cover, 30% from the top), and his mouth sits at 44% across and
            37.5% down the art, so the mouth's spot is worked out from the card's width
            (cqw). The tail tip is at 9% across, 94% down the bubble, hence the translate. */}
        {pick?.weekendArt && (
          <div
            className="pointer-events-none absolute z-10"
            style={{ left: 'calc(min(44cqw, 50cqw - 19.8px) + 8px)', top: 'calc(max(123.75px, 99px + 7.5cqw) - 10px)', transform: 'translate(-9%, -94%)' }}
          >
            <Bubble kind="l" className="ex-in w-[176px] !min-w-0 !px-5 !pb-8 !pt-4 text-[13px] leading-tight" style={{ animationDelay: '1s', transformOrigin: '9% 94%' }}>
              Paid for by {name}.
            </Bubble>
          </div>
        )}
      </div>
      <div className="relative flex flex-col items-center gap-0.5 text-center">
        <div className="ex-in ex-fredoka text-[34px] font-bold leading-tight" style={{ animationDelay: '.75s' }}>
          {reached ? pick?.weekendTitle || 'Weekend away: funded.' : `${(pick?.weekendTitle || 'Weekend away: funded.').split(':')[0]}: ${pct}% there.`}
        </div>
        <div className="ex-in w-full max-w-[300px]" style={{ animationDelay: '1.3s' }}>
          <div className="ex-fredoka text-[20px] font-semibold" style={{ color: C.mint }}>{money(saved)} of {money(goal)} saved</div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <div className="ex-bar h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.coral}, ${C.mint})` }} />
          </div>
          <div className="mt-1 text-[12.5px]" style={{ color: C.muted }}>{reached ? 'Paid for by the exes you blocked.' : 'Block more exes to fill it.'}</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="ex-in relative flex items-center gap-3.5 rounded-[22px] px-[18px] py-4" style={{ animationDelay: '1.85s', background: C.text, color: C.bg, transform: 'rotate(-1.5deg)', boxShadow: '0 16px 40px -18px rgba(0,0,0,0.7)' }}>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="text-[12px] font-extrabold tracking-wide" style={{ color: C.coralDeep }}>POSTCARD</div>
          <div className="ex-fredoka text-[20px] font-semibold leading-snug">Wish you weren&apos;t here, {name}.</div>
          <div className="text-[13px] font-bold" style={{ color: '#5c5668' }}>{SITE}</div>
        </div>
        <div aria-hidden="true" className="flex h-16 w-[54px] flex-none items-center justify-center rounded-md" style={{ border: `2px dashed ${C.coral}`, color: C.coral }}>♥</div>
      </div>
      <div className={`grid gap-2.5 ${onNext ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <PrimaryButton onClick={send} delay="2.4s">{sent ? 'Sent' : 'Send postcard'}</PrimaryButton>
        {onNext && <GhostButton onClick={onNext} delay="2.4s">Next month</GhostButton>}
      </div>
    </Screen>
  );
}

// Design screen Ex11Checkin: next month, Ghost Fees checks the exes stayed blocked.
export function ExCheckin({ pick, pickKey, blockedCount, onUpload, onSeeAll }) {
  const them = { background: C.card, borderRadius: '20px 20px 20px 6px' };
  return (
    <Screen stars={false}>
      <div className="relative z-[1] flex items-center gap-3 px-4 pb-3.5 pt-[18px]" style={{ background: C.bar, borderBottom: `1px solid ${C.barLine}` }}>
        <ReceiptGhost width={34} className="flex-none" />
        <div className="flex flex-col gap-0.5">
          <div className="ex-fredoka text-[18px] font-semibold">Ghost Fees</div>
          <div className="text-[13px] font-bold" style={{ color: C.mint }}>Monthly check-in</div>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col gap-2.5 p-4" style={{ background: 'radial-gradient(ellipse at 80% 85%, #24202c 0%, #15131a 55%)' }}>
        <div className="self-center rounded-full px-3 py-1 text-[12px] font-bold" style={{ color: C.muted, background: C.card }}>Next month</div>
        <div className="ex-in max-w-[82%] self-start px-4 py-3 text-[16px]" style={{ ...them, animationDelay: '.3s' }}>Monthly check-in. Send me your new statement and I&apos;ll read it.</div>
        <div className="ex-in max-w-[82%] self-start px-4 py-3 text-[16px]" style={{ ...them, animationDelay: '.9s' }}>
          I&apos;ll check your {blockedCount} {blockedCount === 1 ? 'ex is' : 'exes are'} still blocked, and catch anyone new sliding in.
        </div>
        <div className="ex-in flex max-w-[78%] flex-col items-end gap-1 self-end" style={{ animationDelay: '1.5s' }}>
          <div className="px-4 py-3 text-[16px] font-bold" style={{ background: C.coral, color: C.bg, borderRadius: '20px 20px 6px 20px' }}>Deal.</div>
        </div>
        <div className="mt-auto flex items-end gap-1 pt-6">
          <GhostPal pickKey={pickKey} mood="happy" width={112} speed={3.3} side="right" kind="t" bubble="I don't do trials anymore." bubbleWidth={160} bubbleDelay="2s" bubbleClass="text-[13px]" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-4 pb-[22px] pt-3.5" style={{ background: C.bar, borderTop: `1px solid ${C.barLine}` }}>
        <PrimaryButton onClick={onUpload}>Upload this month&apos;s statement</PrimaryButton>
        {onSeeAll && <GhostButton onClick={onSeeAll}>See all my results</GhostButton>}
      </div>
    </Screen>
  );
}

// Design screen FineSplurge: what your exes paid for. The F**k-ex jar fills as you
// block exes; each treat unlocks when its ex is blocked, and when the jar is full
// the party ghost says "Feel it" and Party mode opens: your ghosts dance on the
// exes' gravestones. Real yearly prices only.
export function ExSplurge({ pick, subscriptions, avatarFor }) {
  const [ghostList] = useGhostList();
  const [party, setParty] = useState(false);
  const blocked = new Set(ghostList.filter((item) => item.status !== 'charging').map((item) => item.id));
  const top = [...subscriptions].sort((a, b) => b.monthly - a.monthly).slice(0, pick.splurge.length);
  const total = top.reduce((sum, item) => sum + item.monthly * 12, 0);
  const fund = top.filter((item) => blocked.has(item.id)).reduce((sum, item) => sum + item.monthly * 12, 0);
  const full = top.length > 0 && top.every((item) => blocked.has(item.id));
  const pct = total > 0 ? Math.min(100, (fund / total) * 100) : 0;
  const [lead, shine] = pick.splurgeTitle;

  if (party) {
    return (
      <Screen background="radial-gradient(ellipse at 50% 30%, #3a2440 0%, #15131a 65%)" className="gap-3 px-4 pb-[22px] pt-[18px]">
        {Array.from({ length: 22 }, (_, i) => (
          <span key={i} aria-hidden="true" className="ex-mote pointer-events-none absolute rounded-sm" style={{ left: `${(i * 37 + 5) % 96}%`, bottom: -12, width: 6, height: 10, background: [C.coral, C.mint, '#ffe3a3'][i % 3], animationDuration: `${5 + (i % 5)}s`, animationDelay: `${-i * 0.6}s` }} />
        ))}
        <h2 className="ex-fredoka relative m-0 text-center text-[28px] font-bold leading-tight"><span className="ex-shine">Party mode</span></h2>
        <div className="relative text-center text-[14px]" style={{ color: C.soft }}>{money(fund)} a year, all yours. Dance on their graves.</div>
        <div className="relative grid grid-cols-2 gap-1">
          {pick.partyCrew.map((file, index) => (
            <div key={file} className="flex justify-center"><img src={`/themes/ex/${file}.webp`} alt="" className="ex-dance h-[120px] w-auto object-contain" style={{ '--gs': `${1.4 + index * 0.25}s` }} /></div>
          ))}
        </div>
        <div className="relative flex flex-wrap justify-center gap-2">
          {top.map((item) => (
            <div key={item.id} className="flex h-[74px] w-[64px] flex-col items-center justify-center rounded-t-[32px] text-center" style={{ background: '#34303e', boxShadow: '0 6px 0 #0f0d13' }}>
              <span className="text-[9px] font-extrabold tracking-[0.15em]" style={{ color: C.muted }}>RIP</span>
              <img src={avatarFor(item.merchant)} alt="" className="h-6 w-6 object-contain opacity-60 grayscale" />
              <span className="line-clamp-1 px-1 text-[9.5px] font-bold">{item.merchant}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <GhostButton onClick={() => setParty(false)}>Back to what they paid for</GhostButton>
      </Screen>
    );
  }

  return (
    <Screen background="radial-gradient(ellipse at 50% 0%, #2a2530 0%, #15131a 55%)" className="gap-3.5 px-4 pb-[22px] pt-[18px]">
      <div className="relative flex flex-col gap-0.5">
        <h2 className="ex-fredoka m-0 text-[26px] font-bold leading-tight">{lead}<span className="ex-shine">{shine}</span></h2>
        <div className="text-[14px]" style={{ color: C.soft }}>{pick.splurgeSub}</div>
      </div>

      {/* The F**k-ex jar fills with coins as you block exes (amount counts up), with
          the party ghost beside it; her bubble dances with her, tail at her mouth. */}
      <div className="relative flex flex-col gap-2 rounded-[20px] px-3 pb-2 pt-3" style={{ ...card }}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="ex-fredoka text-[17px] font-semibold">F**k-ex jar</span>
          <span className="text-[13px] font-extrabold"><span style={{ color: C.mint }}>{money(fund)}</span> of {money(total)}</span>
        </div>
        <div className="flex items-end justify-between">
          <FkJar amount={fund} total={total} size={112} />
          <div className="ex-dance relative mr-2 flex-none" style={{ '--gs': '1.8s' }}>
            <img src={pick.party} alt="Your party ghost" className="block h-[104px] w-auto object-contain" />
            {/* Tail tip (86.4% across the bubble's bottom) sits at the mouth. */}
            <div
              className="pointer-events-none absolute z-10"
              style={{ left: `calc(${(PARTY_MOUTH[pick.party] || [46, 35])[0]}% - 3px)`, top: `calc(${(PARTY_MOUTH[pick.party] || [46, 35])[1]}% - 2px)`, transform: 'translate(-86.4%, -100%)' }}
            >
              <Bubble kind="r" className="ex-in !min-w-0 whitespace-nowrap !px-6 !pb-8 !pt-3.5 text-[16px]" style={{ animationDelay: '.6s', transformOrigin: '86.4% 100%' }}>Feel it.</Bubble>
            </div>
          </div>
        </div>
        <span className="text-center text-[12px]" style={{ color: C.muted }}>{full ? 'Jar full. Every treat is paid for.' : 'Block an ex to unlock their treat.'}</span>
      </div>

      <div className="relative grid grid-cols-2 gap-x-3 gap-y-5 pt-3">
        {top.map((item, index) => {
          const treat = pick.splurge[index];
          const open = blocked.has(item.id);
          return (
            <div key={item.id} className="ex-in relative flex flex-col" style={{ ...card, borderRadius: 22, animationDelay: `${0.3 + index * 0.55}s` }}>
              <img src={avatarFor(item.merchant)} alt="" className="absolute -left-2 -top-5 z-10 h-11 w-11 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
              <div className="relative flex h-[150px] items-end justify-center overflow-hidden rounded-t-[22px]" style={{ background: 'radial-gradient(ellipse at 50% 70%, #2c3a3a 0%, #1b1921 70%)' }}>
                <img src={treat.art} alt="" className={`block h-[92%] w-[86%] object-contain object-bottom ${open ? 'ex-dance' : 'opacity-25 blur-[2px] grayscale'}`} style={{ '--gs': `${1.7 + index * 0.2}s` }} />
                {!open && <span className="absolute inset-0 flex items-center justify-center text-[30px]" aria-hidden="true">🔒</span>}
              </div>
              <div className="flex flex-col gap-0.5 px-3 pb-3 pt-2.5">
                <span className="ex-fredoka text-[17px] font-semibold">{treat.label}</span>
                <span className="text-[12px]" style={{ color: C.muted }}>{open ? `Paid for by ${item.merchant}` : `Block ${item.merchant} to unlock`}</span>
                <span className="ex-fredoka text-[16px] font-semibold" style={{ color: open ? C.mint : C.muted }}>{money(item.monthly * 12)}/yr</span>
              </div>
            </div>
          );
        })}
      </div>
      {full ? (
        <PrimaryButton onClick={() => setParty(true)}>🎉 Party mode</PrimaryButton>
      ) : (
        <div className="relative text-center text-[13px]" style={{ color: C.muted }}>Fill the jar to unlock Party mode.</div>
      )}
    </Screen>
  );
}
