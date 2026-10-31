import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import { base44 } from '@/api/base44Client';
import { money } from '@/lib/ghostFees/format';

const EVENT_TYPES = ['scan_started', 'scan_finished', 'cancel_email_clicked', 'feedback_submitted'];

function formatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function FeedbackAdmin() {
  const [allowed, setAllowed] = useState(null);
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let alive = true;

    base44.auth
      .me()
      .then(async (user) => {
        if (!alive) return;
        if (user?.role !== 'admin') {
          setAllowed(false);
          return;
        }
        setAllowed(true);

        const [page, events] = await Promise.all([
          base44.entities.Feedback.list({ sort: '-created_at', limit: 200 }),
          base44.entities.Event.aggregate({ groupBy: 'event_type' }),
        ]);
        if (!alive) return;
        setRows(page?.items || []);
        setCounts(Object.fromEntries((events?.rows || []).map((row) => [row.event_type, row.count])));
      })
      .catch(() => {
        if (alive) setAllowed(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <BrandHeader />

      <main className="mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Feedback</h1>

        {allowed === null && (
          <div className="mt-10 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading…
          </div>
        )}

        {allowed === false && (
          <p className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-[13px] text-muted-foreground">
            This page is for admins.
          </p>
        )}

        {allowed === true && (
          <>
            <section className="mt-6 rounded-[1.5rem] border border-white/[0.08] bg-card/70 p-5 sm:p-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Events</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EVENT_TYPES.map((type) => (
                  <div key={type} className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3">
                    <p className="text-xl font-semibold tabular-nums text-white">{counts[type] || 0}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">{type.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {rows.length} feedback {rows.length === 1 ? 'response' : 'responses'}
              </h2>

              {rows.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 text-[13px] text-muted-foreground">
                  No feedback yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {rows.map((row) => (
                    <article key={row.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-muted-foreground">
                        <span className="font-medium text-white">{formatWhen(row.created_at || row.created_date)}</span>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5">
                          {row.used_sample ? 'sample' : 'own file'}
                        </span>
                        <span className="rounded-full bg-primary/12 px-2 py-0.5 text-primary">
                          {row.found_real || 'no answer'}
                        </span>
                        <span className="rounded-full bg-white/[0.06] px-2 py-0.5">
                          would pay: {row.would_pay || '—'}
                        </span>
                        <span>{row.leaks_found || 0} leaks · {money(row.yearly_total)} found</span>
                        {row.builder_name && <span>builder: {row.builder_name}</span>}
                      </div>
                      {row.most_useful_leak && (
                        <p className="mt-2 text-[13px] text-white/85">Most useful: {row.most_useful_leak}</p>
                      )}
                      {row.confusion_text && (
                        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                          Confused: {row.confusion_text}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}