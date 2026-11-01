import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { base44 } from '@/api/base44Client';
import { money } from '@/lib/ghostFees/format';
import changelog from '@/data/changelog.json';
import shipped from '@/data/shipped.json';

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
        <div className="text-[13px] font-bold text-muted-foreground">coming soon</div>
      ) : (
        <div className="font-heading text-[1.6rem] font-bold leading-none tabular-nums text-foreground">{value}</div>
      )}
      <div className="mt-1.5 text-[12px] text-muted-foreground">{label}</div>
    </div>
  );
}

// Public "Ghost Log": real numbers, what users told us, and what shipped each day.
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
  const latestChange = realChanges[realChanges.length - 1]?.change || shipped[shipped.length - 1]?.title || '';
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
        <p className="text-[12px] font-bold uppercase tracking-wide text-primary">Ghost Log · Day {dayNumber()}</p>
        <h1 className="mt-1 font-heading text-[2rem] font-bold leading-tight text-foreground">Our progress, in public</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Real numbers, what people told us, and what we changed because of it.</p>

        <section className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3" aria-label="Scoreboard">
          <Stat label="statements scanned" value={stats ? stats.scans : '...'} />
          <Stat label="found on real statements (from feedback)" value={stats?.foundOnRealStatements != null ? `${money(stats.foundOnRealStatements)}/yr` : null} />
          <Stat label="feedback responses" value={stats ? stats.feedback : '...'} />
          <Stat label='said it found something real' value={stats?.foundSomethingReal} />
          <Stat label="would pay" value={stats?.wouldPay} />
          <Stat label="visits from the Ghost It agent" value={stats?.agentVisits} />
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
                <div className="text-[11.5px] font-bold text-muted-foreground">{niceDate(item.date)}{item.who ? ` · ${item.who}` : ''}</div>
                <p className="mt-1 text-[14px] italic text-foreground">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-1 text-[13px] text-muted-foreground"><span className="font-bold text-primary">We changed:</span> {item.change}</p>
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
          <div className="mt-3 space-y-4">
            {Object.entries(byDay).map(([date, items]) => (
              <div key={date}>
                <div className="text-[12px] font-bold text-primary">{niceDate(date)} · {items.length} shipped</div>
                <ul className="mt-1.5 space-y-1">
                  {items.map((item) => (
                    <li key={item.title} className="flex items-start gap-2 text-[13.5px] text-foreground">
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
