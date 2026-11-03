import { useState } from 'react';
import { useGhostList } from '@/hooks/use-ghost-list';
import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { findOverlaps } from '@/lib/ghostFees/overlaps';
import { xmasAvatar } from '@/lib/ghostFees/christmasArt';
import { useCancelProof } from '@/components/results/ProofDialog';
import { Disclaimer, TinySavings, Title, XScreen, useSeason } from './XmasKit';

// "Changed my ways" (design CW6): the 🎄 cancel list. Tick "I cancelled it", then
// next month "It stopped" or "Still charging". Uses the same Ghost List (this
// browser only) as the Subscriptions tab and 💔, so statuses match everywhere.
export default function ChangedMyWays({ subscriptions }) {
  const { season, X } = useSeason();
  const [ghostList, setGhostList] = useGhostList();
  const [hop, setHop] = useState(0);
  const statusOf = (id) => ghostList.find((item) => item.id === id)?.status;
  const set = (item, status) => {
    setGhostList((current) => (current.some((entry) => entry.id === item.id)
      ? current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry))
      : [...current, { id: item.id, merchant: item.merchant, monthly: item.monthly, status, date: new Date().toISOString() }]));
    setHop((value) => value + 1);
  };
  // "I cancelled it" asks for proof first; Tiny Savings hops once it's saved.
  const proof = useCancelProof({ saveLabel: '🎄 Save proof', onSaved: () => setHop((value) => value + 1) });
  const yearlyOf = (items) => items.reduce((sum, item) => sum + item.monthly * 12, 0);
  const req = subscriptions.filter((item) => statusOf(item.id) === 'requested');
  const conf = subscriptions.filter((item) => statusOf(item.id) === 'confirmed');
  const live = subscriptions.filter((item) => !['requested', 'confirmed'].includes(statusOf(item.id)));
  const overlaps = findOverlaps(subscriptions);

  // One style for every status tag: outlined in its colour (3 Nov: cards looked different by state).
  const pill = {
    requested: { text: 'Requested', style: { border: `1.5px solid ${X.gold}`, color: X.gold } },
    confirmed: { text: 'Stopped', style: { border: `1.5px solid ${X.mint}`, color: X.mint } },
    charging: { text: 'Still charging', style: { border: `1.5px solid ${X.orange}`, color: X.orange } },
  };
  const btn = 'x-btn flex min-h-[46px] flex-1 items-center justify-center rounded-xl text-[15px] font-extrabold';

  return (
    <XScreen X={X} season={season} className="mx-auto">
      <Title size={28}>Changed my ways</Title>
      <div className="relative flex flex-col gap-2.5 rounded-[20px] p-3.5" style={{ background: X.card, border: `1.5px solid ${X.gold}` }}>
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="x-fredoka text-[24px] font-bold leading-tight" style={{ color: X.gold }}>{money(yearlyOf([...req, ...conf]))}/yr ghosted</div>
            <div className="text-[14px] font-bold" style={{ color: X.mint }}>{money(yearlyOf(conf))}/yr confirmed stopped</div>
          </div>
          <TinySavings X={X} hop={hop} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full px-2.5 py-1 text-[13px] font-extrabold" style={pill.requested.style}>Requested {req.length}</span>
          <span className="rounded-full px-2.5 py-1 text-[13px] font-extrabold" style={pill.confirmed.style}>Stopped {conf.length}</span>
          <span className="rounded-full px-2.5 py-1 text-[13px] font-extrabold" style={pill.charging.style}>Still charging {live.length}</span>
        </div>
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${X.line}` }}>
          <div className="flex flex-none gap-0.5" role="img" aria-label={`Jacob's chain: ${live.length} of ${subscriptions.length} links left`}>
            {subscriptions.map((item) => {
              const gone = !live.includes(item);
              return <span key={item.id} className="h-3.5 w-2.5 rounded-full" style={{ border: `2.5px ${gone ? 'dashed' : 'solid'} ${gone ? X.line : X.gold}` }} />;
            })}
          </div>
          <div className="text-[13px]" style={{ color: X.muted }}>Jacob&apos;s chain</div>
          <div className="ml-auto text-right">
            <div className="text-[12.5px]" style={{ color: X.muted }}>Frost on the glass</div>
            <div className="x-fredoka text-[16px] font-semibold" style={{ color: X.frost }}>{money(yearlyOf(live))}/yr</div>
          </div>
        </div>
      </div>

      {overlaps.map((group) => (
        <div key={group.key} className="relative flex flex-col gap-1.5 rounded-[20px] p-3.5" style={{ background: X.card, border: `1.5px solid ${X.orange}` }}>
          <div className="text-[14px] font-extrabold" style={{ color: X.orange }}>Double-ups spotted</div>
          <div className="x-fredoka text-[18px] font-semibold">{group.items.length} {group.label} = {money(group.yearly)}/yr together</div>
          <div className="text-[14px]" style={{ color: X.muted }}>{group.items.map((item) => `${item.merchant} ${money(item.monthly)}`).join(', ')}. Keep the one you use.</div>
        </div>
      ))}

      {subscriptions.map((item) => {
        const status = statusOf(item.id);
        const info = cancelInfo(item.merchant);
        const p = pill[status] || pill.charging;
        return (
          <div key={item.id} className="relative flex flex-col gap-2 rounded-[20px] p-3.5" style={{ background: X.card, border: `1px solid ${X.line}` }}>
            <div className="flex items-center gap-2.5">
              <img src={xmasAvatar(item.merchant, season)} alt="" width={46} height={46} className="object-contain h-[46px] w-[46px] flex-none" />
              <span className="flex-1 text-[16px] font-extrabold">{item.merchant}</span>
              <span className="x-fredoka text-[18px] font-semibold">{money(item.monthly)}/mo</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              {/* Always a link: their cancel page if checked, otherwise a search for it. Never a guessed URL. */}
              <a href={info.url || `https://www.google.com/search?q=${encodeURIComponent(`cancel ${item.merchant} subscription`)}`} target="_blank" rel="noreferrer" className="text-[14px] font-extrabold" style={{ color: X.gold }}>
                {info.url ? `Cancel on ${info.name}` : `Find ${item.merchant}'s cancel page`} ↗
              </a>
              <span className="flex-none rounded-full px-2.5 py-1 text-[13px] font-extrabold" style={p.style}>{p.text}</span>
            </div>
            <div className="text-[13.5px] leading-snug" style={{ color: X.muted }}>{info.url ? info.steps : 'No checked cancel link yet. Search their site or check your sign-up email.'}</div>
            {status === 'confirmed' ? (
              <div className="flex min-h-[46px] items-center justify-center rounded-xl text-[15px] font-extrabold" style={{ background: `${X.mint}1f`, color: X.mint }}>✓ Stopped. That money stays with you.</div>
            ) : status === 'requested' ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => set(item, 'confirmed')} className={btn} style={{ background: X.mint, color: X.mintInk }}>It stopped</button>
                <button type="button" onClick={() => set(item, 'charging')} className={btn} style={{ border: `1.5px solid ${X.orange}`, color: X.text }}>Still charging</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button type="button" onClick={() => proof.ask(item)} className={btn} style={{ background: X.gold, color: X.ink }}>🎄 I cancelled it</button>
              </div>
            )}
          </div>
        );
      })}
      {proof.dialog}
      <Disclaimer X={X} />
    </XScreen>
  );
}
