import { Fragment, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { biasGroups, leakRows, PATTERN_BY_KEY } from '@/lib/ghostFees/leaks';
import { money, moneyWhole } from '@/lib/ghostFees/format';

// Graph 2 (Pack 9 part 4): "When it happened". One bar per month, stacked by pattern,
// from the leaked part of each statement line (row.wastedAmount), so months add up to the
// pattern totals. Past only, never a forecast. Colour follows the pattern, never its rank:
// the first four slots of the validated dark palette, stacked in that order (adjacent
// pairs pass CVD and normal-vision checks on all three themes' dark cards). Past four
// patterns the rest fold into "Other". Bars are separated by a 2px surface gap.
const SLOT = { present_bias: '#3987e5', denomination: '#d95926', status_quo: '#199e70', ostrich: '#c98500', mental_accounting: '#d55181', pain_of_paying: '#9085e9' };
const ORDER = ['present_bias', 'denomination', 'status_quo', 'ostrich', 'mental_accounting', 'pain_of_paying'];
const OTHER = { key: 'other', bias: 'Other', color: '#8b8794' };
const monthLabel = (ym) => new Date(`${ym}-01T12:00:00Z`).toLocaleDateString('en-AU', { month: 'short', year: '2-digit', timeZone: 'UTC' });

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value > 0);
  return (
    <div className="rounded-xl border border-white/10 bg-[#16121f] px-3 py-2 text-[13px] text-white shadow-lg">
      <p className="font-semibold">{monthLabel(label)}</p>
      {rows.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-white/80"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />{p.name}: {money(p.value)}</p>
      ))}
    </div>
  );
}

export function monthBuckets(leaks) {
  const groups = biasGroups(leaks);
  const keep = groups.slice(0, 4).map((g) => g.key);
  const series = [...ORDER.filter((k) => keep.includes(k)).map((k) => ({ key: k, bias: PATTERN_BY_KEY[k].bias, color: SLOT[k] }))];
  if (groups.length > 4) series.push(OTHER);
  const months = new Map();
  groups.forEach((g) => {
    const slot = keep.includes(g.key) ? g.key : 'other';
    leaks.filter((leak) => g.leakIds.includes(leak.id)).forEach((leak) => {
      leakRows(leak).forEach((row) => {
        const ym = String(row.date).slice(0, 7);
        const value = Number(row.wastedAmount) || Number(row.amount) || 0;
        const m = months.get(ym) || { month: ym };
        m[slot] = Math.round(((m[slot] || 0) + value) * 100) / 100;
        months.set(ym, m);
      });
    });
  });
  const data = [...months.values()].sort((a, b) => a.month.localeCompare(b.month)).slice(-12);
  return { series, data };
}

export default function WhenChart({ leaks }) {
  const [table, setTable] = useState(false);
  const { series, data } = monthBuckets(leaks);
  if (series.length < 2 || data.length < 2) return null;
  const totalOf = (m) => series.reduce((sum, s) => sum + (m[s.key] || 0), 0);
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4" aria-labelledby="when-chart-title">
      <h3 id="when-chart-title" className="text-[16px] font-semibold text-foreground">When it happened</h3>
      <p className="mt-0.5 text-[13.5px] text-muted-foreground">Charges by month. Past only, never a forecast.</p>
      <div className="mt-2 h-[240px]" role="img" aria-label={data.map((m) => `${monthLabel(m.month)}: ${money(totalOf(m))}`).join(', ')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
            <XAxis dataKey="month" tickFormatter={monthLabel} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            <YAxis tickFormatter={(v) => moneyWhole(v)} width={44} tickLine={false} axisLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
            <Tooltip content={<Tip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', paddingTop: 6 }} />
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.bias} stackId="m" fill={s.color} stroke="hsl(var(--card))" strokeWidth={2}
                radius={i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <button type="button" onClick={() => setTable((v) => !v)} aria-expanded={table} className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        See the numbers <ChevronDown className={`h-3.5 w-3.5 transition-transform ${table ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {table && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-muted-foreground"><tr><th className="py-1 pr-3 font-semibold">Month</th><th className="py-1 pr-3 font-semibold">Pattern</th><th className="py-1 text-right font-semibold">Amount</th></tr></thead>
            <tbody className="text-foreground">
              {data.map((m) => (
                <Fragment key={m.month}>
                  {series.filter((s) => m[s.key]).map((s) => (
                    <tr key={`${m.month}-${s.key}`} className="border-t border-white/[0.06]"><td className="py-1 pr-3">{monthLabel(m.month)}</td><td className="py-1 pr-3">{s.bias}</td><td className="py-1 text-right tabular-nums">{money(m[s.key])}</td></tr>
                  ))}
                  <tr className="font-semibold"><td className="py-1 pr-3" /><td className="py-1 pr-3">Month total</td><td className="py-1 text-right tabular-nums">{money(totalOf(m))}</td></tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
