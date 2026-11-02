import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useAllowance } from '@/lib/AllowanceContext';

// Privacy page: removes this account's free-tier counters (and paid flag, after a check).
export default function DeleteServerData() {
  const { isAuthenticated } = useAuth();
  const { refresh } = useAllowance();
  const [state, setState] = useState('idle');
  if (!isAuthenticated) return null;

  const run = async (confirmPaid = false) => {
    setState('busy');
    try {
      const { data } = await base44.functions.invoke('deleteMyData', { confirm_paid: confirmPaid });
      if (data?.needsConfirm) setState('confirm');
      else {
        setState('done');
        refresh();
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-border px-3 py-2.5 text-[13.5px]">
      {state === 'done' ? (
        <p className="font-bold text-[#5ee6c8]">Deleted. We no longer hold any counters for your account.</p>
      ) : state === 'confirm' ? (
        <>
          <p className="text-foreground">You paid to unlock. Deleting removes that too, and you would need to pay again. Delete anyway?</p>
          <button type="button" onClick={() => run(true)} className="mt-2 rounded-full bg-[#ff6fa3] px-3 py-1 text-[12.5px] font-bold text-[#1b1233]">Yes, delete everything</button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground">Signed in: delete your free-tier counters and payment flag from our server now.</p>
          <button type="button" disabled={state === 'busy'} onClick={() => run(false)} className="mt-2 rounded-full border border-border px-3 py-1 text-[12.5px] font-bold text-foreground disabled:opacity-60">
            {state === 'busy' ? 'Deleting...' : state === 'error' ? 'Try again' : 'Delete my server data'}
          </button>
        </>
      )}
    </div>
  );
}
