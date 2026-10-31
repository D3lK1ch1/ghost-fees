import { useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import LeakTotal from './LeakTotal';
import EmptyState from './EmptyState';
import LeakCard from './LeakCard';
import SubscriptionsSection from './SubscriptionsSection';
import FeedbackPanel from './FeedbackPanel';
import LeakEmailDialog from './LeakEmailDialog';
import FileErrors from './FileErrors';
import HauntedHouse from './HauntedHouse';
import PossessedReceipt from './PossessedReceipt';
import SiteFooter from '@/components/site/SiteFooter';
import GhostGuide from '@/components/guide/GhostGuide';
import { CardList, CardItem } from '@/components/GhostAnimations';
import { useScan } from '@/lib/ScanContext';
import { trackEvent } from '@/lib/session';
import { cn } from '@/lib/utils';

const VIEWS = [
  { key: 'cards', label: 'Cards' },
  { key: 'house', label: 'Haunted House' },
];

const WINDOWS = [
  { value: 0, label: 'All months' },
  { value: 12, label: 'Last 12 months' },
  { value: 6, label: 'Last 6 months' },
  { value: 3, label: 'Last 3 months' },
];

export default function ResultsView({ analysis, usedSample, onRestart, onSample }) {
  const { leaks, subscriptions, total, enoughHistory } = analysis;
  const { windowMonths, setWindowMonths, fileErrors, fileNames } = useScan();
  const [emailLeak, setEmailLeak] = useState(null);
  const [view, setView] = useState('cards');
  const [guideKey, setGuideKey] = useState('penny');
  const [pulseId, setPulseId] = useState(null);
  const [mostUsefulId, setMostUsefulId] = useState(null);
  const mostUseful = leaks.find((leak) => leak.id === mostUsefulId) || null;

  // Tapping a card (not one of its buttons) marks it as the most useful for feedback.
  const pickCard = (event, leak) => {
    if (event.target.closest('button, a')) return;
    setMostUsefulId((current) => (current === leak.id ? null : leak.id));
  };

  const openEmail = (leak) => {
    trackEvent('cancel_email_clicked');
    setEmailLeak(leak);
  };

  // Guide actions only run after the user taps the button under a reply.
  const onGuideAction = (action, leak) => {
    if (action === 'draft_email' && leak) openEmail(leak);
    if (action === 'open_house') {
      setView('house');
      setTimeout(() => document.getElementById('ghosts')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    if ((action === 'open_leak' || action === 'show_transactions') && leak) {
      setView('cards');
      setPulseId(leak.id);
      setTimeout(() => document.getElementById(`leak-${leak.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      setTimeout(() => setPulseId(null), 2400);
    }
    if (action === 'scroll_feedback') document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <BrandHeader
        right={(
          <button
            type="button"
            onClick={onRestart}
            className="text-[13px] font-bold text-primary underline underline-offset-4"
          >
            Scan another statement
          </button>
        )}
      />

      <main className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-retro text-[15px] uppercase tracking-[0.16em] text-primary/80">The reading</p>
          <label className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
            <span className="sr-only">Statement period</span>
            <select
              value={windowMonths}
              onChange={(event) => setWindowMonths(Number(event.target.value))}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] font-bold text-foreground outline-none focus:border-primary"
            >
              {WINDOWS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {leaks.length ? (
          <LeakTotal
            total={total}
            months={analysis.monthSpan}
            from={analysis.firstDate}
            to={analysis.lastDate}
            monthlyIncome={analysis.monthlyIncome}
            leakCount={leaks.length}
            fileNames={fileNames}
          />
        ) : (
          <EmptyState fileNames={fileNames} onRestart={onRestart} onSample={onSample} />
        )}

        <FileErrors errors={fileErrors} />

        {!enoughHistory && (
          <div className="mt-4 rounded-2xl border border-[#ffb37c]/25 bg-[#ffb37c]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#ffb37c]">
            Upload at least 3 months to catch subscriptions and price rises.
          </div>
        )}

        {leaks.length ? (
          <>
            <div id="ghosts" className="mt-6 flex scroll-mt-6 flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {leaks.length} {leaks.length === 1 ? 'ghost' : 'ghosts'}, biggest first
              </h2>
              <div className="flex rounded-full border border-border bg-card/60 p-0.5">
                {VIEWS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setView(item.key)}
                    className={cn(
                      'rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors',
                      view === item.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {view === 'house' ? (
              <HauntedHouse leaks={leaks} onDraft={openEmail} monthlyIncome={analysis.monthlyIncome} guideKey={guideKey} onGuide={setGuideKey} />
            ) : (
              <CardList className="mt-4 grid gap-3 sm:grid-cols-2">
                {leaks.map((leak, index) => (
                  <CardItem key={leak.id} index={index}>
                    <div
                      id={`leak-${leak.id}`}
                      onClick={(event) => pickCard(event, leak)}
                      className={cn(
                        'relative h-full cursor-pointer rounded-3xl transition-shadow duration-500',
                        mostUsefulId === leak.id && 'shadow-[0_0_0_3px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.35)]',
                        pulseId === leak.id && 'animate-pulse shadow-[0_0_0_3px_hsl(var(--primary))]',
                      )}
                    >
                      {mostUsefulId === leak.id && (
                        <span className="absolute -top-2.5 left-4 z-10 animate-poof rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
                          Most useful
                        </span>
                      )}
                      <LeakCard leak={leak} onDraft={() => openEmail(leak)} />
                    </div>
                  </CardItem>
                ))}
              </CardList>
            )}
          </>
        ) : null}

        <PossessedReceipt leaks={leaks} />

        <SubscriptionsSection subscriptions={subscriptions} />

        <div id="feedback" className="scroll-mt-6">
          <FeedbackPanel usedSample={usedSample} leaksFound={leaks.length} yearlyTotal={total} mostUseful={mostUseful} />
        </div>
      </main>

      <SiteFooter />

      <LeakEmailDialog leak={emailLeak} onClose={() => setEmailLeak(null)} />

      <GhostGuide analysis={analysis} guideKey={guideKey} onGuide={setGuideKey} onAction={onGuideAction} />
    </div>
  );
}