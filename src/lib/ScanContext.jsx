import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { parseCsv } from '@/lib/ghostFees/parseCsv';
import { analyse, mergeTransactions } from '@/lib/ghostFees/analyse';
import { SAMPLE_CSV } from '@/lib/ghostFees/sampleStatement';
import { sourceLabel } from '@/lib/ghostFees/detectBank';
import { loadGhostList, saveGhostList } from '@/lib/ghostFees/ghostList';
import { checkGhosts } from '@/lib/ghostFees/ghostCheck';
import { toast } from '@/components/ui/use-toast';

const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

// Monthly ghost check: a new statement updates Ghost List items still "Requested"
// (charged again -> Still charging, quiet for 35+ days -> Confirmed). In the browser only.
function runGhostCheck(transactions) {
  const { items, changes } = checkGhosts(loadGhostList(), transactions);
  if (!changes.length) return;
  saveGhostList(items);
  changes.filter((change) => change.kind === 'charging').forEach((change) => {
    toast({ title: `${change.merchant} charged you again on ${shortDate(change.date)}`, description: 'Marked Still charging on your Ghost List. Send them your proof and ask for a refund.' });
  });
  const confirmed = changes.filter((change) => change.kind === 'confirmed');
  if (confirmed.length) {
    toast({ title: `Confirmed stopped: ${confirmed.map((change) => change.merchant).join(', ')}`, description: 'No charges on your statement since you ghosted them.' });
  }
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const STEP_COUNT = 4;

function initialSteps() {
  return Array.from({ length: STEP_COUNT }, (_, index) => (index === 0 ? 'active' : 'pending'));
}

// Keep only the last N months of the statement, counted back from its newest date.
function withinMonths(transactions, months) {
  if (!months) return transactions;
  const dated = transactions.filter((item) => item.date).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!dated.length) return transactions;
  const cutoff = new Date(`${dated[0].date}T00:00:00Z`);
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - (months - 1));
  const floor = cutoff.toISOString().slice(0, 10);
  return transactions.filter((item) => !item.date || item.date >= floor);
}

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [steps, setSteps] = useState(initialSteps);
  const [progress, setProgress] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [transactions, setTransactions] = useState(null);
  const [windowMonths, setWindowMonths] = useState(0);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileNames, setFileNames] = useState([]);

  const reset = useCallback(() => {
    setStatus('idle');
    setTransactions(null);
    setWindowMonths(0);
    setFileErrors([]);
    setFileNames([]);
    setSteps(initialSteps());
    setProgress(0);
    setTransactionCount(0);
    setFileCount(0);
  }, []);

  const runScan = useCallback(async ({ files = [], useSample = false, ticket = '' }) => {
    setFileErrors([]);
    setTransactions(null);
    setWindowMonths(0);
    setSteps(initialSteps());
    setProgress(4);
    setTransactionCount(0);
    setFileCount(files.length);
    setStatus('scanning');

    const lists = [];
    const errors = [];
    const names = [];

    if (useSample) {
      lists.push(parseCsv(SAMPLE_CSV).map((row) => ({ ...row, source: 'Sample statement' })));
      names.push('Sample statement');
    } else {
      for (const file of files) {
        try {
          // Same limit is checked again on the server for PDFs.
          if (file.size > MAX_FILE_BYTES) throw new Error('This file is over 5 MB. Try exporting a shorter date range.');
          if (/\.csv$/i.test(file.name)) {
            const text = await file.text();
            const rows = parseCsv(text);
            if (!rows.length) throw new Error('No transactions found in this file.');
            const label = sourceLabel(file.name, text);
            lists.push(rows.map((row) => ({ ...row, source: label })));
            names.push(label);
          } else if (/\.pdf$/i.test(file.name)) {
            const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
            const response = await base44.functions.invoke('parseStatement', { file_uri, ticket });
            const data = response?.data || {};
            if (data.error) errors.push({ name: file.name, message: data.error });
            else if (Array.isArray(data.transactions) && data.transactions.length) {
              const label = sourceLabel(file.name);
              lists.push(data.transactions.map((row) => ({ ...row, source: label })));
              names.push(label);
            } else errors.push({ name: file.name, message: 'No transactions found in this PDF.' });
          } else {
            throw new Error("This isn't a CSV or PDF.");
          }
        } catch (error) {
          errors.push({
            name: file.name,
            message: error?.response?.data?.error || error?.message || 'Could not read this file.',
          });
        }
      }
    }

    const transactions = mergeTransactions(lists);

    if (!transactions.length) {
      setFileErrors(errors.length ? errors : [{ name: 'Statement', message: 'We could not find any transactions in that file.' }]);
      setStatus('idle');
      return null;
    }

    setTransactionCount(transactions.length);
    const analysis = analyse(transactions);

    setSteps(Array.from({ length: STEP_COUNT }, () => 'done'));
    setProgress(100);
    setFileErrors(errors);
    setFileNames(names);
    setTransactions(transactions);
    setStatus('done');
    runGhostCheck(transactions);
    return analysis;
  }, []);

  const results = useMemo(
    () => (transactions ? analyse(withinMonths(transactions, windowMonths)) : null),
    [transactions, windowMonths],
  );

  const value = useMemo(() => ({
    status,
    steps,
    progress,
    transactionCount,
    fileCount,
    results,
    windowMonths,
    setWindowMonths,
    fileErrors,
    fileNames,
    runScan,
    reset,
  }), [status, steps, progress, transactionCount, fileCount, results, windowMonths, fileErrors, fileNames, runScan, reset]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) throw new Error('useScan must be used inside ScanProvider');
  return context;
}