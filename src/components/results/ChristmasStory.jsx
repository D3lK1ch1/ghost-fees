import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import SeasonToggle from '@/components/site/SeasonToggle';
import { SpeechBubble } from '@/components/site/Bubbles';
import { money } from '@/lib/ghostFees/format';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { SEASON_KEY, SEASONS, XMAS, xmasAvatar } from '@/lib/ghostFees/christmasArt';

// The Ghosts of Christmas: Jacob Ledger, then the ghosts of Past, Present and
// Yet to Come, then Christmas morning. One stave at a time, real numbers only.
// A stave with no real figure behind it is left out.
export default function ChristmasStory({ subscriptions = [], leaks = [], leaksTotal = 0, onSkip, onMoveOn }) {
  const reduce = useReducedMotion();
  const [season, setSeason] = useSavedChoice(SEASON_KEY, SEASONS, 'winter');
  const [step, setStep] = useState(0);
  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const hasSubs = monthly > 0;

  const staves = [
    hasSubs && 'jacob',
    leaksTotal > 0 && 'past',
    hasSubs && 'present',
    hasSubs && 'future',
    'morning',
  ].filter(Boolean);
  const stave = staves[Math.min(step, staves.length - 1)];
  const next = () => setStep((value) => Math.min(value + 1, staves.length - 1));

  const kicker = 'text-[11px] font-bold uppercase tracking-[0.14em] text-[#e8563f]';
  const title = 'mt-1 font-heading text-[20px] font-bold leading-tight text-foreground';
  const art = 'h-auto w-[130px] shrink-0 sm:w-[150px]';

  const screens = {
    jacob: {
      cta: 'Meet the first ghost',
      body: (
        <>
          <p className={kicker}>The first visitor</p>
          <h3 className={title}>Jacob Ledger</h3>
          <div className="mt-3 flex items-start gap-3">
            <img src={XMAS.jacob} alt="Jacob Ledger, a weary ghost wrapped in a chain of receipts" width={320} className={art} />
            <div className="space-y-2">
              <SpeechBubble>I wear the chain I forged in life. Every link an auto-renew.</SpeechBubble>
              <SpeechBubble>Three ghosts will show you what they cost.</SpeechBubble>
            </div>
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {subscriptions.slice(0, 8).map((item) => (
              <li key={item.id} className="flex flex-col items-center rounded-xl bg-[#fbf3e4] px-1.5 py-2 text-center text-[#14301f] shadow">
                <img src={xmasAvatar(item.merchant, season)} alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
                <span className="mt-1 line-clamp-1 text-[11px] font-bold">{item.merchant}</span>
                <span className="text-[11px] font-bold text-[#c0392b]">{money(item.monthly)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-center text-[13px] text-muted-foreground">
            {subscriptions.length} {subscriptions.length === 1 ? 'link' : 'links'}. <span className="font-bold text-primary">{money(monthly)}</span> every month.
          </p>
        </>
      ),
    },
    past: {
      cta: hasSubs ? 'Next ghost' : 'Wake up',
      body: (
        <>
          <p className={kicker}>Stave one · The past</p>
          <h3 className={title}>Dusty, the Ghost of Fees Past</h3>
          <div className="mt-3 flex items-start gap-3">
            <img src={XMAS.dusty} alt="Dusty, a candle ghost reading an old ledger" width={320} className={art} />
            <div className="space-y-2">
              <SpeechBubble>I am the Ghost of Fees Past.</SpeechBubble>
              <SpeechBubble>Long past? No. Your past, from this statement.</SpeechBubble>
            </div>
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {leaks.slice(0, 3).map((leak) => (
              <li key={leak.id} className="rounded-xl bg-[#fbf3e4] px-2 py-2 text-[#14301f] shadow">
                <span className="block rounded-md bg-[#1f5c3a] px-1.5 py-1 text-center text-[10.5px] font-bold text-white">{leak.badge}</span>
                <span className="mt-1.5 block line-clamp-2 text-[11.5px] font-bold">{leak.title || leak.merchant}</span>
                <span className="text-[11px] font-bold text-[#c0392b]">{money(leak.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-2xl border border-[#5ee6c8]/40 bg-[#5ee6c8]/[0.08] px-4 py-3">
            <div className="font-heading text-[26px] font-bold text-primary">{money(leaksTotal)}</div>
            <div className="text-[12.5px] text-foreground">already lost to the leaks in your statement</div>
            <div className="text-[11.5px] text-muted-foreground">These can&apos;t be undone, but some can be refunded.</div>
          </div>
        </>
      ),
    },
    present: {
      cta: 'And next year?',
      body: (
        <>
          <p className={kicker}>Stave two · The present</p>
          <h3 className={title}>Jolly, the Ghost of Subscriptions Present</h3>
          <div className="mt-3 flex items-start gap-3">
            <div className="space-y-2">
              <SpeechBubble>Come in, and know me better, friend! Every dish is something you pay for.</SpeechBubble>
            </div>
            <img src={XMAS.jolly} alt="Jolly, a cheerful ghost in a patchwork robe holding a torch" width={320} className={`${art} ml-auto`} />
          </div>
          <ul className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border-t-4 border-dashed border-[#c0392b] bg-[#5a3a24] p-3">
            {subscriptions.slice(0, 6).map((item) => (
              <li key={item.id} className="flex flex-col items-center text-center">
                <span className="h-5 w-14 rounded-[50%] bg-[#efe6d8] shadow-inner" aria-hidden="true" />
                <span className="mt-1 rounded bg-[#fbf3e4] px-1.5 py-0.5 text-[10.5px] font-bold text-[#14301f]">
                  {item.merchant} <span className="text-[#c0392b]">{money(item.monthly)}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center font-heading text-[26px] font-bold text-primary">{money(monthly)} a month</p>
          <p className="text-center text-[12.5px] text-muted-foreground">charging right now.</p>
        </>
      ),
    },
    future: {
      cta: 'Change the future',
      body: (
        <>
          <p className={kicker}>Stave three · The future</p>
          <h3 className={title}>The Hooded One, Ghost of Subscriptions Yet to Come</h3>
          <div className="mt-3 flex items-start gap-3">
            <img src={XMAS.hooded} alt="The Hooded One, a silent cloaked ghost holding a lantern" width={320} className={art} />
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Next 12 months</p>
              <SpeechBubble side="right">Spirit, is this my future? Can I still change it?</SpeechBubble>
              <p className="text-[11.5px] italic text-muted-foreground">He never speaks. He shows you next year: every month you keep paying drops into the stocking.</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-primary/30 bg-background/60 px-4 py-3 font-heading text-[18px] font-bold text-foreground">
            {money(monthly * 12)} over the next 12 months if nothing changes.
          </div>
        </>
      ),
    },
    morning: {
      cta: 'Show me what to cancel',
      body: (
        <>
          <img src={XMAS.morning(season)} alt="Christmas morning, with coins falling like snow" width={720} className="h-[180px] w-full rounded-2xl object-cover sm:h-[220px]" />
          <h3 className="mt-3 text-center font-heading text-[22px] font-bold text-[#5ee6c8]">It is not too late to change the ending.</h3>
          {hasSubs && (
            <p className="mt-1 text-center text-[15px] font-bold text-primary">Cancel what you don&apos;t use and keep up to {money(monthly * 12)} a year.</p>
          )}
        </>
      ),
    },
  };

  const screen = screens[stave];
  const isLast = stave === 'morning';

  return (
    <section className="mx-auto mt-4 w-full max-w-3xl overflow-hidden rounded-3xl border border-primary/30 bg-card/70 p-4 sm:p-5" aria-label="The Ghosts of Christmas">
      <div className="flex items-center justify-between gap-3">
        <SeasonToggle season={season} setSeason={setSeason} />
        <button type="button" onClick={onSkip} className="text-[12px] font-bold text-muted-foreground underline-offset-4 hover:underline">
          Skip
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stave}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: reduce ? 0.15 : 0.35 }}
          className="mt-4"
        >
          {screen.body}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
        {staves.map((key) => (
          <span key={key} className={`h-1.5 flex-1 rounded-full ${key === stave ? 'bg-primary' : 'bg-border'}`} />
        ))}
      </div>
      <button
        type="button"
        onClick={isLast ? onMoveOn : next}
        className="mt-3 w-full rounded-2xl bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
      >
        {screen.cta}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">General information about subscriptions, not financial advice.</p>
    </section>
  );
}