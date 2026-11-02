import { BadgeDollarSign, MailCheck, Upload } from 'lucide-react';

// The first thing on the home page in every theme, before any art: the promise
// (UVP), what it does and who it's for, kept short on purpose. The rest of the
// detail (Is this you?, Free vs Pro) lives in the home tabs.
// Testers: "make the value statement clear from the start and more concise",
// "information overload".
const STEPS = [
  { title: 'Upload', line: 'a bank statement (CSV or PDF)', Icon: Upload },
  { title: 'See', line: 'every leak, in dollars', Icon: BadgeDollarSign },
  { title: 'Cancel', line: 'with ready-made steps and emails', Icon: MailCheck },
];

export default function ValueLine({ onSample }) {
  return (
    <section data-tour="uvp" aria-label="What Ghost Fees does and who it's for" className="mx-auto mt-4 w-full max-w-2xl rounded-3xl border border-primary/40 bg-primary/[0.07] px-5 py-5 text-center">
      <p className="font-heading text-[26px] font-bold leading-tight text-foreground sm:text-[30px]">
        Ghost them once. <span className="text-primary">Pay once.</span>
      </p>
      <p className="mx-auto mt-1.5 max-w-lg text-[15px] leading-snug text-muted-foreground">
        Ghost Fees finds the subscriptions and bank fees you forgot you&apos;re paying, then helps you cancel them. No bank login.
      </p>
      <p className="mt-2 text-[14px] text-muted-foreground">For Australians juggling subscriptions: students, sharehouses, couples and families.</p>

      {/* How it works: a clean list, top to bottom. Number, icon, then one line. */}
      <ol className="mx-auto mt-4 flex max-w-md flex-col gap-2 text-left" aria-label="How it works">
        {STEPS.map(({ title, line, Icon }, index) => (
          <li key={title} className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-3.5 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-[16px] font-bold text-primary-foreground">{index + 1}</span>
            <Icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} aria-hidden="true" />
            <span className="min-w-0 text-[15.5px] leading-snug text-muted-foreground"><b className="font-bold text-foreground">{title}</b> {line}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {onSample && (
          <button type="button" data-tour="try" onClick={onSample} className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
            See it on a sample in 10 seconds
          </button>
        )}
      </div>
      <p className="mt-2 text-[12.5px] text-muted-foreground">Free to start. Pro is $10 once, never a subscription. Free while we&apos;re in beta.</p>
    </section>
  );
}
