import { CalendarDays, FileText } from 'lucide-react';

function dateLabel(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function dateRange(dates) {
  if (!dates.length) return '';
  if (dates.length === 1) return dateLabel(dates[0]);
  return `${dateLabel(dates[0])} to ${dateLabel(dates[dates.length - 1])}`;
}

function sourceLabel(sources) {
  if (!sources.length) return '';
  if (sources.length === 1) return sources[0];
  if (sources.length === 2) return `${sources[0]} and ${sources[1]}`;
  return `${sources.length} statements`;
}

// Where a ghost came from: the dates of the charges and the statement file(s).
export default function LeakSource({ dates = [], sources = [], dark = false }) {
  const when = dateRange(dates);
  const where = sourceLabel(sources);
  if (!when && !where) return null;

  return (
    <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold ${dark ? 'text-[#bdb7c6]' : 'text-[#5b5275]'}`}>
      {when && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {when}
        </span>
      )}
      {where && (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">from {where}</span>
        </span>
      )}
    </div>
  );
}