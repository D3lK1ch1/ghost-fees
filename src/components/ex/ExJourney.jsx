import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useSavedChoice } from '@/hooks/use-saved-choice';
import { useGhostList } from '@/hooks/use-ghost-list';
import { EX_GHOST_KEY, EX_GHOSTS, EX_PICKS } from '@/lib/ghostFees/exArt';
import { glowUp } from '@/lib/ghostFees/exJourney';
import ExStory from '@/components/results/ExStory';
import ExScanChat from './ExScanChat';
import ExMovingOn from './ExMovingOn';
import ExBlockedChat from './ExBlockedChat';
import ExInboxZero from './ExInboxZero';
import { ExCheckin, ExComesBack, ExGlowupPlan, ExWeekend } from './ExAct2';
import { Screen } from './ExKit';

// My Ex Ghosted Me story mode, Act 1 of the design, one phone screen at a time:
// scanning chat > Unread messages > Moving on > Blocked chat per ex > Inbox zero,
// then Act 2: the ex comes back > glow-up plan > weekend away > monthly check-in.
// Same features as the other themes underneath: blocking an ex adds it to the Ghost
// List (this browser only), cancel steps and links are the official ones, and every
// number comes from the scan. The full results stay below under See everything.
export default function ExJourney({ theme, analysis, fileName, avatarFor, onSeeAll, onUpload }) {
  const { subscriptions, leaks } = analysis;
  const [pickKey] = useSavedChoice(EX_GHOST_KEY, EX_GHOSTS, 'heartbroken');
  const pick = EX_PICKS[pickKey];
  const [ghostList, setGhostList] = useGhostList();
  const [scene, setScene] = useState('scan');
  const [exId, setExId] = useState(null);
  const [history, setHistory] = useState([]);

  const blocked = useMemo(
    () => new Set(ghostList.filter((item) => item.status !== 'charging').map((item) => item.id)),
    [ghostList],
  );
  const glow = glowUp(subscriptions, blocked);
  const priceRiseIds = useMemo(() => new Set(leaks.filter((leak) => leak.priceRise).map((leak) => leak.id)), [leaks]);
  const ex = subscriptions.find((item) => item.id === exId);
  // The biggest ex you blocked stars in Act 2 (subscriptions are sorted biggest first).
  const firstBlocked = subscriptions.find((item) => blocked.has(item.id));

  const go = (next, id = null) => {
    setHistory((list) => [...list, { scene, exId }]);
    setScene(next);
    setExId(id);
    window.requestAnimationFrame(() => document.getElementById('ex-story')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const back = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setHistory((list) => list.slice(0, -1));
    setScene(last.scene);
    setExId(last.exId);
  };

  const block = (item) => {
    setGhostList((current) => (
      current.some((entry) => entry.id === item.id)
        ? current.map((entry) => (entry.id === item.id && entry.status === 'charging' ? { ...entry, status: 'requested' } : entry))
        : [...current, { id: item.id, merchant: item.merchant, monthly: item.monthly, status: 'requested', date: new Date().toISOString() }]
    ));
    go('blocked', item.id);
  };
  const nextEx = () => {
    const remaining = subscriptions.filter((item) => !blocked.has(item.id));
    go(remaining.length ? 'moving' : 'clear');
  };

  if (!subscriptions.length) return null;

  return (
    <section id="ex-story" className="mx-auto mt-2 w-full max-w-[460px] scroll-mt-4" aria-label="My Ex Ghosted Me story">
      <div className="mb-3 flex items-center justify-between">
        {history.length > 0 ? (
          <button type="button" onClick={back} className="inline-flex items-center gap-1 text-[13px] font-bold text-white/70 hover:text-white">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        ) : <span />}
        <button type="button" onClick={onSeeAll} className="text-[13px] font-bold text-white/60 underline underline-offset-4 hover:text-white">
          See everything
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${scene}-${exId || ''}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {scene === 'scan' && <ExScanChat pick={pick} pickKey={pickKey} count={subscriptions.length} fileName={fileName} sample={fileName === 'sample-statement.csv'} onUpload={onUpload} onNext={() => go('reveal')} />}
          {scene === 'reveal' && (
            <Screen className="px-4 pb-6 pt-5">
              <ExStory theme={theme} subscriptions={subscriptions} avatarFor={avatarFor} onSkip={() => go('moving')} onMoveOn={() => go('moving')} />
            </Screen>
          )}
          {scene === 'moving' && (
            <ExMovingOn
              theme={theme}
              pick={pick}
              pickKey={pickKey}
              subscriptions={subscriptions}
              glow={glow}
              blocked={blocked}
              ghostList={ghostList}
              avatarFor={avatarFor}
              priceRiseIds={priceRiseIds}
              onBlock={block}
              onDone={() => go('clear')}
            />
          )}
          {scene === 'blocked' && ex && (
            <ExBlockedChat theme={theme} pick={pick} pickKey={pickKey} ex={ex} glow={glow} avatarFor={avatarFor} onNext={nextEx} />
          )}
          {scene === 'clear' && (
            <ExInboxZero pick={pick} pickKey={pickKey} glow={glow} total={subscriptions.length} onSeeAll={onSeeAll} onBack={() => go('moving')} onNext={glow.blockedCount ? () => go('back') : null} />
          )}
          {scene === 'back' && firstBlocked && <ExComesBack pick={pick} pickKey={pickKey} ex={firstBlocked} onNext={() => go('plan')} />}
          {scene === 'plan' && <ExGlowupPlan pick={pick} pickKey={pickKey} glow={glow} blockedCount={glow.blockedCount} onNext={() => go('weekend')} />}
          {scene === 'weekend' && <ExWeekend pick={pick} pickKey={pickKey} glow={glow} biggest={firstBlocked} onNext={() => go('checkin')} />}
          {scene === 'checkin' && (
            <ExCheckin pick={pick} pickKey={pickKey} blockedCount={glow.blockedCount} onUpload={onUpload} onSeeAll={onSeeAll} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
