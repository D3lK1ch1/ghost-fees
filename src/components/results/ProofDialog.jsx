import { useEffect, useState } from 'react';
import { Globe, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const METHODS = [
  { key: 'online', label: 'Online', Icon: Globe, ref: 'Confirmation number', refHint: 'e.g. CX-48213', note: 'Anything else (end date, screenshot saved)' },
  { key: 'email', label: 'Email', Icon: Mail, ref: 'Their reply or reference', refHint: 'e.g. Ticket #55102', note: 'Email address you sent it from or to' },
  { key: 'phone', label: 'Phone call', Icon: Phone, ref: 'Reference number', refHint: 'e.g. 0099123', note: 'Who you spoke to' },
];

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export function proofLine(proof) {
  if (!proof) return '';
  const method = METHODS.find((item) => item.key === proof.method)?.label || 'Cancelled';
  const when = proof.when ? new Date(proof.when).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
  return [method, when, proof.ref && `Ref ${proof.ref}`, proof.note].filter(Boolean).join(' · ');
}

// Before an ex is blocked: how did you cancel, and when? Online, email or a phone
// call, with the time and any reference, so there's proof if they charge again.
// Kept in this browser only, with the Ghost List.
export default function ProofDialog({ target, onSave, onClose }) {
  const [method, setMethod] = useState('online');
  const [when, setWhen] = useState(nowLocal());
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    setMethod('online');
    setWhen(nowLocal());
    setRef('');
    setNote('');
  }, [target]);
  if (!target) return null;
  const m = METHODS.find((item) => item.key === method);

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card text-foreground">
        <DialogTitle className="font-heading text-[20px]">How did you cancel {target.merchant}?</DialogTitle>
        <p className="-mt-2 text-[13px] text-muted-foreground">Keep proof, so you can get your money back if they charge you again.</p>

        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="How you cancelled">
          {METHODS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={method === item.key}
              onClick={() => setMethod(item.key)}
              className={cn('flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[13px] font-bold', method === item.key ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/50')}
            >
              <item.Icon className="h-5 w-5" /> {item.label}
            </button>
          ))}
        </div>

        <label className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
          {method === 'phone' ? 'Date and time of the call' : 'When'}
          <input type="datetime-local" value={when} onChange={(event) => setWhen(event.target.value)} className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-normal normal-case text-foreground" />
        </label>
        <label className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
          {m.ref} <span className="font-normal normal-case">(optional)</span>
          <input value={ref} maxLength={60} onChange={(event) => setRef(event.target.value)} placeholder={m.refHint} className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-normal normal-case text-foreground" />
        </label>
        <label className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
          {m.note} <span className="font-normal normal-case">(optional)</span>
          <input value={note} maxLength={80} onChange={(event) => setNote(event.target.value)} className="mt-1 block w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] font-normal normal-case text-foreground" />
        </label>

        <button
          type="button"
          disabled={!when}
          onClick={() => onSave({ method, when, ref: ref.trim(), note: note.trim() })}
          className="mt-1 rounded-2xl bg-primary px-4 py-3 font-heading text-[16px] font-bold text-primary-foreground disabled:opacity-40"
        >
          💔 Save proof and block
        </button>
        <p className="text-[11px] text-muted-foreground">Saved in this browser only, with your Ghost List. Don&apos;t type card numbers or passwords.</p>
      </DialogContent>
    </Dialog>
  );
}
