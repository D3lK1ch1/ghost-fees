import { AlertCircle } from 'lucide-react';

export default function UploadErrors({ errors }) {
  return (
    <div className="mx-auto mt-10 w-full max-w-3xl px-5 sm:px-8">
      <ul className="space-y-2">
        {errors.map((error) => (
          <li
            key={`${error.name}-${error.message}`}
            className="flex items-start gap-2 rounded-xl border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.07] px-3.5 py-2.5"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b6b]" />
            <span className="text-[12.5px] leading-relaxed text-[#ffb3b3]">
              <span className="font-medium text-white/90">{error.name}: </span>
              {error.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}