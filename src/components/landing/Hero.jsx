import { Lock, Upload } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';
import StatementCard from './StatementCard';

export default function Hero({ onSample, onUpload }) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pt-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-8">
      <div className="animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/25">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Free scan &bull; no sign-up
        </span>
        <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[3.9rem]">
          Find the ghosts haunting your bank account
        </h1>
        <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
          We read your statement and surface the subscriptions, price rises and bank fees you forgot about.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onSample}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
          >
            <GhostMark className="h-4 w-4" />
            Try a sample statement
          </button>
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.07]"
          >
            <Upload className="h-4 w-4" strokeWidth={2.4} />
            Upload my CSV
          </button>
        </div>

        <p className="mt-6 flex items-center gap-2 text-[13px] leading-relaxed text-muted-foreground/80">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          Your file is processed and never stored.
        </p>
      </div>

      <div className="animate-rise pb-6 lg:justify-self-end">
        <StatementCard />
      </div>
    </section>
  );
}