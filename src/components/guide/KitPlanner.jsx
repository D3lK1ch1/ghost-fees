import { useMemo, useState } from 'react';
import { CalendarPlus, Check, ExternalLink, Loader2, Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAllowance } from '@/lib/AllowanceContext';
import { cancelInfo } from '@/lib/ghostFees/cancelLinks';
import { cn } from '@/lib/utils';
import { money } from '@/lib/ghostFees/format';
import { trackEvent } from '@/lib/session';
import {
  AI_NEEDS, GENRES, aiPlan, aiToolFor, bundleGroups, mergeSubs, downloadRotation, isSampleService, itemLine, keepPlan, needList, parseTyped, researchVerdict, rotationPlan, splitShows, sumMonthly,
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

// "Make it happen": each one to cancel gets its checked cancel link and steps (never a
// guessed link), Cassy for the rest, and a button that marks it Cancelling in the list.
function CancelSteps({ items, onDecide, onCancelHelp, done, setDone }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((item) => {
        const info = cancelInfo(item.merchant || item.name);
        const marked = done.includes(item.name);
        return (
          <li key={item.name} className="rounded-xl border border-border bg-background/50 p-2.5 text-[13.5px]">
            <p className="font-bold text-foreground">Cancel {item.name} <span className="font-semibold text-muted-foreground">({money(item.monthly)} a month)</span></p>
            {isSampleService(item.name)
              ? <p className="mt-0.5 text-muted-foreground">Streammax is a made-up service in the sample, so there's nothing to cancel.</p>
              : info.url
                ? <p className="mt-0.5 text-muted-foreground">{info.steps} <a href={info.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-bold text-foreground underline-offset-4 hover:underline">Official cancel page <ExternalLink className="h-3 w-3" /></a></p>
                : <p className="mt-0.5 text-muted-foreground">No checked cancel link yet. {onCancelHelp ? 'Cassy can look it up.' : 'Search their official site for "cancel subscription".'}</p>}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {onDecide && item.id != null && !isSampleService(item.name) && (
                <button type="button" disabled={marked} onClick={() => { onDecide(item, 'cancel'); setDone((d) => [...d, item.name]); }}
                  className="rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground disabled:opacity-60">
                  {marked ? '✓ On my Cancelling list' : 'Add to my Cancelling list'}
                </button>
              )}
              {onCancelHelp && !info.url && !isSampleService(item.name) && (
                <button type="button" onClick={() => onCancelHelp([item.name])} className="rounded-full border border-border px-2.5 py-1 text-[12.5px] font-bold text-foreground">Ask Cassy to find it</button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Kit's research: what you like, where it streams (web search, sources shown), then a
// cost-benefit table and a keep / rotate verdict worked out by rules from it.
function KitResearch({ group, onDecide, onCancelHelp }) {
  const { openPaywall } = useAllowance();
  const [genres, setGenres] = useState([]);
  const [showsText, setShowsText] = useState('');
  const [state, setState] = useState({ status: 'idle' });
  const [done, setDone] = useState([]);
  const shows = splitShows(showsText);
  const services = group.items.filter((i) => !isSampleService(i.name)).map((i) => i.name);
  const toggle = (g) => setGenres((list) => (list.includes(g) ? list.filter((x) => x !== g) : [...list, g]));

  const run = async () => {
    setState({ status: 'loading' });
    trackEvent('kit_research');
    try {
      const res = await base44.functions.invoke('kitResearch', { services, shows, genres });
      const data = res?.data || {};
      if (data.locked) { setState({ status: data.reason === 'busy' ? 'busy' : 'locked' }); return; }
      if (!data.shows) throw new Error(data.error || 'empty');
      setState({ status: 'done', research: data });
    } catch {
      setState({ status: 'error' });
    }
  };

  const verdict = state.status === 'done' ? researchVerdict(group, state.research) : null;
  return (
    <div className="mt-3 rounded-xl border border-[#7fd1ff]/30 bg-[#7fd1ff]/[0.05] p-3">
      <p className="text-[14px] font-bold text-foreground">1. What do you like to watch?</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {GENRES.map((g) => <Pill key={g} on={genres.includes(g)} onClick={() => toggle(g)}>{g}</Pill>)}
      </div>
      <label className="mt-2 block">
        <span className="text-[13px] text-muted-foreground">Shows or films you watch (up to 5, commas between)</span>
        <input value={showsText} onChange={(e) => setShowsText(e.target.value)} maxLength={300} placeholder="Bridgerton, The Bear, Love Island"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-[#7fd1ff]" />
      </label>
      <button type="button" onClick={run} disabled={state.status === 'loading' || services.length < 2 || (!genres.length && !shows.length)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-bold text-[#0c1b26] disabled:opacity-50" style={{ background: KIT }}>
        {state.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {state.status === 'loading' ? 'Kit is checking where they stream...' : '2. Find where my shows are'}
      </button>
      {services.length < 2 && <p className="mt-1 text-[12.5px] text-muted-foreground">Kit needs two real services to compare.</p>}
      {group.items.some((i) => isSampleService(i.name)) && <p className="mt-1 text-[12.5px] text-muted-foreground">Streammax is a made-up sample service, so Kit only searches {services.join(' and ')}.</p>}
      {state.status === 'locked' && (
        <p className="mt-2 text-[13.5px] text-foreground">That was your free AI answer. <button type="button" onClick={() => openPaywall('guide')} className="font-bold underline">Unlock Ghost Fees</button> for unlimited research, or pick your favourite below.</p>
      )}
      {state.status === 'busy' && <p className="mt-2 text-[13.5px] text-muted-foreground">Lots of ghost hunters searching right now. Try again soon, or pick your favourite below.</p>}
      {state.status === 'error' && <p className="mt-2 text-[13.5px] text-muted-foreground">Kit couldn't search just now. Try again, or pick your favourite below.</p>}

      {verdict && (
        <div className="mt-3">
          <p className="text-[14px] font-bold text-foreground">3. Cost and benefit</p>
          <div className="mt-1.5 overflow-x-auto">
            <table className="w-full min-w-[440px] border-separate border-spacing-y-1 text-left text-[13px]">
              <thead className="text-[11.5px] uppercase tracking-wide text-muted-foreground">
                <tr><th className="pr-2 font-bold">Service</th><th className="pr-2 font-bold">A month</th><th className="pr-2 font-bold">Your shows</th><th className="pr-2 font-bold">Best for</th><th className="pr-2 font-bold">Per show</th><th className="font-bold">Kit says</th></tr>
              </thead>
              <tbody>
                {verdict.rows.map((r) => (
                  <tr key={r.item.name} className="align-top">
                    <td className="pr-2 font-bold text-foreground">{r.item.name}</td>
                    <td className="pr-2 text-foreground">{money(r.item.monthly)}</td>
                    <td className="pr-2 text-foreground">{r.sample ? <span className="text-muted-foreground">Sample, not searched</span> : r.shows.length ? r.shows.map((s) => (
                      <span key={s.title} className="block">{s.source ? <a href={s.source} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">{s.title}</a> : s.title}{s.note ? <span className="text-muted-foreground"> ({s.note})</span> : null}</span>
                    )) : <span className="text-muted-foreground">None</span>}</td>
                    <td className="pr-2 text-foreground">{r.genres.length ? r.genres.map((g) => g.genre).join(', ') : <span className="text-muted-foreground">-</span>}</td>
                    <td className="pr-2 text-foreground">{r.perShow != null ? money(r.perShow) : <span className="text-muted-foreground">-</span>}</td>
                    <td className="font-bold" style={{ color: r.verdict === 'Cancel' ? undefined : KIT }}>{r.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {verdict.missing.length > 0 && <p className="mt-1 text-[12.5px] text-muted-foreground">Not on any of yours: {verdict.missing.join(', ')}. Kit doesn't suggest new services.</p>}
          <p className="mt-1 text-[12px] text-muted-foreground">Where shows stream in Australia, checked {state.research.checked}. Catalogues change, so tap a show to see the source.</p>

          <p className="mt-3 text-[14px] font-bold text-foreground">4. Kit&apos;s plan</p>
          {verdict.mode === 'keep' && (
            <p className="mt-1 text-[14px] text-foreground">
              Keep <span className="font-bold">{verdict.top.item.name}</span>: it has {verdict.top.shows.length ? `${verdict.top.shows.length} of your ${verdict.top.shows.length === 1 ? 'show' : 'shows'}` : 'the most of what you like'}. {money(group.monthly)} a month becomes {money(verdict.top.item.monthly)}: <span className="font-bold" style={{ color: KIT }}>{money(verdict.keepSaving)} a month less</span>.
            </p>
          )}
          {verdict.mode === 'rotate' && (
            <>
              <p className="mt-1 text-[14px] text-foreground">Your shows are split, so rotate: one at a time, the one with most of yours first.</p>
              <ol className="mt-1 space-y-0.5 text-[14px]">
                {verdict.rotation.months.map((m, i) => {
                  const row = verdict.rows.find((r) => r.item === m.item);
                  const prev = verdict.rotation.months[i - 1]?.item;
                  return <li key={m.label}><span className="font-bold text-foreground">1 {m.label}:</span> <span className="text-muted-foreground">{prev ? `cancel ${prev.name}, start ` : ''}{m.item.name}{row?.shows.length ? ` for ${row.shows.map((s) => s.title).join(', ')}` : ''}</span></li>;
                })}
              </ol>
              <p className="mt-1 text-[14px] text-foreground">About <span className="font-bold">{money(verdict.rotation.average)} a month</span> instead of {money(group.monthly)}: <span className="font-bold" style={{ color: KIT }}>{money(verdict.rotation.saving)} a month less</span>.</p>
              <button type="button" onClick={() => { downloadRotation(verdict.rotation); trackEvent('kit_rotation_ics'); }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-bold text-[#0c1b26]" style={{ background: KIT }}>
                <CalendarPlus className="h-4 w-4" /> Add the rotation to my calendar
              </button>
            </>
          )}
          {verdict.mode === 'none' && <p className="mt-1 text-[14px] text-muted-foreground">None of your services has what you listed. Pick your favourite below instead.</p>}
          {verdict.cancel.length > 0 && <CancelSteps items={verdict.cancel} onDecide={onDecide} onCancelHelp={onCancelHelp} done={done} setDone={setDone} />}
        </div>
      )}
    </div>
  );
}

// Kit's planner: pick a group of double-ups, then keep one or rotate (streaming, food,
// gaming), or tick what you use AI for and a budget (AI tools). Rules only, no AI.
export default function KitPlanner({ subscriptions = [], compact = false, initialTab, initialTyped = '', onCancelHelp, onDecide, className = '' }) {
  // Anything typed ("Netflix $19, ChatGPT $30") joins the statement's subscriptions, so
  // Kit can sort every Ghost It pack, not only what the statement shows.
  const [typed, setTyped] = useState(initialTyped);
  const typedSubs = useMemo(() => parseTyped(typed), [typed]);
  const groups = useMemo(() => bundleGroups(mergeSubs(subscriptions, typedSubs)), [subscriptions, typedSubs]);
  const aiTools = groups.find((g) => g.key === 'ai')?.items || typedSubs.filter((t) => aiToolFor(t.merchant));
  const tabs = [...groups.filter((g) => g.key !== 'ai'), { key: 'ai', label: 'AI tools', emoji: '🤖' }];
  const [tab, setTab] = useState(tabs.some((t) => t.key === initialTab) ? initialTab : (tabs[0]?.key || 'ai'));
  const group = groups.find((g) => g.key === tab);
  const [fav, setFav] = useState({});
  const [mode, setMode] = useState('keep');
  const [needs, setNeeds] = useState([]);
  const [budget, setBudget] = useState(undefined);
  const [done, setDone] = useState([]);

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
            {t.emoji} {t.key === 'ai' ? `${aiTools.length > 1 ? `${aiTools.length} ` : ''}AI tools` : `${t.items.length} ${t.label}`}
          </Pill>
        ))}
      </div>

      <label className="mt-2 block">
        <span className="text-[12.5px] text-muted-foreground">Pay for something not on this statement? Type it with the price.</span>
        <input value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={400}
          placeholder="Disney+ $16, YouTube Premium $17, ChatGPT $30, Claude $30"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus:border-[#7fd1ff]" />
      </label>
      {typedSubs.length > 0 && <p className="mt-1 text-[12.5px] text-muted-foreground">Got it: {itemLine(typedSubs)}.</p>}
      {!groups.length && !typedSubs.length && <p className="mt-2 text-[13.5px] text-muted-foreground">No double-ups on this statement yet. Type what else you pay for and Kit checks every Ghost It pack: Screen, Sound, Tech Stack, Food and Play.</p>}

      {group && tab !== 'ai' && (
        <div className="mt-3">
          {!compact && (
            <p className="mb-2 text-[14px] text-foreground">
              {itemLine(group.items)}: <span className="font-bold">{money(group.monthly)} a month</span> together.
            </p>
          )}
          {group.tips?.length > 0 && (
            <ul className="mb-2 space-y-0.5 text-[12.5px] text-muted-foreground">
              {group.tips.map((tip) => <li key={tip}>💡 {tip}</li>)}
            </ul>
          )}
          {group.key === 'video' && <KitResearch key={group.key} group={group} onDecide={onDecide} onCancelHelp={onCancelHelp} />}
          <p className={cn('text-[14px] font-bold text-foreground', group.key === 'video' && 'mt-3')}>{group.key === 'video' ? 'Or just pick the one you watch most:' : group.ask}</p>
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
              {mode === 'keep' && <CancelSteps items={keep.cancel} onDecide={onDecide} onCancelHelp={onCancelHelp} done={done} setDone={setDone} />}
            </>
          )}
        </div>
      )}

      {tab === 'ai' && (
        <div className="mt-3">
          {aiTools.length >= 2
            ? <p className="text-[14px] text-foreground">{itemLine(aiTools)}: <span className="font-bold">{money(sumMonthly(aiTools))} a month</span>.</p>
            : <p className="text-[14px] text-muted-foreground">Type the AI tools you pay for above, with prices.</p>}
          {groups.find((g) => g.key === 'ai')?.tips.map((tip) => <p key={tip} className="mt-1 text-[12.5px] text-muted-foreground">💡 {tip}</p>)}
          <p className="mt-3 text-[14px] font-bold text-foreground">What do you use AI for? Tick all that apply.</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {AI_NEEDS.map((n) => <Pill key={n.key} on={needs.includes(n.key)} onClick={() => toggleNeed(n.key)}>{n.emoji} {n.label}</Pill>)}
          </div>
          <p className="mt-3 text-[14px] font-bold text-foreground">Your monthly budget for AI tools?</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {BUDGETS.map((b) => <Pill key={String(b)} on={budget === b} onClick={() => setBudget(b)}>{b ? `Up to $${b}` : 'No limit'}</Pill>)}
          </div>

          {aiTools.length < 2 && needs.length > 0 && <p className="mt-3 text-[14px] text-muted-foreground">Add at least two AI tools above and I'll sort them.</p>}
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
