import { useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import LeakTotal from './LeakTotal';
import LeakCard from './LeakCard';
import SubscriptionsSection from './SubscriptionsSection';
import FeedbackPanel from './FeedbackPanel';
import LeakEmailDialog from './LeakEmailDialog';
import HauntedHouse from './HauntedHouse';
import SiteFooter from '@/components/site/SiteFooter';
import { CardList, CardItem } from '@/components/GhostAnimations';
import { trackEvent } from '@/lib/session';
import { cn } from '@/lib/utils';

const VIEWS = [
  { key: 'cards', label: 'Cards' },
  { key: 'house', label: 'Haunted House' },
];

export default function ResultsView({ analysis, usedSample, onRestart }) {
  const { leaks, subscriptions, total, enoughHistory } = analysis;
  const [emailLeak, setEmailLeak] = useState(null);
  const [view, setView] = useState('cards');

  const openEmail = (leak) => {
    trackEvent('cancel_email_clicked');
    setEmailLeak(leak);
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
        <LeakTotal
          total={total}
          months={analysis.monthSpan}
          from={analysis.firstDate}
          to={analysis.lastDate}
          monthlyIncome={analysis.monthlyIncome}
        />

        {!enoughHistory && (
          <div className="mt-4 rounded-2xl border border-[#ffb37c]/25 bg-[#ffb37c]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#ffb37c]">
            Upload 6+ months to catch price rises.
          </div>
        )}

        {leaks.length ? (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
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
              <HauntedHouse leaks={leaks} onDraft={openEmail} />
            ) : (
              <CardList className="mt-4 grid gap-3 sm:grid-cols-2">
                {leaks.map((leak, index) => (
                  <CardItem key={leak.id} index={index}>
                    <LeakCard leak={leak} onDraft={() => openEmail(leak)} />
                  </CardItem>
                ))}
              </CardList>
            )}
          </>
        ) : (
          <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-[13px] text-muted-foreground">
            No ghosts found in this statement.
          </p>
        )}

        <SubscriptionsSection subscriptions={subscriptions} />

        <FeedbackPanel usedSample={usedSample} leaksFound={leaks.length} yearlyTotal={total} />
      </main>

      <SiteFooter />

      <LeakEmailDialog leak={emailLeak} onClose={() => setEmailLeak(null)} />
    </div>
  );
}