import { useState } from 'react';
import { ExternalLink, KeyRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROVIDERS, clearOwnAI, readOwnAI, saveOwnAI } from '@/lib/ghostFees/ownAI';

// "Connect your own AI": paste a Claude (Anthropic) or OpenAI API key for unlimited ghost
// answers. The key stays in this browser and goes straight to the provider.
export default function OwnAIPanel({ onClose }) {
  const current = readOwnAI();
  const [provider, setProvider] = useState(current?.provider || 'anthropic');
  const [key, setKey] = useState('');
  const [model, setModel] = useState(current?.model || PROVIDERS[current?.provider || 'anthropic'].model);
  const [remember, setRemember] = useState(false);
  const p = PROVIDERS[provider];
  const canSave = key.trim().length > 20 && (provider === 'anthropic' || model.trim());
  return (
    <div className="shrink-0 border-b border-border bg-background/70 px-3 py-3 text-[13px]" role="region" aria-label="Connect your own AI">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" />
        <p className="font-heading text-[14px] font-bold text-foreground">Connect your own AI</p>
        <button type="button" onClick={onClose} aria-label="Close" className="ml-auto rounded-full p-1 text-muted-foreground hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      <p className="mt-1 text-muted-foreground">
        Free answers are limited so the app stays free. Add your own API key for unlimited ghost answers. Your key stays in this browser and goes straight to {provider === 'anthropic' ? 'Anthropic' : 'OpenAI'}. Ghost Fees never sees or stores it, and you pay them for what you use.
      </p>
      {current ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 font-bold text-foreground">✓ Using your {PROVIDERS[current.provider].label}{current.model ? ` (${current.model})` : ''}</span>
          <button type="button" onClick={() => { clearOwnAI(); onClose?.(); }} className="rounded-full border border-border px-2.5 py-1 font-bold text-foreground">Remove my key</button>
        </div>
      ) : (
        <>
          <div className="mt-2 flex gap-1.5" role="radiogroup" aria-label="Which AI">
            {Object.entries(PROVIDERS).map(([k, v]) => (
              <button key={k} type="button" role="radio" aria-checked={provider === k} onClick={() => { setProvider(k); setModel(v.model); }}
                className={cn('rounded-full border px-2.5 py-1 font-bold', provider === k ? 'border-primary bg-primary/15 text-foreground' : 'border-border text-muted-foreground')}>
                {v.label}
              </button>
            ))}
          </div>
          <label className="mt-2 block">
            <span className="text-muted-foreground">API key</span>
            <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder={p.keyHint}
              className="mt-0.5 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-foreground outline-none focus:border-primary" />
          </label>
          <label className="mt-1.5 block">
            <span className="text-muted-foreground">Model{provider === 'openai' ? ' (from your OpenAI account)' : ''}</span>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={provider === 'openai' ? 'the model name your account uses' : PROVIDERS.anthropic.model}
              className="mt-0.5 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-foreground outline-none focus:border-primary" />
          </label>
          <label className="mt-1.5 flex items-center gap-2 text-muted-foreground">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
            Remember on this device (otherwise it's forgotten when you close the tab)
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" disabled={!canSave} onClick={() => { saveOwnAI({ provider, key, model, remember }); setKey(''); onClose?.(); }}
              className="rounded-full bg-primary px-3 py-1.5 font-bold text-primary-foreground disabled:opacity-50">Use my AI</button>
            <a href={p.getKey} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-foreground underline-offset-4 hover:underline">
              Get a key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <p className="mt-1.5 text-[12px] text-muted-foreground">A ChatGPT Plus or Claude Pro subscription doesn&apos;t include an API key. You need an API account with the provider.</p>
        </>
      )}
    </div>
  );
}
