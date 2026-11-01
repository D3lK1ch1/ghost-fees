import { useEffect, useState } from 'react';

// The clock on the wall of the room: the visitor's real local time, ticking on
// the minute so it never sits on a stale figure.
export default function RoomClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

  return (
    <div className="absolute bottom-3 left-3 rounded-2xl border border-primary/40 bg-background/85 px-3 py-1.5 text-left">
      <div className="font-heading text-[22px] font-bold leading-none tabular-nums text-primary">{time}</div>
      <div className="text-[10.5px] font-semibold text-muted-foreground">{date}</div>
    </div>
  );
}