import { AlertCircle, Upload } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';

export default function UploadErrors({ errors = [], onSample, onUpload }) {
  return (
    <div className="mx-auto mt-10 w-full max-w-lg px-5 text-center sm:px-8">
      <AlertCircle className="mx-auto h-8 w-8 text-[#ff6b6b]" />
      <h2 className="mt-3 text-2xl font-bold text-white">
        {errors.length > 1 ? 'We couldn\u2019t read those files' : 'We couldn\u2019t read that file'}
      </h2>

      <ul className="mt-4 space-y-2 text-left">
        {errors.map((error, index) => (
          <li key={`${error.name}-${index}`} className="rounded-xl border border-border bg-card/60 px-4 py-3">
            <span className="inline-block max-w-full truncate rounded-md bg-background px-2 py-0.5 font-mono text-[12.5px] font-bold text-foreground">
              {error.name}
            </span>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{error.message}</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">
        We need a .csv or .pdf with date, description and amount. Most banks have it under{' '}
        <span className="font-bold text-foreground">Export transactions</span>.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onSample}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:brightness-105"
        >
          <GhostMark className="h-5 w-5 text-primary-foreground" eyeColor="hsl(30 100% 62%)" />
          Try the sample instead
        </button>
        {onUpload && (
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card/60 px-6 py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:border-primary/50"
          >
            <Upload className="h-4 w-4" />
            Upload a different file
          </button>
        )}
      </div>
      <p className="mt-5 text-[12.5px] text-muted-foreground">CSVs are processed in your browser. Never stored. No sign-in.</p>
    </div>
  );
}
