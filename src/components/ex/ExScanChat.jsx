import { motion, useReducedMotion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { ThoughtBubble } from '@/components/site/Bubbles';

// Scene 1 (design Ex2Scanning): Ghost Fees "texts" you while it reads the statement,
// then counts the exes it found. The count and file name are real.
export default function ExScanChat({ pick, count, fileName, onNext }) {
  const reduce = useReducedMotion();
  const step = (index) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.5 + index * 0.8, duration: 0.35 },
  });

  return (
    <div className="flex min-h-[640px] flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <img src={pick.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full" />
        <div>
          <p className="font-heading text-[17px] font-bold text-white">Ghost Fees</p>
          <p className="text-[12.5px] font-semibold text-[#5ee6c8]">Ghost Fees is typing ●●</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 pt-4">
        <p className="mx-auto w-fit rounded-full bg-white/10 px-3 py-0.5 text-[12px] text-white/70">Today</p>
        <motion.div {...step(0)} className="ml-auto w-fit max-w-[80%]">
          <div className="flex items-center gap-2.5 rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground">
            <FileText className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-[14px] font-bold">{fileName}</p>
              <p className="text-[12px]">Here&apos;s everything. Be honest.</p>
            </div>
          </div>
          <p className="mt-1 text-right text-[11.5px] text-white/50">Delivered</p>
        </motion.div>
        <motion.p {...step(1)} className="w-fit max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.08] px-4 py-2.5 text-[14.5px] text-white">
          Going through your messages...
        </motion.p>
        <motion.p {...step(2)} className="w-fit max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.08] px-4 py-2.5 text-[14.5px] text-white">
          Found someone who never calls...
        </motion.p>
        <motion.p {...step(3)} className="flex w-fit items-center gap-3 rounded-2xl border-2 border-primary px-4 py-2.5 text-[15px] font-bold text-white">
          <span className="font-heading text-[30px] leading-none text-primary">{count}</span>
          Found {count} {count === 1 ? 'ex' : 'exes'} still charging you
        </motion.p>

        <motion.div {...step(4)} className="relative flex items-end justify-end pt-10">
          <ThoughtBubble trail="right" tones="text-[#2a1020]" className="absolute left-0 top-0 max-w-[190px]">
            {pick.scanBubble}
          </ThoughtBubble>
          <img src={pick.scan} alt="" width={360} className="h-auto w-[150px] drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]" />
        </motion.div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="mt-4 w-full rounded-[20px] bg-primary px-6 py-4 font-heading text-[18px] font-bold text-primary-foreground shadow-[0_8px_36px_hsl(var(--primary)/0.3)] transition-transform hover:-translate-y-0.5"
      >
        Show me who
      </button>
      <p className="mt-3 rounded-full bg-white/[0.05] px-4 py-2.5 text-[13px] text-white/45">Reading between the lines...</p>
    </div>
  );
}
