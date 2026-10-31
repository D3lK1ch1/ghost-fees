import { useRef, useState } from 'react';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';
import { BANKS } from '@/lib/ghostFees/constants';

const MAX_FILES = 6;

export default function UploadPanel({ bankId, onBankChange, files, onFilesChange, onScan, onSample, errors }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (incoming) => {
    const next = [...files];
    Array.from(incoming).forEach((file) => {
      if (!/\.(pdf|csv)$/i.test(file.name)) return;
      if (next.some((existing) => existing.name === file.name && existing.size === file.size)) return;
      next.push(file);
    });
    onFilesChange(next.slice(0, MAX_FILES));
  };

  const removeFile = (index) => onFilesChange(files.filter((_, i) => i !== index));

  return (
    <section id="upload" className="mx-auto w-full max-w-3xl px-5 sm:px-8">
      <div className="rounded-[1.75rem] border border-white/[0.08] bg-card/70 p-5 shadow-[0_30px_80px_-50px_rgba(0,0,0,1)] sm:p-7">
        <h2 className="text-lg font-semibold tracking-tight text-white">Check your statement</h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Upload at least 3 months to detect subscriptions and price creep.
        </p>

        <div className="mt-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your bank</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {BANKS.map((bank) => {
              const active = bankId === bank.id;
              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => onBankChange(bank.id)}
                  className={
                    active
                      ? 'rounded-xl border border-primary/60 bg-primary/12 px-4 py-2 text-[13.5px] font-semibold text-primary'
                      : 'rounded-xl border border-white/[0.09] bg-white/[0.02] px-4 py-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-white'
                  }
                >
                  {bank.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
          className={
            dragging
              ? 'mt-5 cursor-pointer rounded-2xl border border-dashed border-primary/60 bg-primary/[0.06] px-4 py-8 text-center transition-colors'
              : 'mt-5 cursor-pointer rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-4 py-8 text-center transition-colors hover:border-white/25'
          }
        >
          <Upload className="mx-auto h-5 w-5 text-primary" strokeWidth={2.2} />
          <p className="mt-2.5 text-[13.5px] font-medium text-white">Drop PDFs or CSVs here</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Up to 6 files &bull; PDF or CSV</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.csv,text/csv,application/pdf"
            multiple
            className="hidden"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-primary/80" />
                  <span className="truncate text-[13px] text-white/90">{file.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {errors.length > 0 && (
          <ul className="mt-4 space-y-2">
            {errors.map((error) => (
              <li key={`${error.name}-${error.message}`} className="flex items-start gap-2 rounded-xl border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.07] px-3.5 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b6b]" />
                <span className="text-[12.5px] leading-relaxed text-[#ffb3b3]">
                  <span className="font-medium text-white/90">{error.name}: </span>
                  {error.message}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onSample}
            className="text-[13.5px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Try with sample data
          </button>
          <button
            type="button"
            onClick={onScan}
            disabled={!files.length}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="h-4 w-4" strokeWidth={2.4} />
            Find my ghosts
          </button>
        </div>
      </div>
    </section>
  );
}