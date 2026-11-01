import { motion, useReducedMotion } from 'framer-motion';
import { money } from '@/lib/ghostFees/format';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { EX_GHOST_KEY, EX_GHOSTS, EX_PICKS, exAvatar } from '@/lib/ghostFees/exArt';
import GhostTip from './GhostTip';

// My Ex Ghosted Me: "Unread messages from your exes".
// One message per real subscription, with the real monthly price. Kind jokes only.
export default function ExStory({ theme, subscriptions = [], onSkip, onMoveOn }) {
  const reduce = useReducedMotion();
  const [pickKey] = useSavedChoice(EX_GHOST_KEY, EX_GHOSTS, 'heartbroken');
  const pick = EX_PICKS[pickKey];
  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const shown = subscriptions.slice(0, 5);
  const more = subscriptions.length - shown.length;

  const enter = (index) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.35 + index * 0.45, duration: reduce ? 0.2 : 0.4 },
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto mt-4 w-full max-w-3xl overflow-hidden rounded-3xl border border-primary/30 bg-card/70 p-4 sm:p-5"
      aria-label={theme.storyTitle}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-[18px] font-bold text-foreground">
            Unread messages
            <span className="rounded-full bg-primary px-2 py-0.5 text-[12px] font-bold text-primary-foreground">{subscriptions.length}</span>
          </h2>
          <p className="text-[12.5px] text-muted-foreground">from your exes</p>
        </div>
        <button type="button" onClick={onSkip} className="text-[12px] font-bold text-muted-foreground underline-offset-4 hover:underline">
          Skip
        </button>
      </div>

      <div className="mt-1 flex items-center justify-end gap-1">
        <p className="rounded-[18px] bg-white px-3.5 py-2 text-[13px] font-extrabold text-[#2a1020] shadow-lg">{pick.shout}</p>
        <img src={pick.shocked} alt="" width={360} className="h-auto w-[96px] sm:w-[120px]" />
      </div>

      <div className="mt-2 rounded-[26px] border border-border bg-background/70 p-3">
        <div className="flex items-center gap-2.5 border-b border-border pb-2.5">
          <div className="flex -space-x-2">
            {shown.slice(0, 3).map((item) => (
              <GhostTip key={item.id} side="bottom" align="start" biggest={item.id === subscriptions[0]?.id} label={item.merchant} detail={`${money(item.monthly)} a month · ${money(item.monthly * 12)} a year`}>
                <img src={exAvatar(item.merchant)} alt={item.merchant} width={28} height={28} className="h-7 w-7 rounded-full ring-2 ring-background" />
              </GhostTip>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-foreground">The Exes</div>
            <div className="text-[11px] text-muted-foreground">{subscriptions.length} members · all still charging</div>
          </div>
          <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{subscriptions.length} new</span>
        </div>

        <ul className="mt-2.5 space-y-2.5">
          {shown.map((item, index) => {
            const line = theme.lines.find((entry) => entry.match.test(item.merchant))?.text || theme.fallbackLine;
            return (
              <motion.li key={item.id} {...enter(index)} className="flex items-end gap-2">
                <GhostTip className="shrink-0" align="start" biggest={item.id === subscriptions[0]?.id} label={item.merchant} detail={`${money(item.monthly)} a month · ${money(item.monthly * 12)} a year`}>
                  <img src={exAvatar(item.merchant)} alt={item.merchant} width={28} height={28} className="h-7 w-7 rounded-full" />
                </GhostTip>
                <div className="max-w-[85%]">
                  <div className="pl-1 text-[11px] font-bold text-primary">{item.merchant}</div>
                  <div className="rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-[13px] text-foreground">
                    {line}{!line.includes('$') && <span className="font-bold text-primary"> {money(item.monthly)}/mo</span>}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
        {more > 0 && <p className="mt-2 text-center text-[11.5px] text-muted-foreground">+ {more} more {more === 1 ? 'ex' : 'exes'} typing...</p>}
      </div>

      {monthly > 0 && (
        <motion.div {...enter(shown.length)} className="mt-3 rounded-2xl border border-[#5ee6c8]/40 bg-[#5ee6c8]/[0.08] px-4 py-3 text-[13.5px] leading-relaxed text-foreground">
          Cut them loose and that&apos;s <span className="font-heading text-[18px] font-bold text-[#5ee6c8]">{money(monthly * 12)}</span> a year back for brunch, travel or your savings.
        </motion.div>
      )}

      <button
        type="button"
        onClick={onMoveOn}
        className="mt-3 w-full rounded-2xl bg-primary px-5 py-3 text-[15px] font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
      >
        Help me move on
      </button>
    </motion.section>
  );
}
