import { useState } from 'react';
import { Check } from 'lucide-react';
import { SpeechBubble } from '@/components/site/Bubbles';
import { money } from '@/lib/ghostFees/format';

const SITE = 'hunt-ghost-fees.base44.app';

// Scene 5 (design Ex6Clear): the chat list after blocking, the unlocked treat and a
// share card. All amounts are the real yearly total of the exes you blocked.
export default function ExInboxZero({ pick, glow, total, onSeeAll, onBack }) {
  const [copied, setCopied] = useState(false);
  const left = total - glow.blockedCount;
  const unlocked = glow.steps.filter((step) => step.unlocked).pop();
  const text = `I blocked ${money(glow.fund)}/yr of exes 💔 ${SITE}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${SITE}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Ex Ghosted Me', text, url: `https://${SITE}` });
        return;
      } catch {
        return;
      }
    }
    copy();
  };

  return (
    <div className="flex min-h-[640px] flex-col">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-[28px] font-bold text-white">Chats</h2>
        <span className="rounded-full border-2 border-[#5ee6c8] px-3 py-0.5 text-[13px] font-bold text-[#5ee6c8]">{left} unread</span>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-[#1d2a3a] to-[#141218] p-4">
        <div className="pointer-events-none absolute inset-x-6 top-6 h-24 rounded-xl border-2 border-white/10 [background-image:radial-gradient(circle,#5ee6c8_1px,transparent_1.5px)] [background-size:12px_12px] opacity-30" aria-hidden="true" />
        <div className="relative flex items-end justify-between">
          <img src={pick.clear} alt="" width={360} className="h-auto w-[170px]" />
          <SpeechBubble side="left" className="mb-24 max-w-[170px] text-[13px] font-bold">{pick.clearBubble}</SpeechBubble>
        </div>
        {unlocked && (
          <p className="relative mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#5ee6c8] px-3 py-1 text-[12.5px] font-bold text-[#0f2a24]">
            <Check className="h-3.5 w-3.5" /> {unlocked.label}: unlocked
          </p>
        )}
      </div>

      <div className="flex-1 py-6 text-center">
        <p className="font-heading text-[40px] font-bold leading-none">
          {left === 0 ? (
            <><span className="text-[#5ee6c8]">Inbox</span> <span className="text-primary">zero.</span></>
          ) : (
            <span className="text-white">{left} {left === 1 ? 'ex' : 'exes'} to go.</span>
          )}
        </p>
        <p className="mt-2 font-heading text-[22px] font-bold text-[#5ee6c8]">{money(glow.fund)} a year back.</p>
      </div>

      <div className="rounded-[22px] border-2 border-primary/60 bg-white/[0.04] p-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/60">Share card</p>
        <p className="mt-1 font-heading text-[19px] font-bold text-white">I blocked {money(glow.fund)}/yr of exes 💔</p>
        <p className="text-[14px] font-bold text-[#5ee6c8]">{SITE}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button type="button" onClick={share} className="rounded-[18px] bg-primary px-5 py-3 font-heading text-[16px] font-bold text-primary-foreground">Share</button>
        <button type="button" onClick={copy} className="rounded-[18px] border-2 border-white/20 px-5 py-3 font-heading text-[16px] font-bold text-white">{copied ? 'Copied' : 'Copy link'}</button>
      </div>
      <button type="button" onClick={onSeeAll} className="mt-3 text-center text-[14px] font-bold text-primary underline underline-offset-4">
        See all {total} exes and the full Blocked list
      </button>
      {left > 0 && (
        <button type="button" onClick={onBack} className="mt-2 text-center text-[13px] font-semibold text-white/60 underline underline-offset-4">
          Back to the exes still charging
        </button>
      )}
    </div>
  );
}
