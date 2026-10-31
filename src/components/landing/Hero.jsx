import { Upload, Lock } from 'lucide-react';
import StatementCard from './StatementCard';

export default function Hero({ onSample, onUpload }) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pt-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-8">
      <div className="animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/25">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Free scan &bull; no sign-up
        </span>
        <h1 className="mt-6 text-[2.7rem] font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-[4.1rem]">
          Your bank account is <span className="text-primary">haunted.</span>
        </h1>
        <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
          Upload a bank statement. We find the subscriptions and fees quietly draining you.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
          >
            <Upload className="h-4 w-4" strokeWidth={2.4} />
            Upload a statement
          </button>
          <button
            type="button"
            onClick={onSample}
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.07]"
          >
            Try with sample data
          </button>
        </div>
        <p className="mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground/80">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Never your bank login. CSVs are read in your browser, and nothing is saved to an account.
        </p>
      </div>
      <div className="animate-rise pb-6 lg:justify-self-end">
        <StatementCard />
      </div>
    </section>
  );
}