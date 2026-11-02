import { useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { GHOST_IT_MASCOT, GHOST_IT_PRICE } from '@/lib/ghostFees/ghostItAgent';
import { useGo } from './AskGhostIt';
import GhostItDialog from './GhostItDialog';

// Ghost It's own box on your results. Cassy helps you cancel each subscription here in the
// app; Ghost It does something else: its Ghost Packs hunt the leaks a statement
// can't show (doubles across services, things hidden in bundles or on another
// card, weekly costs a year). One box, its own look, its own job.
const BLUE = '#8FB8FF';

export const PACKS = [
  { emoji: '📺', name: 'Screen', hunts: 'Streaming apps doing the same job' },
  { emoji: '🎧', name: 'Sound', hunts: 'Two music apps (YouTube Premium includes YouTube Music)' },
  { emoji: '💻', name: 'Tech Stack', hunts: 'AI tools and storage paid twice' },
  { emoji: '🍔', name: 'Food', hunts: 'Two delivery passes, or a meal kit on top' },
  { emoji: '💪', name: 'Gym', hunts: 'What weekly fees really cost a year' },
  { emoji: '🎮', name: 'Play', hunts: 'Two or three gaming passes' },
];

export default function GhostItPacks({ items = [], className = '', kicker = 'Ghost It · AI agent on ASI:One', title = 'The leaks your statement can\'t show', intro }) {
  const list = items.filter((item) => item?.merchant && Number(item.monthly) > 0).slice(0, 8);
  const text = list.length
    ? `@ghostit ${list.map((item) => `${item.merchant} $${Number(item.monthly).toFixed(2)}/mo`).join(', ')}`
    : '@ghostit packs';
  const go = useGo(text);
  const [about, setAbout] = useState(false);

  return (
    <section aria-label="Ghost It, our chat agent" className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6 ${className}`} style={{ borderColor: `${BLUE}77`, background: `radial-gradient(circle at 12% 0%, ${BLUE}33, transparent 55%), linear-gradient(180deg, #161b3a, #11142a)` }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <img src={GHOST_IT_MASCOT} alt="Ghost It, a friendly ghost waving with a chat bubble" width={104} height={104} className="motion-safe:animate-float h-[104px] w-[104px] shrink-0 object-contain drop-shadow-[0_0_24px_rgba(143,184,255,0.45)]" />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.14em]" style={{ color: BLUE }}>{kicker}</p>
          <h3 className="mt-1 font-heading text-[24px] font-bold leading-tight text-white">{title}</h3>
          <p className="mt-1 text-[15px] leading-snug text-white/75">
            {intro || <>Cassy helps you cancel each one here. Ghost It hunts across them in chat: doubles, things hidden in Apple or Google bundles or on another card, and what weekly costs add up to.</>}
          </p>
        </div>
      </div>

      <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.12em] text-white/60">Its Ghost Packs</p>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PACKS.map((pack) => (
          <li key={pack.name} className="rounded-2xl border px-3 py-2.5" style={{ borderColor: `${BLUE}33`, background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[15px] font-bold text-white"><span aria-hidden="true">{pack.emoji}</span> {pack.name}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-white/65">{pack.hunts}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-2xl px-4 py-3 text-[14px] leading-snug" style={{ background: `${BLUE}1a`, color: '#dfe7ff' }}>
        <b className="text-white">Example:</b> Spotify $14 and YouTube Premium $17 → Sound pack: &quot;YouTube Premium already includes YouTube Music. Keep just Spotify and save $204.00/yr.&quot;
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button type="button" onClick={go} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 text-[16px] font-bold text-[#0f1730] shadow-[0_10px_30px_rgba(143,184,255,0.35)]" style={{ background: BLUE }}>
          <MessageCircle className="h-5 w-5" aria-hidden="true" /> {list.length ? 'Run my Ghost Packs in chat' : 'Try Ghost It'}
        </button>
        <button type="button" onClick={() => setAbout(true)} className="min-h-[44px] rounded-2xl px-3 text-[14.5px] font-bold underline-offset-4 hover:underline" style={{ color: BLUE }}>
          What is Ghost It?
        </button>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-[13.5px] text-white/65"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BLUE }} aria-hidden="true" /><span><b className="text-white">Free trial: 1 try.</b> {GHOST_IT_PRICE}</span></p>
      <GhostItDialog open={about} onClose={() => setAbout(false)} onMessage={go} />
    </section>
  );
}
