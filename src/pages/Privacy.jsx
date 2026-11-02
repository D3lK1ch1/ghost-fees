import BrandHeader from '@/components/site/BrandHeader';
import SiteFooter from '@/components/site/SiteFooter';

// Exactly what is kept, where, and for how long. Keep this true: update it with every data change.
const STORED = [
  { what: 'Your results, Ghost List and theme', where: 'Your browser only', how: 'Until you press Clear my data or clear your browser' },
  { what: 'Proof of cancelling (how and when, references, screenshots you add)', where: 'Your browser only, with your Ghost List. Never uploaded', how: 'Until you press Clear my data, remove it, or clear your browser' },
  { what: 'CSV statements', where: 'Never leave your browser', how: 'Not stored' },
  { what: 'PDF statements', where: 'Base44 private storage, so they can be read', how: 'Kept for now: we are working on deleting them right after reading' },
  { what: 'Anonymous usage events (e.g. "scan finished")', where: 'Ghost Fees database', how: 'A random session id and the event type only' },
  { what: 'Feedback you choose to send', where: 'Ghost Fees database', how: 'Only what you type, plus how many ghosts were found and their total' },
  { what: 'Calendar sync, only if you turn it on', where: 'Ghost Fees database, behind a private link', how: 'Reminder titles, amounts and dates you chose to sync, until you press Stop syncing' },
  { what: 'Cassy cancel lookups', where: 'Sent to our AI provider to search the web', how: 'Only the company name; nothing is stored' },
  { what: 'Visits from the Ghost It agent', where: 'Ghost Fees database', how: 'Date, where you came from, and how many subscriptions were passed (no names or prices)' },
  { what: 'Your account, if you sign in', where: 'Base44 sign-in', how: 'Email and name, until you delete your account' },
  { what: 'Free tier used and whether you paid', where: 'Ghost Fees database, only our server can read it', how: 'Counts, plus scrambled one-way codes for the files you scanned (from file name, size and date, never the contents) and the one subscription Cassy looked up. No statement, transactions, merchants or results.' },
  { what: 'Payment, if you unlock', where: 'Stripe', how: 'Stripe holds your card. We keep the Stripe session id, the amount and the date.' },
];

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <BrandHeader />
      <main className="mx-auto w-full max-w-2xl px-5 pb-6 sm:px-8">
        <h1 className="font-heading text-[2rem] font-bold leading-tight text-foreground">Privacy: exactly what we keep</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          No bank login, ever. We never sell your data. Here is everything Ghost Fees keeps.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-secondary/60 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-bold">What</th>
                <th className="px-3 py-2 font-bold">Where</th>
                <th className="px-3 py-2 font-bold">How much, how long</th>
              </tr>
            </thead>
            <tbody>
              {STORED.map((row) => (
                <tr key={row.what} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-bold text-foreground">{row.what}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.where}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 font-heading text-[20px] font-semibold text-foreground">Delete my data</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
          <li>Results and Ghost List: press <span className="font-bold text-foreground">Clear my data</span> on the results page.</li>
          <li>Calendar sync: press <span className="font-bold text-foreground">Stop syncing</span> in the calendar and the reminders are deleted.</li>
          <li>Feedback, usage events and uploaded PDFs: these are anonymous, so tell us roughly when you scanned and we will delete them.</li>
          <li>Your account: ask us and we will delete it.</li>
        </ul>
        <p className="mt-3 rounded-xl border border-dashed border-[#ffc27a] bg-[#ffc27a]/10 px-3 py-2 text-[13.5px] font-bold text-[#ffc27a]">
          [FOUNDERS: add a contact email for deletion requests]
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
