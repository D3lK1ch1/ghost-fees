import { useMemo, useState } from 'react';
import BrandHeader from '@/components/site/BrandHeader';
import LeakTotal from './LeakTotal';
import LeakCard from './LeakCard';
import FeedbackPanel from './FeedbackPanel';
import CancelEmailDialog from './CancelEmailDialog';
import { buildLeaks } from '@/lib/ghostFees/leaks';
import { trackEvent } from '@/lib/session';

export default function ResultsView({ analysis, usedSample, onRestart }) {
  const leaks = useMemo(() => buildLeaks(analysis), [analysis]);
  const total = useMemo(() => leaks.reduce((sum, leak) => sum + leak.yearlyCost, 0), [leaks]);
  const [selectedId, setSelectedId] = useState(null);
  const [emailLeak, setEmailLeak] = useState(null);

  const selectedLeak = leaks.find((leak) => leak.id === selectedId) || null;

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
            New scan
          </button>
        )}
      />

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
        <LeakTotal total={total} count={leaks.length} />

        {leaks.length ? (
          <div className="mt-4 space-y-3">
            {leaks.map((leak) => (
              <LeakCard
                key={leak.id}
                leak={leak}
                selected={leak.id === selectedId}
                onSelect={() => setSelectedId(leak.id === selectedId ? null : leak.id)}
                onDraft={() => openEmail(leak)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-[13px] leading-relaxed text-muted-foreground">
            No ghosts in this one. Try a statement with at least three months of history.
          </p>
        )}

        {!analysis.enoughHistory && (
          <div className="mt-4 rounded-2xl border border-[#ffb37c]/25 bg-[#ffb37c]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#ffb37c]">
            Subscriptions and price creep need at least three months of history, so this is bank fees only.
          </div>
        )}

        <FeedbackPanel
          usedSample={usedSample}
          leaks={leaks}
          yearlyTotal={total}
          selectedLeak={selectedLeak}
        />
      </main>

      <CancelEmailDialog subscription={emailLeak} onClose={() => setEmailLeak(null)} />
    </div>
  );
}