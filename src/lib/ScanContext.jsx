import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { parseCsv } from '@/lib/ghostFees/parseCsv';
import { analyse, mergeTransactions } from '@/lib/ghostFees/analyse';
import { SAMPLE_CSV } from '@/lib/ghostFees/sampleStatement';
import { sourceLabel } from '@/lib/ghostFees/detectBank';

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

  const runScan = useCallback(async ({ files = [], useSample = false }) => {
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
          if (/\.csv$/i.test(file.name)) {
            const text = await file.text();
            const rows = parseCsv(text);
            if (!rows.length) throw new Error('No transactions found in this file.');
            lists.push(rows.map((row) => ({ ...row, source: file.name })));
            names.push(sourceLabel(file.name, text));
          } else if (/\.pdf$/i.test(file.name)) {
            const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
            const response = await base44.functions.invoke('parseStatement', { file_uri });
            const data = response?.data || {};
            if (data.error) errors.push({ name: file.name, message: data.error });
            else if (Array.isArray(data.transactions) && data.transactions.length) {
              lists.push(data.transactions.map((row) => ({ ...row, source: file.name })));
              names.push(sourceLabel(file.name));
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