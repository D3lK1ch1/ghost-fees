import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Sparkles } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import SummaryCard from '@/components/results/SummaryCard';
import ResultSection from '@/components/results/ResultSection';
import ResultRow from '@/components/results/ResultRow';
import CancelEmailDialog from '@/components/results/CancelEmailDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useScan } from '@/lib/ScanContext';
import { totalsFor } from '@/lib/ghostFees/analyse';
import { money, moneyWhole, monthRangeLabel, monthsLabel, shortDate } from '@/lib/ghostFees/format';

export default function Results() {
  const navigate = useNavigate();
  const { results, reset } = useScan();
  const [hidden, setHidden] = useState(() => new Set());
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [emailTarget, setEmailTarget] = useState(null);

  const totals = useMemo(() => (results ? totalsFor(results, hidden) : null), [results, hidden]);

  useEffect(() => {
    if (!results) navigate('/', { replace: true });
  }, [results, navigate]);

  useEffect(() => {
    if (!results) return undefined;
    let alive = true;
    const top = results.subscriptions[0] || results.fees[0] || null;
    setSummaryLoading(true);

    base44.functions
      .invoke('summariseLeaks', {
        total: results.totals.total,
        topMerchant: top?.merchant || '',
        topCost: top?.yearlyCost || 0,
        count: results.subscriptions.length + results.fees.length,
      })
      .then((response) => {
        if (alive) setSummary(response?.data?.summary || '');
      })
      .catch(() => {
        if (alive) setSummary('');
      })
      .finally(() => {
        if (alive) setSummaryLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [results]);

  if (!results || !totals) return null;

  const toggle = (id) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const monthsText = monthsLabel(Math.max(results.monthsCovered, 1));
  const monthWord = monthsText === '1' ? 'month' : 'months';
  const rangeLabel = monthRangeLabel(results.range.from, results.range.to);

  return (
    <div className="min-h-screen">
      <BrandHeader
        right={(
          <Link
            to="/"
            onClick={reset}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:border-white/25"
          >
            New scan
          </Link>
        )}
      />

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
        <SummaryCard
          totals={totals}
          counts={{
            subscriptions: results.subscriptions.length,
            fees: results.fees.length,
            creep: results.priceCreeps.length,
          }}
          rangeLabel={rangeLabel}
        />

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3.5">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[13px] leading-relaxed text-white/85">
            {summaryLoading ? 'Reading the receipts…' : summary || 'The biggest leak is your top charge below.'}
          </p>
        </div>

        {!results.enoughHistory && (
          <div className="mt-4 rounded-2xl border border-[#ffb37c]/25 bg-[#ffb37c]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#ffb37c]">
            You&apos;ve only uploaded about {monthsText} {monthWord}. Subscriptions and price creep need at least 3 months of history, so this is bank fees only.
          </div>
        )}

        <ResultSection
          title="Subscriptions"
          hint="Sorted by yearly cost"
          empty={results.enoughHistory ? 'No repeat charges found.' : 'Needs 3 months of history.'}
        >
          {results.subscriptions.map((sub) => (
            <ResultRow
              key={sub.id}
              merchant={sub.merchant}
              badge={sub.frequencyLabel}
              tone="subscription"
              meta={`${money(sub.amount)} each \u00b7 ${sub.occurrences} charges \u00b7 last ${shortDate(sub.lastDate)}`}
              yearly={moneyWhole(sub.yearlyCost)}
              dimmed={hidden.has(sub.id)}
            >
              <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-muted-foreground">
                <Checkbox
                  checked={hidden.has(sub.id)}
                  onCheckedChange={() => toggle(sub.id)}
                  className="h-4 w-4 border-white/25"
                />
                Not a subscription
              </label>
              <button
                type="button"
                onClick={() => setEmailTarget(sub)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-3.5 py-2 text-[12.5px] font-medium text-white/90 transition-colors hover:border-primary/45 hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
                Draft cancel email
              </button>
            </ResultRow>
          ))}
        </ResultSection>

        <ResultSection
          title="Bank fees"
          hint={`Scaled to 12 months from ${monthsText} ${monthWord}`}
          empty="No sneaky bank fees in this statement."
        >
          {results.fees.map((fee) => (
            <ResultRow
              key={fee.id}
              merchant={fee.merchant}
              badge={fee.keyword}
              tone="fee"
              meta={`${fee.occurrences} charge${fee.occurrences === 1 ? '' : 's'} in ${monthsText} ${monthWord}`}
              yearly={moneyWhole(fee.yearlyCost)}
              amount={`${money(fee.amount)} last`}
            />
          ))}
        </ResultSection>

        <ResultSection
          title="Price creep"
          hint="Quiet price rises"
          empty={results.enoughHistory ? 'No price rises found.' : 'Needs 3 months of history.'}
        >
          {results.priceCreeps.map((creep) => (
            <ResultRow
              key={creep.id}
              merchant={creep.merchant}
              badge="Price creep"
              tone="creep"
              meta={`was ${money(creep.from)}, now ${money(creep.to)}${creep.since ? ` since ${shortDate(creep.since)}` : ''}`}
              yearly={`+${moneyWhole(creep.yearlyIncrease)}`}
              dimmed={hidden.has(creep.subscriptionId)}
            />
          ))}
        </ResultSection>

        <div className="mt-12 text-center">
          <Link
            to="/"
            onClick={reset}
            className="text-[13.5px] font-medium text-primary underline-offset-4 hover:underline"
          >
            Scan another statement
          </Link>
        </div>
      </main>

      <CancelEmailDialog subscription={emailTarget} onClose={() => setEmailTarget(null)} />
    </div>
  );
}