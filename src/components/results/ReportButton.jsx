import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { useAllowance } from '@/lib/AllowanceContext';
import { useGhostList } from '@/hooks/use-ghost-list';
import { downloadReport } from '@/lib/ghostFees/report';

// Paid feature: a PDF of the results, made in the browser.
export default function ReportButton({ analysis, usedSample }) {
  const { paid, openPaywall } = useAllowance();
  const [ghostList] = useGhostList();
  const [busy, setBusy] = useState(false);

  const click = async () => {
    if (!paid && !usedSample) {
      openPaywall('report');
      return;
    }
    setBusy(true);
    try {
      await downloadReport(analysis, ghostList);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={click} disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/60 px-4 py-2 text-[13.5px] font-bold text-foreground hover:bg-primary/10 disabled:opacity-60">
      <FileDown className="h-4 w-4 text-primary" />
      {busy ? 'Making your report...' : paid || usedSample ? 'Download PDF report' : 'PDF report (unlock)'}
    </button>
  );
}
