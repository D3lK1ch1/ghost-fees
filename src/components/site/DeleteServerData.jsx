import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useAllowance } from '@/lib/AllowanceContext';

// Privacy page, signed in: Download my data (this account's server row as JSON,
// hashes labelled as one-way) and delete the free-tier counters (and the paid
// flag, after a check).
export default function DeleteServerData() {
  const { isAuthenticated } = useAuth();
  const { refresh } = useAllowance();
  const [state, setState] = useState('idle');
  const [exportState, setExportState] = useState('idle');
  if (!isAuthenticated) return null;

  const download = async () => {
    setExportState('busy');
    try {
      const { data } = await base44.functions.invoke('allowance', { action: 'export' });
      if (!data?.exported_at) throw new Error('No data');
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ghost-fees-my-data.json';
      link.click();
      URL.revokeObjectURL(url);
      setExportState('done');
    } catch {
      setExportState('error');
    }
  };

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
    <>
    <div className="mt-3 rounded-xl border border-border px-3 py-2.5 text-[13.5px]">
      <p className="text-muted-foreground">Signed in: download everything our server keeps for your account, as a file.</p>
      <button type="button" disabled={exportState === 'busy'} onClick={download} className="mt-2 rounded-full border border-border px-3 py-1 text-[12.5px] font-bold text-foreground disabled:opacity-60">
        {exportState === 'busy' ? 'Getting it...' : exportState === 'error' ? 'Try again' : exportState === 'done' ? 'Downloaded. Download again' : 'Download my data'}
      </button>
    </div>
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
    </>
  );
}
