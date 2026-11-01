import { useEffect, useState } from 'react';
import { CalendarDays, Ghost, House, Mail, MessageSquareHeart, MessagesSquare, Receipt, Repeat, Route, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import BrandHeader from '@/components/site/BrandHeader';
import LeakTotal from './LeakTotal';
import EmptyState from './EmptyState';
import LeakCard from './LeakCard';
import SubscriptionsSection from './SubscriptionsSection';
import ThemeStory from './ThemeStory';
import GuessReveal from './GuessReveal';
import FeedbackPanel from './FeedbackPanel';
import LeakEmailDialog from './LeakEmailDialog';
import FileErrors from './FileErrors';
import HauntedHouse from './HauntedHouse';
import PossessedReceipt from './PossessedReceipt';
import HauntedCalendar from './HauntedCalendar';
import GoalPath from './GoalPath';
import EmailsPanel from './EmailsPanel';
import NightSky from './NightSky';
import SiteFooter from '@/components/site/SiteFooter';
import GhostGuide from '@/components/guide/GhostGuide';
import { CardList, CardItem } from '@/components/GhostAnimations';
import { useScan } from '@/lib/ScanContext';
import { trackEvent } from '@/lib/session';
import { clearGhostList } from '@/lib/ghostFees/ghostList';
import { cn } from '@/lib/utils';

// One tab per feature so each is easy to find.
const TABS = [
  { key: 'ghosts', label: 'Ghosts', Icon: Ghost, title: 'Your ghosts, biggest first', blurb: 'Each card is one money leak, with the transactions behind it. Tap a card to mark it most useful.' },
  { key: 'house', label: 'Haunted House', Icon: House, title: 'Haunted House', blurb: 'Every room holds one kind of ghost. Pick a room, draft an email, then bust each ghost once it is sorted.' },
  { key: 'path', label: 'Goal path', Icon: Route, title: 'Goal path', blurb: 'One stop per ghost. Walk your lantern up the hill to the ghost-free house.' },
  { key: 'calendar', label: 'Calendar & reminders', Icon: CalendarDays, title: 'Haunted calendar', blurb: 'See the days you were charged, and add reminders for the next charges to your own calendar.' },
  { key: 'emails', label: 'Email templates', Icon: Mail, title: 'Email templates', blurb: 'Cancel, refund and fee-waiver emails, ready to edit and send.' },
  { key: 'subscriptions', label: 'Subscriptions', Icon: Repeat, title: 'Still using these?', blurb: 'Your regular subscriptions. Not counted in the total.' },
  { key: 'receipt', label: 'Possessed receipt', Icon: Receipt, title: 'Possessed receipt', blurb: 'Every ghost charge printed on one spooky receipt.' },
  { key: 'feedback', label: 'Feedback', Icon: MessageSquareHeart, title: 'Tell us in 20 seconds', blurb: 'Did it find something real? It helps us tune the ghost detector.' },
];

const WINDOWS = [
  { value: 0, label: 'All months' },
  { value: 12, label: 'Last 12 months' },
  { value: 6, label: 'Last 6 months' },
  { value: 3, label: 'Last 3 months' },
];

export default function ResultsView({ analysis, usedSample, onRestart, onSample }) {
  const { leaks, subscriptions, total, enoughHistory } = analysis;
  const { windowMonths, setWindowMonths, fileErrors, fileNames } = useScan();
  const [emailLeak, setEmailLeak] = useState(null);
  const [tab, setTab] = useState(() => {
    const linked = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    return TABS.some((item) => item.key === linked) ? linked : 'ghosts';
  });
  const [guideOpen, setGuideOpen] = useState(0);
  // Shared between the Haunted House and the goal path. Never stored.
  const [cleared, setCleared] = useState([]);
  const [remindersDone, setRemindersDone] = useState(false);
  const [subAnswers, setSubAnswers] = useState({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [lifeGoal, setLifeGoal] = useState({ name: '', amount: 0 });
  // Guess-your-number comes first; the guess stays in this tab only.
  const [guessDone, setGuessDone] = useState(false);
  const cancelSubs = subscriptions.filter((item) => subAnswers[item.id] === 'no');
  const draftCancel = (item) => openEmail({ id: `sub:${item.id}`, merchant: item.merchant, title: item.merchant, monthly: item.monthly, amount: item.monthly, action: 'cancel', badge: 'Subscription' });
  const current = TABS.find((item) => item.key === tab);

  // Wipes everything from this tab: results, busted ghosts, goals and chat.
  const clearData = () => {
    setConfirmClear(false);
    window.history.replaceState(null, '', window.location.pathname);
    clearGhostList();
    onRestart();
    toast({ title: 'Your data is cleared', description: 'Nothing from your statement is left in this tab.' });
  };

  // Keep the address bar on the open tab so the link can be shared.
  useEffect(() => {
    if (leaks.length) window.history.replaceState(null, '', `#${tab}`);
  }, [tab, leaks.length]);
  const [guideKey, setGuideKey] = useState('penny');
  const [pulseId, setPulseId] = useState(null);
  const [mostUsefulId, setMostUsefulId] = useState(null);
  const mostUseful = leaks.find((leak) => leak.id === mostUsefulId) || null;

  // Tapping a card (not one of its buttons) marks it as the most useful for feedback.
  const pickCard = (event, leak) => {
    if (event.target.closest('button, a')) return;
    setMostUsefulId((current) => (current === leak.id ? null : leak.id));
  };

  const openEmail = (leak) => {
    trackEvent('cancel_email_clicked');
    setEmailLeak(leak);
  };

  // Guide actions only run after the user taps the button under a reply.
  const onGuideAction = (action, leak) => {
    if (action === 'draft_email' && leak) openEmail(leak);
    if (action === 'open_house') {
      setTab('house');
      setTimeout(() => document.getElementById('ghosts')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    if ((action === 'open_leak' || action === 'show_transactions') && leak) {
      setTab('ghosts');
      setPulseId(leak.id);
      setTimeout(() => document.getElementById(`leak-${leak.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      setTimeout(() => setPulseId(null), 2400);
    }
    if (action === 'open_calendar' || action === 'open_emails' || action === 'open_path') {
      setTab({ open_calendar: 'calendar', open_emails: 'emails', open_path: 'path' }[action]);
      setTimeout(() => document.getElementById('ghosts')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    if (action === 'scroll_feedback') {
      setTab('feedback');
      setTimeout(() => document.getElementById('ghosts')?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div className="relative min-h-screen">
      <NightSky />
      <div className="relative z-10">
      <BrandHeader
        right={(
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[12.5px] font-bold text-foreground transition-colors hover:border-[#ff6b8a]/70 hover:text-[#ff9db1]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear my data
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="hidden text-[13px] font-bold text-primary underline underline-offset-4 sm:inline"
            >
              Scan another statement
            </button>
          </div>
        )}
      />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-retro text-[15px] uppercase tracking-[0.16em] text-primary/80">The reading</p>
          <label className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
            <span className="sr-only">Statement period</span>
            <select
              value={windowMonths}
              onChange={(event) => setWindowMonths(Number(event.target.value))}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] font-bold text-foreground outline-none focus:border-primary"
            >
              {WINDOWS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {leaks.length > 0 && !guessDone ? (
          <GuessReveal total={total} months={analysis.monthSpan} onDone={() => setGuessDone(true)} />
        ) : leaks.length ? (
          <LeakTotal
            total={total}
            months={analysis.monthSpan}
            from={analysis.firstDate}
            to={analysis.lastDate}
            monthlyIncome={analysis.monthlyIncome}
            leakCount={leaks.length}
            fileNames={fileNames}
            onClearData={() => setConfirmClear(true)}
          />
        ) : (
          <EmptyState fileNames={fileNames} onRestart={onRestart} onSample={onSample} transactionCount={analysis.transactionCount} months={analysis.monthSpan} />
        )}

        {leaks.length > 0 && guessDone && <ThemeStory subscriptions={subscriptions} leaksTotal={total} />}

        <p className="mt-3 flex items-start gap-2 rounded-2xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] px-4 py-2.5 text-[12.5px] leading-relaxed text-[#bff5e8]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5ee6c8]" />
          <span>
            <span className="font-bold text-[#e6fffa]">Nothing is saved.</span> Your results live only in this browser tab and are gone when you close it or press Clear my data.
            {fileNames.some((name) => /\.pdf$/i.test(name)) && ' PDFs are uploaded privately so they can be read.'}
          </span>
        </p>

        <FileErrors errors={fileErrors} />

        {!enoughHistory && (
          <div className="mt-4 rounded-2xl border border-[#ffb37c]/25 bg-[#ffb37c]/[0.06] px-4 py-3.5 text-[13px] leading-relaxed text-[#ffb37c]">
            Upload at least 3 months to catch subscriptions and price rises.
          </div>
        )}

        {leaks.length ? (
          <div id="ghosts" className="mt-6 scroll-mt-4 lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
            <nav
              aria-label="Results sections"
              className="sticky top-0 z-20 -mx-5 mb-4 flex gap-1.5 overflow-x-auto border-b border-border bg-background/90 px-5 py-2.5 backdrop-blur sm:-mx-8 sm:px-8 lg:top-4 lg:mx-0 lg:mb-0 lg:flex-col lg:self-start lg:overflow-visible lg:rounded-2xl lg:border lg:bg-card/80 lg:p-2"
            >
              {TABS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  aria-current={tab === item.key ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-left text-[13px] font-bold transition-colors',
                    tab === item.key ? 'bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.35)]' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                  )}
                >
                  <item.Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {item.key === 'ghosts' && (
                    <span className={cn('ml-auto rounded-full px-1.5 text-[11px]', tab === item.key ? 'bg-primary-foreground/20' : 'bg-white/10')}>{leaks.length}</span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setGuideOpen((count) => count + 1)}
                className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl border border-primary/40 px-3 py-2 text-left text-[13px] font-bold text-primary transition-colors hover:bg-primary/10 lg:mt-2"
              >
                <MessagesSquare className="h-4 w-4 shrink-0" />
                Ask a ghost
              </button>
            </nav>

            <div key={tab} className="min-w-0 animate-rise">
              <h2 className="font-heading text-xl font-semibold text-foreground">{current.title}</h2>
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{current.blurb}</p>

              {tab === 'ghosts' && (
                <CardList className="mt-4 grid gap-3 sm:grid-cols-2">
                  {leaks.map((leak, index) => (
                    <CardItem key={leak.id} index={index}>
                      <div
                        id={`leak-${leak.id}`}
                        onClick={(event) => pickCard(event, leak)}
                        className={cn(
                          'relative h-full cursor-pointer rounded-3xl transition-shadow duration-500',
                          mostUsefulId === leak.id && 'shadow-[0_0_0_3px_hsl(var(--primary)),0_0_24px_hsl(var(--primary)/0.35)]',
                          pulseId === leak.id && 'animate-pulse shadow-[0_0_0_3px_hsl(var(--primary))]',
                        )}
                      >
                        {mostUsefulId === leak.id && (
                          <span className="absolute -top-2.5 left-4 z-10 animate-poof rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow">
                            Most useful
                          </span>
                        )}
                        <LeakCard leak={leak} onDraft={() => openEmail(leak)} />
                      </div>
                    </CardItem>
                  ))}
                </CardList>
              )}
              {tab === 'house' && (
                <HauntedHouse leaks={leaks} onDraft={openEmail} monthlyIncome={analysis.monthlyIncome} guideKey={guideKey} onGuide={setGuideKey} cleared={cleared} onClearedChange={setCleared} onSetGoals={() => setTab('path')} onAskGuide={() => setGuideOpen((count) => count + 1)} />
              )}
              {tab === 'path' && (
                <GoalPath
                  leaks={leaks}
                  subscriptions={subscriptions}
                  cleared={cleared}
                  onClearedChange={setCleared}
                  remindersDone={remindersDone}
                  onRemindersDone={setRemindersDone}
                  onDraft={openEmail}
                  onOpenHouse={() => setTab('house')}
                  cancelSubs={cancelSubs}
                  lifeGoal={lifeGoal}
                  onLifeGoal={setLifeGoal}
                  guideKey={guideKey}
                />
              )}
              {tab === 'calendar' && <HauntedCalendar leaks={leaks} subscriptions={subscriptions} />}
              {tab === 'emails' && <EmailsPanel leaks={leaks} onDraft={openEmail} />}
              {tab === 'subscriptions' && (
                <SubscriptionsSection
                  subscriptions={subscriptions}
                  leaks={leaks}
                  answers={subAnswers}
                  onAnswer={setSubAnswers}
                  onDraftCancel={draftCancel}
                  onOpenPath={() => setTab('path')}
                />
              )}
              {tab === 'receipt' && <PossessedReceipt leaks={leaks} />}
              {tab === 'feedback' && (
                <div id="feedback">
                  <FeedbackPanel usedSample={usedSample} leaksFound={leaks.length} yearlyTotal={total} mostUseful={mostUseful} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <SubscriptionsSection subscriptions={subscriptions} />
            <div id="feedback" className="scroll-mt-6">
              <FeedbackPanel usedSample={usedSample} leaksFound={leaks.length} yearlyTotal={total} mostUseful={mostUseful} />
            </div>
          </>
        )}
      </main>

      <SiteFooter />

      <LeakEmailDialog leak={emailLeak} onClose={() => setEmailLeak(null)} />

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent className="max-w-md rounded-[1.5rem] border-border bg-popover p-0">
          <div className="p-5 sm:p-6">
            <DialogTitle className="flex items-center gap-2 pr-8 font-heading text-lg font-semibold text-foreground">
              <Trash2 className="h-5 w-5 text-[#ff9db1]" />
              Clear my data?
            </DialogTitle>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">This wipes everything from this browser tab straight away:</p>
            <ul className="mt-3 space-y-1.5 text-[13px] text-foreground">
              {['Your statement and every transaction read from it', 'The ghosts, totals and receipt', 'Busted ghosts, goals, your life goal and subscription answers', 'Your chat with the ghost guide'].map((item) => (
                <li key={item} className="flex gap-2"><span className="text-[#5ee6c8]">✓</span>{item}</li>
              ))}
            </ul>
            <p className="mt-3 flex gap-2 rounded-xl border border-[#5ee6c8]/25 bg-[#5ee6c8]/[0.06] px-3 py-2 text-[12px] leading-relaxed text-[#bff5e8]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#5ee6c8]" />
              <span>
                CSVs never left your browser, so there is nothing to delete anywhere else.
                {fileNames.some((name) => /\.pdf$/i.test(name)) && ' PDFs you uploaded were stored privately so they could be read.'}
              </span>
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setConfirmClear(false)} className="rounded-xl border border-border py-2.5 text-[14px] font-bold text-foreground transition-colors hover:bg-white/5">
                Cancel
              </button>
              <button type="button" onClick={clearData} className="rounded-xl bg-[#ff6b8a] py-2.5 text-[14px] font-bold text-white transition-transform hover:-translate-y-0.5">
                Clear now
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GhostGuide analysis={analysis} guideKey={guideKey} onGuide={setGuideKey} onAction={onGuideAction} openRequest={guideOpen} />
    </div>
  );
}