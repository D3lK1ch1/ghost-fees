import { useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import LeakTotal from './LeakTotal';
import LeakCard from './LeakCard';
import SubscriptionsSection from './SubscriptionsSection';
import FeedbackPanel from './FeedbackPanel';
import CancelEmailDialog from './CancelEmailDialog';
import { trackEvent } from '@/lib/session';

export default function ResultsView({ analysis, usedSample, onRestart }) {
  const { leaks, subscriptions, total, enoughHistory } = analysis;
  const [emailLeak, setEmailLeak] = useState(null);

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
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:border-white/25"
          >
            Start over
          </button>
        )}
      />

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
        <LeakTotal total={total} months={analysis.monthSpan} />

        {!enoughHistory && (
          <div className="mt-4 rounded-2xl border border-[#ffb37c]/25 bg-[#ffb37c]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#ffb37c]">
            Upload 6+ months to catch price rises.
          </div>
        )}

        {leaks.length ? (
          <div className="mt-4 space-y-3">
            {leaks.map((leak) => (
              <LeakCard key={leak.id} leak={leak} onDraft={() => openEmail(leak)} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-[13px] text-muted-foreground">
            No ghosts found in this statement.
          </p>
        )}

        <SubscriptionsSection subscriptions={subscriptions} />

        <FeedbackPanel usedSample={usedSample} leaksFound={leaks.length} yearlyTotal={total} />
      </main>

      <CancelEmailDialog leak={emailLeak} onClose={() => setEmailLeak(null)} />
    </div>
  );
}