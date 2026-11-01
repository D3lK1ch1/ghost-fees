import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '@/lib/ghostFees/format';
import { groupSubs, rotationPlan } from '@/lib/ghostFees/ghostItLink';
import { cn } from '@/lib/utils';

const ORANGE = '#ffb37c';

// "From Ghost.it": what the Ghost It agent on ASI:One already found.
export default function FromGhostIt({ subs, onScan }) {
  const groups = groupSubs(subs);
  const overlaps = groups.filter((group) => group.overlap && group.saving > 0);
  const rotation = rotationPlan(subs);
  const chart = groups.filter((group) => group.yearly > 0).map((group) => ({ name: group.label, yearly: Math.round(group.yearly), overlap: group.overlap }));
  const missingPrices = subs.some((item) => item.monthly == null);

  return (
    <section className="mx-auto mt-2 w-full max-w-3xl px-5 sm:px-8" aria-label="From Ghost.it">
      <div className="rounded-3xl border border-primary/40 bg-card/80 p-4 sm:p-6">
        <p className="text-[12px] font-bold uppercase tracking-wide text-primary">From Ghost.it</p>
        <h2 className="mt-1 font-heading text-[20px] font-semibold text-foreground">Ghost.it found these subscriptions. Scan your statement to find the rest.</h2>

        {/* Overlap table grouped by type */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-bold">Service</th>
                <th className="px-3 py-2 text-right font-bold">$/month</th>
                <th className="px-3 py-2 text-right font-bold">$/year</th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.key} className={cn(group.overlap && 'bg-[#ffb37c]/[0.08]')}>
                <tr className="border-t border-border">
                  <td colSpan={3} className="px-3 pt-2.5 text-[12px] font-bold text-foreground">
                    {group.label}
                    {group.overlap && <span className="ml-2 rounded-full bg-[#ffb37c] px-2 py-0.5 text-[10.5px] font-bold text-[#3a1d00]">Overlap</span>}
                  </td>
                </tr>
                {group.items.map((item) => (
                  <tr key={item.key}>
                    <td className="px-3 py-1.5 text-foreground">{item.name}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{item.monthly != null ? money(item.monthly) : 'not given'}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">{item.monthly != null ? money(item.monthly * 12) : ''}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        {missingPrices && <p className="mt-1.5 text-[11.5px] text-muted-foreground">Some prices weren't passed in. Scan your statement to see what you really pay.</p>}

        {/* Yearly cost per group */}
        {chart.length > 0 && (
          <div className="mt-5">
            <h3 className="text-[13.5px] font-bold text-foreground">Yearly cost by type</h3>
            <div className="mt-2 h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [money(value), 'per year']} cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                  <Bar dataKey="yearly" radius={[0, 6, 6, 0]}>
                    {chart.map((row) => <Cell key={row.name} fill={row.overlap ? ORANGE : 'hsl(var(--primary))'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Consolidate cards */}
        {overlaps.length > 0 && (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {overlaps.map((group) => (
              <div key={group.key} className="rounded-2xl border border-[#ffb37c]/50 bg-[#ffb37c]/[0.07] px-4 py-3">
                <p className="text-[12px] font-bold text-[#ffb37c]">Consolidate {group.label.toLowerCase()}</p>
                <p className="mt-0.5 font-heading text-[17px] font-semibold text-foreground">Keep 1, save {money(group.saving)} a year</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">For example keep {group.keep.name}, the cheapest of {group.items.length}.</p>
              </div>
            ))}
          </div>
        )}

        {/* Rotation calendar */}
        {rotation && (
          <div className="mt-5">
            <h3 className="text-[13.5px] font-bold text-foreground">Rotation calendar: one streaming service a month</h3>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {rotation.months.map((month) => (
                <div key={month.label} className="rounded-xl bg-secondary/70 px-2.5 py-2 text-center">
                  <div className="text-[11px] font-bold text-muted-foreground">{month.label}</div>
                  <div className="mt-0.5 truncate text-[12.5px] font-bold text-foreground">{month.service.name}</div>
                  <div className="text-[11.5px] tabular-nums text-muted-foreground">{money(month.service.monthly)}</div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12.5px] text-foreground">
              6 months of rotating: <span className="font-bold">{money(rotation.rotationCost)}</span> vs {money(rotation.allCost)} for all of them.{' '}
              <span className="font-bold text-[#5ee6c8]">Saves {money(rotation.saved)}.</span>
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          {onScan && (
            <button type="button" onClick={onScan} className="rounded-2xl bg-primary px-5 py-3 text-[14.5px] font-bold text-primary-foreground">
              Scan my statement to find the rest
            </button>
          )}
          <a href="https://asi1.ai" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-border px-5 py-3 text-center text-[14.5px] font-bold text-foreground hover:border-primary/60">
            Track your ghosts in ASI:One: @ghostit
          </a>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">General information about subscriptions, not financial advice.</p>
      </div>
    </section>
  );
}
