import { Brain, Calculator, CalendarCheck, Layers, Mail, MessageCircle, Scissors, Trophy } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';
import { GUIDES } from '@/lib/ghostFees/guides';
import { GHOST_IT_MASCOT } from '@/lib/ghostFees/ghostItAgent';

// Home page, under the stats: who does what. The seven ghost guides in the app and
// Ghost It, the chat agent in ASI:One. "Where's the different ghost agents?" (2 Nov)
// Each agent: their colour ghost, a role icon, their job and what they actually do.
const ICONS = { penny: Calculator, sir: Mail, gus: Trophy, cass: Scissors, bundle: Layers, mind: Brain, habit: CalendarCheck };
const BLURBS = {
  penny: 'Adds up every charge and fee and shows the maths.',
  sir: 'Writes your cancel, refund and fee-waiver emails.',
  gus: 'Keeps score as you bust ghosts and sets goals.',
  cass: 'Finds the real cancel page, steps and phone number.',
  bundle: 'Researches and optimises your subscriptions: checks where your shows stream, compares cost against what you use, then keep one, rotate or cancel.',
  mind: 'Explains the money pattern behind each ghost and one habit to beat it.',
  habit: 'Helps you keep one small money habit and checks in a week later.',
};
export const TEAM = [
  ...['penny', 'sir', 'gus', 'cass', 'bundle', 'mind', 'habit'].map((key) => ({ key, ...GUIDES[key], Icon: ICONS[key], does: BLURBS[key] })),
  {
    key: 'ghostit',
    name: 'Ghost It',
    role: 'the chat agent',
    color: '#8FB8FF',
    job: 'Chat in ASI:One',
    does: 'Tell @ghostit what you pay for. It shows the maths, finds double-ups, then a plan to keep one and cancel or rotate the rest. First Ghost Pack free.',
    Icon: MessageCircle,
  },
];


export default function GhostTeam() {
  return (
    <section aria-label="Meet your ghost team" className="mx-auto mt-8 w-full max-w-4xl px-4">
      <p className="text-center text-[13.5px] font-bold uppercase tracking-[0.14em] text-primary">Meet your ghost team</p>
      <p className="mt-1 text-center text-[15px] text-muted-foreground">Seven ghost guides in the app, plus Ghost It in ASI:One.</p>
      {/* One agent per row, cascading down the page (each fades in a beat after the last). */}
      <ul className="mx-auto mt-4 flex max-w-2xl flex-col gap-3">
        {TEAM.map((agent, index) => (
          <li
            key={agent.key}
            className="team-cascade flex items-center gap-4 rounded-3xl border-2 bg-card/70 px-4 py-4 sm:px-5"
            style={{ borderColor: `${agent.color}55`, background: `linear-gradient(90deg, ${agent.color}1f, transparent 55%)`, animationDelay: `${index * 120}ms` }}
          >
            <span className="relative shrink-0" aria-hidden="true">
              <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full" style={{ background: `${agent.color}2e`, boxShadow: `0 0 24px ${agent.color}40` }}>
                {agent.key === 'ghostit' || agent.image ? (
                  <img src={agent.key === 'ghostit' ? GHOST_IT_MASCOT : agent.image} alt="" width={60} height={60} loading="lazy" className="h-[60px] w-[60px] object-contain motion-safe:animate-float" />
                ) : (
                  <GhostMark className="h-11 w-11 motion-safe:animate-float" style={{ color: agent.color }} eyeColor="#1a1230" />
                )}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-card" style={{ background: agent.color, color: '#1a1230' }}>
                <agent.Icon className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="font-heading text-[20px] font-bold leading-tight text-foreground">{agent.name}</span>
                <span className="rounded-full px-2.5 py-0.5 text-[13px] font-bold" style={{ background: `${agent.color}26`, color: agent.color }}>{agent.job}</span>
              </span>
              <span className="mt-1 block text-[15px] leading-snug text-muted-foreground">{agent.does}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
