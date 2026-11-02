import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HEADLINE_STATS } from '@/data/stats';
import { base44 } from '@/api/base44Client';

// Home page: three sourced stats, then live numbers from /progress as social proof.
export default function StatsStrip() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.functions.invoke('progressStats', {})
      .then((response) => { if (alive) setLive(response?.data || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const scans = Number(live?.scans) || 0;

  return (
    <section aria-label="Why it matters" className="mx-auto mt-8 w-full max-w-5xl px-4">
      <ul className="grid gap-2.5 sm:grid-cols-3">
        {HEADLINE_STATS.map((fact) => (
          <li key={fact.key} className="rounded-2xl border border-border bg-card/70 px-4 py-3">
            <p className="font-heading text-[22px] font-bold leading-tight text-foreground">
              <span aria-hidden="true">{fact.emoji} </span>{fact.stat}
            </p>
            <p className="text-[13px] leading-snug text-muted-foreground">{fact.text}</p>
            {fact.url ? (
              <a href={fact.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[11px] text-muted-foreground/80 underline-offset-2 hover:underline">{fact.source}</a>
            ) : (
              <span className="mt-1 block text-[11px] text-muted-foreground/80">{fact.source}</span>
            )}
          </li>
        ))}
      </ul>
      {scans > 0 && (
        <p className="mt-2 text-center text-[12.5px] text-muted-foreground">
          <b className="text-foreground">{scans.toLocaleString('en-AU')}</b> scans run on Ghost Fees so far. <Link to="/progress" className="font-bold text-primary underline-offset-4 hover:underline">See live progress</Link>
        </p>
      )}
    </section>
  );
}
