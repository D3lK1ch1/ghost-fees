import { TourButton } from '@/components/landing/HomeTour';

// The first thing on the home page in every theme, before any art: the promise
// (UVP), what it does and who it's for, kept short on purpose. The rest of the
// detail (Is this you?, Free vs Pro) lives in the home tabs.
// Testers: "make the value statement clear from the start and more concise",
// "information overload".
export default function ValueLine({ onSample }) {
  return (
    <section data-tour="uvp" aria-label="What Ghost Fees does and who it's for" className="mx-auto mt-4 w-full max-w-2xl rounded-3xl border border-primary/40 bg-primary/[0.07] px-5 py-5 text-center">
      <p className="font-heading text-[26px] font-bold leading-tight text-foreground sm:text-[30px]">
        Ghost them once. <span className="text-primary">Pay once.</span>
      </p>
      <p className="mx-auto mt-1.5 max-w-lg text-[15px] leading-snug text-muted-foreground">
        Ghost Fees finds the subscriptions and bank fees you forgot you&apos;re paying, then helps you cancel them. No bank login.
      </p>
      <p className="mt-2 text-[13px] text-muted-foreground">For Australians juggling subscriptions: students, sharehouses, couples and families.</p>

      <ol className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted-foreground">
        <li><span className="font-bold text-primary">1</span> Upload a bank statement</li>
        <li aria-hidden="true">›</li>
        <li><span className="font-bold text-primary">2</span> See every leak in dollars</li>
        <li aria-hidden="true">›</li>
        <li><span className="font-bold text-primary">3</span> Cancel with ready-made steps</li>
      </ol>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {onSample && (
          <button type="button" data-tour="try" onClick={onSample} className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
            See it on a sample in 10 seconds
          </button>
        )}
        <TourButton />
      </div>
      <p className="mt-2 text-[11.5px] text-muted-foreground">Free to start. Pro is $10 once, never a subscription. Free while we&apos;re in beta.</p>
    </section>
  );
}
