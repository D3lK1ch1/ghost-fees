import { useEffect, useRef, useState } from 'react';
import { Check, Globe, ImagePlus, Mail, Phone, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useGhostList } from '@/hooks/use-ghost-list';
import { withCancelled } from '@/lib/ghostFees/ghostList';
import { dropEvents, reminderUid } from '@/lib/ghostFees/calendarSync';
import { cn } from '@/lib/utils';

// What counts as proof, for each way of cancelling. Shown in the dialog so people
// know what to keep before they close the company's page or hang up.
const METHODS = [
  {
    key: 'online', label: 'Online', Icon: Globe, ref: 'Confirmation number', refHint: 'e.g. CX-48213', note: 'Anything else (the date it ends)',
    proves: ['A screenshot of the "cancelled" screen', 'The confirmation email they send you', 'The date your plan ends'],
  },
  {
    key: 'email', label: 'Email', Icon: Mail, ref: 'Their reply or ticket number', refHint: 'e.g. Ticket #55102', note: 'Email address you sent it from or to',
    proves: ['A screenshot of your email asking them to cancel', 'Their reply confirming it, with the end date', 'Any ticket or case number'],
  },
  {
    key: 'phone', label: 'Phone call', Icon: Phone, ref: 'Reference number', refHint: 'e.g. 0099123', note: 'Who you spoke to',
    proves: ['The date and time of the call', 'The name of who you spoke to', 'A reference number. Ask for one before you hang up'],
  },
];

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// Shrink a screenshot in the browser so a few of them fit in local storage.
// Nothing is uploaded anywhere: the image stays in this browser with the Ghost List.
async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    const encode = (maxSide, quality) => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    };
    let shot = encode(1100, 0.72);
    if (shot.length > 450_000) shot = encode(850, 0.55);
    return shot;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function proofLine(proof) {
  if (!proof) return '';
  const method = METHODS.find((item) => item.key === proof.method)?.label || 'Cancelled';
  const when = proof.when ? new Date(proof.when).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
  return [method, when, proof.ref && `Ref ${proof.ref}`, proof.note].filter(Boolean).join(' · ');
}

// The saved proof: one line, plus the screenshot (tap to see it bigger).
export function ProofSummary({ proof, className, onAdd }) {
  const [big, setBig] = useState(false);
  if (!proof) {
    return onAdd ? (
      <button type="button" onClick={onAdd} className={cn('text-[12px] font-bold text-[#ffc27a] underline underline-offset-4', className)}>
        No proof yet. Add proof of cancelling
      </button>
    ) : null;
  }
  return (
    <div className={cn('text-[12px] text-muted-foreground', className)}>
      <p><span className="font-bold text-foreground">Proof:</span> {proofLine(proof)}</p>
      {proof.shot && (
        <button type="button" onClick={() => setBig((value) => !value)} aria-expanded={big} className="mt-1.5 block" aria-label={big ? 'Make screenshot smaller' : 'See the screenshot bigger'}>
          <img src={proof.shot} alt="Your cancellation screenshot" className={cn('rounded-lg border border-border object-cover object-top', big ? 'max-h-[480px] w-full max-w-sm object-contain' : 'h-16 w-16')} />
        </button>
      )}
    </div>
  );
}

// Before anything goes on the Ghost List: how did you cancel, and what's the proof?
// Online, email or a phone call, with the time, a reference, a note and an optional
// screenshot, so there's proof if they charge again. Saving needs at least one piece
// of proof; "Add proof later" adds it without. Kept in this browser only.
export default function ProofDialog({ target, onSave, onClose, saveLabel = '👻 Save proof', laterLabel = 'Nothing to show yet? Add proof later' }) {
  const [method, setMethod] = useState('online');
  const [when, setWhen] = useState(nowLocal());
  const [ref, setRef] = useState('');
  const [note, setNote] = useState('');
  const [shot, setShot] = useState('');
  const [shotError, setShotError] = useState('');
  const fileRef = useRef(null);
  useEffect(() => {
    setMethod('online');
    setWhen(nowLocal());
    setRef('');
    setNote('');
    setShot('');
    setShotError('');
  }, [target]);
  if (!target) return null;
  const m = METHODS.find((item) => item.key === method);
  const hasProof = Boolean(ref.trim() || note.trim() || shot);

  const pickShot = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setShotError('That isn\'t a picture. Take a screenshot and pick that instead.');
      return;
    }
    try {
      setShot(await shrinkImage(file));
      setShotError('');
    } catch {
      setShotError('Couldn\'t open that picture. Try another screenshot.');
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl border-border bg-card text-foreground">
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

        <div className="rounded-2xl border border-[#5ee6c8]/30 bg-[#5ee6c8]/[0.06] px-3.5 py-2.5">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#5ee6c8]">What counts as proof</p>
          <ul className="mt-1 space-y-0.5 text-[13px] text-foreground">
            {m.proves.map((line) => (
              <li key={line} className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 flex-none text-[#5ee6c8]" /> {line}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">Screenshot <span className="font-normal normal-case">(optional)</span></p>
          {shot ? (
            <div className="mt-1 flex items-center gap-3">
              <img src={shot} alt="Your cancellation screenshot" className="h-20 w-20 rounded-xl border border-border object-cover object-top" />
              <button type="button" onClick={() => setShot('')} className="inline-flex items-center gap-1 text-[12.5px] font-bold text-muted-foreground underline underline-offset-4">
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-3 py-3 text-[13.5px] font-bold text-foreground hover:border-primary/60">
              <ImagePlus className="h-4 w-4" /> Add a screenshot or photo
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickShot} />
          {shotError && <p className="mt-1 text-[12px] font-semibold text-[#ff8f8f]" role="alert">{shotError}</p>}
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
          disabled={!when || !hasProof}
          onClick={() => onSave({ method, when, ref: ref.trim(), note: note.trim(), ...(shot ? { shot } : {}) })}
          className="mt-1 rounded-2xl bg-primary px-4 py-3 font-heading text-[16px] font-bold text-primary-foreground disabled:opacity-40"
        >
          {saveLabel}
        </button>
        {!hasProof && <p className="-mt-1 text-center text-[12px] text-muted-foreground">Add a screenshot, a reference or a note to save it as proof.</p>}
        {laterLabel && (
          <button type="button" onClick={() => onSave(null)} className="text-[13px] font-bold text-muted-foreground underline underline-offset-4 hover:text-foreground">
            {laterLabel}
          </button>
        )}
        <p className="text-[11px] text-muted-foreground">Saved in this browser only, with your Ghost List. Nothing is uploaded. Cover card numbers in screenshots, and don&apos;t type passwords.</p>
      </DialogContent>
    </Dialog>
  );
}

// "I cancelled it" anywhere: ask(subscription) opens the proof dialog, and saving
// puts it on the Ghost List with its proof. addProof(entry) is for something
// already on the list: it only adds the proof and keeps its status. If the browser
// is too full to keep the screenshot, it keeps the rest and says so.
export function useCancelProof({ saveLabel, onSaved } = {}) {
  const [, setGhostList] = useGhostList();
  const [target, setTarget] = useState(null);
  const [onlyProof, setOnlyProof] = useState(false);

  const apply = (sub, proof) => setGhostList((current) => (onlyProof
    ? current.map((entry) => (entry.id === sub.id ? { ...entry, proof } : entry))
    : withCancelled(current, sub, proof)));

  const save = (proof) => {
    const sub = target;
    setTarget(null);
    if (onlyProof && !proof) return;
    const saved = apply(sub, proof);
    if (!saved && proof?.shot) {
      // eslint-disable-next-line no-unused-vars
      const { shot, ...rest } = proof;
      apply(sub, rest);
      toast({ title: 'Screenshot not kept', description: 'Your browser storage is full, so we kept the rest of your proof. Keep the screenshot in your photos.' });
    } else if (onlyProof) {
      toast({ title: `Proof saved for ${sub.merchant}`, description: 'Use it if they charge you again.' });
    } else {
      toast(proof
        ? { title: `${sub.merchant} is on your Ghost List`, description: 'Proof saved. Check your next statement to make sure it stopped.' }
        : { title: `${sub.merchant} is on your Ghost List`, description: 'Add proof from your Ghost List once you have it.' });
    }
    // Cancelled, so no more "charges again in 2 days" reminder in a synced calendar.
    if (!onlyProof) dropEvents([reminderUid(sub.merchant)]).catch(() => {});
    onSaved?.(sub, proof);
  };

  return {
    ask: (sub) => { setOnlyProof(false); setTarget(sub); },
    addProof: (entry) => { setOnlyProof(true); setTarget(entry); },
    dialog: (
      <ProofDialog
        target={target}
        onClose={() => setTarget(null)}
        onSave={save}
        saveLabel={onlyProof ? '👻 Save proof' : saveLabel}
        laterLabel={onlyProof ? null : undefined}
      />
    ),
  };
}
