import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { money } from '@/lib/ghostFees/format';
import { useTheme } from '@/lib/ThemeContext';
import ExStory from './ExStory';

// A short animated story at the top of the results, skinned by the theme.
// Uses only real numbers from the analysis. Haunted has its own house, so no story here.
export default function ThemeStory({ subscriptions = [], leaksTotal = 0, onMoveOn }) {
  const { theme } = useTheme();
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();

  if (hidden || (theme.key !== 'ex' && theme.key !== 'christmas')) return null;
  if (theme.key === 'ex') return <ExStory theme={theme} subscriptions={subscriptions} onSkip={() => setHidden(true)} onMoveOn={onMoveOn} />;

  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const enter = (index) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.35 + index * 0.55, duration: reduce ? 0.2 : 0.45 },
  });

  return (
    <AnimatePresence>
      <motion.section
        key={theme.key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto mt-4 w-full max-w-3xl rounded-3xl border border-primary/30 bg-card/70 p-4 sm:p-5"
        aria-label={theme.storyTitle}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-[16px] font-semibold text-foreground">{theme.emoji} {theme.storyTitle}</h2>
          <button type="button" onClick={() => setHidden(true)} className="text-[12px] font-bold text-muted-foreground underline-offset-4 hover:underline">
            Skip
          </button>
        </div>

        {theme.key === 'christmas' && (
          <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
            {theme.ghosts.map((ghost, index) => {
              const value = { past: leaksTotal, present: monthly, future: monthly * 12 }[ghost.key];
              if (!value) return null; // leave a panel out rather than show a made-up figure
              return (
                <motion.div key={ghost.key} {...enter(index)} className="rounded-2xl bg-primary/[0.08] px-3.5 py-3">
                  <div className="text-[22px]" aria-hidden="true">{ghost.emoji}</div>
                  <div className="mt-1 text-[12px] font-bold text-primary">{ghost.name}</div>
                  <div className="mt-1 font-heading text-[1.4rem] font-bold tabular-nums text-foreground">{money(value)}</div>
                  <div className="text-[11.5px] leading-snug text-muted-foreground">{ghost.caption}</div>
                </motion.div>
              );
            })}
            <motion.p {...enter(3)} className="text-[12.5px] font-semibold text-foreground sm:col-span-3">{theme.outro}</motion.p>
          </div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
