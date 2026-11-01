import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { money } from '@/lib/ghostFees/format';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { EX_GHOST_KEY, EX_GHOSTS, EX_PICKS, EX_SHOUT_BUBBLE, exAvatar } from '@/lib/ghostFees/exArt';
import GhostTip from './GhostTip';

// My Ex Ghosted Me: "Unread messages from your exes", laid out like the Ex3Reveal
// design: a shocked ghost and shout bubble, then a phone showing The Exes group chat
// with one message per real subscription and its real monthly price. Kind jokes only.
export default function ExStory({ theme, subscriptions = [], onSkip, onMoveOn, avatarFor }) {
  const reduce = useReducedMotion();
  const [pickKey] = useSavedChoice(EX_GHOST_KEY, EX_GHOSTS, 'heartbroken');
  const [replay, setReplay] = useState(0);
  const pick = EX_PICKS[pickKey];
  const avatar = avatarFor || exAvatar;
  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const shown = subscriptions.slice(0, 5);
  const more = subscriptions.length - shown.length;
  const tip = (item) => `${money(item.monthly)} a month · ${money(item.monthly * 12)} a year`;

  const enter = (index) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 },
    transition: { delay: reduce ? 0 : 0.4 + index * 0.5, duration: reduce ? 0.2 : 0.4 },
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative mx-auto mt-4 w-full max-w-[460px] px-1"
      aria-label={theme.storyTitle}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2.5 font-heading text-[30px] font-bold leading-none text-foreground">
            Unread messages
            <span className="grid h-8 min-w-8 place-items-center rounded-full bg-primary px-2 text-[16px] font-bold text-primary-foreground">{subscriptions.length}</span>
          </h2>
          <p className="mt-2 text-[16px] text-muted-foreground">from your exes</p>
        </div>
        <img src={pick.shocked} alt="" width={360} className="-mt-2 h-auto w-[104px] shrink-0 drop-shadow-[0_0_24px_hsl(var(--primary)/0.35)]" />
      </div>

      <div className="-mt-4 flex items-center gap-3">
        <p
          className="flex h-[92px] w-[250px] shrink-0 items-center justify-center bg-[length:100%_100%] bg-center bg-no-repeat px-12 pt-1 text-center font-heading text-[14px] font-bold leading-tight text-[#1b1820]"
          style={{ backgroundImage: `url(${EX_SHOUT_BUBBLE})` }}
        >
          {pick.shout}
        </p>
        <button
          type="button"
          onClick={() => setReplay((count) => count + 1)}
          aria-label="Replay the messages"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-card/70 text-foreground hover:border-primary/60"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button type="button" onClick={onSkip} className="ml-auto text-[12px] font-bold text-muted-foreground underline-offset-4 hover:underline">
          Skip
        </button>
      </div>

      {/* The phone */}
      <div className="mx-auto mt-4 w-full max-w-[340px] rounded-[48px] bg-gradient-to-b from-[#f2f2f5] via-[#b9b9c2] to-[#e9e9ee] p-[5px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="rounded-[43px] bg-[#141218] px-3 pb-3 pt-3">
          <div className="mx-auto h-6 w-28 rounded-full bg-black" aria-hidden="true" />

          <div className="mt-3 flex items-center gap-2.5 border-b border-white/10 px-1 pb-3">
            <div className="flex -space-x-3">
              {shown.slice(0, 3).map((item) => (
                <img key={item.id} src={avatar(item.merchant)} alt="" width={36} height={36} className="object-contain h-9 w-9" />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-heading text-[16px] font-bold leading-tight text-white">The Exes</div>
              <div className="text-[12px] leading-snug text-white/60">{subscriptions.length} members · all still charging</div>
            </div>
            <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[12px] font-bold text-primary-foreground">{subscriptions.length} new</span>
          </div>

          <ul key={replay} className="mt-3 space-y-2.5">
            {shown.map((item, index) => {
              const line = theme.lines.find((entry) => entry.match.test(item.merchant))?.text || theme.fallbackLine;
              return (
                <motion.li key={item.id} {...enter(index)} className="flex items-end gap-2">
                  <GhostTip className="shrink-0" align="start" biggest={item.id === subscriptions[0]?.id} label={item.merchant} detail={tip(item)}>
                    <img src={avatar(item.merchant)} alt={item.merchant} width={34} height={34} className="object-contain h-[34px] w-[34px]" />
                  </GhostTip>
                  <div className="min-w-0 flex-1">
                    <div className="pl-1 text-[12px] font-bold text-primary">{item.merchant}</div>
                    <div className="rounded-2xl rounded-bl-md bg-white/[0.08] px-3 py-2 text-[13.5px] leading-snug text-white">
                      {line}
                      {!line.includes('$') && <span className="font-bold text-primary"> {money(item.monthly)}/mo</span>}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
          {more > 0 && <p className="mt-2 text-center text-[12px] text-white/45">+ {more} more {more === 1 ? 'ex' : 'exes'} typing...</p>}

          <div className="mt-3 flex items-center justify-between rounded-full bg-white/[0.07] px-4 py-2.5">
            <span className="text-[13px] text-white/45">Reply to your exes...</span>
            <button type="button" onClick={onMoveOn} className="text-[13px] font-bold text-primary hover:underline">
              Block all
            </button>
          </div>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/50" aria-hidden="true" />
        </div>
      </div>

      {monthly > 0 && (
        <motion.div {...enter(shown.length)} className="mt-5 rounded-[22px] border border-[#5ee6c8]/60 bg-[#173b33] px-5 py-4 text-[15px] leading-relaxed text-white">
          Cut them loose and that&apos;s <span className="font-heading text-[24px] font-bold text-[#5ee6c8]">{money(monthly * 12)}</span> a year back.
        </motion.div>
      )}

      <button
        type="button"
        onClick={onMoveOn}
        className="mt-3 w-full rounded-[20px] bg-primary px-6 py-4 font-heading text-[18px] font-bold text-primary-foreground shadow-[0_8px_36px_hsl(var(--primary)/0.3)] transition-transform hover:-translate-y-0.5"
      >
        Help me move on
      </button>
    </motion.section>
  );
}
