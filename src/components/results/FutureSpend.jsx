import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { money, moneyWhole } from '@/lib/ghostFees/format';
import { findOverlaps } from '@/lib/ghostFees/overlaps';
import { cn } from '@/lib/utils';

// Future spend (4 Nov: "can I have future prediction through some graphs"). Plain maths
// from the subscriptions on the statement: monthly cost x months, nothing guessed. Two
// lines: if nothing changes and if you cancel what you picked (or your double ups).
// Colours checked with the dataviz validator on the dark surfaces of all three themes.
const KEEP = '#d0692a';   // if nothing changes
const CUT = '#24a68a';    // after cancelling
const RANGES = [{ key: 12, label: '12 months' }, { key: 60, label: '5 years' }];

// What to cancel: the ones you said No to, otherwise every double up but the cheapest.
function cancelPlan(subscriptions, cancelSubs) {
  if (cancelSubs.length) return { items: cancelSubs, why: `cancel the ${cancelSubs.length} you picked` };
  const extra = findOverlaps(subscriptions).flatMap((group) => [...group.items].sort((a, b) => a.monthly - b.monthly).slice(1));
  if (extra.length) return { items: extra, why: `keep one of each double up and cancel ${extra.length}` };
  return { items: [], why: '' };
}

// A short label at the end of each line (direct label), in text colour, not the line colour.
const endLabel = (count, text) => function EndLabel({ x, y, index }) {
  if (index !== count - 1) return null;
  return <text x={x - 4} y={y - 8} textAnchor="end" fontSize={12} fill="rgba(255,255,255,0.75)">{text}</text>;
};

export default function FutureSpend({ subscriptions = [], cancelSubs = [] }) {
  const [months, setMonths] = useState(12);
  if (!subscriptions.length) return null;
  const monthly = subscriptions.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const plan = cancelPlan(subscriptions, cancelSubs);
  const saved = plan.items.reduce((sum, item) => sum + (Number(item.monthly) || 0), 0);
  const after = monthly - saved;
  const step = months === 12 ? 1 : 6;
  const data = [];
  for (let m = 0; m <= months; m += step) {
    data.push({ m, keep: Math.round(monthly * m * 100) / 100, ...(saved > 0 ? { cut: Math.round(after * m * 100) / 100 } : {}) });
  }
  const label = (m) => (m === 0 ? 'Now' : months === 12 ? `${m} mo` : m % 12 === 0 ? `Year ${m / 12}` : '');
  const total = monthly * months;
  const span = months === 12 ? 'the next 12 months' : 'the next 5 years';

  return (
    <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5" aria-labelledby="future-spend-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary"><TrendingUp className="h-4 w-4" aria-hidden="true" /> Future spend</p>
          <h3 id="future-spend-title" className="mt-1 text-[17px] font-semibold text-foreground">If nothing changes: {moneyWhole(total)} over {span}</h3>
          {saved > 0 && (
            <p className="mt-0.5 text-[14px] text-muted-foreground">
              If you {plan.why}: <b className="text-foreground">{moneyWhole(after * months)}</b>. You keep <b className="text-foreground">{moneyWhole(saved * months)}</b>.
            </p>
          )}
        </div>
        <div className="flex gap-1 rounded-full border border-border p-0.5" role="radiogroup" aria-label="How far ahead">
          {RANGES.map((item) => (
            <button key={item.key} type="button" role="radio" aria-checked={months === item.key} onClick={() => setMonths(item.key)}
              className={cn('rounded-full px-3 py-1 text-[13px] font-semibold', months === item.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend: always shown for two lines, so colour is never the only label. */}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <li className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full" style={{ background: KEEP }} aria-hidden="true" />If nothing changes</li>
        {saved > 0 && <li className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded-full border-t-2 border-dashed" style={{ borderColor: CUT }} aria-hidden="true" />After cancelling</li>}
      </ul>

      <div className="mt-2 h-56 w-full" role="img" aria-label={`Line chart of total subscription spend over ${span}. ${moneyWhole(total)} if nothing changes${saved > 0 ? `, ${moneyWhole(after * months)} after cancelling` : ''}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 18, right: 28, bottom: 0, left: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="m" tickFormatter={label} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} interval={months === 12 ? 2 : 1} />
            <YAxis tickFormatter={(v) => moneyWhole(v)} tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
            <Tooltip
              cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }}
              contentStyle={{ background: '#1a1230', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 13 }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              itemStyle={{ color: '#fff' }}
              labelFormatter={(m) => (m === 0 ? 'Now' : `After ${m} month${m === 1 ? '' : 's'}`)}
              formatter={(value, key) => [money(value), key === 'keep' ? 'If nothing changes' : 'After cancelling']}
            />
            <Line type="linear" dataKey="keep" stroke={KEEP} strokeWidth={2} dot={false} label={endLabel(data.length, moneyWhole(total))} activeDot={{ r: 5, stroke: '#1a1230', strokeWidth: 2 }} isAnimationActive={false} />
            {saved > 0 && <Line type="linear" dataKey="cut" stroke={CUT} strokeWidth={2} strokeDasharray="6 4" dot={false} label={endLabel(data.length, moneyWhole(after * months))} activeDot={{ r: 5, stroke: '#1a1230', strokeWidth: 2 }} isAnimationActive={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-2 text-[13px] text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-foreground/90">See the numbers</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead><tr className="text-muted-foreground"><th className="py-1 font-semibold">When</th><th className="py-1 font-semibold">If nothing changes</th>{saved > 0 && <th className="py-1 font-semibold">After cancelling</th>}</tr></thead>
          <tbody>
            {[1, 3, 6, 12, 24, 36, 60].filter((m) => m <= months).map((m) => (
              <tr key={m} className="border-t border-white/[0.06]">
                <td className="py-1">{m < 12 ? `${m} month${m === 1 ? '' : 's'}` : `${m / 12} year${m === 12 ? '' : 's'}`}</td>
                <td className="py-1 text-foreground">{money(monthly * m)}</td>
                {saved > 0 && <td className="py-1 text-foreground">{money(after * m)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2">How it&apos;s worked out: what you pay a month today ({money(monthly)}) times the months. Prices that rise would make it more. General information, not financial advice.</p>
      </details>
    </section>
  );
}
