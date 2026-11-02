import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { GHOST_IT_MASCOT } from '@/lib/ghostFees/ghostItAgent';

// Next to the upload button: an offer to understand your fees more with Ghost It,
// our chat agent, whose Ghost Packs analyse each kind of leak. Opens /ghostit.
export default function GhostItOffer({ className = '' }) {
  return (
    <Link
      to="/ghostit"
      className={`group flex w-full max-w-md items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors hover:bg-[#8FB8FF]/10 ${className}`}
      style={{ borderColor: '#8FB8FF66', background: 'linear-gradient(90deg, #8FB8FF1f, transparent 70%)' }}
    >
      <img src={GHOST_IT_MASCOT} alt="" width={48} height={48} className="h-12 w-12 shrink-0 object-contain motion-safe:animate-float" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-foreground">Want to understand your fees more?</span>
        <span className="block text-[13.5px] leading-snug text-muted-foreground">Ghost It, our AI agent, runs Ghost Packs that analyse each kind of leak: doubles, bundles and what weekly costs add up to.</span>
      </span>
      <MessageCircle className="h-5 w-5 shrink-0 text-[#8FB8FF] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
