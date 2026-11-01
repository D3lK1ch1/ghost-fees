import { useState } from 'react';
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
export function ExComesBack({ pickKey, ex, onNext }) {
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
        <div className="text-[13px] font-extrabold" style={{ color: C.coralSoft }}>Act 2 · If the ex comes back</div>
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
        <Bubble kind="s" className="ex-in mb-[120px] text-[14px]" style={{ animationDelay: '.9s' }}>New phone. Who dis?</Bubble>
        <GhostPal pickKey={pickKey} mood="sassy" motion="dance" width={140} speed={1.79} drift={6.4} />
      </div>
      <div className="ex-in relative flex flex-col gap-2.5 p-4" style={{ ...card, animationDelay: '1.45s' }}>
        <span className="ex-fredoka text-[19px] font-semibold">If {ex.merchant} charges you after you cancelled</span>
        <div className="text-[14px]" style={{ color: C.soft }}>You&apos;re owed that back. Here&apos;s a message ready to send:</div>
        <div className="px-3.5 py-3 text-[14px] font-bold leading-relaxed" style={{ borderRadius: '16px 16px 4px 16px', background: C.coral, color: C.bg }}>{message}</div>
      </div>
      <div className="flex-1" />
      <PrimaryButton onClick={copy} delay="2s">{copied ? 'Copied' : 'Copy refund message'}</PrimaryButton>
      <GhostButton onClick={onNext} delay="2s">Next: your glow-up plan</GhostButton>
    </Screen>
  );
}

// Design screen Ex9Glowup: the better-life plan, month by month.
export function ExGlowupPlan({ pickKey, glow, blockedCount, onNext }) {
  const monthly = blockedMonthly(glow);
  // A timeline from today: nothing is done yet, month 1 is next. Each milestone's
  // money is what your blocked exes would have charged by that month.
  const badge = (index) => (index === 0
    ? { text: 'Next up', style: { color: C.coralSoft, border: '1.5px solid #ffa3ab' } }
    : { text: 'Later', style: { color: C.muted, border: `1.5px solid ${C.line}` } });

  return (
    <Screen background="radial-gradient(ellipse at 80% 10%, #2a2530 0%, #15131a 55%)" className="gap-3.5 px-4 pb-[22px] pt-[18px]">
      <div className="relative flex items-end gap-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1 pb-2">
          <div className="text-[13px] font-extrabold" style={{ color: C.coralSoft }}>Act 2 · The glow-up</div>
          <h2 className="ex-fredoka m-0 text-[26px] font-bold leading-tight">Your better-life plan</h2>
          <div className="text-[14px]" style={{ color: C.soft }}>
            {monthly > 0 ? `${money(monthly)} a month you're not giving your exes.` : 'Block an ex to start your plan.'}
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
              {!last && <div aria-hidden="true" className="absolute left-[21px] top-[46px] w-[3px] rounded" style={{ bottom: -14, background: index === 0 ? C.mint : C.line }} />}
              <div className="relative z-[1]"><MilestoneIcon icon={step.icon} on={index === 0 && monthly > 0} /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-3" style={{ ...card, borderRadius: 16, border: index === 0 ? `1.5px solid ${C.coral}` : card.border }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-extrabold" style={{ color: C.muted }}>Month {step.months}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[12px] font-extrabold" style={b.style}>{b.text}</span>
                </div>
                <div className="ex-fredoka text-[19px] font-semibold">{step.label}</div>
                <div className="text-[14px]" style={{ color: C.soft }}><span className="font-extrabold" style={{ color: C.mint }}>{money(monthly * step.months)}</span> back from your exes</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-1" />
      <div className="text-center text-[12px]" style={{ color: C.muted }}>Based on the {blockedCount} {blockedCount === 1 ? 'ex' : 'exes'} you blocked: {money(glow.fund)} a year.</div>
      <PrimaryButton onClick={onNext} delay="2.4s">Fast-forward to month 6</PrimaryButton>
    </Screen>
  );
}

// Design screen Ex10Weekend: month 6, on the beach, paid for by your exes.
export function ExWeekend({ pickKey, glow, biggest, onNext }) {
  const [sent, setSent] = useState(false);
  const six = blockedMonthly(glow) * 6;
  // By month 6 the weekend-away money in the plan is there, by definition.
  const funded = six > 0;
  const name = biggest?.merchant || 'my exes';
  const send = async () => {
    const text = `Wish you weren't here, ${name}. ${money(six)} back in 6 months. ${SITE}`;
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
      <div className="relative text-[13px] font-extrabold" style={{ color: C.coralSoft }}>Act 2 · Month 6</div>
      <div className="ex-in relative h-[330px] overflow-hidden rounded-[26px]" style={{ animationDelay: '.2s', background: 'linear-gradient(180deg, #ffb48a 0%, #ff8a7d 38%, #6a4a7a 70%, #2b3a55 100%)', border: `1px solid ${C.line}` }}>
        <div aria-hidden="true" className="absolute left-1/2 top-[120px] -ml-[60px] h-[120px] w-[120px] rounded-full" style={{ background: '#ffe3a3', boxShadow: '0 0 60px rgba(255,211,140,0.7)' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[120px]" style={{ background: '#1f3a55' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-[104px] h-[3px]" style={{ background: 'rgba(255,227,163,0.6)' }} />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[52px]" style={{ background: '#e8c99a', borderRadius: '60% 40% 0 0 / 30% 30% 0 0' }} />
        <div aria-hidden="true" className="absolute bottom-[38px] left-6 h-[120px] w-1.5 origin-bottom -rotate-[8deg]" style={{ background: '#6b4a35' }} />
        <div aria-hidden="true" className="absolute -left-1 bottom-[150px] h-[26px] w-[70px] -rotate-[20deg] rounded-[50%]" style={{ background: '#2c5a52' }} />
        <div aria-hidden="true" className="absolute bottom-[156px] left-[22px] h-6 w-[70px] rotate-[18deg] rounded-[50%]" style={{ background: '#3f7d72' }} />
        <div aria-hidden="true" className="absolute bottom-[26px] right-[26px] h-11 w-14 rounded-lg" style={{ background: C.coral, border: `3px solid ${C.coralDeep}` }} />
        <div className="absolute bottom-[46px] left-1/2 -ml-[70px]"><GhostPal pickKey={pickKey} mood="happy" motion="dance" width={140} speed={2.2} drift={8.2} /></div>
        <Bubble kind="r" className="ex-in absolute right-3.5 top-4 max-w-[184px] text-[13px]" style={{ animationDelay: '1s' }}>Paid for by {name}&apos;s tears.</Bubble>
      </div>
      <div className="relative flex flex-col items-center gap-0.5 text-center">
        <div className="ex-in ex-fredoka text-[34px] font-bold leading-tight" style={{ animationDelay: '.75s' }}>{funded ? 'Weekend away: funded.' : 'Month 6: getting there.'}</div>
        <div className="ex-in ex-fredoka text-[22px] font-semibold" style={{ color: C.mint, animationDelay: '1.3s' }}>{money(six)} back since you blocked them.</div>
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
      <div className="grid grid-cols-2 gap-2.5">
        <PrimaryButton onClick={send} delay="2.4s">{sent ? 'Sent' : 'Send postcard'}</PrimaryButton>
        <GhostButton onClick={onNext} delay="2.4s">Next month</GhostButton>
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
        <img src={pick.avatar} alt="" className="h-[42px] w-[42px] flex-none rounded-full object-cover" />
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
          <GhostPal pickKey={pickKey} mood="happy" width={112} speed={3.3} />
          <Bubble kind="t" className="ex-in mb-[90px] text-[13px]" style={{ animationDelay: '2s' }}>I don&apos;t do trials anymore.</Bubble>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-4 pb-[22px] pt-3.5" style={{ background: C.bar, borderTop: `1px solid ${C.barLine}` }}>
        <PrimaryButton onClick={onUpload}>Upload this month&apos;s statement</PrimaryButton>
        <GhostButton onClick={onSeeAll}>See all my results</GhostButton>
      </div>
    </Screen>
  );
}
