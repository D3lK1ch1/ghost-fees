import { useMemo, useState } from 'react';
import { CalendarPlus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { trackEvent } from '@/lib/session';
import {
  AI_NEEDS, aiPlan, bundleGroups, downloadRotation, itemLine, keepPlan, needList, parseTyped, rotationPlan, sumMonthly,
} from '@/lib/ghostFees/bundles';

const KIT = '#7fd1ff';
const BUDGETS = [20, 40, 60, null];

const Pill = ({ on, onClick, children, label }) => (
  <button type="button" onClick={onClick} aria-pressed={on} aria-label={label}
    className={cn('rounded-full border px-3 py-1.5 text-[13px] font-bold transition-colors', on ? 'border-transparent text-[#0c1b26]' : 'border-border bg-background/60 text-muted-foreground hover:text-foreground')}
    style={on ? { background: KIT } : undefined}>
    {children}
  </button>
);

function Row({ keep, name, price, note }) {
  return (
    <li className="flex items-start gap-2 text-[14px] leading-snug">
      {keep ? <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: KIT }} strokeWidth={3} /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={3} />}
      <span className={keep ? 'text-foreground' : 'text-muted-foreground line-through decoration-1'}>
        <span className="font-bold">{name}</span> {money(price)} a month{note ? <span className="no-underline"> · {note}</span> : null}
      </span>
    </li>
  );
}

// Kit's planner: pick a group of double-ups, then keep one or rotate (streaming, food,
// gaming), or tick what you use AI for and a budget (AI tools). Rules only, no AI.
export default function KitPlanner({ subscriptions = [], compact = false, initialTab, initialTyped = '', onCancelHelp, className = '' }) {
  const groups = useMemo(() => bundleGroups(subscriptions), [subscriptions]);
  const [typed, setTyped] = useState(initialTyped);
  const typedTools = useMemo(() => parseTyped(typed), [typed]);
  const statementAi = groups.find((g) => g.key === 'ai')?.items || [];
  const aiTools = typedTools.length ? typedTools : statementAi;
  const tabs = [...groups.filter((g) => g.key !== 'ai'), { key: 'ai', label: 'AI tools', emoji: '🤖' }];
  const [tab, setTab] = useState(tabs.some((t) => t.key === initialTab) ? initialTab : (tabs[0]?.key || 'ai'));
  const group = groups.find((g) => g.key === tab);
  const [fav, setFav] = useState({});
  const [mode, setMode] = useState('keep');
  const [needs, setNeeds] = useState([]);
  const [budget, setBudget] = useState(undefined);

  const pickFav = (name) => { setFav((f) => ({ ...f, [tab]: name })); trackEvent('kit_pick'); };
  const toggleNeed = (key) => setNeeds((n) => (n.includes(key) ? n.filter((k) => k !== key) : [...n, key]));

  const keep = group && fav[tab] ? keepPlan(group, fav[tab]) : null;
  const rota = group && fav[tab] && group.rotate ? rotationPlan(group, fav[tab]) : null;
  const plan = tab === 'ai' && aiTools.length >= 2 && needs.length && budget !== undefined ? aiPlan(aiTools, needs, budget) : null;

  return (
    <div className={cn('rounded-2xl border bg-card/80 p-4', compact ? 'border-border' : 'border-[#7fd1ff]/40', className)}>
      {!compact && (
        <p className="font-heading text-[15px] font-bold text-foreground">
          <span style={{ color: KIT }}>Kit</span> · keep one, rotate the rest
        </p>
      )}
      <div className={cn('flex flex-wrap gap-1.5', !compact && 'mt-2')} role="tablist" aria-label="Which double-ups">
        {tabs.map((t) => (
          <Pill key={t.key} on={tab === t.key} onClick={() => setTab(t.key)}>
            {t.emoji} {t.key === 'ai' ? 'AI tools' : `${t.items.length} ${t.label}`}
          </Pill>
        ))}
      </div>

      {group && tab !== 'ai' && (
        <div className="mt-3">
          <p className="text-[14px] text-foreground">
            {itemLine(group.items)}: <span className="font-bold">{money(group.monthly)} a month</span> together.
          </p>
          <p className="mt-2 text-[14px] font-bold text-foreground">{group.ask}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {group.items.map((item) => <Pill key={item.name} on={fav[tab] === item.name} onClick={() => pickFav(item.name)}>{item.name}</Pill>)}
          </div>

          {keep && (
            <>
              {group.rotate && (
                <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Keep one or rotate">
                  <Pill on={mode === 'keep'} onClick={() => setMode('keep')}>Keep {keep.keep.name} only</Pill>
                  <Pill on={mode === 'rotate'} onClick={() => setMode('rotate')}>Rotate, one a month</Pill>
                </div>
              )}
              {(mode === 'keep' || !rota) && (
                <div className="mt-3">
                  <ul className="space-y-1">
                    <Row keep name={keep.keep.name} price={keep.keep.monthly} />
                    {keep.cancel.map((i) => <Row key={i.name} name={i.name} price={i.monthly} />)}
                  </ul>
                  <p className="mt-2 text-[14px] text-foreground">
                    {money(keep.now)} a month becomes <span className="font-bold">{money(keep.keep.monthly)}</span>: <span className="font-bold" style={{ color: KIT }}>{money(keep.saving)} a month less</span>.
                  </p>
                </div>
              )}
              {mode === 'rotate' && rota && (
                <div className="mt-3">
                  <ol className="space-y-1 text-[14px]">
                    {rota.months.map((m) => (
                      <li key={m.label + m.item.name}><span className="font-bold text-foreground">{m.label}:</span> <span className="text-muted-foreground">{m.item.name} only ({money(m.item.monthly)})</span></li>
                    ))}
                  </ol>
                  <p className="mt-2 text-[14px] text-foreground">
                    One at a time is about <span className="font-bold">{money(rota.average)} a month</span> instead of {money(rota.now)}: <span className="font-bold" style={{ color: KIT }}>{money(rota.saving)} a month less</span>, and you still see everything.
                  </p>
                  <button type="button" onClick={() => { downloadRotation(rota); trackEvent('kit_rotation_ics'); }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-bold text-[#0c1b26]" style={{ background: KIT }}>
                    <CalendarPlus className="h-4 w-4" /> Add the rotation to my calendar
                  </button>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">A reminder 2 days before each switch, so you cancel before it renews.</p>
                </div>
              )}
              {onCancelHelp && <button type="button" onClick={() => onCancelHelp(keep.cancel.map((i) => i.name))} className="mt-2 text-[13.5px] font-bold underline-offset-4 hover:underline" style={{ color: KIT }}>How do I cancel the others? →</button>}
            </>
          )}
        </div>
      )}

      {tab === 'ai' && (
        <div className="mt-3">
          {statementAi.length >= 2 && !typed
            ? <p className="text-[14px] text-foreground">On your statement: {itemLine(statementAi)}: <span className="font-bold">{money(sumMonthly(statementAi))} a month</span>.</p>
            : <p className="text-[14px] text-muted-foreground">Type the AI tools you pay for and what each costs a month.</p>}
          <label className="mt-2 block">
            <span className="sr-only">AI tools you pay for</span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={300}
              placeholder="ChatGPT $30, Claude $30, Midjourney $15"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-[#7fd1ff]" />
          </label>
          {typedTools.length > 0 && <p className="mt-1 text-[12.5px] text-muted-foreground">Got it: {itemLine(typedTools)}.</p>}

          <p className="mt-3 text-[14px] font-bold text-foreground">What do you use AI for? Tick all that apply.</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {AI_NEEDS.map((n) => <Pill key={n.key} on={needs.includes(n.key)} onClick={() => toggleNeed(n.key)}>{n.emoji} {n.label}</Pill>)}
          </div>
          <p className="mt-3 text-[14px] font-bold text-foreground">Your monthly budget for AI tools?</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {BUDGETS.map((b) => <Pill key={String(b)} on={budget === b} onClick={() => setBudget(b)}>{b ? `Up to $${b}` : 'No limit'}</Pill>)}
          </div>

          {aiTools.length < 2 && needs.length > 0 && <p className="mt-3 text-[14px] text-muted-foreground">Add at least two tools above and I'll sort them.</p>}
          {plan && (
            <div className="mt-3 rounded-xl border border-[#7fd1ff]/30 bg-[#7fd1ff]/[0.06] p-3">
              <p className="text-[14px] font-bold text-foreground">Keep {plan.keep.length} {plan.keep.length === 1 ? 'tool' : 'tools'}:</p>
              <ul className="mt-1 space-y-1">
                {plan.keep.map((t) => <Row key={t.name} keep name={t.name} price={t.monthly} note={t.uses.length ? `for ${needList(t.uses)}` : null} />)}
                {plan.cancel.map((t) => <Row key={t.name} name={t.name} price={t.monthly} />)}
              </ul>
              <p className="mt-2 text-[14px] text-foreground">
                {money(plan.now)} a month becomes <span className="font-bold">{money(plan.cost)}</span>: <span className="font-bold" style={{ color: KIT }}>{money(plan.saving)} a month less</span>.
              </p>
              {plan.uncovered.length > 0 && (
                <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                  {plan.missing.length ? `None of your tools covers ${needList(plan.missing)}. ` : ''}
                  {plan.uncovered.filter((k) => !plan.missing.includes(k)).length ? `To stay within $${plan.budget}, this leaves out ${needList(plan.uncovered.filter((k) => !plan.missing.includes(k)))}. ` : ''}
                  I only pick from what you already pay for.
                </p>
              )}
              {plan.overBudget && <p className="mt-1.5 text-[13.5px] text-muted-foreground">Nothing you have fits ${plan.budget} for all of that, so this is the cheapest mix that covers it.</p>}
              <p className="mt-1.5 text-[12px] text-muted-foreground">Based on each tool&apos;s main features. Check your plan includes them before you cancel.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
