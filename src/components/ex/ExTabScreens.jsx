import { useSavedChoice } from '@/hooks/use-saved-choice';
import { useGhostList } from '@/hooks/use-ghost-list';
import { EX_GHOST_KEY, EX_GHOSTS, EX_PICKS } from '@/lib/ghostFees/exArt';
import { glowUp, monthlyOf } from '@/lib/ghostFees/exJourney';
import { ExCheckin, ExComesBack, ExGlowupPlan, ExSplurge, ExWeekend } from './ExAct2';

// The 💔 design screen for each results tab, so every tab in My Ex Ghosted Me looks
// like the design while keeping the same features underneath:
//   Goal path        > design 9 Glow-up plan (I'm Fine: power-on plan) + 10 Weekend away
//   Calendar         > design 11 Monthly check-in
//   Email templates  > design 8 The ex comes back (refund message ready to send)
//   Possessed receipt> design FineSplurge, What your exes paid for
// All numbers come from the scan and the exes you blocked (the Ghost List).
export default function ExTabScreens({ tab, subscriptions, avatarFor, onUpload }) {
  const [pickKey] = useSavedChoice(EX_GHOST_KEY, EX_GHOSTS, 'heartbroken');
  const pick = EX_PICKS[pickKey];
  const [ghostList] = useGhostList();
  const blockedIds = new Set(ghostList.filter((item) => item.status !== 'charging').map((item) => item.id));
  const glow = glowUp(subscriptions, blockedIds);
  const biggest = [...subscriptions].sort((a, b) => b.monthly - a.monthly)[0];
  const firstBlocked = subscriptions.find((item) => blockedIds.has(item.id)) || biggest;
  if (!subscriptions.length) return null;

  const row = (children) => <div className="mb-6 mt-4 grid justify-center gap-6 xl:grid-cols-2">{children}</div>;

  if (tab === 'path') {
    return row(
      <>
        <ExGlowupPlan pick={pick} pickKey={pickKey} glow={glow} blockedCount={glow.blockedCount} monthlyIfAll={monthlyOf(subscriptions)} label="Your glow-up" />
        <ExWeekend pick={pick} pickKey={pickKey} glow={glow.fund > 0 ? glow : { ...glow, fund: monthlyOf(subscriptions) * 12 }} biggest={firstBlocked} preview={glow.fund <= 0} />
      </>,
    );
  }
  if (tab === 'calendar') return row(<ExCheckin pick={pick} pickKey={pickKey} blockedCount={glow.blockedCount} onUpload={onUpload} />);
  if (tab === 'emails') return row(<ExComesBack pick={pick} pickKey={pickKey} ex={firstBlocked} label="If an ex charges you after you cancel" />);
  if (tab === 'receipt') return row(<ExSplurge pick={pick} subscriptions={subscriptions} avatarFor={avatarFor} />);
  return null;
}
