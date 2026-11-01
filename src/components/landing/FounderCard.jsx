import { useState } from 'react';

// Photo if the file exists, otherwise initials. Theme-aware colours only.
export default function FounderCard({ founder, full = false }) {
  const [photoOk, setPhotoOk] = useState(true);
  return (
    <div className="flex gap-3.5 rounded-3xl border border-border bg-card/70 p-4 text-left">
      <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/20 font-heading text-[20px] font-bold text-primary">
        {photoOk ? (
          <img src={founder.photo} alt={founder.name} className="h-full w-full object-cover" onError={() => setPhotoOk(false)} />
        ) : (
          founder.initials
        )}
      </div>
      <div className="min-w-0">
        <div className="font-heading text-[17px] font-semibold text-foreground">{founder.name}</div>
        <div className="text-[12.5px] font-bold text-primary">{founder.role}</div>
        <p className={`mt-1 text-[13px] leading-relaxed text-muted-foreground ${full ? '' : 'line-clamp-2'}`}>{founder.bio}</p>
      </div>
    </div>
  );
}
