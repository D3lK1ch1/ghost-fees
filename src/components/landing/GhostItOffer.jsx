import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GHOST_IT_MASCOT } from '@/lib/ghostFees/ghostItAgent';

// Next to the upload button: Ghost It, our specialised AI agent, and what it's for,
// short and to the point. Opens /ghostit.
const POINTS = ['Subscriptions you pay for twice', 'Apps hidden in Apple or Google bundles', 'What weekly costs add up to a year'];
const PACKS = ['📺 Screen', '🎧 Sound', '💻 Tech Stack', '🍔 Food', '💪 Gym', '🎮 Play'];

export default function GhostItOffer({ className = '' }) {
  return (
    <Link
      to="/ghostit"
      className={`group flex w-full max-w-xl items-center gap-4 rounded-3xl border-2 px-5 py-4 text-left transition-colors hover:bg-[#8FB8FF]/10 ${className}`}
      style={{ borderColor: '#8FB8FF88', background: 'linear-gradient(90deg, #8FB8FF26, transparent 75%)' }}
    >
      <img src={GHOST_IT_MASCOT} alt="" width={72} height={72} className="h-[72px] w-[72px] shrink-0 object-contain motion-safe:animate-float" />
      <span className="min-w-0 flex-1">
        <span className="inline-block rounded-full bg-[#8FB8FF] px-2.5 py-0.5 text-[12.5px] font-bold uppercase tracking-wide text-[#0f1730]">Specialised AI agent</span>
        <span className="mt-1.5 block font-heading text-[21px] font-bold leading-tight text-foreground">Ghost It finds what your statement can&apos;t show</span>
        <span className="mt-1.5 flex flex-col gap-0.5 text-[15px] leading-snug text-foreground/80">
          {POINTS.map((point) => <span key={point}>• {point}</span>)}
        </span>
        <span className="mt-2.5 block text-[13px] font-bold uppercase tracking-wide text-[#8FB8FF]">Its Ghost Packs, one per kind of leak</span>
        <span className="mt-1 flex flex-wrap gap-1.5">
          {PACKS.map((pack) => <span key={pack} className="rounded-full border border-[#8FB8FF55] bg-[#8FB8FF14] px-2.5 py-0.5 text-[13.5px] font-semibold text-foreground">{pack}</span>)}
        </span>
        <span className="mt-2.5 block text-[14px] leading-snug text-foreground/75">
          <b className="text-foreground">Not a general chatbot:</b> every number is real maths you can check and every cancel link is checked and never guessed.
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#8FB8FF] px-4 py-2 text-[14.5px] font-bold text-[#0f1730] sm:inline-flex">
        Try it <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
