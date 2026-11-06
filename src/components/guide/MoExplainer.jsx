import { ExternalLink } from 'lucide-react';
import { PATTERN_BY_KEY } from '@/lib/ghostFees/leaks';
import { money } from '@/lib/ghostFees/format';

const MO = '#c4f06c';

// Mo's little animated explainer: the pattern builds up one step at a time (what happens,
// why your brain does it, how to beat it, the research). Every fact comes from the app's
// checked pattern data (leaks.js, citations verified with Crossref), nothing invented.
// Reduced motion: the steps simply appear (team-cascade turns its animation off).
export default function MoExplainer({ biasKey, group }) {
  const info = PATTERN_BY_KEY[biasKey];
  if (!info) return null;
  const steps = [
    { icon: '🎯', title: 'What happens', text: info.what },
    { icon: '🧠', title: 'Why your brain does it', text: info.why },
    { icon: '💡', title: 'How to beat it', text: info.beat },
  ];
  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border p-3" style={{ borderColor: `${MO}66`, background: `${MO}0d` }}>
      <div className="flex items-center gap-2">
        <span className="text-[20px] motion-safe:animate-bob" aria-hidden="true">🧠</span>
        <p className="font-heading text-[15px] font-bold text-foreground">{info.bias}</p>
        <span className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#1b2a08]" style={{ background: MO }}>
          {info.evidence === 'strong' ? 'Strong evidence' : 'Good evidence'}
        </span>
      </div>
      <p className="mt-1 text-[13.5px] italic leading-relaxed text-foreground/90">&ldquo;{info.line}&rdquo;</p>
      {group && (
        <p className="mt-1 text-[13px] text-muted-foreground">
          In your statement: <span className="font-bold text-foreground">{money(group.total)}</span> across {group.charges} {group.charges === 1 ? 'charge' : 'charges'}.
        </p>
      )}
      <ol className="mt-2.5 space-y-2">
        {steps.map((step, i) => (
          <li key={step.title} className="team-cascade flex gap-2.5" style={{ animationDelay: `${300 + i * 700}ms` }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[16px]" style={{ background: `${MO}26` }} aria-hidden="true">{step.icon}</span>
            <span className="min-w-0">
              <span className="block text-[12px] font-bold uppercase tracking-wide" style={{ color: MO }}>{i + 1}. {step.title}</span>
              <span className="block text-[14px] leading-relaxed text-foreground">{step.text}</span>
            </span>
          </li>
        ))}
        <li className="team-cascade flex gap-2.5" style={{ animationDelay: `${300 + steps.length * 700}ms` }}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[16px]" style={{ background: `${MO}26` }} aria-hidden="true">📚</span>
          <span className="min-w-0">
            <span className="block text-[12px] font-bold uppercase tracking-wide" style={{ color: MO }}>The research</span>
            <span className="block text-[13px] leading-relaxed text-muted-foreground">{info.paper}</span>
            {info.url && (
              <a href={info.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-bold text-foreground underline-offset-4 hover:underline">
                Read the paper <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </span>
        </li>
      </ol>
      <p className="mt-2.5 text-[12px] text-muted-foreground">It&apos;s a common pattern, not a flaw. Most people do this.</p>
    </div>
  );
}
