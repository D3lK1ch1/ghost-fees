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
    <section aria-label="Why it matters" className="mx-auto mt-8 w-full max-w-4xl px-4">
      {/* 5 Nov: open, centred stats (no boxes), side by side however many there are. */}
      <ul className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-center sm:gap-12">
        {HEADLINE_STATS.map((fact) => (
          <li key={fact.key} className="max-w-[17rem]">
            <p className="font-heading text-[30px] font-bold leading-tight text-foreground">
              <span aria-hidden="true">{fact.emoji} </span>{fact.stat}
            </p>
            <p className="mt-0.5 text-[15px] leading-snug text-muted-foreground">{fact.text}</p>
            {fact.url ? (
              <a href={fact.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-[12.5px] text-muted-foreground/80 underline-offset-2 hover:underline">({fact.source})</a>
            ) : (
              <span className="mt-1 block text-[12.5px] text-muted-foreground/80">({fact.source})</span>
            )}
          </li>
        ))}
      </ul>
      {scans > 0 && (
        <p className="mt-5 text-center text-[13.5px] text-muted-foreground">
          <b className="text-foreground">{scans.toLocaleString('en-AU')}</b> scans run on Ghost Fees so far (includes the sample). <Link to="/progress" className="font-bold text-primary underline-offset-4 hover:underline">See live progress</Link>
        </p>
      )}
    </section>
  );
}
