import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, KeyRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROVIDERS, clearOwnAI, keyProblem, maskKey, readOwnAI, saveOwnAI, testKey } from '@/lib/ghostFees/ownAI';

// "Got your own AI?": a 3-step popup to connect a Claude (Anthropic) or OpenAI API key
// for unlimited ghost answers. The key stays in this browser and goes straight to the
// provider. One step at a time so it never feels like a form.
const STEPS = ['Pick yours', 'Get a key', 'Paste it'];

export default function OwnAIPanel({ onClose }) {
  const current = readOwnAI();
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState(current?.provider || 'anthropic');
  const [key, setKey] = useState('');
  const [model, setModel] = useState(current?.model || PROVIDERS[current?.provider || 'anthropic'].model);
  const [remember, setRemember] = useState(false);
  const p = PROVIDERS[provider];
  const brand = provider === 'anthropic' ? 'Claude' : 'ChatGPT';
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState(null);
  const canSave = key.trim().length > 0 && (provider === 'anthropic' || model.trim()) && !checking;

  // Shape check, then a free test call to the provider. Only a working key is saved.
  const connect = async () => {
    const bad = keyProblem(provider, key);
    if (bad) { setProblem(bad); return; }
    setProblem(null);
    setChecking(true);
    const result = await testKey(provider, key);
    if (result === 'bad') {
      setChecking(false);
      setProblem(`${brand} said no to that key. Check it's active, or make a new one.`);
      return;
    }
    await saveOwnAI({ provider, key, model, remember });
    setKey('');
    setChecking(false);
    onClose?.();
  };

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const btn = 'rounded-full px-3 py-1.5 text-[13px] font-bold';
  // Portal to <body>: the chat panel clips anything inside it, so the popup sits above it.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Connect your own AI" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 text-[13.5px] shadow-2xl">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <p className="font-heading text-[16px] font-bold text-foreground">Got your own AI?</p>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto rounded-full p-1 text-muted-foreground hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-0.5 text-muted-foreground">Use Claude or ChatGPT for unlimited ghost answers.</p>

        {current ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1.5 font-bold text-foreground">✓ {PROVIDERS[current.provider].label} <span className="font-mono text-[12.5px] text-muted-foreground">{maskKey(current.last4)}</span></span>
            <button type="button" onClick={() => { clearOwnAI(); onClose?.(); }} className={cn(btn, 'border border-border text-foreground')}>Remove</button>
          </div>
        ) : (
          <>
            <ol className="mt-3 flex items-center gap-1.5 text-[11.5px] font-bold" aria-label="Steps">
              {STEPS.map((label, i) => (
                <li key={label} className={cn('flex items-center gap-1', i === step ? 'text-foreground' : 'text-muted-foreground')}>
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[11px]', i <= step ? 'bg-primary text-primary-foreground' : 'bg-white/10')}>{i < step ? '✓' : i + 1}</span>
                  {label}
                  {i < STEPS.length - 1 && <span aria-hidden="true" className="mx-0.5 text-muted-foreground">›</span>}
                </li>
              ))}
            </ol>

            <div className="mt-3 min-h-[96px]">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Which AI">
                  {Object.entries(PROVIDERS).map(([k, v]) => (
                    <button key={k} type="button" role="radio" aria-checked={provider === k}
                      onClick={() => { setProvider(k); setModel(v.model); setStep(1); }}
                      className={cn('rounded-xl border px-3 py-3 text-center font-bold', provider === k ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-foreground hover:border-white/40')}>
                      {k === 'anthropic' ? 'Claude' : 'ChatGPT'}
                      <span className="block text-[11.5px] font-semibold text-muted-foreground">{k === 'anthropic' ? 'Anthropic' : 'OpenAI'}</span>
                    </button>
                  ))}
                </div>
              )}
              {step === 1 && (
                <div>
                  <a href={p.getKey} target="_blank" rel="noreferrer" className={cn(btn, 'inline-flex items-center gap-1 bg-primary text-primary-foreground')}>
                    Open {brand} API keys <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="mt-2 text-foreground">Sign in, tap <b>Create key</b>, copy it.</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">A Plus or Pro plan isn&apos;t enough: you need an API key. You pay {provider === 'anthropic' ? 'Anthropic' : 'OpenAI'} a few cents for what you use.</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">💡 Tip: set a monthly spend limit there, and delete the key any time.</p>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-2">
                  <input type="password" autoComplete="off" spellCheck={false} autoFocus value={key} onChange={(e) => { setKey(e.target.value); setProblem(null); }} placeholder={`Paste your key (${p.keyHint})`} aria-label="API key"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-foreground outline-none focus:border-primary" />
                  {provider === 'openai' && (
                    <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model name from your OpenAI account" aria-label="Model"
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-foreground outline-none focus:border-primary" />
                  )}
                  {problem && <p role="alert" className="text-[12.5px] font-semibold text-red-300">{problem}</p>}
                  <label className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
                    Remember on this device
                  </label>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className={cn(btn, 'border border-border text-foreground')}>← Back</button>}
              {step === 1 && <button type="button" onClick={() => setStep(2)} className={cn(btn, 'ml-auto border border-primary text-foreground')}>I have my key →</button>}
              {step === 2 && (
                <button type="button" disabled={!canSave} onClick={connect}
                  className={cn(btn, 'ml-auto bg-primary text-primary-foreground disabled:opacity-50')}>{checking ? 'Checking your key…' : 'Check and connect'}</button>
              )}
            </div>
          </>
        )}
        <p className="mt-3 text-[11.5px] text-muted-foreground">🔒 Checked, then saved encrypted in this browser. Only the last 4 are ever shown. Ghost Fees never sees it.</p>
      </div>
    </div>,
    document.body,
  );
}
