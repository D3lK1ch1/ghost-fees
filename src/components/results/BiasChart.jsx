import { useState } from 'react';
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Brain, ChevronDown } from 'lucide-react';
import { biasGroups } from '@/lib/ghostFees/leaks';
import { money, moneyWhole, shortDate } from '@/lib/ghostFees/format';

// "Where your ghost money went" (5 Nov): one bar per money pattern, dollars from this
// statement only, largest first. One series, so one colour (the theme's primary) and no
// legend; the value sits at the end of each bar. Tap a bar to show that kind of ghost.
// A "See the numbers" table is always there for anyone who can't read the bars.
function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const g = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-[#16121f] px-3 py-2 text-[13px] text-white shadow-lg">
      <p className="font-semibold">{g.bias}</p>
      <p className="text-white/75">{money(g.total)} · {g.charges} {g.charges === 1 ? 'charge' : 'charges'} ({g.badge})</p>
    </div>
  );
}

export default function BiasChart({ leaks, activeType = 'all', onType, onBar, footer = true, heading = true }) {
  const [table, setTable] = useState(false);
  // Only plain fields go to recharts (it spreads each row onto SVG elements).
  const groups = biasGroups(leaks).map((g) => ({ bias: g.bias, total: g.total, badge: g.badge, charges: g.charges, pkey: g.key, from: g.from, to: g.to }));
  if (groups.length < 2) return null;
  const height = 24 + groups.length * 44;
  return (
    <section className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4" aria-labelledby="bias-chart-title">
      {heading && <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary"><Brain className="h-4 w-4" aria-hidden="true" /> Money patterns</p>}
      <h3 id="bias-chart-title" className="mt-1 text-[16px] font-semibold text-foreground">Where your ghost money went</h3>
      <p className="mt-0.5 text-[13.5px] text-muted-foreground">From the charges on this statement. {onBar ? 'Tap a bar to see why.' : 'Tap a bar to see those ghosts.'}</p>
      <div className="mt-2" style={{ height }} role="img" aria-label={groups.map((g) => `${g.bias}: ${money(g.total)}`).join(', ')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groups} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 4 }} barCategoryGap={12}>
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            {/* One text per name (the default tick split "Denomination Effect" into two
                pieces, which read as "DenominationEffect"). */}
            <YAxis
              type="category"
              dataKey="bias"
              width={150}
              tickLine={false}
              axisLine={false}
              tick={({ x, y, payload }) => <text x={x} y={y} dy={4} textAnchor="end" fontSize={13} fill="rgba(255,255,255,0.8)">{payload.value}</text>}
            />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={18} onClick={(g) => (onBar ? onBar(g.pkey) : onType(activeType === g.badge ? 'all' : g.badge))} className="cursor-pointer">
              {groups.map((g) => (
                <Cell key={g.bias} fill="hsl(var(--primary))" fillOpacity={activeType === 'all' || activeType === g.badge ? 1 : 0.35} />
              ))}
              <LabelList dataKey="total" position="right" formatter={(v) => moneyWhole(v)} style={{ fill: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <button type="button" onClick={() => setTable((v) => !v)} aria-expanded={table} className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        See the numbers <ChevronDown className={`h-3.5 w-3.5 transition-transform ${table ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {table && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-muted-foreground">
              <tr><th className="py-1 pr-3 font-semibold">Pattern</th><th className="py-1 pr-3 font-semibold">Ghost</th><th className="py-1 pr-3 text-right font-semibold">Charges</th><th className="py-1 pr-3 text-right font-semibold">Total</th><th className="py-1 font-semibold">Dates</th></tr>
            </thead>
            <tbody className="text-foreground">
              {groups.map((g) => (
                <tr key={g.bias} className="border-t border-white/[0.06]">
                  <td className="py-1.5 pr-3">{g.bias}</td>
                  <td className="py-1.5 pr-3">{g.badge}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{g.charges}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{money(g.total)}</td>
                  <td className="py-1.5 whitespace-nowrap">{g.from ? (g.from === g.to ? shortDate(g.from) : `${shortDate(g.from)} to ${shortDate(g.to)}`) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer && <p className="mt-3 text-[12.5px] text-muted-foreground">Common money patterns from behavioural finance research. Not a judgement, and not financial advice.</p>}
    </section>
  );
}
