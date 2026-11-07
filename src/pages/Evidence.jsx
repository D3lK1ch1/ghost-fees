import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import { money } from '@/lib/ghostFees/format';
import CHANGELOG from '@/data/changelog.json';
import { cn } from '@/lib/utils';

// /evidence (B10): admin only. Everything for the judges in one place, all time and
// the last 7 days. Aggregates only, except the feedback people chose to send.
// The Ghost List ($ ghosted, confirmed stopped) lives in each person's browser and
// is never sent to us, so it can't be counted here; the page says so.
const DAY = 86400000;
const asList = (value) => value?.items || value || [];
const recent = (row) => Date.now() - (Date.parse(row.created_at || row.created_date || '') || 0) < 7 * DAY;

function tally(events, refs, feedback) {
  const count = (type) => events.filter((row) => row.event_type === type).length;
  const reveals = events.filter((row) => row.event_type === 'guess_revealed' && Number(row.real_amount) > 0);
  const answered = feedback.filter((row) => row.would_pay);
  const scores = feedback.flatMap((row) => [row.clarity_app, row.clarity_agent]).filter((n) => Number(n) >= 1);
  const byRef = refs.reduce((map, row) => ({ ...map, [row.ref || 'none']: (map[row.ref || 'none'] || 0) + 1 }), {});
  return {
    byRef,
    scans: count('scan_finished'),
    samples: count('sample_finished'),
    found: reveals.reduce((sum, row) => sum + Number(row.real_amount), 0),
    askGhostIt: count('ask_ghostit_click'),
    tries: count('try_completed'),
    feedback: feedback.length,
    score: scores.length ? scores.reduce((a, b) => a + Number(b), 0) / scores.length : null,
    wouldPay: answered.length ? Math.round((answered.filter((row) => row.would_pay === 'Yes').length / answered.length) * 100) : null,
    reveals: reveals.length,
  };
}

const asText = (rows) => rows.map((row) => `${(row.created_at || '').slice(0, 10)} ${row.kind === 'journey' ? '[/try]' : '[results]'}${row.quote_ok && row.builder_name ? ` ${row.builder_name}` : ''}: ${row.confusion_text || '(no comment)'}${row.would_pay ? ` | would pay: ${row.would_pay}` : ''}${row.clarity_app ? ` | app ${row.clarity_app}/5` : ''}${row.clarity_agent ? ` | Ghost It ${row.clarity_agent}/5` : ''}`).join('\n');
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function Evidence() {
  const [allowed, setAllowed] = useState(null);
  const [data, setData] = useState({ events: [], refs: [], feedback: [] });
  const [quoteOnly, setQuoteOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.auth.me().then(async (user) => {
      if (!alive) return;
      if (user?.role !== 'admin') {
        setAllowed(false);
        return;
      }
      setAllowed(true);
      const [events, refs, feedback] = await Promise.all([
        base44.entities.Event.list({ sort: '-created_at', limit: 5000 }).catch(() => []),
        base44.entities.Analytics.list({ limit: 5000 }).catch(() => []),
        base44.entities.Feedback.list({ sort: '-created_at', limit: 1000 }).catch(() => []),
      ]);
      if (alive) setData({ events: asList(events), refs: asList(refs), feedback: asList(feedback) });
    }).catch(() => alive && setAllowed(false));
    return () => {
      alive = false;
    };
  }, []);

  const all = useMemo(() => tally(data.events, data.refs, data.feedback), [data]);
  const week = useMemo(() => tally(data.events.filter(recent), data.refs.filter((row) => Date.now() - (Date.parse(row.date || '') || 0) < 7 * DAY), data.feedback.filter(recent)), [data]);
  const list = quoteOnly ? data.feedback.filter((row) => row.quote_ok) : data.feedback;

  const copy = async () => {
    await navigator.clipboard.writeText(asText(list));
    toast({ title: `Copied ${list.length} feedback` });
  };
  const csv = () => {
    const head = ['date', 'kind', 'name (if quote OK)', 'quote_ok', 'comment', 'would_pay', 'clarity_app', 'clarity_agent', 'found_real', 'yearly_total', 'used_sample'];
    const rows = list.map((row) => [(row.created_at || '').slice(0, 10), row.kind || 'result', row.quote_ok ? row.builder_name : '', row.quote_ok ? 'yes' : '', row.confusion_text, row.would_pay, row.clarity_app, row.clarity_agent, row.found_real, row.yearly_total, row.used_sample ? 'yes' : '']);
    const url = URL.createObjectURL(new Blob([[head, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghost-fees-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (allowed === null) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!allowed) {
    return (
      <div className="min-h-screen"><BrandHeader /><p className="mx-auto max-w-xl px-5 pt-10 text-center text-muted-foreground">This page is for the Ghost Fees team. Sign in as an admin.</p></div>
    );
  }

  const rows = [
    ['Visits by ref', (stats) => Object.entries(stats.byRef).map(([ref, n]) => `${ref} ${n}`).join(' · ') || '0'],
    ['Scans (all)', (stats) => stats.scans],
    ['Sample scans (counted from 2 Nov)', (stats) => stats.samples],
    ['Real scans', (stats) => Math.max(0, stats.scans - stats.samples)],
    ['$ found on real statements (counted from 2 Nov)', (stats) => `${money(stats.found)} (${stats.reveals} scans)`],
    ['Ask Ghost It clicks', (stats) => stats.askGhostIt],
    ['/try completions', (stats) => stats.tries],
    ['Feedback received', (stats) => stats.feedback],
    ['Average clarity score (1 to 5)', (stats) => (stats.score ? stats.score.toFixed(1) : 'none yet')],
    ['Would pay $10 once', (stats) => (stats.wouldPay == null ? 'none yet' : `${stats.wouldPay}%`)],
  ];

  return (
    <div className="min-h-screen pb-16">
      <BrandHeader />
      <main className="mx-auto w-full max-w-3xl px-5">
        <h1 className="font-heading text-[2rem] font-bold">Evidence</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">For the judges. Counts and totals only, plus the feedback people chose to send.</p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-[14px]">
            <thead><tr className="text-left text-muted-foreground"><th className="px-4 py-2 font-semibold">Measure</th><th className="px-4 py-2 font-semibold">All time</th><th className="px-4 py-2 font-semibold">Last 7 days</th></tr></thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label} className="border-t border-white/[0.06]"><td className="px-4 py-2">{label}</td><td className="px-4 py-2 font-bold">{get(all)}</td><td className="px-4 py-2 font-bold">{get(week)}</td></tr>
              ))}
              <tr className="border-t border-white/[0.06]"><td className="px-4 py-2">$ ghosted, confirmed stopped</td><td colSpan={2} className="px-4 py-2 text-muted-foreground">Kept in each person&apos;s browser and never sent to us, so not counted here. Ghost It&apos;s <code>evidence</code> command has its own ghosted and stopped counts.</td></tr>
            </tbody>
          </table>
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-auto font-heading text-[20px] font-bold">Feedback ({list.length})</h2>
            <label className="flex items-center gap-1.5 text-[14px] font-bold"><input type="checkbox" checked={quoteOnly} onChange={(event) => setQuoteOnly(event.target.checked)} /> Quote OK only</label>
            <button type="button" onClick={copy} className="rounded-full border border-border px-3 py-1.5 text-[14px] font-bold">Copy as text</button>
            <button type="button" onClick={csv} className="rounded-full bg-primary px-3 py-1.5 text-[14px] font-bold text-primary-foreground">Download CSV</button>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {list.map((row) => (
              <li key={row.id} className="rounded-2xl border border-border px-4 py-3 text-[14px]">
                <div className="flex flex-wrap gap-2 text-[13px] text-muted-foreground">
                  <span>{(row.created_at || '').slice(0, 10)}</span>
                  <span className={cn('rounded-full px-2', row.kind === 'journey' ? 'bg-primary/20 text-foreground' : 'bg-white/10')}>{row.kind === 'journey' ? '/try' : 'results'}</span>
                  {row.quote_ok && <span className="rounded-full bg-[#5ee6c8]/20 px-2 text-foreground">quote OK{row.builder_name ? `: ${row.builder_name}` : ''}</span>}
                  {row.would_pay && <span>would pay: {row.would_pay}</span>}
                  {row.clarity_app && <span>app {row.clarity_app}/5</span>}
                  {row.clarity_agent && <span>Ghost It {row.clarity_agent}/5</span>}
                </div>
                <p className="mt-1">{row.confusion_text || <span className="text-muted-foreground">(no comment)</span>}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-heading text-[20px] font-bold">You said, we changed</h2>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-[14.5px]">
              <tbody>
                {CHANGELOG.map((row) => (
                  <tr key={row.said} className="border-t border-white/[0.06] first:border-0 align-top">
                    <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{row.date}<br />{row.who}{row.source && row.source !== row.who ? ` (${row.source})` : ''}<br /><b className="text-foreground">{row.product}</b></td>
                    <td className="px-3 py-2 italic">&ldquo;{row.said}&rdquo;</td>
                    <td className="px-3 py-2">{row.changed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
