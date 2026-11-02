// The plain-English value statement, first thing on the home page in every theme,
// before any art. A tester said: "make the value statement clear from the start and
// more concise... it was really hard to understand" (2 Nov, 3 of 5).
export default function ValueLine({ onSample }) {
  return (
    <section aria-label="What Ghost Fees does" className="mx-auto mt-4 w-full max-w-2xl rounded-3xl border border-primary/40 bg-primary/[0.07] px-5 py-4 text-center">
      <p className="font-heading text-[19px] font-bold leading-snug text-foreground sm:text-[21px]">
        Find the subscriptions and bank fees you forgot you&apos;re paying, then cancel them.
      </p>
      <ol className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13.5px] font-semibold text-muted-foreground">
        <li><span className="font-bold text-primary">1</span> Upload a bank statement</li>
        <li aria-hidden="true">›</li>
        <li><span className="font-bold text-primary">2</span> See every leak in dollars</li>
        <li aria-hidden="true">›</li>
        <li><span className="font-bold text-primary">3</span> Cancel with ready-made steps and emails</li>
      </ol>
      <p className="mt-2 text-[12.5px] text-muted-foreground">
        Free, no bank login.{' '}
        {onSample && (
          <button type="button" onClick={onSample} className="font-bold text-primary underline underline-offset-4">See it on a sample in 10 seconds</button>
        )}
      </p>
    </section>
  );
}
