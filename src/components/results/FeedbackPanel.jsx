import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getSessionId } from '@/lib/session';
import ChoiceGroup from './ChoiceGroup';

const inputClass = 'mt-2 w-full rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-2.5 text-[13.5px] text-white placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none';

export default function FeedbackPanel({ usedSample, leaksFound, yearlyTotal }) {
  const [foundReal, setFoundReal] = useState('');
  const [wouldPay, setWouldPay] = useState('');
  const [confusion, setConfusion] = useState('');
  const [builderName, setBuilderName] = useState('');
  const [state, setState] = useState('idle');

  const submit = async () => {
    setState('sending');
    try {
      await base44.functions.invoke('submitFeedback', {
        session_id: getSessionId(),
        used_sample: usedSample,
        leaks_found: leaksFound,
        yearly_total: yearlyTotal,
        found_real: foundReal,
        confusion_text: confusion.trim(),
        would_pay: wouldPay,
        builder_name: builderName.trim(),
      });
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <section className="mt-10 rounded-[1.5rem] border border-primary/25 bg-primary/[0.06] p-6 text-center sm:p-8">
        <p className="text-2xl font-semibold text-white">Thanks! 🎃</p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-[1.5rem] border border-white/[0.08] bg-card/70 p-5 sm:p-7">
      <ChoiceGroup label="Did it find something real?" options={['Yes', 'Kinda', 'No']} value={foundReal} onChange={setFoundReal} />

      <label className="mt-5 block">
        <span className="text-[13px] font-medium text-white">What confused you or was missing?</span>
        <input
          value={confusion}
          onChange={(event) => setConfusion(event.target.value)}
          placeholder="Optional"
          className={inputClass}
        />
      </label>

      <ChoiceGroup label="Would you pay $5 for the full report?" options={['Yes', 'Maybe', 'No']} value={wouldPay} onChange={setWouldPay} />

      <label className="mt-5 block">
        <span className="text-[13px] font-medium text-white">Your builder name</span>
        <input
          value={builderName}
          onChange={(event) => setBuilderName(event.target.value)}
          placeholder="Optional"
          className={inputClass}
        />
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={state === 'sending'}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-all enabled:hover:brightness-105 disabled:opacity-50"
      >
        {state === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={2.4} />}
        {state === 'sending' ? 'Sending…' : 'Submit'}
      </button>

      {state === 'error' && (
        <p className="mt-2 text-center text-[12.5px] text-[#ffb3b3]">That didn&apos;t send. Try once more.</p>
      )}
    </section>
  );
}