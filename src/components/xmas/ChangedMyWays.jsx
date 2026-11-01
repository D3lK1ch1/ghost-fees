import { useState } from 'react';
import { useGhostList } from '@/hooks/use-ghost-list';
import { money } from '@/lib/ghostFees/format';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { findOverlaps } from '@/lib/ghostFees/overlaps';
import { xmasAvatar } from '@/lib/ghostFees/christmasArt';
import { Disclaimer, GoldButton, TinySavings, Title, XScreen, useSeason } from './XmasKit';

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
  const yearlyOf = (items) => items.reduce((sum, item) => sum + item.monthly * 12, 0);
  const req = subscriptions.filter((item) => statusOf(item.id) === 'requested');
  const conf = subscriptions.filter((item) => statusOf(item.id) === 'confirmed');
  const live = subscriptions.filter((item) => !['requested', 'confirmed'].includes(statusOf(item.id)));
  const overlaps = findOverlaps(subscriptions);

  const pill = {
    requested: { text: 'Requested', style: { border: `1.5px solid ${X.gold}`, color: X.gold } },
    confirmed: { text: 'Confirmed', style: { background: X.mint, color: X.mintInk } },
    charging: { text: 'Still charging', style: { background: X.orange, color: X.ink } },
  };

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
          <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold" style={pill.requested.style}>Requested {req.length}</span>
          <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold" style={pill.confirmed.style}>Confirmed {conf.length}</span>
          <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold" style={pill.charging.style}>Still charging {live.length}</span>
        </div>
        <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${X.line}` }}>
          <div className="flex flex-none gap-0.5" role="img" aria-label={`Jacob's chain: ${live.length} of ${subscriptions.length} links left`}>
            {subscriptions.map((item) => {
              const gone = !live.includes(item);
              return <span key={item.id} className="h-3.5 w-2.5 rounded-full" style={{ border: `2.5px ${gone ? 'dashed' : 'solid'} ${gone ? X.line : X.gold}` }} />;
            })}
          </div>
          <div className="text-[12px]" style={{ color: X.muted }}>Jacob&apos;s chain</div>
          <div className="ml-auto text-right">
            <div className="text-[11px]" style={{ color: X.muted }}>Frost on the glass</div>
            <div className="x-fredoka text-[16px] font-semibold" style={{ color: X.frost }}>{money(yearlyOf(live))}/yr</div>
          </div>
        </div>
      </div>

      {overlaps.map((group) => (
        <div key={group.key} className="relative flex flex-col gap-1.5 rounded-[20px] p-3.5" style={{ background: X.card, border: `1.5px solid ${X.orange}` }}>
          <div className="text-[13px] font-extrabold" style={{ color: X.orange }}>Double-ups spotted</div>
          <div className="x-fredoka text-[18px] font-semibold">{group.items.length} {group.label} = {money(group.yearly)}/yr together</div>
          <div className="text-[13px]" style={{ color: X.muted }}>{group.items.map((item) => `${item.merchant} ${money(item.monthly)}`).join(', ')}. Keep the one you use.</div>
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
              {info.url ? (
                <a href={info.url} target="_blank" rel="noreferrer" className="text-[14px] font-extrabold" style={{ color: X.gold }}>Cancel on {info.name} ↗</a>
              ) : <span className="text-[13px]" style={{ color: X.muted }}>Search &quot;cancel {item.merchant}&quot;</span>}
              <span className="rounded-full px-2.5 py-1 text-[12px] font-extrabold" style={p.style}>{p.text}</span>
            </div>
            <div className="text-[12px]" style={{ color: X.muted }}>{info.steps}</div>
            {!status || status === 'charging' ? (
              <GoldButton X={X} className="!min-h-[46px] !text-[16px]" onClick={() => set(item, 'requested')}>🎄 I cancelled it</GoldButton>
            ) : status === 'requested' ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => set(item, 'confirmed')} className="x-btn min-h-[44px] flex-1 rounded-xl text-[14px] font-extrabold" style={{ background: X.mint, color: X.mintInk }}>It stopped</button>
                <button type="button" onClick={() => set(item, 'charging')} className="x-btn min-h-[44px] flex-1 rounded-xl text-[14px] font-extrabold" style={{ border: `1.5px solid ${X.orange}`, color: X.text }}>Still charging</button>
              </div>
            ) : null}
          </div>
        );
      })}
      <Disclaimer X={X} />
    </XScreen>
  );
}
