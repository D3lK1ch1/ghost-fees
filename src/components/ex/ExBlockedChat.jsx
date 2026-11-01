import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCheck, HeartCrack } from 'lucide-react';
import { SpeechBubble } from '@/components/site/Bubbles';
import { yearly } from '@/lib/ghostFees/exJourney';
import GlowUpFund from './GlowUpFund';

// Scene 4 (design Ex5Story): the chat with one ex after you block them. Their line
// is the real joke for that merchant; the money back is their real price x 12.
export default function ExBlockedChat({ theme, pick, ex, glow, avatarFor, onReplay, onNext }) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const line = theme.lines.find((entry) => entry.match.test(ex.merchant))?.text || theme.fallbackLine;
  const step = (index) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.3 + index * 0.7, duration: 0.35 },
  });

  return (
    <div key={run} className="flex min-h-[640px] flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <img src={avatarFor(ex.merchant)} alt="" width={44} height={44} className="h-11 w-11 rounded-full opacity-60 grayscale" />
        <div>
          <p className="font-heading text-[17px] font-bold text-white">{ex.merchant}</p>
          <p className="text-[12.5px] text-white/55">Blocked</p>
        </div>
      </div>

      <motion.div {...step(0)} className="mt-3 flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
        <HeartCrack className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-heading text-[16px] font-bold">Blocked</p>
          <p className="text-[13px]">{ex.merchant} won&apos;t be texting you again.</p>
        </div>
      </motion.div>

      <div className="flex-1 space-y-3 pt-4">
        <p className="mx-auto w-fit rounded-full bg-white/10 px-3 py-0.5 text-[12px] text-white/70">Before</p>
        <motion.p {...step(1)} className="w-fit max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.08] px-4 py-2.5 text-[14.5px] text-white">
          {line}
        </motion.p>
        <p className="mx-auto w-fit rounded-full bg-white/10 px-3 py-0.5 text-[12px] text-white/70">Today</p>
        <motion.div {...step(2)} className="ml-auto w-fit max-w-[80%]">
          <p className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[14.5px] font-semibold text-primary-foreground">
            I cancelled. We&apos;re done, and that&apos;s okay.
          </p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[11.5px] font-semibold text-[#5ee6c8]">
            <CheckCheck className="h-3.5 w-3.5" /> Left on read
          </p>
        </motion.div>

        <motion.div {...step(3)} className="flex items-end justify-between gap-3 pt-8">
          <div className="space-y-2">
            <p className="w-fit rounded-full border-2 border-[#5ee6c8] bg-[#173b33] px-4 py-2 text-[14px] text-white">
              <span className="font-heading text-[18px] font-bold text-[#5ee6c8]">+{yearly(ex.monthly)}</span> a year back
            </p>
            <GlowUpFund glow={glow} compact className="w-[220px] rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5" />
          </div>
          <div className="relative">
            <SpeechBubble side="right" className="absolute -left-24 top-0 w-max">{pick.healedBubble}</SpeechBubble>
            <img src={pick.healed} alt="" width={360} className="h-auto w-[110px]" />
          </div>
        </motion.div>
      </div>

      <p className="mt-4 text-center text-[13px] text-white/60">{ex.merchant} is on your Blocked list.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => { setRun((value) => value + 1); onReplay?.(); }}
          className="rounded-[18px] border-2 border-white/20 px-5 py-3 font-heading text-[16px] font-bold text-white hover:border-primary/60"
        >
          Replay
        </button>
        <button type="button" onClick={onNext} className="rounded-[18px] bg-primary px-5 py-3 font-heading text-[16px] font-bold text-primary-foreground">
          Next ex
        </button>
      </div>
    </div>
  );
}
