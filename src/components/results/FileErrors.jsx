import { AlertCircle } from 'lucide-react';

// Files that could not be read, listed by name with the reason, on the results page.
export default function FileErrors({ errors = [] }) {
  if (!errors.length) return null;

  return (
    <div className="mt-4 rounded-2xl border border-[#ff6b6b]/25 bg-[#ff6b6b]/[0.06] px-4 py-3.5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-[#ff9c9c]">
        <AlertCircle className="h-4 w-4" />
        {errors.length === 1 ? '1 file could not be read' : `${errors.length} files could not be read`}
      </p>
      <ul className="mt-2 space-y-1.5">
        {errors.map((error, index) => (
          <li key={`${error.name}-${index}`} className="text-[12.5px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground/90">{error.name}</span>
            {' — '}
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}