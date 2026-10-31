import { Lock, Upload } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';

const TAGS = ['Forgotten subscriptions', 'Sneaky fees', 'Price creep'];

export default function Hero({ onSample, onUpload }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl animate-rise flex-col items-center px-5 pb-16 pt-6 text-center sm:px-8">
      <div className="rounded-full p-6 shadow-[0_0_80px_hsl(var(--primary)/0.22)]">
        <GhostMark className="h-24 w-24 text-foreground sm:h-28 sm:w-28" eyeColor="#150e28" />
      </div>

      <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] text-foreground sm:text-[4rem]">
        Find the ghosts haunting your bank account.
      </h1>
      <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
        Drop in a bank statement. We find forgotten subscriptions, sneaky fees and price creep.
      </p>

      <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onSample}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[17px] font-bold text-primary-foreground shadow-[0_8px_40px_hsl(var(--primary)/0.35)] transition-transform hover:-translate-y-0.5"
        >
          <GhostMark className="h-5 w-5 text-primary-foreground" eyeColor="hsl(30 100% 62%)" />
          Try a sample statement
        </button>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 px-6 py-3.5 text-[15px] font-bold text-foreground transition-colors hover:border-primary/50"
        >
          <Upload className="h-4 w-4" strokeWidth={2.4} />
          Upload my CSV or PDF
        </button>
      </div>

      <p className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
        CSVs are processed in your browser. PDFs are read once, then deleted. No sign-in.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-2.5">
        {TAGS.map((tag) => (
          <span key={tag} className="rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-[13px] font-bold text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}