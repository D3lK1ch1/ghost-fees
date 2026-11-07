import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';
import WatchVideos from '@/components/site/WatchVideos';
import FeedbackBoard from '@/components/site/FeedbackBoard';
import { base44 } from '@/api/base44Client';
import { money } from '@/lib/ghostFees/format';
import changelog from '@/data/changelog.json';
import shipped from '@/data/shipped.json';
import mergedPrs from '@/data/mergedPrs.json';
import reviews from '@/data/testerFeedback.json';

const reviewAvg = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

// Day 1 of Stranger Builds is Sat 31 Oct 2026 (Melbourne).
const DAY_ONE = new Date(2026, 9, 31);

function dayNumber(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.round((today - DAY_ONE) / 86400000) + 1);
}

function niceDate(iso) {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 px-4 py-3">
      {value == null ? (
        <div className="text-[14px] font-bold text-muted-foreground">coming soon</div>
      ) : (
        <div className="font-heading text-[1.6rem] font-bold leading-none tabular-nums text-foreground">{value}</div>
      )}
      <div className="mt-1.5 text-[13px] text-muted-foreground">{label}</div>
    </div>
  );
}

// Public "Ghost Log": real numbers, what users told us and what shipped each day.
export default function Progress() {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.functions
      .invoke('progressStats', {})
      .then((response) => { if (alive) setStats(response?.data ?? {}); })
      .catch(() => { if (alive) setStats({}); });
    return () => { alive = false; };
  }, []);

  const realChanges = changelog.filter((item) => !item.example);
  const latestChange = (realChanges[realChanges.length - 1]?.changed || realChanges[realChanges.length - 1]?.change) || shipped[shipped.length - 1]?.title || '';
  const byDay = shipped.reduce((days, item) => ({ ...days, [item.date]: [...(days[item.date] || []), item] }), {});

  const update = `Day ${dayNumber()} of Stranger Builds: ${stats?.scans ?? 0} scans, ${stats?.feedback ?? 0} feedback. Changed: ${latestChange}. hunt-ghost-fees.base44.app`;
  const copyUpdate = async () => {
    try {
      await navigator.clipboard.writeText(update);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-6 sm:px-8">
        <p className="text-[13px] font-bold uppercase tracking-wide text-primary">Ghost Log · Day {dayNumber()}</p>
        <h1 className="mt-1 font-heading text-[2rem] font-bold leading-tight text-foreground">Our progress in public</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Real numbers, what people told us and what we changed because of it.</p>

        <WatchVideos keys={['journey', 'journeyFull']} id="how-far" title="Stranger Builds hackathon feedback" subtitle="Ghost Fees" line="The 60-second version first, then the full journey. Every review is on the board below." />
        <FeedbackBoard />

        <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="Scoreboard">
          <Stat label="reviews from the Duck" value={reviews.length} />
          <Stat label="average score, out of 5" value={reviewAvg.toFixed(1)} />
          <Stat label="reviews acted on" value={`${reviews.filter((item) => item.did).length} of ${reviews.length}`} />
          <Stat label="scans run (includes the sample)" value={stats ? stats.scans : '...'} />
        </section>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Reviews and scores come from Trick or Feedback in the Stranger Builds portal, where the Duck sends another builder to try our app. Scans are counted by the app.
        </p>

        {/* Our users vs the research (aggregate, 3+ real scans). */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-4" aria-label="Our users vs the research">
          <h2 className="font-heading text-[18px] font-semibold text-foreground">Our users vs the research</h2>
          {stats?.avgGuess != null ? (
            <>
              <p className="mt-1 text-[15px] text-foreground">
                On average our users guessed <b>{money(stats.avgGuess)}</b>. Their statements showed <b>{money(stats.avgFound)}</b>
                {stats.moreThanThought != null && stats.moreThanThought > 0 ? <>: <b className="text-primary">{stats.moreThanThought}% more than they thought</b></> : null}.
              </p>
              <p className="mt-1 text-[13.5px] text-muted-foreground">Across {stats.revealCount} real statements. Westpac found Australians spend about 20% more on subscriptions than they realise (Westpac, 2025).</p>
            </>
          ) : (
            <p className="mt-1 text-[14.5px] text-muted-foreground">Shows once 3 people have guessed and then scanned a real statement ({stats?.revealCount || 0} so far). Westpac found Australians spend about 20% more on subscriptions than they realise (Westpac, 2025).</p>
          )}
        </section>

        <button
          type="button"
          onClick={copyUpdate}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-[14px] font-bold text-primary-foreground"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : "Copy today's update"}
        </button>

        <section className="mt-10" aria-label="You said, we changed">
          <h2 className="font-heading text-[20px] font-semibold text-foreground">You said, we changed</h2>
          <ul className="mt-3 space-y-3">
            {changelog.map((item, index) => (
              <li key={`${item.date}-${index}`} className={`rounded-2xl border px-4 py-3 ${item.example ? 'border-dashed border-[#ffc27a]/60 bg-[#ffc27a]/[0.06]' : 'border-border bg-card/70'}`}>
                <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-muted-foreground">
                  <span>{niceDate(item.date)}{item.who ? ` · ${item.who}` : ''}</span>
                  {item.source && item.source !== item.who && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11.5px] text-foreground">From {item.source}</span>}
                </div>
                <p className="mt-1 text-[14px] italic text-foreground">&ldquo;{item.said || item.quote}&rdquo;</p>
                <p className="mt-1 text-[14px] text-muted-foreground"><span className="font-bold text-primary">We changed:</span> {item.changed || item.change}</p>
                {(item.beforeImg || item.afterImg) && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {item.beforeImg && <img src={item.beforeImg} alt="Before" className="rounded-xl border border-border" />}
                    {item.afterImg && <img src={item.afterImg} alt="After" className="rounded-xl border border-border" />}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-label="Build streak">
          <h2 className="font-heading text-[20px] font-semibold text-foreground">Build streak</h2>
          <p className="mt-1 text-[13.5px] text-muted-foreground">Every day since 31 Oct. Highlights from each day, and how many pull requests were merged that day (counted from GitHub).</p>
          <div className="mt-3 space-y-4">
            {Object.entries(byDay).map(([date, items]) => (
              <div key={date}>
                <div className="text-[13px] font-bold text-primary">{niceDate(date)} · {items.length} shipped{mergedPrs[date] ? <span className="font-semibold text-muted-foreground"> · {mergedPrs[date]} merged PRs</span> : null}</div>
                <ul className="mt-1.5 space-y-1">
                  {items.map((item) => (
                    <li key={item.title} className="flex items-start gap-2 text-[14.5px] text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5ee6c8]" />
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
