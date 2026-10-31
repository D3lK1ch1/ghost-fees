import { AlertCircle, Upload } from 'lucide-react';
import GhostMark from '@/components/site/GhostMark';

export default function UploadErrors({ errors = [], onSample }) {
  return (
    <div className="mx-auto mt-10 w-full max-w-md px-5 sm:px-8">
      <AlertCircle className="mx-auto h-8 w-8 text-[#ff6b6b]" />
      <h2 className="mt-3 text-center text-2xl font-bold text-white">
        {errors.length > 1 ? "Couldn't read those files" : "Couldn't read that file"}
      </h2>

      <ul className="mt-5 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        {errors.map((error, index) => (
          <li key={`${error.name}-${index}`} className="px-4 py-3 text-left">
            <p className="truncate text-[13.5px] font-semibold text-white">{error.name}</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{error.message}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSample}
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:brightness-105"
        >
          Try the sample instead
        </button>
      </div>
    </div>
  );
}
